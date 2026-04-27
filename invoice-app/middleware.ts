import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Edge-safe middleware — does NOT import from "next-auth".
 * 
 * Checks for the session cookie to determine if the user is authenticated.
 * The actual JWT verification happens server-side via auth.ts.
 */

const publicRoutes = new Set(["/login", "/register"])
const publicPrefixes = ["/portal", "/api/webhook/stripe", "/api/auth"]

function isPublicRoute(pathname: string): boolean {
  if (publicRoutes.has(pathname)) return true
  return publicPrefixes.some((prefix) => pathname.startsWith(prefix))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes through
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Check for session token cookie
  // NextAuth v5 uses "authjs.session-token" (HTTP) or "__Secure-authjs.session-token" (HTTPS)
  const hasToken =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token")

  if (!hasToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - api (API routes — auth is handled server-side)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
