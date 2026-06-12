import { NextRequest, NextResponse } from "next/server";
import poolConfig, { getPoolServers } from "@/lib/poolConfig";
// Import specific handlers so we can delegate when the catch-all route
// accidentally captures them. This avoids 404 responses in production
// where routing precedence can vary between builds.
import { GET as checkPortGET } from "../check-port/route";
import { GET as priceGET } from "../price/route";

// Ensure this route always executes in the Node.js runtime; the delegated
// handler uses the "net" module which is Node-only.
export const runtime = "nodejs";

// SECURITY: Allowed origins for CORS (configure for your deployment)
const ALLOWED_ORIGINS: ReadonlySet<string> = new Set([
  // Production domains
  "https://pool.digitalregion.jp",
  "https://*.digitalregion.jp",
  "https://pool.virbicoin.com",
  "https://*.virbicoin.com",
  // Development
  ...(process.env.NODE_ENV === "development"
    ? ["http://localhost:3000", "http://127.0.0.1:3000"]
    : []),
]);

// SECURITY: Get allowed origin or default
function getAllowedOrigin(requestOrigin: string | null): string {
  if (requestOrigin && ALLOWED_ORIGINS.has(requestOrigin)) {
    return requestOrigin;
  }
  // In development, allow any localhost origin
  if (
    process.env.NODE_ENV === "development" &&
    requestOrigin &&
    (requestOrigin.startsWith("http://localhost:") || requestOrigin.startsWith("http://127.0.0.1:"))
  ) {
    return requestOrigin;
  }
  // Return first allowed origin as default (for same-origin requests)
  return ALLOWED_ORIGINS.values().next().value || "";
}

// SECURITY: 許可されたAPIパスのホワイトリスト（パストラバーサル防止）
const ALLOWED_API_PATHS: ReadonlySet<string> = new Set([
  "stats",
  "blocks",
  "payments",
  "miners",
  "accounts",
  "health",
]);

// SECURITY: パスの検証（パストラバーサル防止）
function isValidApiPath(apiPath: string): boolean {
  // 空パスは拒否
  if (!apiPath || apiPath.length === 0) return false;

  // パストラバーサル攻撃を防止
  if (apiPath.includes("..") || apiPath.includes("//")) return false;

  // 特殊文字を拒否（英数字、ハイフン、スラッシュ、アンダースコアのみ許可）
  if (!/^[a-zA-Z0-9\-_\/]+$/.test(apiPath)) return false;

  // ルートパスが許可リストにあるかチェック
  const rootPath = apiPath.split("/")[0];
  return ALLOWED_API_PATHS.has(rootPath);
}

// Build pool endpoints from config.json
function getPoolEndpoints(): Record<string, string> {
  const endpoints: Record<string, string> = {};
  const servers = getPoolServers();

  // Add base pool endpoint
  if (poolConfig.api.baseUrl) {
    endpoints["pool"] = poolConfig.api.baseUrl;
  }

  // Add server endpoints from config
  servers.forEach((server, index) => {
    if (server.apiUrl) {
      endpoints[server.id || `pool${index + 1}`] = server.apiUrl;
    }
  });

  return endpoints;
}

// Use dynamic endpoints from config
const POOL_ENDPOINTS = getPoolEndpoints();

// Build allowed pool IDs from config
const ALLOWED_POOL_IDS: ReadonlySet<string> = new Set([
  "pool",
  "global",
  ...Object.keys(POOL_ENDPOINTS),
]);

