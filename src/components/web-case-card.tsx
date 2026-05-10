'use client'

import { useState } from 'react'

interface CaseExtraction {
  caseName: string
  location: string
  projectScale: string
  totalInvestment: string
  participants: string
  startDate: string
  endDate: string
  awardStatus: string
  caseType: string
  sustainabilityTargets: string[]
  demonstrationValue: string
  projectIntroduction: string
  constructionPhase: string[]
  awardEvaluation: string
  projectInitiatives: string[]
  infoSource: string
  caseImages: string[]
  extractionSource: string
  dataQuality: string
}

interface WebCaseCardProps {
  extraction: CaseExtraction
  sourceUrl?: string
  onClose?: () => void
}

// 字段标签映射
const FIELD_LABELS: Record<string, string> = {
  location: '📍 所在区位',
  projectScale: '📐 项目规模',
  totalInvestment: '💰 总投资额',
  participants: '👤 参与主体',
  startDate: '📅 起止时间',
  caseType: '🏗️ 案例类型',
  awardStatus: '🏆 获奖情况',
  sustainabilityTargets: '🌱 可持续目标',
  demonstrationValue: '💡 示范意义',
}

// 可持续目标标签颜色映射
const SUSTAINABILITY_COLORS: Record<string, string> = {
  '宜居': 'bg-blue-100 text-blue-700',
  '智慧': 'bg-purple-100 text-purple-700',
  '人文': 'bg-amber-100 text-amber-700',
  '创新': 'bg-green-100 text-green-700',
  '绿色': 'bg-emerald-100 text-emerald-700',
  '韧性': 'bg-red-100 text-red-700',
}

// 质量等级映射
function getQualityBadge(quality: string) {
  if (quality.startsWith('高')) {
    return <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">高质量</span>
  }
  if (quality.startsWith('中')) {
    return <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">中等质量</span>
  }
  return <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">信息较少</span>
}

