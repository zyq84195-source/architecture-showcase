'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useAuthAction } from '@/hooks/useAuthAction'
import CaseCard from '@/components/case-card'
import LoginModal from '@/components/LoginModal'
// @ts-ignore
import cases from '@/data/cases.json'

export default function CasesPage() {
  const { user, profile, signOut } = useAuth()
  const { requireAuth } = useAuthAction()
  const [selectedType, setSelectedType] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const itemsPerPage = 9

  const filteredCases = cases.filter((caseItem: any) => {
    const locationText = Array.isArray(caseItem.location)
      ? caseItem.location.join(' ')
      : caseItem.location
    const matchesType = !selectedType ||
      caseItem.tags.includes(selectedType) ||
      caseItem.case_type?.includes(selectedType)
    const matchesLocation = !selectedLocation || locationText.includes(selectedLocation)
    return matchesType && matchesLocation
  })

  const sortedCases = [...filteredCases].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'likes': return (b.likes_count || 0) - (a.likes_count || 0)
      case 'reviews': return (b.reviews_count || 0) - (a.reviews_count || 0)
      default: return 0
    }
  })

  const totalPages = Math.ceil(sortedCases.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCases = sortedCases.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetFilters = () => {
    setSelectedType('')
    setSelectedLocation('')
    setSortBy('newest')
    setCurrentPage(1)
  }

  const hasFilters = selectedType || selectedLocation || sortBy !== 'newest'

  return (
    <div className="min-h-screen bg-elegant-gradient text-foreground">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-base font-semibold text-heading tracking-tight">Architecture Showcase</span>
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/cases">
                <Button variant="ghost" className="text-foreground hover:bg-gray-100 text-sm h-9 px-3">
                  案例
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-foreground hover:bg-gray-100 text-sm h-9 px-3"
                onClick={() => requireAuth(() => { window.location.href = '/search' })}
              >
                搜索
              </Button>
              <Button
                className="bg-foreground text-white hover:bg-gray-800 text-sm h-9 px-3 rounded-lg shadow-none"
                onClick={() => requireAuth(() => { window.location.href = '/smart-search' })}
              >
                AI 搜索
              </Button>
              <div className="ml-2 pl-2 border-l border-gray-200 flex items-center gap-2">
                {user ? (
                  <>
                    <span className="text-sm text-gray-600 max-w-[100px] truncate">
                      {profile?.username || user.email || '用户'}
                    </span>
                    <Button
                      variant="ghost"
                      className="text-gray-400 hover:text-red-500 text-sm h-9 px-2"
                      onClick={signOut}
                    >
                      登出
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-foreground hover:bg-gray-100 text-sm h-9 px-3"
                    onClick={() => setShowLoginModal(true)}
                  >
                    登录 / 注册
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-heading tracking-tight">所有案例</h1>
          <p className="text-gray-500 mt-2 text-sm">
            共收录 <span className="font-semibold text-foreground">{cases.length}</span> 个优秀建筑案例
          </p>
        </div>

        {/* 筛选栏 */}
        <div className="elegant-card p-4 mb-8">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1) }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-gray-300 bg-white transition-all"
            >
              <option value="">全部类型</option>
              <option value="城市更新">城市更新</option>
              <option value="文化保护">文化保护</option>
              <option value="社区更新">社区更新</option>
              <option value="历史街区">历史街区</option>
              <option value="历史建筑">历史建筑</option>
            </select>
            <select
              value={selectedLocation}
              onChange={(e) => { setSelectedLocation(e.target.value); setCurrentPage(1) }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-gray-300 bg-white transition-all"
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
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-gray-300 bg-white transition-all"
            >
              <option value="newest">最新发布</option>
              <option value="likes">最多点赞</option>
              <option value="reviews">最多评论</option>
            </select>
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-sm text-gray-500 hover:text-foreground transition-colors"
              >
                重置
              </button>
            )}
            <div className="ml-auto text-sm text-gray-400">
              {filteredCases.length} 个结果
            </div>
          </div>
        </div>

        {/* 案例列表 */}
        {currentCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCases.map((caseItem: any) => (
              <CaseCard key={caseItem.id} case={caseItem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 elegant-card">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-heading mb-2">没有找到相关案例</h3>
            <p className="text-gray-500 text-sm mb-6">试试调整筛选条件</p>
            <Button onClick={resetFilters} className="btn-primary-elegant">
              清空筛选
            </Button>
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-lg text-sm font-medium flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  currentPage === page
                    ? 'bg-foreground text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-lg text-sm font-medium flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100"
            >
              →
            </button>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="border-t border-gray-200/60 bg-white/40 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <span className="text-sm text-gray-500">Architecture Showcase</span>
            </div>
            <p className="text-xs text-gray-400">© 2026 建筑案例展示平台</p>
          </div>
        </div>
      </footer>

      {/* 登录弹窗 */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  )
}
