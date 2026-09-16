import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/auth");
  const isProtectedPage =
    pathname.startsWith("/seeker") ||
    pathname.startsWith("/company") ||
    pathname.startsWith("/settings");

  if (!sessionCookie && isProtectedPage) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (
    sessionCookie &&
    isAuthPage &&
    !pathname.includes("verify-email") &&
    !pathname.includes("reset-password") &&
    !pathname.includes("oauth-success")
  ) {
    return NextResponse.redirect(new URL("/seeker/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
