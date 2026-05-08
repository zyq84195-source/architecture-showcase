import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '建筑案例浏览 - Architecture Showcase',
  description:
    '浏览所有精选建筑案例，涵盖城市更新、历史街区保护、社区更新等多个领域。支持按类型、地区筛选和排序。',
  keywords: ['建筑案例', '案例浏览', '城市更新', '历史街区', '文化保护', '建筑设计'],
  openGraph: {
    title: '建筑案例浏览 - Architecture Showcase',
    description: '浏览所有精选建筑案例，涵盖城市更新、历史街区保护、社区更新等多个领域。',
    url: 'https://architecture-showcase.vercel.app/cases',
    siteName: 'Architecture Showcase',
    type: 'website',
    locale: 'zh_CN',
  },
  alternates: {
    canonical: 'https://architecture-showcase.vercel.app/cases',
  },
}

export default function CasesLayout({ children }: { children: React.ReactNode }) {
  return children
}
