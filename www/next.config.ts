import { type NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Next.js 15+ requires assetPrefix to start with "/" or be full URL. Empty string also allowed (default).
const assetPrefix = process.env["NEXT_PUBLIC_ASSET_PREFIX"] ?? (isProd ? "/" : "");

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

  // Custom headers for CORS during local development
  async headers() {
    if (!isProd) {
      return [
        {
          source: "/:path*",
          headers: [
            {
              key: "Access-Control-Allow-Origin",
              value: "http://localhost",
            },
          ],
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
