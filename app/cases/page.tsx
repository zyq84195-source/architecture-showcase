'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import CaseCard from '@/components/case-card'
// @ts-ignore
import cases from '@/data/cases.json'

export default function CasesPage() {
  const [selectedType, setSelectedType] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // 筛选和排序
  const filteredCases = cases.filter((caseItem: any) => {
    const locationText = Array.isArray(caseItem.location)
      ? caseItem.location.join(' ')
      : caseItem.location

    const matchesType = !selectedType ||
      caseItem.tags.includes(selectedType) ||
      caseItem.case_type?.includes(selectedType)

    const matchesLocation = !selectedLocation ||
      locationText.includes(selectedLocation)

    return matchesType && matchesLocation
  })

  // 排序
  const sortedCases = [...filteredCases].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'likes':
        return (b.likes_count || 0) - (a.likes_count || 0)
      case 'reviews':
        return (b.reviews_count || 0) - (a.reviews_count || 0)
      default:
        return 0
    }
  })

  // 分页
  const totalPages = Math.ceil(sortedCases.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCases = sortedCases.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-heading mb-2">
            所有案例
          </h1>
          <p className="text-body text-lg">
            共收录 <span className="font-bold text-blue-600">{cases.length}</span> 个优秀建筑案例
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
          <div className="elegant-card p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {cases.length}+
            </div>
            <div className="text-body text-sm">精选案例</div>
          </div>
          <div className="elegant-card p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {sortedCases.reduce((sum, c: any) => sum + (c.images?.length || 0), 0)}
            </div>
            <div className="text-body text-sm">高清图片</div>
          </div>
          <div className="elegant-card p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {cases.reduce((sum, c: any) => sum + (c.likes_count || 0), 0)}
            </div>
            <div className="text-body text-sm">总点赞数</div>
          </div>
          <div className="elegant-card p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {cases.reduce((sum, c: any) => sum + (c.reviews_count || 0), 0)}
            </div>
            <div className="text-body text-sm">总评论数</div>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="elegant-card p-6 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">案例类型：</label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">全部类型</option>
                <option value="城市更新">城市更新</option>
                <option value="文化保护">文化保护</option>
                <option value="社区更新">社区更新</option>
                <option value="历史街区">历史街区</option>
                <option value="历史建筑">历史建筑</option>
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">地区：</label>
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">全部地区</option>
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
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">排序：</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="newest">最新</option>
                <option value="likes">最多点赞</option>
                <option value="reviews">最多评论</option>
              </select>
            </div>
            <Button
              onClick={() => {
                setSelectedType('')
                setSelectedLocation('')
                setCurrentPage(1)
              }}
              className="btn-secondary-elegant"
            >
              重置筛选
            </Button>
          </div>
        </div>

        {/* 结果统计 */}
        <div className="mb-6 text-center text-body">
          <p>
            显示 <span className="font-bold text-blue-600">{startIndex + 1}-{Math.min(endIndex, filteredCases.length)}</span> /
            共 <span className="font-bold text-blue-600">{filteredCases.length}</span> 个案例
          </p>
        </div>

        {/* 案例列表 */}
        {currentCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentCases.map((caseItem: any, index: number) => (
              <div key={caseItem.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <CaseCard case={caseItem} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 elegant-card">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-heading mb-2">
              没有找到相关案例
            </h3>
            <p className="text-body mb-6">
              试试调整筛选条件
            </p>
            <Button
              onClick={() => {
                setSelectedType('')
                setSelectedLocation('')
                setCurrentPage(1)
              }}
              className="btn-primary-elegant"
            >
              清空筛选
            </Button>
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12 animate-fade-in">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              className="btn-secondary-elegant"
            >
              ← 上一页
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              className="btn-secondary-elegant"
            >
              下一页 →
            </Button>
          </div>
        )}
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
