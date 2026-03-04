'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
// @ts-ignore
import cases from '@/data/cases.json'

interface Case {
  id: string
  title: string
  description: string
  images: Array<{
    id: string
    filename: string
    url: string
    caption: string
    isMain: boolean
    order: number
  }>
  architect: string
  location: string | string[]
  tags: string[]
  scale?: string
  investment?: string
  participants?: string
  start_date?: string
  awards?: string
  case_type?: string
  sustainable_goal?: string
  demo_significance?: string
  likes_count: number
  reviews_count: number
  created_at: string
  _raw?: any
}

interface CaseDetailPageProps {
  params: { id: string }
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Array<{ id: number; user: string; text: string; date: string }>>([])

  useEffect(() => {
    const found = cases.find((c: any) => c.id === params.id)
    if (found) {
      setCaseData(found)
      setLikesCount(found.likes_count)
    }

    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]')
    if (favoriteIds.includes(params.id)) {
      setIsFavorited(true)
    }

    const allComments = JSON.parse(localStorage.getItem(`comments_${params.id}`) || '[]')
    setComments(allComments)
  }, [params.id])

  if (!caseData) {
    return (
      <div className="min-h-screen bg-elegant-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📁</div>
          <h1 className="text-2xl font-bold mb-2">案例未找到</h1>
          <p className="text-body mb-4">该案例可能已被删除或不存在</p>
          <Link href="/">
            <Button className="btn-primary-elegant">返回首页</Button>
          </Link>
        </div>
      </div>
    )
  }

  const locationText = Array.isArray(caseData.location) ? caseData.location.join(', ') : caseData.location
  const mainImage = caseData.images.find(img => img.isMain) || caseData.images[0]
  const detailImages = caseData.images.filter(img => !img.isMain)

  const raw = caseData._raw || {}

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
  }

  const handleFavorite = () => {
    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]')
    if (favoriteIds.includes(caseData.id)) {
      const newFavorites = favoriteIds.filter((fid: string) => fid !== caseData.id)
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      setIsFavorited(false)
    } else {
      favoriteIds.push(caseData.id)
      localStorage.setItem('favorites', JSON.stringify(favoriteIds))
      setIsFavorited(true)
    }
  }

  const handleSubmitComment = () => {
    if (!newComment.trim()) return

    const user = JSON.parse(localStorage.getItem('currentUser') || 'null')
    if (!user) {
      alert('请先登录后再评论')
      return
    }

    const comment = {
      id: Date.now(),
      user: user.name,
      text: newComment,
      date: new Date().toISOString()
    }

    const allComments = [...comments, comment]
    setComments(allComments)
    localStorage.setItem(`comments_${caseData.id}`, JSON.stringify(allComments))
    setNewComment('')
  }

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
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                  我的收藏
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
        {/* 案例标题 */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>案例</span>
            <span>/</span>
            <span className="text-blue-600">{caseData.id.replace('excel_', '')}</span>
          </div>
          <div className="flex items-start justify-between">
            <h1 className="text-4xl font-bold text-heading mb-4 flex-1">
              {caseData.title}
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleFavorite}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isFavorited
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isFavorited ? '❤️ 已收藏' : '🤍 收藏'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-1.5 hover:text-red-500 transition-colors"
                >
                  <span className={isLiked ? 'text-red-500' : 'text-gray-400'}>
                    {isLiked ? '❤' : '🤍'}
                  </span>
                  <span>{likesCount}</span>
                </button>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <span className="text-blue-400">💬</span>
                  <span>{caseData.reviews_count}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主图 */}
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

        {/* 完整详细信息 */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 所在区位 */}
          {caseData.location && (
            <div className="elegant-card p-6">
              <h2 className="text-2xl font-bold text-heading mb-4">所在区位</h2>
              <p className="text-body">{locationText}</p>
            </div>
          )}

          {/* 参与主体 */}
          {caseData.participants && (
            <div className="elegant-card p-6">
              <h2 className="text-2xl font-bold text-heading mb-4">参与主体</h2>
              <p className="text-body whitespace-pre-line">{caseData.participants}</p>
            </div>
          )}

          {/* 项目介绍 */}
          {caseData.description && (
            <div className="elegant-card p-6">
              <h2 className="text-2xl font-bold text-heading mb-4">项目介绍</h2>
              <p className="text-body leading-relaxed whitespace-pre-line">
                {caseData.description}
              </p>
            </div>
          )}

          {/* 项目规模 */}
          {caseData.scale && (
            <div className="elegant-card p-6">
              <h2 className="text-2xl font-bold text-heading mb-4">项目规模</h2>
              <p className="text-body whitespace-pre-line">{caseData.scale}</p>
            </div>
          )}

          {/* 总投资额 */}
          {caseData.investment && (
            <div className="elegant-card p-6">
              <h2 className="text-2xl font-bold text-heading mb-4">总投资额</h2>
              <p className="text-body whitespace-pre-line">{caseData.investment}</p>
            </div>
          )}

          {/* 起止时间 */}
          {caseData.start_date && (
            <div className="elegant-card p-6">
              <h2 className="text-2xl font-bold text-heading mb-4">起止时间</h2>
              <p className="text-body whitespace-pre-line">{caseData.start_date}</p>
            </div>
          )}

          {/* 获奖情况 */}
          {caseData.awards && (
            <div className="elegant-card p-6">
              <h2 className="text-2xl font-bold text-heading mb-4">获奖情况</h2>
              <p className="text-body whitespace-pre-line">{caseData.awards}</p>
            </div>
          )}

          {/* 案例类型 */}
          {caseData.case_type && (
            <div className="elegant-card p-6">
              <h2 className="text-2xl font-bold text-heading mb-4">案例类型</h2>
              <p className="text-body whitespace-pre-line">{caseData.case_type}</p>
            </div>
          )}

          {/* 可持续目标 */}
          {caseData.sustainable_goal && (
            <div className="elegant-card p-6">
              <h2 className="text-2xl font-bold text-heading mb-4">可持续目标</h2>
              <p className="text-body whitespace-pre-line">{caseData.sustainable_goal}</p>
            </div>
          )}

          {/* 示范意义 */}
          {caseData.demo_significance && (
            <div className="elegant-card p-6">
              <h2 className="text-2xl font-bold text-heading mb-4">示范意义</h2>
              <p className="text-body whitespace-pre-line">{caseData.demo_significance}</p>
            </div>
          )}

          {/* 建设阶段 */}
          {raw['建设阶段'] && (
            <div className="elegant-card p-6">
              <h2 className="text-2xl font-bold text-heading mb-4">建设阶段</h2>
              <p className="text-body whitespace-pre-line">{raw['建设阶段']}</p>
            </div>
          )}

          {/* 项目获奖评价 */}
          {raw['项目获奖评价'] && (
            <div className="elegant-card p-6">
              <h2 className="text-2xl font-bold text-heading mb-4">项目获奖评价</h2>
              <p className="text-body whitespace-pre-line">{raw['项目获奖评价']}</p>
            </div>
          )}

          {/* 项目举措 */}
          {raw['项目举措'] && (
            <div className="elegant-card p-6">
              <h2 className="text-2xl font-bold text-heading mb-4">项目举措</h2>
              <p className="text-body whitespace-pre-line">{raw['项目举措']}</p>
            </div>
          )}

          {/* 信息来源 */}
          {raw['信息来源'] && (
            <div className="elegant-card p-6">
              <h2 className="text-2xl font-bold text-heading mb-4">信息来源</h2>
              <p className="text-body whitespace-pre-line">{raw['信息来源']}</p>
            </div>
          )}

          {/* 附图（更多图片） */}
          {detailImages.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-heading mb-6">附图</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {detailImages.map((img, index) => (
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
          <div>
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
        </div>

        {/* 评论区域 */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-heading mb-6">
            评论 ({comments.length})
          </h2>

          <div className="elegant-card p-6 mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写下你的评论..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"
              rows={4}
            />
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="btn-primary-elegant"
              >
                发表评论
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="elegant-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-heading">{comment.user}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.date).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-body text-sm">{comment.text}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-body">
                还没有评论，快来发表第一条评论吧！
              </div>
            )}
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
