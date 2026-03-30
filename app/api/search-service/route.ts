/**
 * 搜索服务 API
 *
 * 功能：
 * 1. 调用 DuckDuckGo Instant Answer API（生产环境，免费，无需 API Key）
 * 2. 调用本地搜索服务（开发环境）
 * 3. 返回搜索结果
 *
 * 查询参数：
 * - q: 搜索关键词（必填）
 * - engine: 搜索引擎（可选，默认：duckduckgo）
 *
 * 环境变量：
 * - TAVILY_API_KEY: Tavily API 密钥（可选）
 * - BING_SEARCH_API_KEY: Bing Search API 密钥（可选）
 * - SEARCH_SERVICE_URL: 本地搜索服务 URL（可选，仅开发环境）
 *
 * 示例：
 * GET /api/search-service?q=建筑案例 历史保护&engine=duckduckgo
 */

import { NextRequest, NextResponse } from 'next/server';

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
  datePublished?: string;
}

/**
 * 使用 DuckDuckGo Instant Answer API 进行搜索（免费，无需 API Key）
 */
async function searchWithDuckDuckGo(query: string): Promise<DuckDuckGoResult[]> {
  const response = await fetch(
    `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=0`
  );

  if (!response.ok) {
    throw new Error(`DuckDuckGo API error: ${response.status}`);
  }

  const data = await response.json();

  // DuckDuckGo 返回 RelatedTopics，从中提取结果
  const results: DuckDuckGoResult[] = [];

  if (data.RelatedTopics) {
    for (const topic of data.RelatedTopics) {
      if (topic.FirstURL && topic.Text && topic.Text !== '') {
        results.push({
          FirstURL: topic.FirstURL,
          Text: topic.Text,
          Title: topic.Text.substring(0, 80) + '...', // 截取前80字符作为标题
        });
      }
      if (results.length >= 10) {
        break;
      }
    }
  }

  if (results.length === 0) {
    // 如果 RelatedTopics 为空，尝试使用 AbstractText
    if (data.AbstractURL && data.AbstractText) {
      results.push({
        FirstURL: data.AbstractURL,
        Text: data.AbstractText,
        Title: data.Heading || 'Abstract',
      });
    }
  }

  return results;
}

/**
 * 使用 Tavily API 进行搜索
 */
async function searchWithTavily(query: string): Promise<TavilyResult[]> {
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
      max_results: 10,
      include_answer: true,
      include_raw_content: false,
      include_images: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.results;
}

/**
 * 使用 Bing Web Search API 进行搜索
 */
async function searchWithBing(query: string): Promise<BingResult[]> {
  const apiKey = process.env.BING_SEARCH_API_KEY;

  if (!apiKey) {
    throw new Error('BING_SEARCH_API_KEY environment variable is not set');
  }

  const response = await fetch(
    `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=10&offset=0&mkt=zh-CN`,
    {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bing API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.webPages.value;
}

/**
 * 使用本地搜索服务进行搜索
 */
async function searchWithLocalService(query: string, engine: string): Promise<any> {
  const searchServiceUrl = process.env.SEARCH_SERVICE_URL || 'http://localhost:3002';
  const searchUrl = `${searchServiceUrl}/api/search?q=${encodeURIComponent(query)}&engine=${engine}`;

  const response = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Local search service error');
  }

  return response.json();
}

/**
 * 统一搜索结果格式
 */
function formatSearchResults(results: any, source: 'duckduckgo' | 'tavily' | 'bing' | 'local'): Array<{
  title: string;
  url: string;
  snippet: string;
  source: string;
  published_date?: string;
  score?: number;
}> {
  if (source === 'duckduckgo') {
    return results.map((item: DuckDuckGoResult) => ({
      title: item.Title,
      url: item.FirstURL,
      snippet: item.Text.substring(0, 200),
      source: 'duckduckgo',
    }));
  } else if (source === 'tavily') {
    return results.map((item: TavilyResult) => ({
      title: item.title,
      url: item.url,
      snippet: item.content.substring(0, 200) + '...',
      source: 'tavily',
      published_date: item.published_date,
      score: item.score,
    }));
  } else if (source === 'bing') {
    return results.map((item: BingResult) => ({
      title: item.name,
      url: item.url,
      snippet: item.snippet,
      source: 'bing',
      published_date: item.datePublished,
    }));
  } else {
    return results.data.map((item: any) => ({
      title: item.title,
      url: item.url,
      snippet: item.snippet,
      source: item.source || 'local',
    }));
  }
}

/**
 * 搜索服务 API
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const engine = searchParams.get('engine') || 'duckduckgo';
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!query) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameter: q' },
      { status: 400 }
    );
  }

  try {
    console.log(`[Search Service API] Query: ${query}, Engine: ${engine}, Env: ${process.env.NODE_ENV}`);

    let results: any;
    let source: 'duckduckgo' | 'tavily' | 'bing' | 'local';
    let searchEngine: string;

    // 判断使用哪个搜索服务
    if (isDevelopment && engine === 'bing-local') {
      // 开发环境，使用本地搜索服务
      const data = await searchWithLocalService(query, 'bing');
      results = data.data;
      source = 'local';
      searchEngine = 'bing-local';
      console.log(`[Search Service API] Using local search service`);
    } else if (engine === 'tavily' && process.env.TAVILY_API_KEY) {
      // 使用 Tavily API
      results = await searchWithTavily(query);
      source = 'tavily';
      searchEngine = 'tavily';
      console.log(`[Search Service API] Using Tavily API`);
    } else if (engine === 'bing' && process.env.BING_SEARCH_API_KEY) {
      // 使用 Bing API
      results = await searchWithBing(query);
      source = 'bing';
      searchEngine = 'bing';
      console.log(`[Search Service API] Using Bing Web Search API`);
    } else {
      // 默认使用 DuckDuckGo API（免费，无需 API Key）
      results = await searchWithDuckDuckGo(query);
      source = 'duckduckgo';
      searchEngine = 'duckduckgo';
      console.log(`[Search Service API] Using DuckDuckGo API (free, no API key required)`);
    }

    // 格式化结果
    const formattedResults = formatSearchResults(results, source);
    const count = formattedResults.length;

    console.log(`[Search Service API] Found ${count} results from ${source}`);

    // 返回结果
    return NextResponse.json({
      success: true,
      query,
      engine: searchEngine,
      source,
      count,
      data: formattedResults,
      metadata: {
        timestamp: new Date().toISOString(),
        searchEngine: searchEngine,
        searchService: source,
        environment: process.env.NODE_ENV,
      },
    });
  } catch (error: any) {
    console.error('[Search Service API Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.toString(),
        hint: 'By default, DuckDuckGo API is used (free, no API key required). Optionally, you can use Tavily or Bing APIs by setting TAVILY_API_KEY or BING_SEARCH_API_KEY.',
      },
      { status: 500 }
    );
  }
}
