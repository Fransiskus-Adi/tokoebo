import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { updateSession } from "@/utils/supabase/middleware";

const PUBLIC_PATHS = new Set(["/login"]);

function isPublicAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/icon-") ||
    pathname.startsWith("/apple-touch-icon") ||
    pathname.startsWith("/sw.js") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/uploads/")
  );
}

function readToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  return request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
}

function redirectWithSessionCookies(url: URL, sessionResponse: NextResponse) {
  const response = NextResponse.redirect(url);
  sessionResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const sessionResponse = await updateSession(request);

  const token = readToken(request);
  const payload = token ? verifyAuthToken(token) : null;
  const isAuthenticated = Boolean(payload);
  const isPublicPath = PUBLIC_PATHS.has(pathname);

  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return redirectWithSessionCookies(loginUrl, sessionResponse);
  }

  if (isAuthenticated && pathname === "/login") {
    return redirectWithSessionCookies(new URL("/", request.url), sessionResponse);
  }

  return sessionResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
