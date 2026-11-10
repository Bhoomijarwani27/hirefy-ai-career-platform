
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname, searchParams } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/auth");

  const isExistingAccountRegistration =
    pathname === "/auth/register" &&
    searchParams.get("oauthError") === "account-exists";

  const isPublicJobPage =
    pathname === "/seeker/jobs" ||
    pathname.startsWith("/seeker/jobs/");

  const isProtectedPage =
    (pathname.startsWith("/seeker") && !isPublicJobPage) ||
    pathname.startsWith("/company") ||
    pathname.startsWith("/settings");

  const isAuthException =
    pathname.includes("verify-email") ||
    pathname.includes("reset-password") ||
    pathname.includes("oauth-success");

  if (!sessionCookie && isProtectedPage) {
    return NextResponse.redirect(
      new URL("/auth/login", request.url)
    );
  }

  if (
    sessionCookie &&
    isAuthPage &&
    !isExistingAccountRegistration &&
    !isAuthException
  ) {
    return NextResponse.redirect(
      new URL("/seeker/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/|api$|_next/static|_next/image|favicon.ico).*)",
  ],
};
