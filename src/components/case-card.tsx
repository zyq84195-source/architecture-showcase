'use client'

import React, { useState } from 'react'
import Link from 'next/link'

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
  const { id, title, images, architect, location, tags } = caseData

  const locationText = Array.isArray(location) ? location.join(', ') : location
  const mainImage = images.find(img => img.isMain) || images[0]

  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(caseData.likes_count)
  const [isFavorited, setIsFavorited] = useState(false)

  React.useEffect(() => {
    try {
      const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]')
      if (favoriteIds.includes(id)) {
        setIsFavorited(true)
      }
    } catch {}
  }, [id])

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
    <Link href={`/cases/${id}`} className="group block">
      <div className="elegant-card elegant-card-hover overflow-hidden">
        {/* 图片区域 */}
        <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={mainImage.caption || title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center">
                <div className="text-3xl mb-1 opacity-40">🏛️</div>
                <div className="text-gray-400 text-xs">暂无图片</div>
              </div>
            </div>
          )}

          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* 收藏按钮 */}
          <button
            onClick={handleFavorite}
            className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-200 ${
              isFavorited
                ? 'bg-red-50 text-red-500 shadow-sm'
                : 'bg-white/80 backdrop-blur-sm text-gray-400 opacity-0 group-hover:opacity-100 shadow-sm hover:text-red-400'
            }`}
            title={isFavorited ? '取消收藏' : '收藏'}
          >
            {isFavorited ? '❤️' : '🤍'}
          </button>

          {/* Hover 时底部显示标题 */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <span className="text-sm text-white/80 font-medium">查看详情 →</span>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-5">
          {/* 标签 */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 标题 */}
          <h3 className="text-base font-semibold text-heading mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
            {title}
          </h3>

          {/* 信息 */}
          <div className="space-y-1.5 text-sm">
            {locationText && (
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="line-clamp-1">{locationText}</span>
              </div>
            )}
            {architect && (
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="line-clamp-1">{architect}</span>
              </div>
            )}
          </div>

          {/* 底部 */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <span className={isLiked ? 'text-red-500' : ''}>
                {isLiked ? '♥' : '♡'}
              </span>
              <span>{likesCount}</span>
            </button>
            <span className="text-xs text-gray-400">
              {caseData.reviews_count || 0} 评论
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
