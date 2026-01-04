import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

// SECURITY: 許可されたAPIホストのホワイトリスト
const ALLOWED_API_HOSTS: ReadonlySet<string> = new Set([
  "https://pool.digitalregion.jp",
  "https://pool1.digitalregion.jp",
  "https://pool2.digitalregion.jp",
  "https://pool3.digitalregion.jp",
  "https://pool4.digitalregion.jp",
  "https://pool5.digitalregion.jp",
]);

// SECURITY: URLが許可されたホストかチェック
function isAllowedHost(apiUrl: string): boolean {
  try {
    const url = new URL(apiUrl);
    const origin = url.origin;
    return ALLOWED_API_HOSTS.has(origin);
  } catch {
    return false;
  }
}

export async function GET() {
  // 1. pools.jsonを読み込む
  const poolsPath = path.join(process.cwd(), "pools.json");
  let poolsJson = [];
  try {
    const data = await fs.readFile(poolsPath, "utf-8");
    poolsJson = JSON.parse(data);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load pools.json", details: String(e) },
      { status: 500 }
    );
  }

  // 2. ステータスチェック（許可されたホストのみ）
  const checks = poolsJson.map(
    async (pool: { apiUrl: string; active: boolean; id?: string; [key: string]: unknown }) => {
      if (!pool.active) {
        return { ...pool, pool: pool.id || pool.apiUrl, status: "inactive", latency: null };
      }

      // SECURITY: 許可されたホストのみリクエスト
      if (!isAllowedHost(pool.apiUrl)) {
        console.warn(`[Security] Blocked health check to unauthorized host: ${pool.apiUrl}`);
        return {
          ...pool,
          pool: pool.id || pool.apiUrl,
          status: "blocked",
          latency: null,
          error: "Host not allowed",
        };
      }

      const url = `${pool.apiUrl}/health`;
      const start = Date.now();
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "User-Agent": "Virbicoin-Pool-Frontend/1.0",
          },
          signal: AbortSignal.timeout(2000),
        });
        const latency = Date.now() - start;
        if (!res.ok) {
          return {
            ...pool,
            pool: pool.id || pool.apiUrl,
            status: "unhealthy",
            latency,
            error: `HTTP ${res.status}`,
          };
        }
        const json = await res.json();
        return { ...pool, pool: pool.id || pool.apiUrl, status: "healthy", latency, ...json };
      } catch (err) {
        const latency = Date.now() - start;
        return {
          ...pool,
          pool: pool.id || pool.apiUrl,
          status: "unhealthy",
          latency,
          error: err instanceof Error ? err.message : "unknown error",
        };
      }
    }
  );

  const pools = await Promise.all(checks);
  const healthyExists = pools.some((p) => p.status === "healthy");
  const statusCode = healthyExists ? 200 : 503;
  return NextResponse.json({ pools }, { status: statusCode });
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
