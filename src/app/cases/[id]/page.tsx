import Link from 'next/link'
// @ts-ignore
import cases from '@/data/cases.json'

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const caseData = cases.find((c: any) => c.id === params.id)

  if (!caseData) {
    return (
      <div className="min-h-screen bg-elegant-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📁</div>
          <h1 className="text-2xl font-bold mb-2">案例未找到</h1>
          <p className="text-body mb-4">该案例可能已被删除或不存在</p>
          <Link href="/">
            <button className="btn-primary-elegant">返回首页</button>
          </Link>
        </div>
      </div>
    )
  }

  const locationText = Array.isArray(caseData.location) ? caseData.location.join(', ') : caseData.location
  const mainImage = caseData.images.find((img: any) => img.isMain) || caseData.images[0]
  const detailImages = caseData.images.filter((img: any) => !img.isMain)

  return (
    <div className="min-h-screen bg-elegant-gradient">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Architecture Showcase</h1>
            </Link>
            <Link href="/">
              <button className="text-gray-700 hover:text-blue-600 transition-colors">
                ← 返回列表
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        {/* 案例标题 */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>案例</span>
            <span>/</span>
            <span className="text-blue-600">{caseData.id.replace('excel_', '')}</span>
          </div>
          <h1 className="text-4xl font-bold text-heading mb-4">{caseData.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">👤</span>
              <span className="text-gray-700">{caseData.architect}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">📍</span>
              <span className="text-gray-700">{locationText}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-red-400">❤</span>
                <span>{caseData.likes_count}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-blue-400">💬</span>
                <span>{caseData.reviews_count}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 主图片 */}
        {mainImage && (
          <div className="max-w-6xl mx-auto mb-12">
            <div className="elegant-card p-4">
              <img
                src={mainImage.url}
                alt={mainImage.caption || caseData.title}
                className="w-full rounded-lg"
              />
              {mainImage.caption && (
                <p className="text-center text-gray-600 mt-4 text-sm italic">
                  {mainImage.caption}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 项目介绍 */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-heading mb-4">项目介绍</h2>
          <div className="elegant-card p-6">
            <p className="text-body leading-relaxed whitespace-pre-line">
              {caseData.description}
            </p>
          </div>
        </div>

        {/* 详细信息 */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-heading mb-6">详细信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caseData.scale && (
              <div className="elegant-card p-4">
                <div className="text-sm text-gray-500 mb-1">项目规模</div>
                <div className="text-body whitespace-pre-line">{caseData.scale}</div>
              </div>
            )}
            {caseData.investment && (
              <div className="elegant-card p-4">
                <div className="text-sm text-gray-500 mb-1">总投资额</div>
                <div className="text-body whitespace-pre-line">{caseData.investment}</div>
              </div>
            )}
            {caseData.start_date && (
              <div className="elegant-card p-4">
                <div className="text-sm text-gray-500 mb-1">起止时间</div>
                <div className="text-body whitespace-pre-line">{caseData.start_date}</div>
              </div>
            )}
            {caseData.case_type && (
              <div className="elegant-card p-4">
                <div className="text-sm text-gray-500 mb-1">案例类型</div>
                <div className="text-body whitespace-pre-line">{caseData.case_type}</div>
              </div>
            )}
          </div>
        </div>

        {/* 更多图片 */}
        {detailImages.length > 0 && (
          <div className="max-w-6xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-heading mb-6">更多图片</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {detailImages.map((img: any, index: number) => (
                <div key={img.id} className="elegant-card overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <img
                    src={img.url}
                    alt={img.caption || `图片 ${img.order}`}
                    className="w-full"
                    loading="lazy"
                  />
                  {img.caption && (
                    <div className="p-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 italic">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 标签 */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-heading mb-4">标签</h2>
          <div className="flex flex-wrap gap-2">
            {caseData.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 原始数据（保留用于开发调试） */}
        {caseData._raw && (
          <details className="max-w-4xl mx-auto">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              显示原始数据
            </summary>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg overflow-x-auto">
              <pre className="text-xs text-gray-600">
                {JSON.stringify(caseData._raw, null, 2)}
              </pre>
            </div>
          </details>
        )}
      </main>
    </div>
  )
}
