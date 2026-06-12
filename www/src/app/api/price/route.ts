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
 * Fetch price from WikaEx API (CoinGecko-compatible endpoint)
 * Same approach as vbc-explorer
 */
async function getPriceFromWikaEx(): Promise<PriceData | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch("https://wikaex.com/api/spot/coingecko/tickers", {
      signal: controller.signal,
      headers: { "User-Agent": "VBC-Pool/1.0", Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const tickers = await response.json();
    const symbol = poolConfig.coin.symbol;

    const usdtTicker = tickers.find(
      (t: { ticker_id: string }) => t.ticker_id === `${symbol}_USDT`
    );
    const btcTicker = tickers.find(
      (t: { ticker_id: string }) => t.ticker_id === `${symbol}_BTC`
    );

    if (usdtTicker?.last_price || btcTicker?.last_price) {
      const priceUSD = usdtTicker?.last_price ? parseFloat(usdtTicker.last_price) : 0;
      if (priceUSD > 0) {
        return {
          symbol,
          priceUSD,
          priceBTC: btcTicker?.last_price ? parseFloat(btcTicker.last_price) : 0,
          timestamp: Date.now(),
          source: "wikaex",
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch price from vbc-explorer's API as fallback
 */
async function getPriceFromExplorer(): Promise<PriceData | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch("https://explorer.virbicoin.com/api/dex/external-price", {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    if (data.success && data.data?.nativePriceUsd > 0) {
      return {
        symbol: data.data.nativeSymbol || poolConfig.coin.symbol,
        priceUSD: data.data.nativePriceUsd,
        priceBTC: 0,
        timestamp: Date.now(),
        source: "explorer",
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

    // Try WikaEx first (primary source)
    let price = await getPriceFromWikaEx();

    // Try explorer API as fallback
    if (!price) {
      price = await getPriceFromExplorer();
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
