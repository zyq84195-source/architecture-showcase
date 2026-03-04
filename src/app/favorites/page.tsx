'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import CaseCard from '@/components/case-card'

interface Case {
  id: string
  title: string
  description: string
  images: any[]
  architect: string
  location: string | string[]
  tags: string[]
  likes_count: number
  reviews_count: number
  created_at: string
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Case[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    // 获取当前用户
    const user = localStorage.getItem('currentUser')
    if (user) {
      setCurrentUser(JSON.parse(user))
    }

    // 获取收藏的案例
    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]')
    const allCases: Case[] = require('@/data/cases.json')
    const favoriteCases = allCases.filter((c) => favoriteIds.includes(c.id))
    setFavorites(favoriteCases)
  }, [])

  const handleRemoveFavorite = (caseId: string) => {
    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]')
    const newFavorites = favoriteIds.filter((id: string) => id !== caseId)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))

    // 更新显示
    const allCases: Case[] = require('@/data/cases.json')
    const favoriteCases = allCases.filter((c) => newFavorites.includes(c.id))
    setFavorites(favoriteCases)
  }

  const handleLike = (caseId: string) => {
    // 更新点赞数（模拟）
    const allCases: Case[] = require('@/data/cases.json')
    const caseIndex = allCases.findIndex(c => c.id === caseId)
    if (caseIndex !== -1) {
      allCases[caseIndex].likes_count++
      setFavorites([...allCases.filter(c => {
        const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]')
        return favoriteIds.includes(c.id)
      })])
    }
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
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                  案例
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                  搜索
                </Button>
              </Link>
              <Link href="/favorites">
                <Button variant="ghost" className="text-blue-600 hover:bg-blue-50">
                  我的收藏
                </Button>
              </Link>
              <div className="w-px h-6 bg-gray-200 mx-2"></div>
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{currentUser.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      localStorage.removeItem('currentUser')
                      window.location.href = '/'
                    }}
                    className="btn-secondary-elegant"
                  >
                    退出
                  </Button>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        {/* 页面标题 */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-heading mb-4">
            我的收藏
          </h1>
          <p className="text-body text-lg">
            共收藏 {favorites.length} 个案例
          </p>
        </div>

        {/* 未登录提示 */}
        {!currentUser && (
          <div className="elegant-card p-8 text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-heading mb-2">
              请先登录
            </h2>
            <p className="text-body mb-6">
              登录后可以收藏你喜欢的案例
            </p>
            <Link href="/auth/login">
              <Button className="btn-primary-elegant">
                立即登录
              </Button>
            </Link>
          </div>
        )}

        {/* 收藏列表 */}
        {currentUser && favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((caseItem: any, index: number) => (
              <div key={caseItem.id} className="animate-fade-in relative" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="absolute top-2 right-2 z-10">
                  <button
                    onClick={() => handleRemoveFavorite(caseItem.id)}
                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                    title="取消收藏"
                  >
                    <span className="text-red-500">❤️</span>
                  </button>
                </div>
                <CaseCard case={caseItem} />
              </div>
            ))}
          </div>
        ) : currentUser && favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-bold text-heading mb-2">
              还没有收藏
            </h3>
            <p className="text-body mb-6">
              浏览案例并点击收藏按钮，添加你喜欢的案例
            </p>
            <Link href="/cases">
              <Button className="btn-primary-elegant">
                浏览案例
              </Button>
            </Link>
          </div>
        ) : null}
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
