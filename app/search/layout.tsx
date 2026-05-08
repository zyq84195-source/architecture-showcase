import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '搜索建筑案例 - Architecture Showcase',
  description:
    '通过关键词搜索建筑案例，快速找到城市更新、历史街区保护等领域的优秀项目。',
  keywords: ['建筑案例搜索', '城市更新案例', '建筑设计搜索'],
  openGraph: {
    title: '搜索建筑案例 - Architecture Showcase',
    description: '通过关键词搜索建筑案例，快速找到优秀项目。',
    url: 'https://architecture-showcase.vercel.app/search',
    siteName: 'Architecture Showcase',
    type: 'website',
    locale: 'zh_CN',
  },
  alternates: {
    canonical: 'https://architecture-showcase.vercel.app/search',
  },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
