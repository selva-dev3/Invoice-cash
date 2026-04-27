import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

export default NextAuth(authConfig).auth

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)", "/api/v1/:path*"],
  unstable_allowDynamic: [
    "**/node_modules/jose/**",
    "**/node_modules/@auth/core/**",
  ],
}
