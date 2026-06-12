import { NextResponse } from "next/server";
import poolConfig from "@/lib/poolConfig";

// In-memory cache for price data
let priceCache: { data: PriceData; timestamp: number } | null = null;
const CACHE_TTL = 60000; // 60 seconds

interface PriceData {
  symbol: string;
  priceUSD: number;
  priceBTC: number;
  timestamp: number;
  source: string;
}

/**
 * Fetch price from primary price API (configured in config.json)
 * Supports CoinGecko-compatible ticker endpoints
 */
async function getPriceFromPrimary(): Promise<PriceData | null> {
  const { url, tickerId } = poolConfig.calculator.priceApi;
  if (!url || !tickerId) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Pool-Frontend/1.0", Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const tickers = await response.json();
    const symbol = poolConfig.coin.symbol;

    // Find the configured ticker
    const usdtTicker = tickers.find(
      (t: { ticker_id: string }) => t.ticker_id === tickerId
    );
    // Also try to find BTC pair
    const btcTicker = tickers.find(
      (t: { ticker_id: string }) => t.ticker_id === `${symbol}_BTC`
    );

    if (usdtTicker?.last_price) {
      const priceUSD = parseFloat(usdtTicker.last_price);
      if (priceUSD > 0) {
        const source = new URL(url).hostname.replace("www.", "");
        return {
          symbol,
          priceUSD,
          priceBTC: btcTicker?.last_price ? parseFloat(btcTicker.last_price) : 0,
          timestamp: Date.now(),
          source,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch price from fallback URL (configured in config.json)
 * Expects { success: true, data: { nativePriceUsd: number } } response format
 */
async function getPriceFromFallback(): Promise<PriceData | null> {
  const { fallbackUrl } = poolConfig.calculator.priceApi;
  if (!fallbackUrl) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(fallbackUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    if (data.success && data.data?.nativePriceUsd > 0) {
      const source = new URL(fallbackUrl).hostname.replace("www.", "");
      return {
        symbol: data.data.nativeSymbol || poolConfig.coin.symbol,
        priceUSD: data.data.nativePriceUsd,
        priceBTC: 0,
        timestamp: Date.now(),
        source,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // Return cached data if still valid
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: priceCache.data,
        cached: true,
      });
    }

    // Try primary price API first
    let price = await getPriceFromPrimary();

    // Try fallback API
    if (!price) {
      price = await getPriceFromFallback();
    }

    if (price) {
      priceCache = { data: price, timestamp: Date.now() };
      return NextResponse.json({
        success: true,
        data: price,
        cached: false,
      });
    }

    // Return cached data even if expired, as fallback
    if (priceCache) {
      return NextResponse.json({
        success: true,
        data: priceCache.data,
        cached: true,
        stale: true,
      });
    }

    return NextResponse.json({
      success: false,
      error: "Failed to fetch price data",
    });
  } catch (error) {
    console.error("Price API error:", error);

    if (priceCache) {
      return NextResponse.json({
        success: true,
        data: priceCache.data,
        cached: true,
        stale: true,
      });
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch price data" },
      { status: 500 }
    );
  }
}
