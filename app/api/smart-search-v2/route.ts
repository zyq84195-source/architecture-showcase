/**
 * 智能搜索 API（优化版 v2 - 基于规则的稳定评分机制）
 *
 * 核心策略：
 * 1. 基于规则的评分（不依赖 AI 模型，稳定可靠）
 * 2. 多维度评分（域名、内容、关键词、位置等）
 * 3. 放宽过滤条件（保留更多搜索结果）
 * 4. 优化搜索关键词（自动添加相关关键词）
 */

import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  content?: string;
  images?: string[];
  score?: number;
  published_date?: string;
  relevance_score?: number;
  relevance_reason?: string;
}

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
 * 基于规则的评分函数（稳定可靠）
 */
function evaluateRelevance(query: string, searchResult: SearchResult): { relevance_score: number; relevance_reason: string } {
  let score = 40; // 初始分数（40 分），避免 0 分
  const reasons = [];
  const combinedContent = (searchResult.title + ' ' + searchResult.snippet + ' ' + (searchResult.content || '')).toLowerCase();

  // 提取地理位置关键词
  const locationKeywords = query.match(/([^\s]+[市县区省])/g);
  const locationKeyword = locationKeywords ? locationKeywords[0] : '';

  // ===== 加分项 =====

  // 加分 1：地理位置匹配（+20 分，CRITICAL）
  if (locationKeyword && combinedContent.includes(locationKeyword.toLowerCase())) {
    score += 20;
    reasons.push(`包含位置关键词"${locationKeyword}"`);
  }

  // 加分 2：高质量域名（+25 分）
  const highQualityDomains = [
    'gov.cn', 'mohurd.gov.cn', 'people.com.cn', 'xinhuanet.com',
    'baike.baidu.com', 'zh.wikipedia.org', 'archdaily.com', 'gooood.cn',
    'cn.archdaily.com', 'sina.com.cn', 'sohu.com', '163.com', 'qq.com'
  ];
  const isHighQualityDomain = highQualityDomains.some(domain => searchResult.url.includes(domain));
  if (isHighQualityDomain) {
    score += 25;
    reasons.push('来自高质量域名');
  }

  // 加分 3：案例关键词（+15 分）
  const caseKeywords = ['案例', '项目', '规划', '生态', '建筑', '示范', '工程'];
  const hasCaseKeyword = caseKeywords.some(keyword => combinedContent.includes(keyword));
  if (hasCaseKeyword) {
    score += 15;
    reasons.push('包含案例相关关键词');
  }

  // 加分 4：项目规模/投资关键词（+10 分）
  const scaleKeywords = ['投资', '规模', '亿', '万', '建筑面积', '占地面积', '总投资'];
  const hasScaleKeyword = scaleKeywords.some(keyword => combinedContent.includes(keyword));
  if (hasScaleKeyword) {
    score += 10;
    reasons.push('包含项目规模/投资信息');
  }

  // 加分 5：时间信息（+5 分）
  const timeKeywords = ['年', '月', '日', '工期', '周期', '年份', '季度'];
  const hasTimeKeyword = timeKeywords.some(keyword => combinedContent.includes(keyword));
  if (hasTimeKeyword) {
    score += 5;
    reasons.push('包含时间信息');
  }

  // 加分 6：详细描述（+10 分，基于内容长度）
  const contentLength = searchResult.content ? searchResult.content.length : 0;
  if (contentLength > 500) {
    score += 10;
    reasons.push('内容详细（>500 字符）');
  } else if (contentLength > 200) {
    score += 5;
    reasons.push('内容适中（>200 字符）');
  }

  // 加分 7：标题和摘要不同（+5 分）
  if (searchResult.title && searchResult.snippet && searchResult.title !== searchResult.snippet) {
    score += 5;
    reasons.push('标题和摘要不同，信息丰富');
  }

  // ===== 扣分项 =====

  // 扣分 1：通用链接页（-30 分，不直接过滤，只扣分）
  if (searchResult.url.includes('baidu.com/link') || 
      searchResult.url.includes('bing.com/search') ||
      searchResult.url.includes('sogou.com/link')) {
    score -= 30;
    reasons.push('百度/Bing/搜狗重定向链接（扣分）');
  }

  // 扣分 2：内容太短（-20 分）
  if (!searchResult.content || searchResult.content.length < 100) {
    score -= 20;
    reasons.push('内容太短（<100 字符，扣分）');
  }

  // 扣分 3：标题太短（-10 分）
  if (!searchResult.title || searchResult.title.length < 5) {
    score -= 10;
    reasons.push('标题太短（<5 字符，扣分）');
  }

  // 扣分 4：新闻文章（-10 分）
  if (searchResult.title.includes('新闻')) {
    score -= 10;
    reasons.push('新闻文章（扣分）');
  }

  // 限制分数范围 0-100
  score = Math.max(0, Math.min(100, score));

  // 生成评分原因
  const relevanceReason = reasons.length > 0 ? reasons.join('；') : '基本信息';

  console.log(`[Rule-based Scoring] Final score: ${score}, Reasons: ${relevanceReason}`);

  return { relevance_score: score, relevance_reason };
}

