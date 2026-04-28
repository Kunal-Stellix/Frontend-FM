import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_FILE = /\.[^/]+$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/sw.js" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  /**
   * This project currently stores auth state in localStorage only.
   * Middleware cannot read localStorage because it runs on the server/edge.
   * Keep client-side AuthGuard/AuthRedirect as the active protection layer
   * until auth is moved to a server-readable session or cookie strategy.
   */
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/ideas/:path*",
    "/roadmap/:path*",
    "/changelog/:path*",
    "/settings/:path*",
  ],
};
