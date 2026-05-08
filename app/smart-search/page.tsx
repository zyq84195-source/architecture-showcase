'use client'

import { useState, useEffect } from 'react'
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
  content?: string;
  images?: string[];
  score?: number;
  published_date?: string;
  relevance_score?: number;  // 相关性评分（0-100）
  relevance_reason?: string;  // 相关性原因说明
}

/**
 * 案例真实信息提取接口
 */
interface CaseExtraction {
  caseName: string;
  location: string;
  projectScale: string;
  totalInvestment: string;
  participants: string;
  startDate: string;
  endDate: string;
  awardStatus: string;
  caseType: string;
  sustainabilityTargets: string[];
  demonstrationValue: string;
  projectIntroduction: string;
  constructionPhase: string[];
  awardEvaluation: string;
  projectInitiatives: string[];
  infoSource: string;
  caseImages: string[];
  extractionSource: string;
  dataQuality: string;
}

/**
 * 对比分析接口
 */
interface ComparisonAnalysis {
  similarity: number;
  similarity_level: string;
  common_points: string[];
  differences: string[];
  lessons: string[];
  suggestions: string[];
  detailed_comparison: string;
}

/**
 * 智能搜索响应接口
 */
interface SmartSearchResponse {
  success: boolean;
  query: string;
  search_results: SearchResult[];
  detailed_results: SearchResult[];
  case_extraction: CaseExtraction;
  metadata?: {
    timestamp: string;
    search_engine: string;
    ai_model: string;
    total_results: number;
    raw_results: number;
    extraction_mode: string;
    data_quality: string;
    relevance_score: number;
    relevance_summary: string;
  };
  error?: string;
}

/**
 * 网站已有案例
 */
interface ExistingCase {
  id: string;
  title: string;
  description: string;
}

/**
 * 对比分析响应接口
 */
interface CompareResponse {
  success: boolean;
  search_case: CaseExtraction;
  existing_case: {
    id: string;
    title: string;
    description: string;
  };
  comparison_analysis: ComparisonAnalysis;
  metadata?: {
    timestamp: string;
    ai_model: string;
    similarity_score: number;
    similarity_level: string;
  };
  error?: string;
}

