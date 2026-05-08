/** @type {import('next').NextConfig} */
const nextConfig = {
  // 允许跨域访问（开发环境）
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://192.168.43.137:3000',
    'http://localhost',
    'http://192.168.43.137',
  ],
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

// Turbopack 已在 next 16 默认启用，构建字体问题用 webpack 回退
// 下行仅在需要时取消注释：
// nextConfig.turbopack = false;

module.exports = nextConfig