export default function WebCaseCard({ extraction, sourceUrl, onClose }: WebCaseCardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'detail' | 'images'>('overview')
  const [showAllInitiatives, setShowAllInitiatives] = useState(false)

  // 统计填充率
  const filledCount = [
    extraction.location,
    extraction.projectScale,
    extraction.totalInvestment,
    extraction.participants,
    extraction.startDate,
    extraction.awardStatus,
    extraction.caseType,
    extraction.projectIntroduction,
    extraction.demonstrationValue,
  ].filter(v => v && v !== '无' && v !== '未检索到获奖信息').length

  const fillRate = Math.round((filledCount / 9) * 100)

  return (
    <div className="elegant-card overflow-hidden animate-fade-in">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{extraction.caseName || '未命名案例'}</h2>
            <div className="flex items-center gap-3 text-blue-100 text-sm">
              {extraction.location && extraction.location !== '无' && (
                <span>📍 {extraction.location}</span>
              )}
              {extraction.caseType && extraction.caseType !== '无' && (
                <span>🏗️ {extraction.caseType}</span>
              )}
              {getQualityBadge(extraction.dataQuality)}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-lg"
            >
              ×
            </button>
          )}
        </div>

        {/* 可持续目标标签 */}
        {extraction.sustainabilityTargets && extraction.sustainabilityTargets.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {extraction.sustainabilityTargets.map((tag, i) => (
              <span
                key={i}
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  SUSTAINABILITY_COLORS[tag] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tab 导航 */}
      <div className="border-b border-gray-200 px-6">
        <div className="flex gap-6">
          {(['overview', 'detail', 'images'] as const).map(tab => {
            const labels = { overview: '📋 概览', detail: '📊 详细', images: '🖼️ 图片' }
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {labels[tab]}
              </button>
            )
          })}
        </div>
      </div>

      {/* 内容区 */}
      <div className="p-6">
        {/* 概览 Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* 关键信息网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 所在区位 */}
              {extraction.location && extraction.location !== '无' && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">📍</span>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">所在区位</div>
                    <div className="text-gray-800 font-medium">{extraction.location}</div>
                  </div>
                </div>
              )}

              {/* 项目规模 */}
              {extraction.projectScale && extraction.projectScale !== '无' && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">📐</span>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">项目规模</div>
                    <div className="text-gray-800 font-medium">{extraction.projectScale}</div>
                  </div>
                </div>
              )}

              {/* 总投资额 */}
              {extraction.totalInvestment && extraction.totalInvestment !== '无' && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">💰</span>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">总投资额</div>
                    <div className="text-gray-800 font-medium">{extraction.totalInvestment}</div>
                  </div>
                </div>
              )}

              {/* 起止时间 */}
              {extraction.startDate && extraction.startDate !== '无' && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">📅</span>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">起止时间</div>
                    <div className="text-gray-800 font-medium">
                      {extraction.startDate}
                      {extraction.endDate && extraction.endDate !== '无' && ` - ${extraction.endDate}`}
                    </div>
                  </div>
                </div>
              )}

              {/* 参与主体 */}
              {extraction.participants && extraction.participants !== '无' && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                  <span className="text-lg">👤</span>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">参与主体</div>
                    <div className="text-gray-800 font-medium whitespace-pre-line text-sm">{extraction.participants}</div>
                  </div>
                </div>
              )}
            </div>

            {/* 项目介绍 */}
            {extraction.projectIntroduction && extraction.projectIntroduction !== '无' && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">📝 项目介绍</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {extraction.projectIntroduction}
                </p>
              </div>
            )}

            {/* 示范意义 */}
            {extraction.demonstrationValue && extraction.demonstrationValue !== '无' && (
              <div className="mt-4 bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 示范意义</h3>
                <p className="text-blue-700 text-sm leading-relaxed">
                  {extraction.demonstrationValue}
                </p>
              </div>
            )}

            {/* 获奖情况 */}
            {extraction.awardStatus && extraction.awardStatus !== '无' && extraction.awardStatus !== '未检索到获奖信息' && (
              <div className="mt-4 bg-amber-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-amber-800 mb-2">🏆 获奖情况</h3>
                <p className="text-amber-700 text-sm leading-relaxed">
                  {extraction.awardStatus}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 详细 Tab */}
        {activeTab === 'detail' && (
          <div className="space-y-6">
            {/* 建设阶段 */}
            {extraction.constructionPhase && extraction.constructionPhase.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">🏗️ 建设阶段</h3>
                <div className="space-y-3">
                  {extraction.constructionPhase.map((phase, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{phase}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 项目举措 */}
            {extraction.projectInitiatives && extraction.projectInitiatives.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">🔧 项目举措</h3>
                <div className="space-y-3">
                  {(showAllInitiatives
                    ? extraction.projectInitiatives
                    : extraction.projectInitiatives.slice(0, 5)
                  ).map((initiative, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-600 text-sm leading-relaxed">{initiative}</p>
                    </div>
                  ))}
                  {extraction.projectInitiatives.length > 5 && !showAllInitiatives && (
                    <button
                      onClick={() => setShowAllInitiatives(true)}
                      className="text-blue-600 text-sm hover:text-blue-700"
                    >
                      展开全部 {extraction.projectInitiatives.length} 条举措 ↓
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 数据质量 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">📊 数据填充率</span>
                <span className="text-sm font-bold text-blue-600">{fillRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    fillRate >= 70 ? 'bg-green-500' : fillRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${fillRate}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                已提取 {filledCount}/9 个核心字段 · {extraction.extractionSource}
              </div>
            </div>

            {/* 信息来源 */}
            {extraction.infoSource && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">🔗 信息来源</h3>
                <div className="text-xs text-gray-500 whitespace-pre-line">{extraction.infoSource}</div>
              </div>
            )}
          </div>
        )}

        {/* 图片 Tab */}
        {activeTab === 'images' && (
          <div>
            {extraction.caseImages && extraction.caseImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {extraction.caseImages.map((img, i) => (
                  <div key={i} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={img}
                      alt={`图片 ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🖼️</div>
                <p className="text-gray-500">暂未提取到相关图片</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部 */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              🔗 查看原文
            </a>
          )}
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => {
            // TODO: 保存到案例库
            alert('保存功能开发中')
          }}
        >
          📥 保存到案例库
        </button>
      </div>
    </div>
  )
}
