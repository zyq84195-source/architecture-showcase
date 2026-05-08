import type { Metadata } from 'next'
// @ts-ignore
import cases from '@/data/cases.json'
import CaseDetailClient from './CaseDetailClient'

interface CaseDetailPageProps {
  params: Promise<{ id: string }>
}

const SITE_URL = 'https://architecture-showcase.vercel.app'
const SITE_NAME = 'Architecture Showcase'

/**
 * 为每个案例生成动态 metadata（SEO 核心能力）
 * - 搜索引擎通过 title / description 理解页面内容
 * - Open Graph / Twitter Card 控制社交分享展示
 */
export async function generateMetadata({ params }: CaseDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const caseData = (cases as any[]).find((c) => c.id === id)

  if (!caseData) {
    return {
      title: '案例未找到 - Architecture Showcase',
      description: '该案例可能已被删除或不存在。',
    }
  }

  const locationText = Array.isArray(caseData.location)
    ? caseData.location.join(', ')
    : caseData.location

  const mainImage = caseData.images?.find((img: any) => img.isMain) || caseData.images?.[0]

  const title = `${caseData.title} - ${SITE_NAME}`
  const description = caseData.description
    ? caseData.description.slice(0, 160)
    : `${caseData.title}，位于${locationText}的优秀建筑案例。`

  return {
    title,
    description,
    keywords: [
      ...(caseData.tags || []),
      caseData.case_type,
      locationText,
      '建筑案例',
      '城市更新',
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/cases/${id}`,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'zh_CN',
      images: mainImage
        ? [{ url: mainImage.url, alt: mainImage.caption || caseData.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: mainImage ? [mainImage.url] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}/cases/${id}`,
    },
  }
}

/**
 * 生成静态路径，让 Next.js 在构建时预渲染所有案例页
 * 这对 SEO 至关重要：搜索引擎可以直接抓取完整的 HTML
 */
export async function generateStaticParams() {
  return (cases as any[]).map((c) => ({
    id: c.id,
  }))
}

/**
 * 构建 JSON-LD 结构化数据
 * 让搜索引擎理解这是一个"建筑项目"实体
 * 可能在搜索结果中展示富摘要（评分、图片、位置等）
 */
function buildJsonLd(caseData: any) {
  const locationText = Array.isArray(caseData.location)
    ? caseData.location.join(', ')
    : caseData.location

  const mainImage = caseData.images?.find((img: any) => img.isMain) || caseData.images?.[0]

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: caseData.title,
    description: caseData.description?.slice(0, 500),
    image: caseData.images?.map((img: any) => img.url) || [],
    url: `${SITE_URL}/cases/${caseData.id}`,
    locationCreated: {
      '@type': 'Place',
      name: locationText,
    },
    keywords: caseData.tags?.join(', '),
    dateCreated: caseData.created_at,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    ...(caseData.ratings?.average > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: caseData.ratings.average.toFixed(1),
        bestRating: '5',
        ratingCount: caseData.ratings.count,
      },
    }),
  }
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = await params
  const caseData = (cases as any[]).find((c) => c.id === id)

  return (
    <>
      {caseData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildJsonLd(caseData)),
          }}
        />
      )}
      <CaseDetailClient params={{ id }} />
    </>
  )
}
