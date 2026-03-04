import Link from 'next/link'
import { Button } from '@/components/ui/button'
import CaseCard from '@/components/case-card'
// @ts-ignore
import cases from '@/data/cases.json'

export default function CasesPage() {
  return (
    <div className="min-h-screen bg-elegant-gradient text-foreground">
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
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/cases">
                <Button variant="ghost" className="text-blue-600 hover:bg-blue-50">
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

      <main className="container mx-auto px-6 py-12">
        {/* 页面标题 */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-heading mb-4">
            所有案例
          </h1>
          <p className="text-body text-lg">
            共收录 {cases.length} 个优秀建筑案例
          </p>
        </div>

        {/* 筛选栏 */}
        <div className="elegant-card p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">案例类型：</label>
              <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">全部</option>
                <option value="城市更新">城市更新</option>
                <option value="文化保护">文化保护</option>
                <option value="社区更新">社区更新</option>
                <option value="历史街区">历史街区</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">地区：</label>
              <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">全部</option>
                <option value="北京">北京</option>
                <option value="上海">上海</option>
                <option value="广州">广州</option>
                <option value="深圳">深圳</option>
                <option value="重庆">重庆</option>
                <option value="成都">成都</option>
                <option value="杭州">杭州</option>
                <option value="贵阳">贵阳</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">排序：</label>
              <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="newest">最新</option>
                <option value="likes">最多点赞</option>
                <option value="reviews">最多评论</option>
              </select>
            </div>
            <Button className="ml-auto btn-primary-elegant">
              应用筛选
            </Button>
          </div>
        </div>

        {/* 案例列表 */}
        {cases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cases.map((caseItem: any, index: number) => (
              <div key={caseItem.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
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

        {/* 统计信息 */}
        <div className="mt-12 text-center">
          <p className="text-body">
            显示 1-{cases.length} / 共 {cases.length} 个案例
          </p>
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
