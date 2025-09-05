/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  // React configuration
  reactStrictMode: true,
  // Enable Turbopack
  experimental: {
    turbo: {
      // Add any Turbopack-specific configurations here
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.svg',
        },
      },
    },
  },
}

module.exports = nextConfig
