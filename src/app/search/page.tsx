'use client'

import { useState } from 'react'
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

interface WebSearchResult {
  title: string
  url: string
  snippet: string
  [key: string]: any
}

interface ComparisonReport {
  summary: string
  keyFindings: string[]
  similarities: string[]
  differences: string[]
  recommendations: string[]
}

export default function SearchPage() {
  // 搜索模式：internal（内部）| web（全网）| compare（AI比对）
  const [searchMode, setSearchMode] = useState<'internal' | 'web' | 'compare'>('internal')

  // 内部搜索状态
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [results, setResults] = useState<Case[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // 全网搜索状态
  const [webSearchTerm, setWebSearchTerm] = useState('')
  const [webResults, setWebResults] = useState<WebSearchResult[]>([])
  const [webHasSearched, setWebHasSearched] = useState(false)
  const [webIsSearching, setWebIsSearching] = useState(false)
  const [webError, setWebError] = useState('')
  const [webSuggestion, setWebSuggestion] = useState('')

  // AI比对状态
  const [selectedCases, setSelectedCases] = useState<Case[]>([])
  const [comparisonReport, setComparisonReport] = useState<ComparisonReport | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [comparisonError, setComparisonError] = useState('')

  // 加载案例数据
  const allCases: Case[] = require('@/data/cases.json')

  // 内部搜索
  const handleInternalSearch = () => {
    setIsSearching(true)
    setHasSearched(true)

    // 模拟搜索延迟
    setTimeout(() => {
      const filtered = allCases.filter((item: Case) => {
        const matchesSearch = !searchTerm ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesType = !selectedType ||
          item.tags.includes(selectedType) ||
          (item as any).case_type?.includes(selectedType)

        const locationText = Array.isArray(item.location)
          ? item.location.join(' ')
          : item.location
        const matchesLocation = !selectedLocation ||
          locationText.includes(selectedLocation)

        return matchesSearch && matchesType && matchesLocation
      })

      setResults(filtered)
      setIsSearching(false)
    }, 500)
  }

  // 全网搜索
  const handleWebSearch = async () => {
    if (!webSearchTerm) return

    setWebIsSearching(true)
    setWebHasSearched(true)
    setWebError('')
    setWebSuggestion('')

    try {
      // 使用新的搜索服务 API
      const response = await fetch(
        `/api/search-service?q=${encodeURIComponent(webSearchTerm)}&engine=bing`
      )
      const data = await response.json()

      if (data.success) {
        setWebResults(data.data)
      } else {
        setWebError(data.error || '搜索失败')
        setWebSuggestion('请检查网络连接或稍后重试')
      }
    } catch (error: any) {
      setWebError(`搜索失败：${error.message}`)
      setWebSuggestion('请检查网络连接或稍后重试')
    } finally {
      setWebIsSearching(false)
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    setSelectedType('')
    setSelectedLocation('')
    setResults([])
    setHasSearched(false)

    setWebSearchTerm('')
    setWebResults([])
    setWebHasSearched(false)
    setWebError('')
    setWebSuggestion('')
  }

  const quickSearchTags = ['城市更新', '文化保护', '历史街区', '社区更新', '可持续发展', '绿色建筑', '宜居', '人文']

  const locationTags = ['北京', '上海', '广州', '深圳', '重庆', '成都', '杭州', '贵阳']

  // 切换案例选中状态（用于AI比对）
  const toggleCaseSelection = (caseItem: Case) => {
    if (selectedCases.find(c => c.id === caseItem.id)) {
      setSelectedCases(selectedCases.filter(c => c.id !== caseItem.id))
    } else {
      if (selectedCases.length < 5) {
        setSelectedCases([...selectedCases, caseItem])
      } else {
        alert('最多只能选择5个案例进行比对')
      }
    }
  }

  // 执行AI比对
  const handleAICompare = async () => {
    if (selectedCases.length < 2) {
      alert('请至少选择2个案例进行比对')
      return
    }

    setIsComparing(true)
    setComparisonReport(null)
    setComparisonError('')

    try {
      const response = await fetch('/api/ai-compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cases: selectedCases }),
      })

      const data = await response.json()

      if (data.success) {
        setComparisonReport(data.report)
      } else {
        setComparisonError(data.error || '比对失败')
      }
    } catch (error: any) {
      setComparisonError(`比对失败：${error.message}`)
    } finally {
      setIsComparing(false)
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
                <Button variant="ghost" className="text-blue-600 hover:bg-blue-50">
                  搜索
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
        {/* 搜索标题 */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-heading mb-4">
            搜索建筑案例
          </h1>
          <p className="text-body text-lg">
            选择搜索模式，找到你需要的建筑案例
          </p>
        </div>

        {/* 搜索模式切换 */}
        <div className="max-w-4xl mx-auto mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="elegant-card p-2 flex gap-2">
            <Button
              onClick={() => setSearchMode('internal')}
              className={`flex-1 ${searchMode === 'internal' ? 'btn-primary-elegant' : 'btn-secondary-elegant'}`}
            >
              📚 内部搜索
            </Button>
            <Button
              onClick={() => setSearchMode('web')}
              className={`flex-1 ${searchMode === 'web' ? 'btn-primary-elegant' : 'btn-secondary-elegant'}`}
            >
              🌐 全网搜索
            </Button>
            <Button
              onClick={() => setSearchMode('compare')}
              className={`flex-1 ${searchMode === 'compare' ? 'btn-primary-elegant' : 'btn-secondary-elegant'}`}
            >
              🤖 AI比对
            </Button>
          </div>
        </div>

        {/* 内部搜索区域 */}
        {searchMode === 'internal' && (
          <div className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {/* 搜索框 */}
            <div className="elegant-card p-6 mb-6">
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="搜索关键词..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleInternalSearch()}
                />
                <Button
                  onClick={handleInternalSearch}
                  disabled={isSearching}
                  className="btn-primary-elegant px-8"
                >
                  {isSearching ? '搜索中...' : '搜索'}
                </Button>
              </div>

              {/* 快速标签 */}
              <div className="flex flex-wrap gap-2">
                {quickSearchTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 筛选器 */}
            <div className="elegant-card p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 类型筛选 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">案例类型</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">全部类型</option>
                    {quickSearchTags.map((tag) => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>

                {/* 地点筛选 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">项目地点</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">全部地点</option>
                    {locationTags.map((location) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 搜索结果 */}
            {hasSearched && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-heading">
                    搜索结果 ({results.length})
                  </h2>
                  <div className="flex gap-2">
                    {results.length > 0 && (
                      <Button
                        onClick={() => setSearchMode('compare')}
                        variant="outline"
                        className="btn-secondary-elegant"
                      >
                        🤖 AI比对 ({selectedCases.length}/5)
                      </Button>
                    )}
                    {results.length > 0 && (
                      <Button
                        onClick={handleClear}
                        variant="outline"
                        className="btn-secondary-elegant"
                      >
                        清空
                      </Button>
                    )}
                  </div>
                </div>

                {results.length === 0 ? (
                  <div className="elegant-card p-12 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">没有找到相关案例</h3>
                    <p className="text-gray-600">
                      试试调整搜索关键词或筛选条件
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((item) => (
                      <div key={item.id} className="relative">
                        <input
                          type="checkbox"
                          className="absolute top-4 right-4 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 z-10"
                          checked={selectedCases.find(c => c.id === item.id) !== undefined}
                          onChange={() => toggleCaseSelection(item)}
                        />
                        <CaseCard case={item} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 全网搜索区域 */}
        {searchMode === 'web' && (
          <div className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>

            {/* 搜索框 */}
            <div className="elegant-card p-6 mb-6">
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="搜索全网建筑案例..."
                  value={webSearchTerm}
                  onChange={(e) => setWebSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleWebSearch()}
                />
                <Button
                  onClick={handleWebSearch}
                  disabled={webIsSearching}
                  className="btn-primary-elegant px-8"
                >
                  {webIsSearching ? '搜索中...' : '搜索'}
                </Button>
              </div>

              {/* 快速标签 */}
              <div className="flex flex-wrap gap-2">
                {quickSearchTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setWebSearchTerm(tag)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 错误提示 */}
            {webError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 animate-fade-in">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-1">搜索失败</h3>
                    <p className="text-red-700 mb-2">{webError}</p>
                    {webSuggestion && (
                      <p className="text-sm text-red-600 bg-red-100 rounded px-3 py-2">
                        💡 建议：{webSuggestion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 加载动画 */}
            {webIsSearching && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
                  <p className="text-gray-600">正在搜索中...</p>
                </div>
              </div>
            )}

            {/* 搜索结果 */}
            {webHasSearched && !webIsSearching && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-heading">
                    搜索结果 ({webResults.length})
                  </h2>
                  {webResults.length > 0 && (
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="btn-secondary-elegant"
                    >
                      清空
                    </Button>
                  )}
                </div>

                {webResults.length === 0 ? (
                  <div className="elegant-card p-12 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">没有找到相关案例</h3>
                    <p className="text-gray-600">
                      试试调整搜索关键词
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {webResults.map((item, index) => (
                      <div key={index} className="elegant-card p-6">
                        <h3 className="text-xl font-bold text-heading mb-2">
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                            {item.title}
                          </a>
                        </h3>
                        <p className="text-gray-700 mb-3">{item.snippet}</p>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          查看详情 →
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* AI比对区域 */}
        {searchMode === 'compare' && (
          <div className="max-w-6xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-purple-900 mb-3">🤖 AI 智能比对</h3>
              <p className="text-gray-700 mb-4">
                选择 2-5 个建筑案例，AI 将自动分析它们在设计理念、建筑风格、功能布局等方面的相似与差异，生成对比报告。
              </p>
              <div className="flex flex-wrap gap-2">
                {quickSearchTags.slice(0, 5).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchTerm(tag)
                      setSearchMode('internal')
                      handleInternalSearch()
                    }}
                    className="px-3 py-1 text-sm bg-white hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-full transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 已选择的案例 */}
            {selectedCases.length > 0 && (
              <div className="elegant-card p-6 mb-6 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-heading">
                    已选择 {selectedCases.length} 个案例
                  </h3>
                  <Button
                    onClick={handleAICompare}
                    disabled={isComparing || selectedCases.length < 2}
                    className="btn-primary-elegant"
                  >
                    {isComparing ? '分析中...' : '开始比对'}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedCases.map((caseItem) => (
                    <div key={caseItem.id} className="bg-gray-50 rounded-lg p-4 relative">
                      <button
                        onClick={() => toggleCaseSelection(caseItem)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                      >
                        ×
                      </button>
                      <h4 className="font-bold text-heading mb-2">{caseItem.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{caseItem.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {caseItem.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 对比报告 */}
            {comparisonReport && (
              <div className="elegant-card p-6 mb-6 animate-fade-in">
                <h3 className="text-xl font-bold text-heading mb-6">📊 对比报告</h3>

                {/* 总结 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 总结</h4>
                  <p className="text-gray-700">{comparisonReport.summary}</p>
                </div>

                {/* 关键发现 */}
                <div className="mb-6">
                  <h4 className="font-semibold text-heading mb-3">🎯 关键发现</h4>
                  <ul className="space-y-2">
                    {comparisonReport.keyFindings.map((finding, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-gray-700">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 相似点 */}
                <div className="mb-6">
                  <h4 className="font-semibold text-heading mb-3">✅ 相似点</h4>
                  <ul className="space-y-2">
                    {comparisonReport.similarities.map((similarity, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-gray-700">{similarity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 差异点 */}
                <div className="mb-6">
                  <h4 className="font-semibold text-heading mb-3">❌ 差异点</h4>
                  <ul className="space-y-2">
                    {comparisonReport.differences.map((difference, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">✗</span>
                        <span className="text-gray-700">{difference}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 建议 */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3">💭 建议</h4>
                  <ul className="space-y-2">
                    {comparisonReport.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">→</span>
                        <span className="text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 错误提示 */}
            {comparisonError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 animate-fade-in">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-1">比对失败</h3>
                    <p className="text-red-700">{comparisonError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 空状态 */}
            {selectedCases.length === 0 && !comparisonReport && (
              <div className="elegant-card p-12 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">开始AI比对</h3>
                <p className="text-gray-600 mb-4">
                  请先在"内部搜索"中找到感兴趣的案例，然后勾选 2-5 个案例进行比对
                </p>
                <Button
                  onClick={() => setSearchMode('internal')}
                  className="btn-primary-elegant"
                >
                  去搜索案例
                </Button>
              </div>
            )}

            {/* 加载动画 */}
            {isComparing && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
                  <p className="text-gray-600">AI 正在分析中...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
