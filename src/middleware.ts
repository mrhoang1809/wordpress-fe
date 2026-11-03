import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth-cookies";

const LOGIN_PATH = "/admin/login";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin =
    pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`);

  // Allow all admin routes except login page
  // Authentication is handled by AuthBootstrap component
  if (pathname.startsWith("/admin") && !isLogin) {
    // Let the request proceed - AuthBootstrap will handle auth
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
