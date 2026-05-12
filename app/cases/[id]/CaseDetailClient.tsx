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
  ratings?: {
    total: number
    count: number
    average: number
  }
  created_at: string
  _raw?: any
}

interface CaseDetailPageProps {
  params: { id: string }
}

export default function CaseDetailClient({ params }: CaseDetailPageProps) {
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Array<{ id: number; user: string; text: string; date: string; rating?: number }>>([])
  const [userRating, setUserRating] = useState<number>(0)
  const [hasRated, setHasRated] = useState(false)

  useEffect(() => {
    const found = cases.find((c: any) => c.id === params.id)
    if (found) {
      setCaseData(found)
      setLikesCount(found.likes_count)
    }

    try {
      const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]')
      if (favoriteIds.includes(params.id)) setIsFavorited(true)
    } catch {}

    try {
      const allComments = JSON.parse(localStorage.getItem(`comments_${params.id}`) || '[]')
      setComments(allComments)
    } catch {}

    try {
      const userRatings = JSON.parse(localStorage.getItem('user_ratings') || '{}')
      if (userRatings[params.id] !== undefined) {
        setUserRating(userRatings[params.id])
        setHasRated(true)
      }
    } catch {}
  }, [params.id])

  if (!caseData) {
    return (
      <div className="min-h-screen bg-elegant-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 opacity-40">📁</div>
          <h1 className="text-xl font-semibold mb-2 text-heading">案例未找到</h1>
          <p className="text-gray-500 text-sm mb-6">该案例可能已被删除或不存在</p>
          <Link href="/">
            <Button className="btn-primary-elegant">返回首页</Button>
          </Link>
        </div>
      </div>
    )
  }

  const raw = caseData._raw || {}
  const locationText = Array.isArray(caseData.location) ? caseData.location.join(', ') : caseData.location
  const mainImage = caseData.images.find(img => img.isMain) || caseData.images[0]
  const detailImages = caseData.images.filter(img => !img.isMain)

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

  const handleRating = (rating: number) => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null')
    if (!user) { alert('请先登录后再评分'); return }
    if (hasRated) { alert('您已经评分过了'); return }
    setUserRating(rating)
    setHasRated(true)
    const userRatings = JSON.parse(localStorage.getItem('user_ratings') || '{}')
    userRatings[caseData.id] = rating
    localStorage.setItem('user_ratings', JSON.stringify(userRatings))
  }

  const handleSubmitComment = () => {
    if (!newComment.trim()) return
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null')
    if (!user) { alert('请先登录后再评论'); return }
    const comment = {
      id: Date.now(),
      user: user.name,
      text: newComment,
      date: new Date().toISOString(),
      rating: userRating
    }
    const allComments = [...comments, comment]
    setComments(allComments)
    localStorage.setItem(`comments_${caseData.id}`, JSON.stringify(allComments))
    setNewComment('')
  }

  const renderStars = (rating: number, interactive: boolean = false) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && handleRating(star)}
          disabled={!interactive || hasRated}
          className={`text-lg transition-all ${interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'} ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
        >
          ★
        </button>
      ))}
    </div>
  )

  const averageRating = caseData.ratings?.average || 0
  const ratingCount = caseData.ratings?.count || 0

  // 信息字段分组
  const infoFields = [
    { label: '区位', value: locationText },
    { label: '主体', value: caseData.participants || caseData.architect },
    { label: '规模', value: caseData.scale },
    { label: '投资', value: caseData.investment },
    { label: '时间', value: caseData.start_date },
    { label: '类型', value: caseData.case_type },
  ].filter(f => f.value)

  const hasContent =
    caseData.description ||
    caseData.sustainable_goal ||
    caseData.demo_significance ||
    raw['建设阶段'] ||
    raw['项目举措'] ||
    raw['项目获奖评价']

  return (
    <div className="min-h-screen bg-elegant-gradient">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-base font-semibold text-heading tracking-tight hidden sm:inline">Architecture Showcase</span>
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/cases">
                <Button variant="ghost" className="text-gray-600 hover:text-foreground hover:bg-gray-100 text-sm h-9 px-3">
                  案例
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="ghost" className="text-gray-600 hover:text-foreground hover:bg-gray-100 text-sm h-9 px-3">
                  搜索
                </Button>
              </Link>
              <Link href="/favorites">
                <Button variant="ghost" className="text-gray-600 hover:text-foreground hover:bg-gray-100 text-sm h-9 px-3">
                  收藏
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* 面包屑 */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-600 transition-colors">首页</Link>
          <span>/</span>
          <Link href="/cases" className="hover:text-gray-600 transition-colors">案例</Link>
          <span>/</span>
          <span className="text-gray-600">{caseData.title.slice(0, 12)}…</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：主内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 主图 */}
            {mainImage && (
              <div className="elegant-card overflow-hidden">
                <img
                  src={mainImage.url}
                  alt={mainImage.caption || caseData.title}
                  className="w-full"
                />
                {mainImage.caption && (
                  <div className="px-5 py-3 text-xs text-gray-500 italic border-t border-gray-100">
                    {mainImage.caption}
                  </div>
                )}
              </div>
            )}

            {/* 项目介绍 */}
            {caseData.description && (
              <div className="elegant-card p-6">
                <h2 className="text-lg font-semibold text-heading mb-4">项目介绍</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                  {caseData.description}
                </p>
              </div>
            )}

            {/* 建设阶段 */}
            {raw['建设阶段'] && (
              <div className="elegant-card p-6">
                <h2 className="text-lg font-semibold text-heading mb-4">建设阶段</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                  {raw['建设阶段']}
                </p>
              </div>
            )}

            {/* 项目举措 */}
            {raw['项目举措'] && (
              <div className="elegant-card p-6">
                <h2 className="text-lg font-semibold text-heading mb-4">项目举措</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                  {raw['项目举措']}
                </p>
              </div>
            )}

            {/* 示范意义 */}
            {caseData.demo_significance && (
              <div className="elegant-card p-6">
                <h2 className="text-lg font-semibold text-heading mb-4">示范意义</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                  {caseData.demo_significance}
                </p>
              </div>
            )}

            {/* 可持续目标 */}
            {caseData.sustainable_goal && (
              <div className="elegant-card p-6">
                <h2 className="text-lg font-semibold text-heading mb-4">可持续目标</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                  {caseData.sustainable_goal}
                </p>
              </div>
            )}

            {/* 获奖情况 */}
            {(caseData.awards || raw['项目获奖评价']) && (
              <div className="elegant-card p-6">
                <h2 className="text-lg font-semibold text-heading mb-4">获奖情况</h2>
                {caseData.awards && (
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                    {caseData.awards}
                  </p>
                )}
                {raw['项目获奖评价'] && (
                  <div className={caseData.awards ? 'mt-4 pt-4 border-t border-gray-100' : ''}>
                    <p className="text-xs text-gray-400 mb-2">获奖评价</p>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                      {raw['项目获奖评价']}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 附图 */}
            {detailImages.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-heading mb-4">项目图片</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {detailImages.map((img) => (
                    <div key={img.id} className="elegant-card overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.caption || `图片 ${img.order}`}
                        className="w-full"
                        loading="lazy"
                      />
                      {img.caption && (
                        <div className="px-4 py-2.5 text-xs text-gray-500 border-t border-gray-100">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：信息侧边栏 */}
          <div className="space-y-6">
            {/* 标题 + 操作 */}
            <div className="elegant-card p-6">
              <h1 className="text-xl font-bold text-heading leading-snug mb-4">
                {caseData.title}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={handleFavorite}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    isFavorited
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {isFavorited ? '♥ 已收藏' : '♡ 收藏'}
                </button>
                <button
                  onClick={handleLike}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    isLiked
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {isLiked ? '♥' : '♡'} {likesCount}
                </button>
              </div>

              {/* 评分 */}
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div>
                  <div className="text-2xl font-bold text-heading">
                    {averageRating > 0 ? averageRating.toFixed(1) : '-'}
                  </div>
                  <div className="text-xs text-gray-400">{ratingCount} 人评分</div>
                </div>
                <div>
                  {hasRated ? (
                    <span className="text-xs text-gray-500">已评 {userRating} 星</span>
                  ) : (
                    renderStars(0, true)
                  )}
                </div>
              </div>
            </div>

            {/* 基本信息 */}
            {infoFields.length > 0 && (
              <div className="elegant-card p-6">
                <h3 className="text-sm font-semibold text-heading mb-4">基本信息</h3>
                <div className="space-y-3">
                  {infoFields.map((f, i) => (
                    <div key={i} className="flex justify-between gap-4">
                      <span className="text-xs text-gray-400 flex-shrink-0">{f.label}</span>
                      <span className="text-sm text-gray-700 text-right">{f.value}</span>
                    </div>
                  ))}
                </div>
                {raw['信息来源'] && (
                  <>
                    <div className="border-t border-gray-100 mt-3 pt-3">
                      <div className="flex justify-between gap-4">
                        <span className="text-xs text-gray-400">来源</span>
                        <span className="text-xs text-gray-500 text-right max-w-[200px] line-clamp-2">{raw['信息来源']}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 标签 */}
            {caseData.tags && caseData.tags.length > 0 && (
              <div className="elegant-card p-6">
                <h3 className="text-sm font-semibold text-heading mb-3">标签</h3>
                <div className="flex flex-wrap gap-1.5">
                  {caseData.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 评论区 */}
            <div className="elegant-card p-6">
              <h3 className="text-sm font-semibold text-heading mb-4">
                评论 ({comments.length})
              </h3>

              <div className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="写下你的评论..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-gray-300 text-sm resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    className="btn-primary-elegant text-xs h-8 px-4"
                  >
                    发表
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="py-3 border-t border-gray-100 first:border-0 first:pt-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-heading">{comment.user}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.date).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      {comment.rating && <div className="mb-1">{renderStars(comment.rating)}</div>}
                      <p className="text-xs text-gray-600 leading-relaxed">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">暂无评论</p>
                )}
              </div>
            </div>
          </div>
        </div>
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
    </div>
  )
}
