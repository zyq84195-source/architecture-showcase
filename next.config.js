/** @type {import('next').NextConfig} */
const nextConfig = {
  // transpilePackages: ['architecture-search-framework'], // Disabled to fix module resolution
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  webpack: (config, { isServer }) => {
    // Fix module resolution for architecture-search-framework
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // Ensure external packages are not bundled
    if (isServer) {
      config.externals = [...(config.externals || []), 'sharp'];
    }
    
    return config;
  },
}

module.exports = nextConfig
