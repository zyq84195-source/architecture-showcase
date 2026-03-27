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

export default function SearchPage() {
  // 搜索模式：internal（内部）| web（全网）
  const [searchMode, setSearchMode] = useState<'internal' | 'web'>('internal')

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
  const [searchApiMode, setSearchApiMode] = useState<'full' | 'search-only'>('search-only')

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
                      <CaseCard key={item.id} case={item} />
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
            {/* 搜索模式说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">搜索模式说明</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-blue-700">🔍 仅搜索模式（推荐）</strong>
                  <p className="text-gray-700 mt-1">快速搜索互联网案例，不使用 AI 模型。适合快速查找案例。</p>
                </div>
                <div>
                  <strong className="text-blue-700">🤖 完整模式</strong>
                  <p className="text-gray-700 mt-1">AI 智能分析，自动提取案例信息。需要配置有效的 API Key。</p>
                </div>
              </div>
            </div>

            {/* 搜索模式切换 */}
            <div className="elegant-card p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">选择模式：</span>
                <Button
                  variant={searchApiMode === 'search-only' ? 'default' : 'outline'}
                  onClick={() => setSearchApiMode('search-only')}
                  className="flex-1"
                >
                  🔍 仅搜索
                </Button>
                <Button
                  variant={searchApiMode === 'full' ? 'default' : 'outline'}
                  onClick={() => setSearchApiMode('full')}
                  className="flex-1"
                >
                  🤖 完整模式
                </Button>
              </div>
            </div>

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
      </main>
    </div>
  )
}
