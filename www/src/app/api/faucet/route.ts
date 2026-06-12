import { NextRequest, NextResponse } from "next/server";
import { isValidEthereumAddress } from "@/lib/formatters";
import poolConfig from "@/lib/poolConfig";

// In-memory storage for rate limiting (frontend-side additional protection)
const requestHistory = new Map<string, { lastRequest: number; count: number }>();
const addressHistory = new Map<string, number>();

// Cleanup old entries periodically
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
let lastCleanup = Date.now();

function cleanupOldEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  const cooldownMs = poolConfig.faucet.cooldownHours * 60 * 60 * 1000;
  const dayMs = 24 * 60 * 60 * 1000;

  for (const [key, timestamp] of addressHistory) {
    if (now - timestamp > cooldownMs) {
      addressHistory.delete(key);
    }
  }

  for (const [key, data] of requestHistory) {
    if (now - data.lastRequest > dayMs) {
      requestHistory.delete(key);
    }
  }

  lastCleanup = now;
}

// Get client IP from headers
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

// Check if IP is rate limited (frontend-side)
function isIPRateLimited(ip: string): { limited: boolean; remainingRequests: number } {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const history = requestHistory.get(ip);

  if (!history) {
    return { limited: false, remainingRequests: poolConfig.faucet.maxDailyRequests };
  }

  // Reset count if it's been more than 24 hours
  if (now - history.lastRequest > dayMs) {
    requestHistory.delete(ip);
    return { limited: false, remainingRequests: poolConfig.faucet.maxDailyRequests };
  }

  const remaining = poolConfig.faucet.maxDailyRequests - history.count;
  return {
    limited: history.count >= poolConfig.faucet.maxDailyRequests,
    remainingRequests: Math.max(0, remaining),
  };
}

// Check if address is on cooldown (frontend-side)
function isAddressOnCooldown(address: string): { onCooldown: boolean; remainingMs: number } {
  const lastRequest = addressHistory.get(address.toLowerCase());
  if (!lastRequest) {
    return { onCooldown: false, remainingMs: 0 };
  }

  const now = Date.now();
  const cooldownMs = poolConfig.faucet.cooldownHours * 60 * 60 * 1000;
  const elapsed = now - lastRequest;

  if (elapsed >= cooldownMs) {
    addressHistory.delete(address.toLowerCase());
    return { onCooldown: false, remainingMs: 0 };
  }

  return { onCooldown: true, remainingMs: cooldownMs - elapsed };
}

// Record a faucet request (frontend-side)
function recordRequest(ip: string, address: string) {
  const now = Date.now();

  // Update IP history
  const ipHistory = requestHistory.get(ip);
  if (ipHistory) {
    ipHistory.count++;
    ipHistory.lastRequest = now;
  } else {
    requestHistory.set(ip, { lastRequest: now, count: 1 });
  }

  // Update address history
  addressHistory.set(address.toLowerCase(), now);
}

export async function GET() {
  // Return faucet status
  if (!poolConfig.faucet.enabled) {
    return NextResponse.json({ enabled: false });
  }

  // Determine backend URL (use faucet-specific URL if configured, otherwise fall back to api.baseUrl)
  const faucetBackendUrl = poolConfig.faucet.backendUrl || poolConfig.api.baseUrl;

  // Try to get status from backend
  try {
    const backendUrl = `${faucetBackendUrl}/api/faucet`;
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    // If backend returns 404, faucet endpoint doesn't exist yet
    if (response.status === 404) {
      return NextResponse.json({
        enabled: false,
        backendNotReady: true,
        amount: poolConfig.faucet.amount,
        symbol: poolConfig.coin.symbol,
        cooldownHours: poolConfig.faucet.cooldownHours,
      });
    }

    if (response.ok) {
      let data;
      try {
        data = await response.json();
      } catch {
        // Invalid JSON response, use frontend config
        return NextResponse.json({
          enabled: poolConfig.faucet.enabled,
          amount: poolConfig.faucet.amount,
          amountFormatted: poolConfig.faucet.amount.toString(),
          symbol: poolConfig.coin.symbol,
          cooldownHours: poolConfig.faucet.cooldownHours,
        });
      }
      // Calculate formatted amount from backend response
      const amountInCoins = data.amount ? data.amount / 1e18 : poolConfig.faucet.amount;
      return NextResponse.json({
        enabled: data.enabled ?? poolConfig.faucet.enabled,
        amount: data.amount || poolConfig.faucet.amount,
        amountFormatted: data.amountFormatted || amountInCoins.toFixed(4),
        symbol: poolConfig.coin.symbol,
        cooldownHours: data.cooldownMinutes
          ? data.cooldownMinutes / 60
          : poolConfig.faucet.cooldownHours,
        cooldownMinutes: data.cooldownMinutes,
        maxDailyPerIP: data.maxDailyPerIP,
        balance: data.balance,
        balanceFormatted: data.balanceFormatted,
        stats: data.stats
          ? {
              totalRequests: data.stats.totalRequests || 0,
              totalSent: data.stats.totalSent || "0",
              totalSentFormatted: data.stats.totalSentFormatted || "0",
              uniqueAddresses: data.stats.uniqueAddresses || 0,
            }
          : undefined,
      });
    }
  } catch {
    // Backend not available, use frontend config
  }

  return NextResponse.json({
    enabled: poolConfig.faucet.enabled,
    amount: poolConfig.faucet.amount,
    symbol: poolConfig.coin.symbol,
    cooldownHours: poolConfig.faucet.cooldownHours,
  });
}

