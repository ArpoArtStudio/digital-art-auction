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
  // Enhanced fixes for tunnel connection issues
  experimental: {
    scrollRestoration: true,
  },
  // External packages moved to the correct location
  serverExternalPackages: [],
  // Set proper HTTP keep-alive options
  compress: true,
  poweredByHeader: false,
  // Improved connection settings
  httpAgentOptions: {
    keepAlive: true,
  },
  // Increase timeouts to prevent ERR_TUNNEL_CONNECTION_FAILED
  staticPageGenerationTimeout: 120,
}

export default nextConfig