export default function SmartSearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [max_results, setMaxResults] = useState(3)
  const [searchEngine, setSearchEngine] = useState('tavily') // tavily、baidu 或 bing
  
  const [isSearching, setIsSearching] = useState(false)
  const [isComparing, setIsComparing] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [detailedResults, setDetailedResults] = useState<SearchResult[]>([])
  const [caseExtraction, setCaseExtraction] = useState<CaseExtraction | null>(null)
  
  const [error, setError] = useState('')
  
  // 对比相关状态
  const [existingCases, setExistingCases] = useState<ExistingCase[]>([])
  const [selectedExistingCaseId, setSelectedExistingCaseId] = useState('')
  const [comparisonAnalysis, setComparisonAnalysis] = useState<ComparisonAnalysis | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  
  const quickSearchTags = ['城市更新', '文化保护', '历史街区', '社区更新', '可持续发展', '绿色建筑', '宜居', '人文', '乡村振兴', '工业遗产', '历史建筑', '公共建筑', '住宅设计', '商业综合体', '文化中心', '博物馆', '图书馆']

  // 加载网站已有案例
  useEffect(() => {
    loadExistingCases()
  }, [])

  const loadExistingCases = async () => {
    try {
      const response = await fetch('/api/existing-cases')
      const data = await response.json()
      setExistingCases(data.cases || [])
    } catch (error) {
      console.error('Failed to load existing cases:', error)
    }
  }

  // 智能搜索
  const handleSmartSearch = async () => {
    if (!searchTerm) return

    setIsSearching(true)
    setHasSearched(true)
    setSearchResults([])
    setDetailedResults([])
    setCaseExtraction(null)
    setError('')
    setShowComparison(false)
    setComparisonAnalysis(null)

    try {
      const response = await fetch('/api/smart-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: searchTerm,
          max_results: max_results,
          engine: searchEngine,
        }),
      })

      const data: SmartSearchResponse = await response.json()

      if (data.success) {
        setSearchResults(data.search_results || [])
        setDetailedResults(data.detailed_results || [])
        setCaseExtraction(data.case_extraction)
        console.log('[Smart Search] Results:', data)
      } else {
        setError(data.error || '智能搜索失败')
      }
    } catch (error: any) {
      setError(`智能搜索失败：${error.message}`)
    } finally {
      setIsSearching(false)
    }
  }

  // 开始对比
  const handleCompare = async () => {
    if (!caseExtraction || !selectedExistingCaseId) return

    setIsComparing(true)
    setShowComparison(true)
    setError('')

    try {
      const response = await fetch('/api/compare-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          search_result: caseExtraction,
          existing_case_id: selectedExistingCaseId,
        }),
      })

      const data: CompareResponse = await response.json()

      if (data.success) {
        setComparisonAnalysis(data.comparison_analysis)
        console.log('[Compare Cases] Results:', data)
      } else {
        setError(data.error || '对比分析失败')
      }
    } catch (error: any) {
      setError(`对比分析失败：${error.message}`)
    } finally {
      setIsComparing(false)
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    setMaxResults(3)
    setSearchResults([])
    setDetailedResults([])
    setCaseExtraction(null)
    setHasSearched(false)
    setError('')
    setShowComparison(false)
    setComparisonAnalysis(null)
    setSelectedExistingCaseId('')
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
            🔍 真实案例搜索 + 对比分析
          </h1>
          <p className="text-xl md:text-2xl text-body mb-6">
            搜索真实建筑案例，与网站已有案例进行深度对比分析
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
              <span className="text-green-900 font-medium">AI 信息提取</span>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-2xl">🔄</span>
              <span className="text-orange-900 font-medium">案例对比</span>
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

          <div className="mb-4">
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              搜索引擎
            </label>
            <select
              value={searchEngine}
              onChange={(e) => setSearchEngine(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tavily">🚀 Tavily 搜索（AI 驱动，推荐）</option>
              <option value="baidu">🇨🇳 百度搜索（中文支持更好）</option>
              <option value="bing">🌐 Bing 搜索（国际搜索）</option>
            </select>
          </div>

          <div className="flex gap-4 mb-4">
            <Button
              onClick={handleSmartSearch}
              disabled={isSearching}
              className="btn-primary-elegant px-8 flex-1"
            >
              {isSearching ? '🔍 搜索中...' : '🚀 开始搜索'}
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
              <p className="text-gray-600">正在搜索中，这可能需要 5-15 秒...</p>
              <p className="text-sm text-gray-500">AI 正在提取真实信息（不编造）...</p>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">操作失败</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 搜索结果 */}
        {hasSearched && !isSearching && caseExtraction && (
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {/* 搜索质量摘要 */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-green-900 mb-4 text-xl">📊 搜索质量报告</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {searchResults.length}
                  </div>
                  <div className="text-sm text-gray-600">相关结果</div>
                  <div className="text-xs text-gray-500 mt-1">
                    平均相关性: {Math.round((searchResults.reduce((sum, r) => sum + (r.relevance_score || 0), 0) / searchResults.length))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {Math.round((searchResults.reduce((sum, r) => sum + (r.relevance_score || 0), 0) / searchResults.length))}
                  </div>
                  <div className="text-sm text-gray-600">平均相关性</div>
                  <div className="text-xs text-gray-500 mt-1">0-100 分</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {caseExtraction.dataQuality?.includes('高') ? '高' : caseExtraction.dataQuality?.includes('中') ? '中' : '低'}
                  </div>
                  <div className="text-sm text-gray-600">数据质量</div>
                  <div className="text-xs text-gray-500 mt-1">AI 评估</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-green-700 mb-3">📝 搜索说明</h4>
                <p className="text-gray-700">
                  系统从更多原始结果中筛选出了最相关的 {searchResults.length} 个案例。
                  相关性评分由 AI 评估，0-100 分，分数越高表示越相关。
                  数据质量评估基于网页内容的丰富程度。
                </p>
              </div>
            </div>

            {/* ========== 案例详情（对齐网站 16 字段 + 示意图片） ========== */}
            <div className="space-y-8 mb-8">
              {/* 案例标题 */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{caseExtraction.caseName}</h1>
                {caseExtraction.caseType && (
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{caseExtraction.caseType}</span>
                )}
              </div>

              {/* 示意图片 */}
              {caseExtraction.caseImages && caseExtraction.caseImages.length > 0 && (
                <div className="elegant-card p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {caseExtraction.caseImages.slice(0, 6).map((img: string, index: number) => (
                      <div key={index} className="rounded-lg overflow-hidden bg-gray-100">
                        <img src={img} alt={`示意图片 ${index + 1}`} className="w-full h-48 object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1. 所在区位 */}
              {caseExtraction.location && caseExtraction.location !== '生态城市' && (
                <div className="elegant-card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">📍 所在区位</h2>
                  <p className="text-gray-700 leading-relaxed">{caseExtraction.location}</p>
                </div>
              )}

              {/* 2. 参与主体 */}
              {caseExtraction.participants && caseExtraction.participants.length > 5 && (
                <div className="elegant-card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">👥 参与主体</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{caseExtraction.participants}</p>
                </div>
              )}

              {/* 3. 项目介绍 */}
              {caseExtraction.projectIntroduction && caseExtraction.projectIntroduction.length > 10 && (
                <div className="elegant-card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">📝 项目介绍</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{caseExtraction.projectIntroduction}</p>
                </div>
              )}

              {/* 4. 项目规模 */}
              {caseExtraction.projectScale && caseExtraction.projectScale.length > 3 && (
                <div className="elegant-card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">📐 项目规模</h2>
                  <p className="text-gray-700 whitespace-pre-line">{caseExtraction.projectScale}</p>
                </div>
              )}

              {/* 5. 总投资额 */}
              {caseExtraction.totalInvestment && caseExtraction.totalInvestment.length > 5 && !caseExtraction.totalInvestment.includes('未检索') && (
                <div className="elegant-card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">💰 总投资额</h2>
                  <p className="text-gray-700 whitespace-pre-line">{caseExtraction.totalInvestment}</p>
                </div>
              )}

              {/* 6. 起止时间 */}
              {caseExtraction.startDate && caseExtraction.startDate.length > 3 && (
                <div className="elegant-card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">📅 起止时间</h2>
                  <p className="text-gray-700 whitespace-pre-line">{caseExtraction.startDate}{caseExtraction.endDate ? ` - ${caseExtraction.endDate}` : ''}</p>
                </div>
              )}

              {/* 7. 获奖情况 */}
              {caseExtraction.awardStatus && caseExtraction.awardStatus.length > 5 && !caseExtraction.awardStatus.includes('未检索') && (
                <div className="elegant-card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">🏆 获奖情况</h2>
                  <p className="text-gray-700 whitespace-pre-line">{caseExtraction.awardStatus}</p>
                </div>
              )}

              {/* 8. 案例类型 */}
              {caseExtraction.caseType && (
                <div className="elegant-card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">🏗 案例类型</h2>
                  <p className="text-gray-700 whitespace-pre-line">{caseExtraction.caseType}</p>
                </div>
              )}

              {/* 9. 可持续目标 */}
              {(caseExtraction.sustainabilityTargets || []).length > 0 && (
                <div className="elegant-card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">🌱 可持续目标</h2>
                  <div className="flex flex-wrap gap-3">
                    {(caseExtraction.sustainabilityTargets || []).map((target, index) => (
                      <span key={index} className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                        {target}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 10. 示范意义 */}
              {caseExtraction.demonstrationValue && caseExtraction.demonstrationValue.length > 10 && (
                <div className="elegant-card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">💡 示范意义</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{caseExtraction.demonstrationValue}</p>
                </div>
              )}

              {/* 11. 建设阶段 */}
              {(caseExtraction.constructionPhase || []).length > 0 && (
                <div className="elegant-card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">🔧 建设阶段</h2>
                  <div className="space-y-3">
                    {(caseExtraction.constructionPhase || []).map((phase, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</span>
                        <p className="text-gray-700 pt-1">{phase}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 12. 项目获奖评价 */}
              {caseExtraction.awardEvaluation && caseExtraction.awardEvaluation.length > 5 && (
                <div className="elegant-card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">🏅 项目获奖评价</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{caseExtraction.awardEvaluation}</p>
                </div>
              )}

              {/* 13. 项目举措 */}
              {(caseExtraction.projectInitiatives || []).length > 0 && (
                <div className="elegant-card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">🚀 项目举措</h2>
                  <div className="space-y-3">
                    {(caseExtraction.projectInitiatives || []).map((initiative, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <span className="text-purple-600 mt-0.5">▸</span>
                        <p className="text-gray-700">{initiative}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 14. 信息来源 */}
              {caseExtraction.infoSource && (
                <div className="elegant-card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">🔗 信息来源</h2>
                  <div className="space-y-1">
                    {caseExtraction.infoSource.split('\n').filter((url: string) => url.trim()).map((url: string, index: number) => (
                      <a key={index} href={url.trim()} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-700 hover:underline text-sm truncate">
                        {url.trim()}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* 15. 数据质量 */}
              <div className="elegant-card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">📊 数据质量</h2>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    caseExtraction.dataQuality?.includes('高') ? 'bg-green-100 text-green-800' :
                    caseExtraction.dataQuality?.includes('中') ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {caseExtraction.dataQuality?.includes('高') ? '高' : caseExtraction.dataQuality?.includes('中') ? '中' : '低'}
                  </span>
                  <span className="text-gray-500 text-sm">{caseExtraction.dataQuality}</span>
                </div>
              </div>
            </div>

            {/* 对比分析选择器 */}
            <div className="elegant-card p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 text-xl">🔄 选择已有案例进行对比</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择网站已有案例
                </label>
                <select
                  value={selectedExistingCaseId}
                  onChange={(e) => setSelectedExistingCaseId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- 请选择案例 --</option>
                  {existingCases.map((existingCase) => (
                    <option key={existingCase.id} value={existingCase.id}>
                      {existingCase.title}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleCompare}
                disabled={!selectedExistingCaseId || isComparing}
                className="btn-primary-elegant w-full"
              >
                {isComparing ? '🔄 对比分析中...' : '🚀 开始对比分析'}
              </Button>
            </div>
          </div>
        )}

        {/* 对比分析结果 */}
        {showComparison && comparisonAnalysis && (
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-green-900 mb-4 text-xl">📊 对比分析结果</h3>

              {/* 相似度评分 */}
              <div className="bg-white rounded-lg p-6 mb-6 text-center">
                <h4 className="font-semibold text-green-700 mb-4 text-lg">相似度评分</h4>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="text-6xl font-bold text-green-600">
                    {comparisonAnalysis.similarity}
                  </span>
                  <span className="text-2xl text-green-600">/ 100</span>
                </div>
                <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
                  {comparisonAnalysis.similarity_level}相似度
                </div>
              </div>

              {/* 详细对比分析 */}
              <div className="bg-white rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-700 mb-3 text-lg">📝 详细对比分析</h4>
                <p className="text-gray-700 leading-relaxed">{comparisonAnalysis.detailed_comparison}</p>
              </div>

              {/* 共同点 */}
              <div className="bg-white rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-700 mb-3 text-lg">✅ 共同点</h4>
                <ul className="space-y-2">
                  {comparisonAnalysis.common_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 差异点 */}
              <div className="bg-white rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-700 mb-3 text-lg">⚠️ 差异点</h4>
                <ul className="space-y-2">
                  {comparisonAnalysis.differences.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-orange-600 mt-1">•</span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 可借鉴经验 */}
              <div className="bg-white rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-700 mb-3 text-lg">💡 可借鉴经验</h4>
                <ul className="space-y-2">
                  {comparisonAnalysis.lessons.map((lesson, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-purple-600 mt-1">•</span>
                      <span className="text-gray-700">{lesson}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 建议 */}
              <div className="bg-white rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-700 mb-3 text-lg">📌 建议</h4>
                <ul className="space-y-2">
                  {comparisonAnalysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 详细搜索结果 */}
        {hasSearched && !isSearching && detailedResults.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold text-heading mb-4">
              📚 详细来源 ({detailedResults.length})
            </h2>

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
                    来源：{result.source}
                  </p>
                  <p className="text-gray-700 mb-3">{result.snippet}</p>
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
