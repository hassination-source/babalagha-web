import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
];

const s3Host = process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL).hostname : undefined;

const config: NextConfig = {
  poweredByHeader: false,
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: s3Host ? [{ protocol: "https", hostname: s3Host }] : [],
  },
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
  // Old Wix URLs → new pages (permanent, keeps search ranking).
  async redirects() {
    return [
      { source: "/menu", destination: "/ar/products", permanent: true },
      { source: "/gallery", destination: "/ar", permanent: true },
      { source: "/about", destination: "/ar/about", permanent: true },
      { source: "/contact", destination: "/ar/contact", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default config;
