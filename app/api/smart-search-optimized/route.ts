/**
 * 智能搜索 API（优化版 - 提高搜索结果质量）
 *
 * 核心策略：
 * 1. 放宽过滤条件，保留更多搜索结果
 * 2. 添加智能评分机制，而非硬性过滤
 * 3. 优化搜索关键词，提高相关性
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

// 调用本地 Qwen 模型
async function callQwenModel(prompt: string, maxTokens: number = 2000): Promise<any> {
  const localApiUrl = process.env.LOCAL_QWEN_API_URL || 'http://localhost:11434/v1';

  if (!localApiUrl) {
    throw new Error('LOCAL_QWEN_API_URL environment variable is not set');
  }

  const response = await fetch(`${localApiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen2.5:7b',
      messages: [
        {
          role: 'system',
          content: 'You are an architecture expert. Always return valid JSON only, no markdown, no extra text. Be extremely detailed and accurate.'
        },
        {
          role: 'user',
          content: prompt,
        }
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Local Qwen API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const aiContent = data.choices[0].message.content;

  let report: any;
  try {
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      report = JSON.parse(jsonMatch[0]);
    } else {
      report = JSON.parse(aiContent);
    }
  } catch (e: any) {
    throw new Error(`无法解析 AI 返回的 JSON: ${e.message}`);
  }

  return report;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { q, urls, engine = 'baidu', max_results = 3, mode = 'search' } = body;

    // 模式 1：URL 输入模式（用户直接提供 URL）
    if (mode === 'url' && urls) {
      console.log('[Smart Search] Mode: URL input');

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

      const firstUrl = urls[0];
      const caseExtraction = await extractAllInformation(mergedContent, '自定义案例', firstUrl);

      // 更新信息来源
      caseExtraction.infoSource = urls.join('\n');
      caseExtraction.dataQuality = contentMap.size > 1 ? '高（多来源信息补全）' : '中（单来源）';

      console.log('[Smart Search] All extraction completed!');

      return NextResponse.json({
        success: true,
        mode: 'url',
        urls,
        case_extraction: caseExtraction,
        metadata: {
          timestamp: new Date().toISOString(),
          extraction_mode: 'URL 输入模式（用户直接提供 URL）',
          extraction_calls: 7,
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

    console.log(`[Smart Search] Query: ${q}, Max Results: ${max_results}`);
    console.log(`[Smart Search] Using Local Qwen Model: ${process.env.LOCAL_QWEN_API_URL}`);

    console.log('[Smart Search] Step 1: Searching with local web search API...');

    // 优化搜索关键词：添加建筑、案例、规划等相关关键词
    const relatedKeywords = ['建筑案例', '城市规划', '生态城', '绿色建筑', '项目案例', '示范工程'];
    let optimizedQuery = q;

    // 如果查询词不包含相关关键词，则添加第一个关键词
    const hasKeyword = relatedKeywords.some(keyword => q.includes(keyword));
    if (!hasKeyword) {
      optimizedQuery = `${q} ${relatedKeywords[0]}`;
      console.log(`[Smart Search] Optimized query: "${q}" → "${optimizedQuery}"`);
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
    console.log(`[Smart Search] Found ${rawSearchResults.length} raw search results`);

    if (rawSearchResults.length === 0) {
      throw new Error('没有找到相关的搜索结果。请尝试：1) 使用其他搜索词；2) 使用 URL 输入模式直接提供网页链接');
    }

    console.log('[Smart Search] Step 2: Fetching page contents (for information completion)...');
    const searchUrls = rawSearchResults.slice(0, max_results * 10).map(r => r.url);
    const contentMap = await fetchMultiplePages(searchUrls);
    console.log(`[Smart Search] Fetched contents for ${contentMap.size} pages`);

    // 格式化搜索结果
    const searchResults = rawSearchResults.map((item: any) => ({
      title: item.title || '未命名',
      url: item.url,
      snippet: item.snippet || '',
      content: contentMap.get(item.url) || '',
      source: 'local-search-service',
      score: 0,
    }));

    console.log('[Smart Search] Step 3: Merging contents and extracting information...');

    // 定义高质量域名白名单
    const highQualityDomains = [
      'gov.cn',           // 政府网站
      'mohurd.gov.cn',    // 住建部
      'people.com.cn',     // 人民网
      'xinhuanet.com',    // 新华网
      'baike.baidu.com',  // 百度百科
      'zh.wikipedia.org', // 维基百科
      'archdaily.com',    // 建筑 daily
      'gooood.cn',        // 谷德设计网
      'cn.archdaily.com', // 中国建筑 daily
      'sina.com.cn',      // 新浪
      'sohu.com',         // 搜狐
      '163.com',          // 网易
      'qq.com',           // 腾讯
    ];

    console.log(`[Quality Scoring] Before scoring: ${searchResults.length} results`);

    // 智能评分：而非硬性过滤
    const scoredResults = searchResults.map(result => {
      let score = 0;

      // 评分 1：高质量域名（+50 分）
      const isHighQualityDomain = highQualityDomains.some(domain =>
        result.url.includes(domain)
      );
      if (isHighQualityDomain) score += 50;

      // 评分 2：内容长度（每 50 字符 +10 分，最高 30 分）
      const contentLength = result.content ? result.content.length : 0;
      score += Math.min(contentLength / 50 * 10, 30);

      // 评分 3：是否包含案例关键词（+20 分）
      const caseKeywords = ['案例', '项目', '规划', '生态', '建筑'];
      const content = (result.title + ' ' + result.snippet + ' ' + (result.content || '')).toLowerCase();
      const hasCaseKeyword = caseKeywords.some(keyword => content.includes(keyword));
      if (hasCaseKeyword) score += 20;

      // 扣分 1：通用链接页（-100 分，直接过滤）
      if (result.url.includes('baidu.com/link')) {
        score -= 100;
      }

      // 扣分 2：内容太短（-50 分）
      if (!result.content || result.content.length < 50) {
        score -= 50;
      }

      // 扣分 3：标题太短（-30 分）
      if (!result.title || result.title.length < 3) {
        score -= 30;
      }

      return { ...result, relevance_score: Math.max(0, Math.min(100, score)) };
    });

    // 过滤掉负分的结果（即被过滤的结果）
    const filteredResults = scoredResults.filter(result => result.relevance_score > 0);

    console.log(`[Quality Scoring] After filtering (score > 0): ${filteredResults.length} results`);

    // 如果过滤后结果太少，保留前 10 个（包括低分但>0的结果）
    let finalResults: SearchResult[];
    if (filteredResults.length >= 3) {
      finalResults = filteredResults;
    } else {
      console.log('[Quality Scoring] Too few results, keeping top 10...');
      finalResults = scoredResults
        .filter(result => result.relevance_score > 0)
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, 10);
    }

    // 按分数排序
    finalResults.sort((a, b) => b.relevance_score - a.relevance_score);

    console.log(`[Quality Scoring] Final: ${finalResults.length} results`);

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

    const topResult = finalResults[0];
    const enrichedContent = (topResult.content || '') + '\n\n' + mergedContent;

    const caseExtraction = await extractAllInformation(enrichedContent, topResult.title, topResult.url);

    // 更新信息来源，显示所有使用的 URL
    const infoSources = Array.from(contentMap.keys()).slice(0, 10);
    caseExtraction.infoSource = infoSources.join('\n');
    caseExtraction.dataQuality = contentMap.size > 1 ? '高（多来源信息补全）' : '中（单来源）';

    console.log('[Smart Search] All extraction completed!');
    console.log('[Smart Search] Final extraction:', JSON.stringify(caseExtraction, null, 2));
    console.log('[Smart Search] Info sources:', infoSources.length);

    const avgRelevanceScore = finalResults.reduce((sum, r) => sum + (r.relevance_score || 0), 0) / finalResults.length;

    return NextResponse.json({
      success: true,
      query: q,
      search_results: finalResults,
      case_extraction: caseExtraction,
      metadata: {
        timestamp: new Date().toISOString(),
        extraction_mode: '优化版（智能评分 + 放宽过滤）',
        extraction_calls: 7,
        data_quality: caseExtraction.dataQuality,
        relevance_score: avgRelevanceScore,
        source_count: contentMap.size,
      },
    });
  } catch (error: any) {
    console.error('[Smart Search Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
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

// 这里需要导入 extractAllInformation 函数
// 由于文件太长，建议将 extractAllInformation 等辅助函数提取到单独的文件中
// 然后在需要时导入使用
