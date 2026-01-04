import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// SECURITY: Simple in-memory rate limiting
// NOTE: In a production serverless/edge environment, this map is not shared across instances.
// For robust rate limiting, use Redis (e.g., Upstash) or a dedicated service.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

// SECURITY: Block suspicious patterns
const SUSPICIOUS_PATTERNS = [
  /wget/i,
  /curl/i,
  /;/,
  /\|/,
  /`/,
  /\$\(/,
  /\$\{/,
  /%00/,
  /\.\.\//, // Path traversal
  /\.\.%2f/i,
  /%2e%2e/i,
  /<script/i,
  /javascript:/i,
  /data:/i,
  /file:/i,
  /gopher:/i,
  /dict:/i,
];

function getClientIP(request: NextRequest): string {
  // Get actual client IP from X-Forwarded-For header
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  // Cloudflare
  const cfConnecting = request.headers.get("cf-connecting-ip");
  if (cfConnecting) {
    return cfConnecting;
  }
  // Default
  return "unknown";
}

function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Lazy cleanup: probabilistically clean up to avoid doing it on every request
  if (Math.random() < 0.01) {
    cleanupRateLimitMap();
  }

  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // Start new window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  record.count++;
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  return false;
}

function containsSuspiciousPattern(url: string): boolean {
  try {
    const decodedUrl = decodeURIComponent(url);
    return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(decodedUrl));
  } catch {
    // If decoding fails, it might be a malicious URL
    return true;
  }
}

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const fullUrl = pathname + search;
  const clientIP = getClientIP(request);

  // SECURITY: Block suspicious patterns (prevent command injection)
  if (containsSuspiciousPattern(fullUrl)) {
    console.warn(`[Security] Blocked suspicious request from ${clientIP}: ${fullUrl}`);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // SECURITY: Rate limiting (API routes only)
  if (pathname.startsWith("/api/")) {
    if (isRateLimited(clientIP)) {
      console.warn(`[Security] Rate limit exceeded for ${clientIP}`);
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        }
      );
    }
  }

  return NextResponse.next();
}

// Paths to apply middleware
export const config = {
  matcher: [
    // Apply to API routes
    "/api/:path*",
    // Exclude static files and _next
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
