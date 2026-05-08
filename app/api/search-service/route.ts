/**
 * 搜索服务 API - 支持多搜索引擎
 *
 * 功能：
 * 1. 支持 DuckDuckGo、Tavily、Bing、百度搜索
 * 2. 统一的搜索接口
 * 3. 搜索引擎选择
 *
 * 查询参数：
 * - q: 搜索关键词（必填）
 * - engine: 搜索引擎（可选，默认：duckduckgo）
 * - max_results: 最大结果数（可选，默认：10）
 *
 * 环境变量：
 * - TAVILY_API_KEY: Tavily API 密钥（可选）
 *
 * 示例：
 * - GET /api/search-service?q=建筑案例&engine=duckduckgo
 * - GET /api/search-service?q=南京小西湖&engine=baidu
 */

import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

/**
 * 搜索结果接口
 */
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
  source: string;
  score?: number;
  published_date?: string;
  relevance_score?: number;
  relevance_reason?: string;
}

/**
 * DuckDuckGo 搜索结果接口
 */
interface DuckDuckGoResult {
  FirstURL: string;
  Text: string;
  Title: string;
}

/**
 * Tavily 搜索结果接口
 */
interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score?: number;
  published_date?: string;
}

/**
 * Bing 搜索结果接口
 */
interface BingResult {
  name: string;
  url: string;
  snippet: string;
}

/**
 * 百度搜索结果接口
 */
interface BaiduResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * 调用本地 Qwen 模型（用于相关性评估）
 */
async function callQwenModel(prompt: string, maxTokens: number = 300): Promise<any> {
  const localApiUrl = process.env.LOCAL_QWEN_API_URL || 'http://localhost:11434/v1';

  try {
    const response = await fetch(localApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:7b',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        max_tokens: maxTokens,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.status}`);
    }

    const data = await response.json();
    
    // 提取内容
    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    
    if (!content) {
      throw new Error('Qwen API returned empty content');
    }

    // 尝试解析 JSON
    try {
      return JSON.parse(content);
    } catch (e) {
      // 如果不是 JSON，返回原始文本
      return {
        content: content
      };
    }
  } catch (error: any) {
    console.error('[Qwen Model] Error:', error.message);
    throw error;
  }
}

/**
 * 评估搜索结果相关性
 */
