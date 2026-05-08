import { MetadataRoute } from 'next'
// @ts-ignore
import cases from '@/data/cases.json'

const BASE_URL = 'https://architecture-showcase.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // 公开页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/cases`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/smart-search`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // 每个案例详情页
  const casePages: MetadataRoute.Sitemap = (cases as any[]).map((caseItem) => ({
    url: `${BASE_URL}/cases/${caseItem.id}`,
    lastModified: caseItem.created_at ? new Date(caseItem.created_at) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...casePages]
}
