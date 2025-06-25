/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Fix tunnel connection issues
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Localhost specific settings
  async rewrites() {
    return []
  },
  // Disable problematic features that can cause tunnel issues
  compress: false,
  poweredByHeader: false,
  // Simplified configuration to avoid networking issues
  env: {
    HOSTNAME: 'localhost',
  },
}

export default nextConfig
