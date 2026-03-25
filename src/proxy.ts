import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Security headers are set in next.config.ts via headers().
// Use this file for auth checks, redirects, and other dynamic per-request logic.
//
// Note: the matcher below excludes /api/* routes. API routes handle their own
// auth and rate limiting directly. If you need middleware on API routes, remove
// "api|" from the matcher pattern.
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
