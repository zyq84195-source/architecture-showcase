import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Architecture Showcase - 优秀建筑案例展示平台',
  description: '精心收录优秀建筑案例，从城市更新到文化保护，获取设计灵感与专业参考。包含南京小西湖、广州恩宁路等经典建筑项目。',
  keywords: '建筑案例, 城市更新, 文化保护, 历史街区, 建筑设计, 南京小西湖, 广州恩宁路',
  authors: [{ name: 'Architecture Showcase' }],
  openGraph: {
    title: 'Architecture Showcase - 优秀建筑案例展示平台',
    description: '精心收录优秀建筑案例，从城市更新到文化保护，获取设计灵感与专业参考',
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Architecture Showcase - 优秀建筑案例展示平台',
    description: '精心收录优秀建筑案例，从城市更新到文化保护，获取设计灵感与专业参考',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '', // 需要添加Google Search Console验证码
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
