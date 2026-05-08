import { MetadataRoute } from 'next'
// @ts-ignore
import cases from '@/data/cases.json'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://architecture-showcase.vercel.app'

  // 首页
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/cases`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // 所有案例页面
  cases.forEach((caseItem: any) => {
    routes.push({
      url: `${baseUrl}/cases/${caseItem.id}`,
      lastModified: new Date(caseItem.created_at),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  })

  return routes
}
