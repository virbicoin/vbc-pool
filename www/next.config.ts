import { type NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Next.js 15+ requires assetPrefix to start with "/" or be full URL. Empty string also allowed (default).
const assetPrefix = process.env["NEXT_PUBLIC_ASSET_PREFIX"] ?? (isProd ? "/" : "");

// SECURITY: Allowed domains for CSP
const ALLOWED_DOMAINS = {
  scripts: ["'self'"],
  styles: ["'self'", "'unsafe-inline'"], // Tailwind requires unsafe-inline
  images: ["'self'", "data:", "https://flagcdn.com", "https://*.digitalregion.jp", "https://*.virbicoin.com"],
  fonts: ["'self'"],
  connect: [
    "'self'",
    "https://api.digitalregion.jp",
    "https://*.digitalregion.jp",
    "https://api.virbicoin.com",
    "https://*.virbicoin.com",
    // Allow localhost in development
    ...(isProd ? [] : ["http://localhost:*", "ws://localhost:*"]),
  ],
};

// Build CSP header value
const cspHeader = [
  `default-src 'self'`,
  `script-src ${ALLOWED_DOMAINS.scripts.join(" ")} 'unsafe-inline' 'unsafe-eval'`,
  `style-src ${ALLOWED_DOMAINS.styles.join(" ")}`,
  `img-src ${ALLOWED_DOMAINS.images.join(" ")}`,
  `font-src ${ALLOWED_DOMAINS.fonts.join(" ")}`,
  `connect-src ${ALLOWED_DOMAINS.connect.join(" ")}`,
  `media-src 'self' data:`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
].join("; ");

const nextConfig: NextConfig = {
  assetPrefix,

  reactStrictMode: true,

  // Remote images settings for <Image />
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/w80/**",
      },
      {
        protocol: "https",
        hostname: "*.digitalregion.jp",
        pathname: "/**",
      },
    ],
  },

  // Security headers
  async headers() {
    const securityHeaders = [
      // Content Security Policy
      {
        key: "Content-Security-Policy",
        value: cspHeader,
      },
      // Prevent clickjacking
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      // Prevent MIME type sniffing
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      // Referrer policy
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      // Permissions policy (disable unused browser features)
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
    ];

    // Add HSTS in production only
    if (isProd) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
