import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  const privatePath = /^\/\d{4}\/p\/[^/]+(?:\/|$)/.test(pathname);
  const devPath = pathname.startsWith("/dev/");
  const indexableGeneralPath = pathname === `/${process.env.REWIND_LATEST_EDITION ?? "2026"}` &&
    process.env.REWIND_GENERAL_PREVIEW === "false" &&
    process.env.REWIND_INDEX_GENERAL === "true" && process.env.REWIND_GENERAL_PUBLISHED === "true";
  response.headers.set("Referrer-Policy", "no-referrer");
  if (privatePath || devPath || !indexableGeneralPath) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  if (privatePath || devPath) response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  return response;
}

export const config = { matcher: ["/:path*"] };
