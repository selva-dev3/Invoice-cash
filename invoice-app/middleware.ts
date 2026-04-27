import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Edge-safe middleware — does NOT import from "next-auth".
 * 
 * The `next-auth@5.0.0-beta.31` package has a known issue where
 * `import NextAuth from "next-auth"` pulls in `lib/env.js` which
 * uses `import { NextRequest } from "next/server"` (missing .js),
 * causing ERR_MODULE_NOT_FOUND on Vercel's Edge Runtime.
 *
 * Instead, we read the session token cookie directly and check
 * if the user is authenticated. The actual JWT verification
 * happens in the server-side auth.ts via NextAuth.
 */

const publicRoutes = ["/login", "/register"]
const publicPrefixes = ["/portal", "/api/webhook/stripe", "/api/auth"]

function isPublicRoute(pathname: string): boolean {
  if (publicRoutes.includes(pathname)) return true
  return publicPrefixes.some((prefix) => pathname.startsWith(prefix))
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Check for session token (NextAuth v5 uses this cookie name)
  const token =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
