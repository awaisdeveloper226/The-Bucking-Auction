// middleware.js
import { NextResponse } from "next/server";
import { getTokenFromCookie, verifyToken } from "./lib/auth";

const PUBLIC_PATHS = ["/", "/api/auth/signup", "/api/auth/login", "/api/auth/verify-email", "/login", "/signup", "/favicon.ico", "/api/health"];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Only protect /dashboard and /api/admin routes in this middleware
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/admin")) {
    const cookieHeader = req.headers.get("cookie") || "";
    const token = getTokenFromCookie(cookieHeader);
    const decoded = verifyToken(token);

    if (!decoded) {
      // Not authenticated: redirect to login (preserve returnTo)
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // RBAC: if accessing admin routes, ensure role is admin
    if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/api/admin")) {
      if (decoded.role !== "admin") {
        // unauthorized: redirect to dashboard home or show 403
        return NextResponse.rewrite(new URL("/403", req.url));
      }
    }

    // The request is allowed; let it through
    return NextResponse.next();
  }

  // Otherwise allow
  return NextResponse.next();
}

// Which paths this middleware runs on
export const config = {
  matcher: ["/dashboard/:path*", "/api/admin/:path*", "/dashboard", "/api/admin"]
};
