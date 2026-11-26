import type { NextConfig } from "next";
import { isAbsolute, relative, resolve } from "node:path";

const recipientFile = relative(process.cwd(), resolve(process.env.REWIND_RECIPIENTS_FILE || "src/server/private/recipients.json")).replaceAll("\\", "/");
if (recipientFile.startsWith("../") || isAbsolute(recipientFile) || recipientFile.startsWith("public/")) {
  throw new Error("For Next.js, REWIND_RECIPIENTS_FILE must point to a private file inside the project, outside public/.");
}
const recipientTrace = `./${recipientFile}`;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    localPatterns: [{ pathname: "/photos/**", search: "" }, { pathname: "/brand/**", search: "" }],
  },
  logging: { incomingRequests: { ignore: [/\/\d{4}\/p\/[^/]+(?:\/|$)/] } },
  outputFileTracingIncludes: {
    "/[edition]/p/[token]": [recipientTrace],
    "/[edition]/pdf": ["./private/pdfs/**/*"],
    "/[edition]/p/[token]/pdf": ["./private/pdfs/**/*", recipientTrace],
    "/[edition]/p/[token]/media/[asset]": ["./private/media/**/*", recipientTrace],
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
