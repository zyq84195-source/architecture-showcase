import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI 智能搜索 - Architecture Showcase',
  description:
    '使用 AI 智能搜索建筑案例，通过自然语言描述快速匹配最相关的建筑项目。',
  keywords: ['AI建筑搜索', '智能搜索', '建筑案例', '自然语言搜索'],
  openGraph: {
    title: 'AI 智能搜索 - Architecture Showcase',
    description: '使用 AI 智能搜索建筑案例，快速匹配最相关的项目。',
    url: 'https://architecture-showcase.vercel.app/smart-search',
    siteName: 'Architecture Showcase',
    type: 'website',
    locale: 'zh_CN',
  },
}

export default function SmartSearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
