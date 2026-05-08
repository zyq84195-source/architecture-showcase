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

    try {
      const response = await fetch(`/api/web-search?q=${encodeURIComponent(webSearchTerm)}`)
      const data = await response.json()

      if (data.success) {
        setWebResults(data.data)
      } else {
        setWebError(data.error || '搜索失败')
      }
    } catch (error: any) {
      setWebError(`搜索失败：${error.message}`)
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
        <div className="max-w-4xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
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

        {/* 内部搜索 */}
        {searchMode === 'internal' && (
          <div className="animate-fade-in">
            {/* 搜索框 */}
            <div className="max-w-4xl mx-auto mb-8" style={{ animationDelay: '0.2s' }}>
              <div className="elegant-card p-6">
                <div className="space-y-6">
                  {/* 关键词搜索 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔍 关键词
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleInternalSearch()}
                        placeholder="搜索案例名称、描述、标签..."
                        className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 筛选选项 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📁 案例类型
                      </label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="">全部类型</option>
                        <option value="城市更新">城市更新</option>
                        <option value="文化保护">文化保护</option>
                        <option value="社区更新">社区更新</option>
                        <option value="历史街区">历史街区</option>
                        <option value="历史建筑">历史建筑</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📍 地区
                      </label>
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="">全部地区</option>
                        {locationTags.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 搜索按钮 */}
                  <div className="flex gap-4">
                    <Button
                      onClick={handleInternalSearch}
                      disabled={isSearching}
                      className="flex-1 btn-primary-elegant"
                    >
                      {isSearching ? '搜索中...' : '🔍 开始搜索'}
                    </Button>
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="btn-secondary-elegant"
                    >
                      🔄 清空
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 搜索结果 */}
            {hasSearched && (
              <div style={{ animationDelay: '0.3s' }}>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-heading">
                    搜索结果
                  </h2>
                  <p className="text-body">
                    找到 <span className="font-bold text-blue-600">{results.length}</span> 个相关案例
                  </p>
                </div>

                {results.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {results.map((caseItem, index) => (
                      <div key={caseItem.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                        <CaseCard case={caseItem} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 elegant-card animate-fade-in">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-heading mb-2">
                      没有找到相关案例
                    </h3>
                    <p className="text-body mb-6">
                      试试调整搜索关键词或筛选条件，或使用全网搜索
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Link href="/cases">
                        <Button className="btn-primary-elegant">
                          📋 浏览所有案例
                        </Button>
                      </Link>
                      <Button
                        onClick={() => setSearchMode('web')}
                        variant="outline"
                        className="btn-secondary-elegant"
                      >
                        🌐 尝试全网搜索
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 热门标签 - 未搜索时显示 */}
            {!hasSearched && (
              <div className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <h2 className="text-2xl font-bold text-heading mb-6">
                  热门标签
                </h2>
                <div className="elegant-card p-6">
                  <div className="flex flex-wrap gap-3">
                    {quickSearchTags.map((tag, index) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchTerm(tag)
                          handleInternalSearch()
                        }}
                        className="px-4 py-2.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-all animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 推荐地区 - 未搜索时显示 */}
            {!hasSearched && (
              <div className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <h2 className="text-2xl font-bold text-heading mb-6">
                  推荐地区
                </h2>
                <div className="elegant-card p-6">
                  <div className="flex flex-wrap gap-3">
                    {locationTags.map((loc, index) => (
                      <button
                        key={loc}
                        onClick={() => {
                          setSelectedLocation(loc)
                          handleInternalSearch()
                        }}
                        className="px-4 py-2.5 bg-gray-50 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition-all animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        📍 {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 全网搜索 */}
        {searchMode === 'web' && (
          <div className="animate-fade-in">
            {/* 搜索框 */}
            <div className="max-w-4xl mx-auto mb-8" style={{ animationDelay: '0.2s' }}>
              <div className="elegant-card p-6">
                <div className="space-y-6">
                  {/* 关键词搜索 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔍 搜索关键词
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={webSearchTerm}
                        onChange={(e) => setWebSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleWebSearch()}
                        placeholder="搜索全网建筑案例资源..."
                        className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      {webSearchTerm && (
                        <button
                          onClick={() => setWebSearchTerm('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 搜索按钮 */}
                  <div className="flex gap-4">
                    <Button
                      onClick={handleWebSearch}
                      disabled={webIsSearching}
                      className="flex-1 btn-primary-elegant"
                    >
                      {webIsSearching ? '搜索中...' : '🌐 全网搜索'}
                    </Button>
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      className="btn-secondary-elegant"
                    >
                      🔄 清空
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 搜索结果 */}
            {webHasSearched && (
              <div style={{ animationDelay: '0.3s' }}>
                {webError && (
                  <div className="elegant-card p-6 mb-6 bg-red-50 border-red-200">
                    <h3 className="text-xl font-bold text-red-700 mb-2">
                      搜索失败
                    </h3>
                    <p className="text-body text-red-600">{webError}</p>
                  </div>
                )}

                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-heading">
                    全网搜索结果
                  </h2>
                  <p className="text-body">
                    找到 <span className="font-bold text-blue-600">{webResults.length}</span> 个相关结果
                  </p>
                </div>

                {webResults.length > 0 ? (
                  <div className="space-y-4">
                    {webResults.map((item, index) => (
                      <div key={index} className="elegant-card p-6 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                        <h3 className="text-xl font-bold text-heading mb-2">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {item.title}
                          </a>
                        </h3>
                        <p className="text-body text-gray-600 mb-3">
                          {item.snippet}
                        </p>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {item.url}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : !webError && (
                  <div className="text-center py-12 elegant-card animate-fade-in">
                    <div className="text-6xl mb-4">🌐</div>
                    <h3 className="text-xl font-bold text-heading mb-2">
                      没有找到相关结果
                    </h3>
                    <p className="text-body mb-6">
                      试试调整搜索关键词，或使用内部搜索
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={() => setSearchMode('internal')}
                        variant="outline"
                        className="btn-secondary-elegant"
                      >
                        📚 尝试内部搜索
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 提示信息 - 未搜索时显示 */}
            {!webHasSearched && (
              <div className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="elegant-card p-6">
                  <h2 className="text-2xl font-bold text-heading mb-4">
                    全网搜索说明
                  </h2>
                  <ul className="space-y-3 text-body">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>使用 AI 智能搜索技术，搜索全网建筑案例资源</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>支持中英文关键词搜索</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>自动提取关键信息，提供相关性排序</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>搜索结果可直接访问原始网页</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
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
