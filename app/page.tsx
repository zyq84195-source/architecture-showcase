'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useAuthAction } from '@/hooks/useAuthAction'
import LoginModal from '@/components/LoginModal'
import CaseCard from '@/components/case-card'
import cases from '@/data/cases.json'

function Nav({ onLoginClick }: { onLoginClick: () => void }) {
  const { user, profile, signOut } = useAuth()
  const { requireAuth } = useAuthAction()
  const pathname = usePathname()

  return (
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
              <Button variant="ghost" className="text-gray-600 hover:text-foreground hover:bg-gray-100 text-sm h-9 px-3">
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
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-foreground hover:bg-gray-100 text-sm h-9 px-3"
              onClick={() => requireAuth(() => { window.location.href = '/admin/cases' })}
            >
              管理
            </Button>
            {/* 右侧：登录状态 */}
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
                  onClick={onLoginClick}
                >
                  登录 / 注册
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default function HomePage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { requireAuth } = useAuthAction()

  const totalImages = cases.reduce((sum: number, c: any) => sum + (c.images?.length || 0), 0)
  const totalLikes = cases.reduce((sum: number, c: any) => sum + (c.likes_count || 0), 0)
  const totalReviews = cases.reduce((sum: number, c: any) => sum + (c.reviews_count || 0), 0)

  const stats = [
    { value: cases.length, label: '精选案例', suffix: '+' },
    { value: totalImages, label: '高清图片', suffix: '' },
    { value: totalLikes, label: '总点赞', suffix: '' },
    { value: totalReviews, label: '总评论', suffix: '' },
  ]

  return (
    <div className="min-h-screen bg-elegant-gradient text-foreground">
      {/* 导航栏 */}
      <Nav onLoginClick={() => setShowLoginModal(true)} />

      {/* Hero */}
      <section className="bg-hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-gray-300 mb-6 border border-white/10">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              精选 {cases.length} 个建筑案例
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-5">
              探索优秀
              <br />
              <span className="text-blue-400">建筑案例</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8 max-w-xl">
              从城市更新到文化保护，精心收录国内优秀建筑案例，获取设计灵感与专业参考。
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/cases">
                <Button className="bg-white text-gray-900 hover:bg-gray-100 h-11 px-6 rounded-xl text-sm font-medium shadow-lg">
                  浏览所有案例
                </Button>
              </Link>
              <Button
                className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20 h-11 px-6 rounded-xl text-sm font-medium"
                onClick={() => requireAuth(() => { window.location.href = '/smart-search' })}
              >
                AI 智能搜索 →
              </Button>
            </div>
          </div>

          {/* 统计条 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 pt-8 border-t border-white/10">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold tracking-tight">
                  {s.value}{s.suffix}
                </div>
                <div className="text-sm text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 精选案例 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-heading tracking-tight">精选案例</h2>
            <p className="text-gray-500 mt-2 text-sm">发现最新的优秀建筑项目</p>
          </div>
          {cases.length > 6 && (
            <Link href="/cases" className="text-sm font-medium text-gray-500 hover:text-foreground transition-colors hidden sm:block">
              查看全部 →
            </Link>
          )}
        </div>

        {cases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.slice(0, 6).map((caseItem: any) => (
              <CaseCard key={caseItem.id} case={caseItem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📁</div>
            <p className="text-gray-500">暂无案例数据</p>
          </div>
        )}

        {cases.length > 6 && (
          <div className="text-center mt-10 sm:hidden">
            <Link href="/cases">
              <Button variant="outline" className="rounded-xl text-sm h-10 px-6">
                查看全部 {cases.length} 个案例 →
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* 页脚 */}
      <footer className="border-t border-gray-200/60 bg-white/40">
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
