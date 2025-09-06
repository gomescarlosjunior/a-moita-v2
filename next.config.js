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
}

module.exports = nextConfig
