import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Architecture Showcase - 优秀建筑案例展示平台',
    template: '%s | Architecture Showcase',
  },
  description:
    '精心收录优秀建筑案例，从城市更新到文化保护，获取设计灵感与专业参考。包含南京小西湖、广州恩宁路等经典建筑项目。',
  keywords: [
    '建筑案例',
    '城市更新',
    '文化保护',
    '历史街区',
    '建筑设计',
    '南京小西湖',
    '广州恩宁路',
    '北京大栅栏',
    '深圳南头古城',
    '成都太古里',
    '建筑案例展示',
  ],
  authors: [{ name: 'Architecture Showcase' }],
  creator: 'Architecture Showcase',
  metadataBase: new URL('https://architecture-showcase.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Architecture Showcase - 优秀建筑案例展示平台',
    description:
      '精心收录优秀建筑案例，从城市更新到文化保护，获取设计灵感与专业参考。',
    type: 'website',
    locale: 'zh_CN',
    siteName: 'Architecture Showcase',
    url: 'https://architecture-showcase.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Architecture Showcase - 优秀建筑案例展示平台',
    description:
      '精心收录优秀建筑案例，从城市更新到文化保护，获取设计灵感与专业参考。',
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
    // TODO: 添加 Google Search Console 验证码后填入
    google: '',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
