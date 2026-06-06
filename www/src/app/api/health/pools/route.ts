import { NextResponse } from "next/server";
import { getPoolServers, PoolServer } from "@/lib/poolConfig";

export const runtime = "nodejs";

// Build allowed hosts from config
function getAllowedApiHosts(): Set<string> {
  const hosts = new Set<string>();
  const servers = getPoolServers();
  servers.forEach((server) => {
    if (server.apiUrl) {
      try {
        const url = new URL(server.apiUrl);
        hosts.add(url.origin);
      } catch {
        // Invalid URL, skip
      }
    }
  });
  return hosts;
}

// SECURITY: URLが許可されたホストかチェック
function isAllowedHost(apiUrl: string, allowedHosts: Set<string>): boolean {
  try {
    const url = new URL(apiUrl);
    const origin = url.origin;
    return allowedHosts.has(origin);
  } catch {
    return false;
  }
}

export async function GET() {
  // 1. config.jsonからサーバー一覧を取得
  const poolsJson = getPoolServers();
  const allowedHosts = getAllowedApiHosts();

  // 2. ステータスチェック（許可されたホストのみ）
  const checks = poolsJson.map(async (pool: PoolServer) => {
    if (!pool.active) {
      return { ...pool, pool: pool.id || pool.apiUrl, status: "inactive", latency: null };
    }

    // SECURITY: 許可されたホストのみリクエスト
    if (!pool.apiUrl || !isAllowedHost(pool.apiUrl, allowedHosts)) {
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
          "User-Agent": "Pool-Frontend/1.0",
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
  });

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
