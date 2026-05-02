/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  images: {
    domains: [
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
    ],
  },
  env: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
  experimental: {
    // Keep Prisma and bcrypt out of edge/browser bundles
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  webpack: (config, { nextRuntime }) => {
    // Fix "__dirname is not defined" in Vercel Edge Runtime.
    // On Vercel, a transitive dependency referencing __dirname leaks into
    // the middleware bundle. By setting node.__dirname to true, webpack
    // replaces __dirname with the resolved directory path at build time
    // instead of leaving it as a runtime reference.
    if (nextRuntime === 'edge') {
      config.node = {
        ...config.node,
        __dirname: true,
        __filename: true,
      }
    }
    return config
  },
}

export default nextConfig