/**
 * 爬取网页内容
 */
async function fetchPageContent(url: string): Promise<string> {
  try {
    console.log(`[Fetch Page Content] Fetching: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000), // 10 秒超时
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    console.log(`[Fetch Page Content] Fetched ${html.length} characters`);

    // 简单的文本提取
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      const bodyText = bodyMatch[1]
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return bodyText.substring(0, 10000); // 限制为 10000 字符
    }

    return '';
  } catch (error: any) {
    console.error(`[Fetch Page Content] Error for ${url}:`, error.message);
    return '';
  }
}

/**
 * 批量爬取多个网页的内容
 */
async function fetchMultiplePages(urls: string[]): Promise<Map<string, string>> {
  const contentMap = new Map<string, string>();

  // 并发爬取（最多 5 个并发）
  const batchSize = 5;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (url) => {
        const content = await fetchPageContent(url);
        return { url, content };
      })
    );

    results.forEach(({ url, content }) => {
      contentMap.set(url, content);
    });
  }

  return contentMap;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { q, urls, engine = 'baidu', max_results = 3, mode = 'search' } = body;

    // 模式 1：URL 输入模式（用户直接提供 URL）
    if (mode === 'url' && urls) {
      console.log('[Smart Search v2] Mode: URL input');

      const contentMap = new Map<string, string>();

      // 爬取所有 URL 的内容
      for (const url of urls) {
        try {
          const content = await fetchPageContent(url);
          if (content && content.length > 100) {
            contentMap.set(url, content);
          }
        } catch (error) {
          console.error(`[Fetch Page Content] Error for ${url}:`, error);
        }
      }

      if (contentMap.size === 0) {
        throw new Error('无法爬取任何提供的 URL，请检查 URL 是否正确');
      }

      // 合并所有网页的内容
      const mergedContent = Array.from(contentMap.entries())
        .map(([url, content]) => `=== URL: ${url} ===\n${content}`)
        .filter(item => item.length > 100)
        .join('\n\n');

      // 模拟案例提取（这里需要调用真正的提取函数）
      const caseExtraction: CaseExtraction = {
        caseName: '自定义案例',
        location: '未提取',
        projectScale: '未提取',
        totalInvestment: '未提取',
        participants: '未提取',
        startDate: '未提取',
        endDate: '未提取',
        awardStatus: '未提取',
        caseType: '未提取',
        sustainabilityTargets: [],
        demonstrationValue: '',
        projectIntroduction: mergedContent.substring(0, 500),
        constructionPhase: [],
        awardEvaluation: '',
        projectInitiatives: [],
        infoSource: urls.join('\n'),
        caseImages: [],
        extractionSource: 'URL 输入模式（简化版，未调用完整提取）',
        dataQuality: contentMap.size > 1 ? '高（多来源信息补全）' : '中（单来源）'
      };

      console.log('[Smart Search v2] All extraction completed!');

      return NextResponse.json({
        success: true,
        mode: 'url',
        urls,
        case_extraction: caseExtraction,
        metadata: {
          timestamp: new Date().toISOString(),
          extraction_mode: 'URL 输入模式（用户直接提供 URL）',
          extraction_calls: 0,
          data_quality: caseExtraction.dataQuality,
          source_count: urls.length,
        },
      });
    }

    // 模式 2：搜索模式（使用本地搜索服务）
    if (!q) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: q (for search mode) or urls (for URL mode)' },
        { status: 400 }
      );
    }

    console.log(`[Smart Search v2] Query: ${q}, Max Results: ${max_results}`);
    console.log(`[Smart Search v2] Using rule-based scoring (stable and reliable)`);

    console.log('[Smart Search v2] Step 1: Searching with local web search API...');

    // 优化搜索关键词：添加建筑、案例、规划等相关关键词
    const relatedKeywords = ['建筑案例', '城市规划', '生态城', '绿色建筑', '项目案例', '示范工程'];
    let optimizedQuery = q;

    // 如果查询词不包含相关关键词，则添加第一个关键词
    const hasKeyword = relatedKeywords.some(keyword => q.includes(keyword));
    if (!hasKeyword) {
      optimizedQuery = `${q} ${relatedKeywords[0]}`;
      console.log(`[Smart Search v2] Optimized query: "${q}" → "${optimizedQuery}"`);
    }

    // 调用本地 Web 搜索 API（使用优化后的搜索词）
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const webSearchUrl = `${baseUrl}/api/web-search`;
    const searchResponse = await fetch(`${webSearchUrl}?q=${encodeURIComponent(optimizedQuery)}&engine=${engine}`);

    if (!searchResponse.ok) {
      throw new Error(`Local search service error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    const rawSearchResults = searchData.data || [];
    console.log(`[Smart Search v2] Found ${rawSearchResults.length} raw search results`);

    if (rawSearchResults.length === 0) {
      throw new Error('没有找到相关的搜索结果。请尝试：1) 使用其他搜索词；2) 使用 URL 输入模式直接提供网页链接');
    }

    console.log('[Smart Search v2] Step 2: Fetching page contents (for information completion)...');
    const searchUrls = rawSearchResults.slice(0, max_results * 10).map(r => r.url);
    const contentMap = await fetchMultiplePages(searchUrls);
    console.log(`[Smart Search v2] Fetched contents for ${contentMap.size} pages`);

    // 格式化搜索结果
    const searchResults = rawSearchResults.map((item: any) => ({
      title: item.title || '未命名',
      url: item.url,
      snippet: item.snippet || '',
      content: contentMap.get(item.url) || '',
      source: 'local-search-service',
      score: 0,
    }));

    console.log('[Smart Search v2] Step 3: Applying rule-based scoring...');
    console.log(`[Smart Search v2] Before scoring: ${searchResults.length} results`);

    // 应用基于规则的评分
    const scoredResults = searchResults.map(result => {
      const evaluation = evaluateRelevance(q, result);
      return {
        ...result,
        relevance_score: evaluation.relevance_score,
        relevance_reason: evaluation.relevance_reason
      };
    });

    console.log(`[Smart Search v2] After scoring: ${scoredResults.length} results`);

    // 只保留分数 > 0 的结果
    const filteredResults = scoredResults.filter(result => result.relevance_score > 0);
    console.log(`[Smart Search v2] Filtered to ${filteredResults.length} results (score > 0)`);

    // 如果过滤后结果太少，保留前 10 个（包括低分但>0的结果）
    let finalResults: SearchResult[];
    if (filteredResults.length >= 3) {
      finalResults = filteredResults;
    } else {
      console.log('[Smart Search v2] Too few results, keeping top 10...');
      finalResults = scoredResults
        .filter(result => result.relevance_score > 0)
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, 10);
    }

    // 按分数排序
    finalResults.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
    const sortedResults = finalResults;

    console.log(`[Smart Search v2] Final: ${sortedResults.length} results`);
    sortedResults.forEach((result, index) => {
      console.log(`  ${index + 1}. Score: ${result.relevance_score}, Title: ${result.title.substring(0, 50)}...`);
    });

    // 合并所有网页的内容
    const mergedContent = Array.from(contentMap.entries())
      .map(([url, content]) => {
        const searchResult = searchResults.find(r => r.url === url);
        return {
          url,
          title: searchResult?.title || '',
          content: content || '',
        };
      })
      .filter(item => item.content && item.content.length > 100)
      .sort((a, b) => b.content.length - a.content.length)
      .map(item => `=== ${item.title} ===\n${item.content}`)
      .join('\n\n');

    // 模拟案例提取（这里需要调用真正的提取函数）
    const caseExtraction: CaseExtraction = {
      caseName: sortedResults[0]?.title || '未命名',
      location: '天津滨海新区（示例）',
      projectScale: '约 3.7 亿人民币（示例）',
      totalInvestment: '约 3.7 亿人民币（示例）',
      participants: '中广核惠州核电有限公司（示例）',
      startDate: '2017 年（示例）',
      endDate: '2021 年（示例）',
      awardStatus: '无获奖记录（示例）',
      caseType: '生态城项目（示例）',
      sustainabilityTargets: ['改善生态环境', '建设生态文明'],
      demonstrationValue: '战略性合作（示例）',
      projectIntroduction: mergedContent.substring(0, 500),
      constructionPhase: ['规划', '建设', '运营'],
      awardEvaluation: '无评估',
      projectInitiatives: ['绿色建筑', '智慧城市'],
      infoSource: Array.from(contentMap.keys()).slice(0, 5).join('\n'),
      caseImages: [],
      extractionSource: '基于规则的评分版（简化版，未调用完整提取）',
      dataQuality: contentMap.size > 1 ? '高（多来源信息补全）' : '中（单来源）'
    };

    const avgRelevanceScore = sortedResults.reduce((sum, r) => sum + (r.relevance_score || 0), 0) / sortedResults.length;

    return NextResponse.json({
      success: true,
      query: q,
      search_results: sortedResults,
      case_extraction: caseExtraction,
      metadata: {
        timestamp: new Date().toISOString(),
        extraction_mode: '基于规则的评分版（稳定可靠，不依赖 AI 模型）',
        data_quality: caseExtraction.dataQuality,
        relevance_score: Math.round(avgRelevanceScore),
        source_count: contentMap.size,
        scoring_method: 'rule-based',
        engine_used: engine
      },
    });
  } catch (error: any) {
    console.error('[Smart Search v2 Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
