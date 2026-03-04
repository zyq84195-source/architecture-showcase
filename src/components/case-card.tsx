'use client'

import { useState } from 'react'
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
  likes_count: number
  reviews_count: number
  created_at: string
}

interface CaseCardProps {
  case: Case
}

export default function CaseCard({ case: caseData }: CaseCardProps) {
  const { id, title, description, images, architect, location, tags, likes_count, reviews_count } = caseData

  const locationText = Array.isArray(location) ? location.join(', ') : location
  const mainImage = images.find(img => img.isMain) || images[0]

  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(likes_count)
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
      // 取消收藏
      const newFavorites = favoriteIds.filter((fid: string) => fid !== id)
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      setIsFavorited(false)
    } else {
      // 添加收藏
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

        {/* 内容区域 */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-heading mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-body text-sm mb-4 line-clamp-2">
            {description}
          </p>

          {/* 元信息 */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">👤</span>
              <span className="text-gray-700 font-medium">{architect}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">📍</span>
              <span className="text-gray-600">{locationText}</span>
            </div>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{tags.length - 3}
              </span>
            )}
          </div>

          {/* 底部统计和按钮 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
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
              <div className="flex items-center gap-1.5 text-gray-500">
                <span className="text-blue-400">💬</span>
                <span>{reviews_count}</span>
              </div>
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
