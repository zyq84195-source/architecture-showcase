/**
 * 搜索服务 API
 *
 * 功能：
 * 1. 调用 Tavily 搜索 API（Vercel 生产环境）
 * 2. 调用本地搜索服务（开发环境）
 * 3. 返回搜索结果
 *
 * 查询参数：
 * - q: 搜索关键词（必填）
 * - engine: 搜索引擎（可选，默认：tavily）
 *
 * 环境变量：
 * - TAVILY_API_KEY: Tavily API 密钥（必填）
 * - SEARCH_SERVICE_URL: 本地搜索服务 URL（可选，仅开发环境）
 *
 * 示例：
 * GET /api/search-service?q=建筑案例 历史保护&engine=tavily
 */

import { NextRequest, NextResponse } from 'next/server';

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
 * Tavily 搜索响应接口
 */
interface TavilyResponse {
  answer?: string;
  query: string;
  follow_up_questions?: string[];
  images?: string[];
  results: TavilyResult[];
}

/**
 * 使用 Tavily API 进行搜索
 */
async function searchWithTavily(query: string): Promise<TavilyResponse> {
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

  return response.json();
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
function formatSearchResults(data: any, source: 'tavily' | 'local'): Array<{
  title: string;
  url: string;
  snippet: string;
  source: string;
  published_date?: string;
  score?: number;
}> {
  if (source === 'tavily') {
    return data.results.map((item: TavilyResult) => ({
      title: item.title,
      url: item.url,
      snippet: item.content.substring(0, 200) + '...',
      source: 'tavily',
      published_date: item.published_date,
      score: item.score,
    }));
  } else {
    return data.data.map((item: any) => ({
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
  const engine = searchParams.get('engine') || 'tavily';
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!query) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameter: q' },
      { status: 400 }
    );
  }

  try {
    console.log(`[Search Service API] Query: ${query}, Engine: ${engine}, Env: ${process.env.NODE_ENV}`);

    let data: any;
    let source: 'tavily' | 'local';
    let searchEngine: string;

    // 判断使用哪个搜索服务
    if (isDevelopment && engine === 'bing') {
      // 开发环境，使用本地搜索服务
      data = await searchWithLocalService(query, engine);
      source = 'local';
      searchEngine = engine;
      console.log(`[Search Service API] Using local search service`);
    } else {
      // 生产环境或 Tavily 引擎，使用 Tavily API
      data = await searchWithTavily(query);
      source = 'tavily';
      searchEngine = 'tavily';
      console.log(`[Search Service API] Using Tavily API`);
    }

    // 格式化结果
    const results = formatSearchResults(data, source);
    const count = results.length;

    console.log(`[Search Service API] Found ${count} results from ${source}`);

    // 返回结果
    return NextResponse.json({
      success: true,
      query,
      engine: searchEngine,
      source,
      count,
      data: results,
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
        hint: 'Make sure TAVILY_API_KEY is set in environment variables',
      },
      { status: 500 }
    );
  }
}
