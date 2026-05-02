/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  webpack: (config, { webpack, nextRuntime }) => {
    if (nextRuntime === 'edge') {
      config.plugins.push(
        new webpack.DefinePlugin({
          '__dirname': JSON.stringify('/'),
          '__filename': JSON.stringify('/middleware.js'),
        })
      )
    }
    return config
  },
}

export default nextConfig