export async function GET(_req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const startTime = Date.now();
  let poolId = "";
  let apiPath = "";

  try {
    const params = await context.params;
    const { slug } = params;

    console.log(`[Proxy] Request: ${slug?.join("/")}`);

    if (!slug || slug.length === 0) {
      console.error(`[Proxy] Invalid path: ${slug?.join("/") || "undefined"}`);
      return NextResponse.json({ error: "Invalid proxy path" }, { status: 400 });
    }

    // Special-case: delegate to dedicated handlers when the catch-all route
    // captures them. This avoids 404 responses in production where routing
    // precedence can vary between builds.
    if (slug && slug.length === 1 && slug[0] === "check-port") {
      return checkPortGET(_req);
    }
    if (slug && slug.length === 1 && slug[0] === "price") {
      return priceGET();
    }

    // Handle /api/health root -> global pool
    if (slug[0] === "health") {
      poolId = "pool";
      apiPath = "health";
    } else if (ALLOWED_API_PATHS.has(slug[0])) {
      // Paths like /api/miners, /api/blocks, /api/payments, /api/accounts/0x...
      // → treat as default pool ("pool" = api.virbicoin.com) request
      poolId = "pool";
      apiPath = slug.join("/");
    } else {
      poolId = slug[0];
      apiPath = slug.slice(1).join("/");
      if (!apiPath) {
        console.error(`[Proxy] Invalid proxy path: missing sub-path`);
        return NextResponse.json({ error: "Invalid proxy path" }, { status: 400 });
      }
    }

    // SECURITY: プールIDのホワイトリストチェック
    if (!ALLOWED_POOL_IDS.has(poolId)) {
      console.warn(`[Security] Blocked request to unauthorized pool: ${poolId}`);
      return NextResponse.json({ error: "Invalid pool identifier" }, { status: 403 });
    }

    // SECURITY: APIパスの検証
    if (!isValidApiPath(apiPath)) {
      console.warn(`[Security] Blocked request with invalid API path: ${apiPath}`);
      return NextResponse.json({ error: "Invalid API path" }, { status: 403 });
    }

    const baseUrl = POOL_ENDPOINTS[poolId as keyof typeof POOL_ENDPOINTS];

    if (!baseUrl) {
      console.error(`[Proxy] Unknown pool: ${poolId}`);
      return NextResponse.json({ error: "Unknown pool endpoint" }, { status: 404 });
    }

    const isHealthCheck = apiPath === "health";
    // プロキシリクエストを送信
    const proxyUrl: string = isHealthCheck ? `${baseUrl}/health` : `${baseUrl}/api/${apiPath}`;
    console.log(`[Proxy] Fetching: ${proxyUrl}`);

    const response = await fetch(proxyUrl, {
      // Always use GET for health so that upstream servers that don't
      // implement HEAD still respond with 200.
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Pool-Frontend/1.0",
      },
      // Route53 latency based routing ensures nearest server; 10s timeout
      signal: AbortSignal.timeout(10000),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`[Proxy] Response: ${response.status} in ${duration}ms for ${proxyUrl}`);

    if (!response.ok) {
      console.error(
        `[Proxy] Upstream error: ${proxyUrl} - ${response.status} ${response.statusText}`
      );
      return NextResponse.json(
        { error: `Upstream server error: ${response.status}` },
        { status: response.status }
      );
    }

    // Try to parse JSON if possible, otherwise return text
    let data: unknown;
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }
    } else if (contentType.startsWith("text/")) {
      data = await response.text();
    } else {
      // For health endpoints that may not return a body, return a default object
      data = { status: "ok" };
    }

    // SECURITY: CORS headers with specific origin
    const origin = _req.headers.get("origin");
    const allowedOrigin = getAllowedOrigin(origin);

    const headers = new Headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400", // 24 hours
      // Duration header for optional debugging
      "X-Proxy-Duration": duration.toString(),
      "X-Proxy-Latency": duration.toString(),
    });

    console.log(`[Proxy] Success: ${proxyUrl} in ${duration}ms`);
    return NextResponse.json(data, { headers });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Proxy] Error after ${duration}ms:`, error);

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }

    return NextResponse.json(
      {
        error: "Internal proxy error",
        // SECURITY: Do not expose internal error details in production
        ...(process.env.NODE_ENV === "development" && {
          details: error instanceof Error ? error.message : "Unknown error",
        }),
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowedOrigin = getAllowedOrigin(origin);

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
