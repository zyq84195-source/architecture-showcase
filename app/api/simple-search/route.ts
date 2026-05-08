/**
 * 简化的智能搜索 API
 * 
 * 功能：
 * 1. 支持 GET 和 POST 请求
 * 2. 调用内部 Web 搜索 API
 * 3. 简化流程，无需复杂的信息提取
 * 
 * 查询参数（GET 或 POST）：
 * - q: 搜索关键词（必填）
 * - engine: 搜索引擎（可选，默认：bing）
 * - max_results: 最大结果数（可选，默认：10）
 */

import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  relevance_score?: number;
  relevance_reason?: string;
}

/**
 * 调用 Web 搜索 API
 */
async function callWebSearch(query: string, engine: string, max_results: number): Promise<{ success: boolean; data: SearchResult[]; count: number }> {
  try {
    // 使用绝对路径，避免 URL 解析错误
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const webSearchUrl = `${baseUrl}/api/web-search`;
    const response = await fetch(`${webSearchUrl}?q=${encodeURIComponent(query)}&engine=${engine}`);

    if (!response.ok) {
      throw new Error(`Web search API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success || false,
      data: data.data || [],
      count: data.data?.length || 0
    };
  } catch (error: any) {
    console.error('[Web Search Error]', error);
    return {
      success: false,
      data: [],
      count: 0
    };
  }
}

/**
 * GET 请求处理
 */
export async function GET(request: NextRequest) {
  const { q, engine = 'bing', max_results = 10 } = Object.fromEntries(
    request.nextUrl.searchParams.entries()
  );

  if (!q) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameter: q' },
      { status: 400 }
    );
  }

  console.log(`[Simple Smart Search] Query: ${q}, Engine: ${engine}, Max Results: ${max_results}`);

  const result = await callWebSearch(q, engine, max_results);

  if (!result.success) {
    return NextResponse.json({
      success: false,
      error: '搜索失败，请稍后重试',
    });
  }

  return NextResponse.json({
    success: true,
    query: q,
    engine: engine,
    count: result.count,
    data: result.data,
  });
}

/**
 * POST 请求处理
 */
export async function POST(request: NextRequest) {
  try {
    const { q, engine = 'bing', max_results = 10 } = await request.json();

    if (!q) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: q' },
        { status: 400 }
      );
    }

    console.log(`[Simple Smart Search] Query: ${q}, Engine: ${engine}, Max Results: ${max_results}`);

    const result = await callWebSearch(q, engine, max_results);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: '搜索失败，请稍后重试',
      });
    }

    return NextResponse.json({
      success: true,
      query: q,
      engine: engine,
      count: result.count,
      data: result.data,
    });
  } catch (error: any) {
    console.error('[Simple Smart Search Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '搜索失败',
      },
      { status: 500 }
    );
  }
}
