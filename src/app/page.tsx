import Link from 'next/link'
import { Button } from '@/components/ui/button'
import CaseCard from '@/components/case-card'
// @ts-ignore
import cases from '@/data/cases.json'

export default function HomePage() {
  const totalImages = cases.reduce((sum, c: any) => sum + (c.images?.length || 0), 0)
  const totalLikes = cases.reduce((sum, c: any) => sum + (c.likes_count || 0), 0)
  const totalReviews = cases.reduce((sum, c: any) => sum + (c.reviews_count || 0), 0)

  return (
    <div className="min-h-screen bg-elegant-gradient text-foreground">
      {/* 优雅导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-elegant">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Architecture Showcase</h1>
            </Link>
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/cases">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                  案例
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                  搜索
                </Button>
              </Link>
              <div className="w-px h-6 bg-gray-200 mx-2"></div>
              <Link href="/auth/register">
                <Button className="btn-primary-elegant">
                  注册
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="btn-secondary-elegant">
                  登录
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <main className="container mx-auto px-6">
        <div className="py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
            {/* 主标题 */}
            <h1 className="text-5xl md:text-6xl font-bold text-heading mb-6 leading-tight">
              探索优秀
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                建筑案例
              </span>
            </h1>

            {/* 副标题 */}
            <p className="text-xl md:text-2xl text-body mb-8 max-w-2xl mx-auto">
              精心收录<span className="font-bold text-blue-600">{cases.length}</span>个优秀建筑案例
              <span className="block md:inline">，{totalImages}张高清图片</span>，
              <span className="block md:inline">获取设计灵感与专业参考</span>
            </p>

            {/* CTA按钮组 */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link href="/cases" className="w-full md:w-auto">
                <Button className="btn-primary-elegant px-8 py-4 text-lg w-full md:w-auto">
                  📋 浏览所有案例
                </Button>
              </Link>
              <Link href="/search" className="w-full md:w-auto">
                <Button variant="outline" className="btn-secondary-elegant px-8 py-4 text-lg w-full md:w-auto">
                  🔍 搜索案例
                </Button>
              </Link>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="elegant-card p-6 text-center hover:shadow-elegant-hover transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2 animate-fade-in">
                {cases.length}+
              </div>
              <div className="text-body">精选案例</div>
            </div>
            <div className="elegant-card p-6 text-center hover:shadow-elegant-hover transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {totalImages}
              </div>
              <div className="text-body">高清图片</div>
            </div>
            <div className="elegant-card p-6 text-center hover:shadow-elegant-hover transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {totalLikes}
              </div>
              <div className="text-body">总点赞数</div>
            </div>
            <div className="elegant-card p-6 text-center hover:shadow-elegant-hover transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                {totalReviews}
              </div>
              <div className="text-body">总评论数</div>
            </div>
          </div>

          {/* 案例展示 */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-2xl font-bold text-heading mb-6">
              精选案例
            </h2>
          </div>
          {cases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cases.slice(0, 6).map((caseItem: any, index: number) => (
                <div key={caseItem.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CaseCard case={caseItem} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-body text-lg">暂无案例数据</p>
            </div>
          )}

          {/* 查看更多按钮 */}
          {cases.length > 6 && (
            <div className="text-center mb-12 animate-fade-in">
              <Link href="/cases">
                <Button variant="outline" className="btn-secondary-elegant px-8 py-3 text-lg">
                  查看全部 {cases.length} 个案例 →
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-body text-sm">
            <p>© 2026 Architecture Showcase. 建筑案例展示平台</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
