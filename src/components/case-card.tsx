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

        {/* 内容区域 - 只显示简略信息 */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-heading mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* 只显示：项目名称、所在区位、参与主体 */}
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <span className="text-gray-400 mt-0.5">📍</span>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">所在区位</div>
                <span className="text-gray-700">{locationText}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-gray-400 mt-0.5">👤</span>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">参与主体</div>
                <span className="text-gray-700 font-medium">{architect}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