export async function POST(request: NextRequest) {
  // Check if faucet is enabled
  if (!poolConfig.faucet.enabled) {
    return NextResponse.json({ error: "Faucet is currently disabled" }, { status: 503 });
  }

  // Cleanup old entries
  cleanupOldEntries();

  // Get client IP
  const clientIP = getClientIP(request);

  // Frontend-side rate limit check
  const ipCheck = isIPRateLimited(clientIP);
  if (ipCheck.limited) {
    return NextResponse.json(
      {
        error: "Too many requests from your IP. Please try again tomorrow.",
        remainingRequests: 0,
      },
      { status: 429 }
    );
  }

  // Parse request body
  let body: { address?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { address } = body;

  // Validate address
  if (!address) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
  }

  if (!isValidEthereumAddress(address)) {
    return NextResponse.json(
      { error: "Invalid wallet address format. Must be a valid Ethereum address (0x...)" },
      { status: 400 }
    );
  }

  // Frontend-side address cooldown check
  const cooldownCheck = isAddressOnCooldown(address);
  if (cooldownCheck.onCooldown) {
    const remainingHours = Math.ceil(cooldownCheck.remainingMs / (60 * 60 * 1000));
    const remainingMinutes = Math.ceil(cooldownCheck.remainingMs / (60 * 1000));
    const timeDisplay =
      remainingHours > 1 ? `${remainingHours} hours` : `${remainingMinutes} minutes`;

    return NextResponse.json(
      {
        error: `This address is on cooldown. Please wait ${timeDisplay} before requesting again.`,
        remainingMs: cooldownCheck.remainingMs,
      },
      { status: 429 }
    );
  }

  try {
    // Call backend faucet API (pool handles the transaction)
    // Use faucet-specific backend URL if configured
    const faucetBackendUrl = poolConfig.faucet.backendUrl || poolConfig.api.baseUrl;
    const backendUrl = `${faucetBackendUrl}/api/faucet`;
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: address,
        ip: clientIP, // Pass IP to backend for its own rate limiting
      }),
    });

    // Handle 404 - backend faucet not deployed yet
    if (response.status === 404) {
      return NextResponse.json(
        { error: "Faucet service is not yet available. Please check back later." },
        { status: 503 }
      );
    }

    let data;
    try {
      data = await response.json();
    } catch {
      return NextResponse.json({ error: "Invalid response from faucet service" }, { status: 502 });
    }

    if (!response.ok) {
      // Backend returned an error
      return NextResponse.json(
        {
          error: data.error || "Faucet request failed",
          cooldownSeconds: data.cooldownSeconds,
          remainingMs: data.cooldownSeconds ? data.cooldownSeconds * 1000 : undefined,
        },
        { status: response.status }
      );
    }

    // Success - record in frontend cache too
    recordRequest(clientIP, address);

    // Use backend's formatted message if available
    const amountInCoins = data.amount ? data.amount / 1e18 : poolConfig.faucet.amount;
    return NextResponse.json({
      success: true,
      message:
        data.message ||
        `Successfully sent ${amountInCoins.toFixed(4)} ${poolConfig.coin.symbol} to ${address}`,
      txHash: data.txHash,
      amount: data.amount || poolConfig.faucet.amount,
      amountFormatted: data.amountFormatted || amountInCoins.toFixed(4),
      symbol: poolConfig.coin.symbol,
      remainingRequests: data.remainingRequests ?? ipCheck.remainingRequests - 1,
      nextRequestTime: Date.now() + poolConfig.faucet.cooldownHours * 60 * 60 * 1000,
    });
  } catch (error) {
    console.error("Faucet API error:", error);
    return NextResponse.json(
      { error: "Failed to connect to faucet service. Please try again later." },
      { status: 503 }
    );
  }
}
