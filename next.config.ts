import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  logging: { incomingRequests: { ignore: [/\/\d{4}\/p\/[^/]+(?:\/|$)/] } },
  outputFileTracingIncludes: {
    "/[edition]/pdf": ["./private/pdfs/**/*"],
    "/[edition]/p/[token]/pdf": ["./private/pdfs/**/*"],
    "/[edition]/p/[token]/media/[asset]": ["./private/media/**/*"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
