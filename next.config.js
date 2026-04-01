/** @type {import('next').NextConfig} */
const nextConfig = {
  port: 3001,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig
