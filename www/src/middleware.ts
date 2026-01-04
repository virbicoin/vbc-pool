import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// SECURITY: シンプルなインメモリレート制限
// 本番環境ではRedisなどの外部ストアを使用することを推奨
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// レート制限の設定
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1分
const RATE_LIMIT_MAX_REQUESTS = 100; // 1分あたり100リクエスト

// SECURITY: 疑わしいパターンをブロック
const SUSPICIOUS_PATTERNS = [
  /wget/i,
  /curl/i,
  /;/,
  /\|/,
  /`/,
  /\$\(/,
  /\$\{/,
  /%00/,
  /\.\.\//, // パストラバーサル
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
  // X-Forwarded-For ヘッダーから実際のクライアントIPを取得
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  // Cloudflare
  const cfConnecting = request.headers.get("cf-connecting-ip");
  if (cfConnecting) {
    return cfConnecting;
  }
  // デフォルト
  return "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // 新しいウィンドウを開始
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
  const decodedUrl = decodeURIComponent(url);
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(decodedUrl));
}

// 古いエントリをクリーンアップ（メモリリーク防止）
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60 * 1000);

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const fullUrl = pathname + search;
  const clientIP = getClientIP(request);

  // SECURITY: 疑わしいパターンをブロック（コマンドインジェクション防止）
  if (containsSuspiciousPattern(fullUrl)) {
    console.warn(`[Security] Blocked suspicious request from ${clientIP}: ${fullUrl}`);
    return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // SECURITY: レート制限（APIルートのみ）
  if (pathname.startsWith("/api/")) {
    if (isRateLimited(clientIP)) {
      console.warn(`[Security] Rate limit exceeded for ${clientIP}`);
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      });
    }
  }

  return NextResponse.next();
}

// ミドルウェアを適用するパス
export const config = {
  matcher: [
    // APIルートに適用
    "/api/:path*",
    // 静的ファイルと_nextを除外
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
