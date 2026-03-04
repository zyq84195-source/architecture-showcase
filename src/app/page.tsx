import Link from 'next/link'
import { Button } from '@/components/ui/button'
import CaseCard from '@/components/case-card'
// @ts-ignore
import cases from '@/data/cases.json'

export default function HomePage() {
  const totalImages = cases.reduce((sum: number, c: any) => sum + (c.images?.length || 0), 0)

  return (
    <div className="min-h-screen bg-elegant-gradient text-foreground">
      {/* 优雅导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
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
            <h1 className="text-5xl md:text-6xl font-bold text-heading mb-6 leading-tight">
              探索优秀
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                建筑案例
              </span>
            </h1>
            <p className="text-xl text-body mb-8 max-w-2xl mx-auto">
              精心收录{cases.length}个优秀建筑案例，{totalImages}张高清图片，从城市更新到文化保护，获取设计灵感与专业参考
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/cases">
                <Button className="btn-primary-elegant px-8 py-3 text-lg">
                  查看案例
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="outline" className="btn-secondary-elegant px-8 py-3 text-lg">
                  开始搜索
                </Button>
              </Link>
            </div>
          </div>

          {/* 案例展示 */}
          {cases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cases.map((caseItem: any, index: number) => (
                <div key={caseItem.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CaseCard case={caseItem} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-body text-lg">暂无案例数据，请先导入Excel数据</p>
            </div>
          )}

          {/* 统计数据 */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="elegant-card p-8 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{cases.length}+</div>
              <div className="text-body">精选案例</div>
            </div>
            <div className="elegant-card p-8 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{totalImages}</div>
              <div className="text-body">高清图片</div>
            </div>
            <div className="elegant-card p-8 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">16</div>
              <div className="text-body">结构化字段</div>
            </div>
          </div>
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
