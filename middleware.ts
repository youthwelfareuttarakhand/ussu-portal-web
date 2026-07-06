import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "ussu_token";
const PUBLIC_PATHS = ["/login", "/unauthorized"];

// ponytail: presence-only check (no signature verification, that needs the JWT
// secret which middleware shouldn't hold client-side-bundled). Real enforcement
// is server-side (dashboard layout's getSessionUser call + ussu-api guards) —
// this just avoids a flash of protected UI for logged-out visitors.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const hasSession = req.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/notices/:path*", "/admissions/:path*", "/students/:path*", "/staff/:path*"],
};
