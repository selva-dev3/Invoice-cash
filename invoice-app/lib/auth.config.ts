import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

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
        (session.user as any).role = token.role
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
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
} satisfies NextAuthConfig
