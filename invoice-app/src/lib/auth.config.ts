import type { NextAuthConfig } from "next-auth"

/**
 * Edge-safe auth configuration.
 * 
 * This file is imported by middleware.ts which runs in the Edge Runtime.
 * It must NOT import any Node.js-specific modules (Prisma, bcrypt, etc.).
 * 
 * The full auth config (with providers and adapter) lives in auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublicRoute =
        nextUrl.pathname.startsWith("/portal") ||
        nextUrl.pathname.startsWith("/api/webhook/stripe") ||
        nextUrl.pathname.startsWith("/api/auth") ||
        nextUrl.pathname === "/login" ||
        nextUrl.pathname === "/register"

      if (!isLoggedIn && !isPublicRoute) {
        return false // Redirect to login
      }
      return true
    },
  },
  providers: [], // Providers are defined in auth.ts (Node.js runtime only)
} satisfies NextAuthConfig