async function evaluateRelevance(query: string, searchResult: SearchResult): Promise<{ relevance_score: number; relevance_reason: string }> {
  const locationKeywords = query.match(/([^\s]+[市县区省])/g);
  const locationKeyword = locationKeywords ? locationKeywords[0] : '';

  const prompt = `
Evaluate relevance of this search result to user's query.

## User Query
Query: "${query}"
${locationKeyword ? `Location Keyword: ${locationKeyword} - If search result mentions this location (the city/province in user's query), it is MORE relevant` : '- No specific location keyword in query.'}

## Search Result
- Title: ${searchResult.title}
- Snippet: ${searchResult.snippet.substring(0, 300)}
- URL: ${searchResult.url}
- Full Content Preview: ${(searchResult.content || '').substring(0, 500)}

## Relevance Criteria

Rate relevance on a scale of 0-100:

### Location Matching (Very Important)
${locationKeyword ? `- If search result mentions "${locationKeyword}" (the city/province in user's query), score should be at least 80. This is a STRONG relevance signal.` : '- No specific location keyword in query.'}

### Content Relevance (Important)
- 90-100: Highly relevant - The result directly addresses user's query (same topic, location, and scope)
- 70-89: Moderately relevant - Related topic but may differ in location, scale, or scope
- 50-69: Somewhat relevant - Tangentially related architecture projects
- 0-49: Not relevant - Unrelated topics (e.g., different country, different city, unrelated industry)

## Task
Provide a brief reason for rating in 1-2 sentences, highlighting:
1. Location matching (if applicable)
2. Topic relevance
3. Content quality

Return ONLY valid JSON:
{
  "relevance_score": number (0-100),
  "relevance_reason": "brief explanation (mention location matching if applicable)"
}
`;

  try {
    const result = await callQwenModel(prompt, 300);
    let relevanceScore = Math.min(100, Math.max(0, result.relevance_score || 50));

    if (locationKeyword) {
      const combinedContent = (searchResult.title + ' ' + searchResult.snippet + ' ' + (searchResult.content || '')).toLowerCase();
      if (combinedContent.includes(locationKeyword.toLowerCase())) {
        relevanceScore = Math.min(100, relevanceScore + 25);
      }
    }

    return {
      relevance_score: relevanceScore,
      relevance_reason: result.relevance_reason || 'Unable to evaluate'
    };
  } catch (error) {
    console.error('[Relevance Evaluation] Error:', error);
    return { relevance_score: 50, relevance_reason: 'Unable to evaluate' };
  }
}

/**
 * 过滤和排序搜索结果
 */
async function filterAndRankResults(query: string, searchResults: SearchResult[], max_results: number): Promise<SearchResult[]> {
  console.log(`[Relevance Filtering] Evaluating ${searchResults.length} results...`);

  const resultsWithRelevance = await Promise.all(
    searchResults.map(async (result) => {
      const evaluation = await evaluateRelevance(query, result);
      return {
        ...result,
        relevance_score: evaluation.relevance_score,
        relevance_reason: evaluation.relevance_reason
      };
    })
  );

  const sortedResults = resultsWithRelevance
    .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));

  const topResults = sortedResults.slice(0, max_results);

  console.log(`[Relevance Filtering] Selected top ${topResults.length} results`);
  topResults.forEach((result, index) => {
    console.log(`  ${index + 1}. Score: ${result.relevance_score}, Title: ${result.title.substring(0, 50)}...`);
  });

  return topResults;
}

/**
 * 使用 DuckDuckGo 进行搜索（免费，无需 API Key）
 */
async function searchWithDuckDuckGo(query: string, max_results: number): Promise<SearchResult[]> {
  const response = await fetch(
    `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=0`
  );

  if (!response.ok) {
    throw new Error(`DuckDuckGo API error: ${response.status}`);
  }

  const data = await response.json();

  // DuckDuckGo 返回 RelatedTopics，从中提取结果
  const results: SearchResult[] = [];

  if (data.RelatedTopics) {
    for (const topic of data.RelatedTopics) {
      if (topic.FirstURL && topic.Text && topic.Text !== '') {
        results.push({
          title: topic.Text.substring(0, 80),
          url: topic.FirstURL,
          snippet: topic.Text.substring(0, 200),
          source: 'duckduckgo',
          score: 0,
        });
      }
      if (results.length >= max_results * 2) {
        break;
      }
    }
  }

  console.log('[DuckDuckGo] Search results count:', results.length);
  return results;
}

/**
 * 使用 Tavily API 进行搜索
 */
async function searchWithTavily(query: string, max_results: number): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error('TAVILY_API_KEY environment variable is not set');
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: apiKey,
      query: query,
      search_depth: 'basic',
      max_results: max_results * 2,
      include_answer: true,
      include_raw_content: false,
      include_images: false,
      include_domains: [],
      exclude_domains: [],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[Tavily] Search results count:', data.results.length);
  console.log('[Tavily] Query:', query);

  return data.results.map((item: any) => ({
    title: item.title || '未命名',
    url: item.url,
    snippet: item.content ? item.content.substring(0, 500) : '',
    content: item.raw_content || item.content || '',
    images: item.images || [],
    source: 'tavily',
    score: item.score || 0,
    published_date: item.published_date || '',
  }));
}

/**
 * 使用百度搜索（爬取百度搜索页面）
 */
async function searchWithBaidu(query: string, max_results: number): Promise<SearchResult[]> {
  console.log('[Baidu Search] Starting search...');
  console.log('[Baidu Search] Query:', query);

  const response = await fetch('https://www.baidu.com/s', {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Baidu Search error: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const results: SearchResult[] = [];

  // 提取搜索结果
  $('.result').each((i: number, el: any) => {
    if (results.length >= max_results * 2) return false;

    const titleEl = $(el).find('h3 a');
    const title = titleEl.text().trim();
    let url = titleEl.attr('href');

    const snippetEl = $(el).find('.c-abstract');
    const snippet = snippetEl.text().trim();

    // 清理 URL
    if (url) {
      if (url.startsWith('http')) {
        url = url.split('?')[0];
      }
    }

    // 只添加有效的结果
    if (title && url && url.length > 10) {
      results.push({
        title,
        url,
        snippet: snippet || '',
        source: 'baidu',
        score: 0,
      });
      console.log(`[Baidu Search] Result ${results.length}: ${title.substring(0, 50)}... (URL: ${url})`);
    }
  });

  console.log('[Baidu Search] Total results:', results.length);
  return results;
}

/**
 * 使用本地搜索服务（包含百度和 Bing）
 */
async function searchWithLocalService(query: string, engine: string): Promise<SearchResult[]> {
  const searchServiceUrl = 'http://localhost:3002';
  const response = await fetch(`${searchServiceUrl}/api/search?q=${encodeURIComponent(query)}&engine=${engine}`);
  
  if (!response.ok) {
    throw new Error(`Local search service error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`[Local Search Service] Engine: ${engine}, Results: ${data.count}`);
  
  return data.data.map((item: any) => ({
    title: item.title || '未命名',
    url: item.url,
    snippet: item.snippet || '',
    source: engine,
    score: 0,
  }));
}

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q');
    const engine = request.nextUrl.searchParams.get('engine') || 'duckduckgo';
    const max_results = parseInt(request.nextUrl.searchParams.get('max_results') || '10', 10);

    if (!q) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: q' },
        { status: 400 }
      );
    }

    console.log(`[Search Service] Query: ${q}, Engine: ${engine}, Max Results: ${max_results}`);
    console.log(`[Search Service] Using ${engine.toUpperCase()} search engine`);

    let rawSearchResults: SearchResult[] = [];

    // 根据搜索引擎选择
    switch (engine.toLowerCase()) {
      case 'duckduckgo':
        rawSearchResults = await searchWithDuckDuckGo(q, max_results);
        break;
      
      case 'tavily':
        rawSearchResults = await searchWithTavily(q, max_results);
        break;
      
      case 'bing':
        rawSearchResults = await searchWithLocalService(q, 'bing');
        break;
      
      case 'baidu':
        rawSearchResults = await searchWithBaidu(q, max_results);
        break;
      
      case 'local':
        // 默认使用百度
        rawSearchResults = await searchWithBaidu(q, max_results);
        break;
      
      default:
        // 默认使用 DuckDuckGo
        rawSearchResults = await searchWithDuckDuckGo(q, max_results);
    }

    console.log(`[Search Service] Found ${rawSearchResults.length} raw search results`);

    if (rawSearchResults.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '没有找到相关的搜索结果。请尝试：1) 使用其他搜索词；2) 使用 URL 输入模式直接提供网页链接' 
        },
        { status: 404 }
      );
    }

    console.log('[Search Service] Step 2: Evaluating relevance...');
    const searchResults = await filterAndRankResults(q, rawSearchResults, max_results);
    console.log(`[Search Service] Selected ${searchResults.length} results`);

    return NextResponse.json({
      success: true,
      query: q,
      engine: engine,
      count: searchResults.length,
      data: searchResults,
      metadata: {
        timestamp: new Date().toISOString(),
        searchEngine: engine,
        maxResults: max_results
      },
    });
  } catch (error: any) {
    console.error('[Search Service Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
