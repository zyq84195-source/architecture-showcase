'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * 搜索结果接口
 */
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  description?: string;
  content?: string;
  crawled_at?: string;
}

/**
 * AI 总结接口
 */
interface AISummary {
  summary: string;
  key_projects: string[];
  architectural_insights: string[];
  design_concepts: string[];
  sustainability: string[];
  source_analysis: {
    most_reliable: string;
    information_quality: string;
  };
}

/**
 * 智能搜索响应接口
 */
interface SmartSearchResponse {
  success: boolean;
  query: string;
  search_results: SearchResult[];
  detailed_results: SearchResult[];
  ai_summary?: AISummary;
  metadata?: {
    timestamp: string;
    search_engine: string;
    ai_model: string;
    total_results: number;
    crawled_results: number;
  };
}

export default function SmartSearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [max_results, setMaxResults] = useState(3)
  const [summary_length, setSummaryLength] = useState(500)
  
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [detailedResults, setDetailedResults] = useState<SearchResult[]>([])
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null)
  
  const [error, setError] = useState('')
  const [suggestion, setSuggestion] = useState('')

  const quickSearchTags = ['城市更新', '文化保护', '历史街区', '社区更新', '可持续发展', '绿色建筑', '宜居', '人文']

  // 智能搜索
  const handleSmartSearch = async () => {
    if (!searchTerm) return

    setIsSearching(true)
    setHasSearched(true)
    setSearchResults([])
    setDetailedResults([])
    setAiSummary(null)
    setError('')
    setSuggestion('')

    try {
      const response = await fetch('/api/smart-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: searchTerm,
          max_results: max_results,
          summary_length: summary_length,
        }),
      })

      const data: SmartSearchResponse = await response.json()

      if (data.success) {
        setSearchResults(data.search_results || [])
        setDetailedResults(data.detailed_results || [])
        setAiSummary(data.ai_summary || null)
        console.log('[Smart Search] Results:', data)
      } else {
        setError(data.error || '智能搜索失败')
        setSuggestion('请检查网络连接或稍后重试')
      }
    } catch (error: any) {
      setError(`智能搜索失败：${error.message}`)
      setSuggestion('请检查网络连接或稍后重试')
    } finally {
      setIsSearching(false)
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    setMaxResults(3)
    setSummaryLength(500)
    setSearchResults([])
    setDetailedResults([])
    setAiSummary(null)
    setHasSearched(false)
    setError('')
    setSuggestion('')
  }

  return (
    <div className="min-h-screen bg-elegant-gradient text-foreground">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-elegant">
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
              <Link href="/smart-search">
                <Button className="btn-primary-elegant">
                  智能搜索
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
            🤖 AI 智能搜索
          </h1>
          <p className="text-xl md:text-2xl text-body mb-6">
            搜索真实建筑案例，AI 智能总结分析
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-2xl">🌐</span>
              <span className="text-blue-900 font-medium">真实案例</span>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-2xl">🕷️</span>
              <span className="text-purple-900 font-medium">网页爬取</span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="text-green-900 font-medium">AI 分析</span>
            </div>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="elegant-card p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              搜索关键词
            </label>
            <input
              type="text"
              placeholder="例如：城市更新 建筑案例"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSmartSearch()}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大结果数
              </label>
              <select
                value={max_results}
                onChange={(e) => setMaxResults(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 个结果</option>
                <option value={2}>2 个结果</option>
                <option value={3}>3 个结果（默认）</option>
                <option value={5}>5 个结果</option>
                <option value={10}>10 个结果</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI 总结长度
              </label>
              <select
                value={summary_length}
                onChange={(e) => setSummaryLength(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={300}>300 字</option>
                <option value={500}>500 字（默认）</option>
                <option value={800}>800 字</option>
                <option value={1000}>1000 字</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <Button
              onClick={handleSmartSearch}
              disabled={isSearching}
              className="btn-primary-elegant px-8 flex-1"
            >
              {isSearching ? '🤖 AI 分析中...' : '🚀 开始智能搜索'}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className="btn-secondary-elegant px-8"
              disabled={isSearching}
            >
              清空
            </Button>
          </div>

          {/* 快速标签 */}
          <div className="flex flex-wrap gap-2">
            {quickSearchTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchTerm(tag)
                  handleSmartSearch()
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full transition-colors"
                disabled={isSearching}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 加载动画 */}
        {isSearching && (
          <div className="flex items-center justify-center py-12 animate-fade-in">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              <p className="text-gray-600">正在智能分析中，这可能需要 10-20 秒...</p>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">搜索失败</h3>
                <p className="text-red-700 mb-2">{error}</p>
                {suggestion && (
                  <p className="text-sm text-red-600 bg-red-100 rounded px-3 py-2">
                    💡 建议：{suggestion}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI 总结 */}
        {hasSearched && !isSearching && aiSummary && (
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-purple-900 mb-4 text-xl">🤖 AI 智能总结</h3>
              
              {/* 总体总结 */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-purple-700 mb-2">📋 总体总结</h4>
                <p className="text-gray-700 leading-relaxed">{aiSummary.summary}</p>
              </div>

              {/* 来源分析 */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-purple-700 mb-2">🔍 来源分析</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">📍</span>
                    <span className="text-gray-700">
                      <span className="font-medium">最可靠来源：</span>
                      <a 
                        href={detailedResults[0]?.url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {aiSummary.source_analysis.most_reliable}
                      </a>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">⭐</span>
                    <span className="text-gray-700">
                      <span className="font-medium">信息质量：</span>
                      <span className="inline-block px-2 py-1 rounded text-sm font-semibold bg-green-100 text-green-700">
                        {aiSummary.source_analysis.information_quality}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 关键项目 */}
        {hasSearched && !isSearching && aiSummary?.key_projects && aiSummary.key_projects.length > 0 && (
          <div className="elegant-card p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-bold text-heading mb-4 text-xl">🏗️ 关键项目</h3>
            <ul className="space-y-3">
              {aiSummary.key_projects.map((project, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-2xl">•</span>
                  <span className="text-gray-700">{project}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 建筑洞察 */}
        {hasSearched && !isSearching && aiSummary?.architectural_insights && aiSummary.architectural_insights.length > 0 && (
          <div className="elegant-card p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h3 className="font-bold text-heading mb-4 text-xl">🎨 建筑洞察</h3>
            <ul className="space-y-3">
              {aiSummary.architectural_insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <span className="text-gray-700">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 设计理念 */}
        {hasSearched && !isSearching && aiSummary?.design_concepts && aiSummary.design_concepts.length > 0 && (
          <div className="elegant-card p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <h3 className="font-bold text-heading mb-4 text-xl">💡 设计理念</h3>
            <ul className="space-y-3">
              {aiSummary.design_concepts.map((concept, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-2xl">💭</span>
                  <span className="text-gray-700">{concept}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 可持续性 */}
        {hasSearched && !isSearching && aiSummary?.sustainability && aiSummary.sustainability.length > 0 && (
          <div className="elegant-card p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <h3 className="font-bold text-heading mb-4 text-xl">🌱 可持续性</h3>
            <ul className="space-y-3">
              {aiSummary.sustainability.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-2xl">🌿</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 详细搜索结果 */}
        {hasSearched && !isSearching && detailedResults.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-heading">
                📚 详细来源 ({detailedResults.length})
              </h2>
              <Button
                onClick={handleClear}
                variant="outline"
                className="btn-secondary-elegant"
              >
                清空
              </Button>
            </div>

            <div className="space-y-4">
              {detailedResults.map((result, index) => (
                <div key={index} className="elegant-card p-6">
                  <h3 className="text-xl font-bold text-heading mb-2">
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {result.title}
                    </a>
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    来源：{result.source} | 
                    爬取时间：{result.crawled_at ? new Date(result.crawled_at).toLocaleString('zh-CN') : 'N/A'}
                  </p>
                  <p className="text-gray-700 mb-3">{result.description || result.snippet}</p>
                  <p className="text-gray-600 text-sm">{result.content?.substring(0, 300) || '无内容...'}</p>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    查看详情 →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {hasSearched && !isSearching && detailedResults.length === 0 && (
          <div className="elegant-card p-12 text-center animate-fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              没有找到相关案例
            </h3>
            <p className="text-gray-600 mb-4">
              试试调整搜索关键词
            </p>
            <p className="text-sm text-gray-500">
              提示：尝试使用更具体的关键词，如"上海外滩 建筑改造"
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
