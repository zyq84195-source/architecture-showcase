'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  likes_count: number
  reviews_count: number
  created_at: string
}

interface CaseCardProps {
  case: Case
}

export default function CaseCard({ case: caseData }: CaseCardProps) {
  const { id, title, images, architect, location } = caseData

  const locationText = Array.isArray(location) ? location.join(', ') : location
  const mainImage = images.find(img => img.isMain) || images[0]

  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(caseData.likes_count)
  const [isFavorited, setIsFavorited] = useState(false)

  // 检查是否已收藏
  if (typeof window !== 'undefined') {
    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]')
    if (favoriteIds.includes(id) && !isFavorited) {
      setIsFavorited(true)
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
  }

  const handleFavorite = () => {
    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]')
    if (favoriteIds.includes(id)) {
      const newFavorites = favoriteIds.filter((fid: string) => fid !== id)
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      setIsFavorited(false)
    } else {
      favoriteIds.push(id)
      localStorage.setItem('favorites', JSON.stringify(favoriteIds))
      setIsFavorited(true)
    }
  }

  return (
    <div className="elegant-card overflow-hidden group cursor-pointer hover:shadow-elegant-hover transition-all duration-300">
      <Link href={`/cases/${id}`}>
        {/* 图片区域 */}
        <div className="aspect-video bg-gradient-to-br from-blue-50 to-gray-100 overflow-hidden relative">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={mainImage.caption || title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🏛️</div>
                <div className="text-gray-400 text-sm">暂无图片</div>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* 收藏按钮 */}
        <button
          onClick={(e) => {
            e.preventDefault()
            handleFavorite()
          }}
          className={`absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transition-all ${
            isFavorited ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-white'
          }`}
          title={isFavorited ? '取消收藏' : '收藏'}
        >
          <span className={isFavorited ? 'text-red-500' : 'text-gray-400'}>
            {isFavorited ? '❤️' : '🤍'}
          </span>
        </button>

        {/* 内容区域 - 只显示4个信息 */}
        <div className="p-6">
          {/* 1. 主图（已在上面显示） */}
          {/* 2. 项目名称 */}
          <h3 className="text-xl font-bold text-heading mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* 3. 所在区位 */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">📍</span>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-0.5">所在区位</div>
                <span className="text-gray-700">{locationText}</span>
              </div>
            </div>

            {/* 4. 参与主体 */}
            <div className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">👤</span>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-0.5">参与主体</div>
                <span className="text-gray-700 font-medium">{architect}</span>
              </div>
            </div>
          </div>

          {/* 底部统计和按钮 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
            <div className="flex items-center gap-4 text-sm">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleLike()
                }}
                className="flex items-center gap-1.5 hover:text-red-500 transition-colors"
              >
                <span className={isLiked ? 'text-red-500' : 'text-gray-400'}>
                  {isLiked ? '❤' : '🤍'}
                </span>
                <span>{likesCount}</span>
              </button>
            </div>
            <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
              查看详情 →
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
