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
  webpack: (config, { webpack, nextRuntime }) => {
    // Fix "__dirname is not defined" in Vercel Edge Runtime.
    // Vercel's builder bundles code that references __dirname into the
    // middleware even though middleware.ts itself doesn't use it.
    // This polyfill prevents the ReferenceError at runtime.
    if (nextRuntime === 'edge') {
      config.plugins.push(
        new webpack.DefinePlugin({
          __dirname: JSON.stringify('/'),
        })
      )
    }
    return config
  },
}

export default nextConfig
