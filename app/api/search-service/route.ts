/**
 * 搜索服务 API
 *
 * 功能：
 * 1. 调用搜索服务（Bing 搜索引擎）
 * 2. 返回搜索结果
 *
 * 查询参数：
 * - q: 搜索关键词（必填）
 * - engine: 搜索引擎（可选，默认：bing）
 *
 * 示例：
 * GET /api/search-service?q=建筑案例 历史保护&engine=bing
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * 搜索服务 API
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const engine = searchParams.get('engine') || 'bing';

  if (!query) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameter: q' },
      { status: 400 }
    );
  }

  try {
    console.log(`[Search Service API] Query: ${query}, Engine: ${engine}`);

    // 调用搜索服务
    const searchServiceUrl = 'http://localhost:3002/api/search';
    const searchUrl = `${searchServiceUrl}?q=${encodeURIComponent(query)}&engine=${engine}`;

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // 不使用缓存，总是获取最新结果
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[Search Service API] Search service error:`, errorData);
      return NextResponse.json(
        { success: false, error: errorData.error || 'Search service error' },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(`[Search Service API] Found ${data.count} results`);

    // 返回结果
    return NextResponse.json({
      success: true,
      query,
      engine,
      count: data.count,
      data: data.data,
      metadata: {
        timestamp: new Date().toISOString(),
        searchEngine: data.engine,
        searchService: 'http://localhost:3002'
      }
    });
  } catch (error: any) {
    console.error('[Search Service API Error]', error);
    return NextResponse.json(
      { success: false, error: error.message, details: error.toString() },
      { status: 500 }
    );
  }
}
