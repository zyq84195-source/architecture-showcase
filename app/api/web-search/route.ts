/**
 * Web 搜索 API（简化版）
 * 
 * 功能：
 * 1. 支持百度、Bing 搜索
 * 2. 简单的接口，无需依赖外部服务
 * 3. 直接返回搜索结果
 * 
 * 查询参数：
 * - q: 搜索关键词（必填）
 * - engine: 搜索引擎（可选，默认：bing）
 * - max_results: 最大结果数（可选，默认：10）
 * 
 * 示例：
 * - GET /api/web-search?q=建筑案例&engine=bing
 * - GET /api/web-search?q=南京小西湖&engine=baidu
 */

import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

/**
 * 百度搜索（HTML 爬取）
 */
async function searchWithBaidu(query: string, max_results: number): Promise<SearchResult[]> {
  try {
    const response = await fetch(`https://www.baidu.com/s?wd=${encodeURIComponent(query)}&ie=utf-8&oe=utf-8`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`Baidu search error: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    // 百度搜索结果选择器
    $('.result, .c-container').each((i, el) => {
      if (results.length >= max_results) return false;

      const titleEl = $(el).find('h3 a, .t a');
      const title = titleEl.text().trim();
      let url = titleEl.attr('href');

      const snippetEl = $(el).find('.c-abstract, .c-span-last, .ec_wise_ad_p0');
      const snippet = snippetEl.text().trim();

      // 跳过百度重定向链接（可选）
      if (url && url.includes('baidu.com/link')) {
        // 保留重定向链接
      }

      // 清理 URL
      if (url && url.startsWith('http')) {
        if (!url.includes('baidu.com/link')) {
          url = url.split('?')[0];
        }
      }

      if (title && url && title.length > 2) {
        results.push({ title, url, snippet: snippet || '', source: 'baidu' });
      }
    });

    return results;
  } catch (error: any) {
    console.error('[Baidu Search Error]', error.message);
    throw new Error(`Baidu 搜索失败: ${error.message}`);
  }
}

/**
 * Bing 搜索（HTML 爬取）
 */
async function searchWithBing(query: string, max_results: number): Promise<SearchResult[]> {
  try {
    // 添加相关关键词，提高搜索精度
    const relatedKeywords = ['建筑案例', '生态城', '规划案例', '建筑规划', '城市规划'];
    let searchQuery = query;
    
    // 如果查询词不包含相关关键词，则添加第一个关键词
    const hasKeyword = relatedKeywords.some(keyword => query.includes(keyword));
    if (!hasKeyword) {
      searchQuery = `${query} ${relatedKeywords[0]}`;
      console.log(`[Bing Search] Optimized query: "${query}" → "${searchQuery}"`);
    }
    
    const response = await fetch(`https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Bing search error: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    $('.b_algo').each((i, el) => {
      if (results.length >= max_results) return false;

      const titleEl = $(el).find('h2 a');
      const title = titleEl.text().trim();
      const url = titleEl.attr('href');

      const snippetEl = $(el).find('.b_caption p');
      const snippet = snippetEl.text().trim();

      // 清理 URL
      let cleanUrl = url || '';
      if (cleanUrl.startsWith('/')) {
        cleanUrl = 'https://www.bing.com' + cleanUrl;
      } else if (!cleanUrl.startsWith('http')) {
        cleanUrl = 'https://www.bing.com/' + cleanUrl;
      }
      cleanUrl = cleanUrl.split('?')[0];

      if (title && cleanUrl && cleanUrl.length > 10) {
        results.push({ title, url: cleanUrl, snippet: snippet || '', source: 'bing' });
      }
    });

    return results;
  } catch (error: any) {
    console.error('[Bing Search Error]', error.message);
    throw new Error(`Bing 搜索失败: ${error.message}`);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { q, engine = 'bing', max_results = 10 } = Object.fromEntries(
      request.nextUrl.searchParams.entries()
    );

    if (!q) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: q' },
        { status: 400 }
      );
    }

    console.log(`[Web Search] Query: ${q}, Engine: ${engine}, Max Results: ${max_results}`);

    let results: SearchResult[] = [];

    try {
      // 根据搜索引擎选择
      switch (engine.toLowerCase()) {
        case 'baidu':
          results = await searchWithBaidu(q, max_results);
          break;
        
        case 'bing':
          results = await searchWithBing(q, max_results);
          break;
        
        default:
          results = await searchWithBing(q, max_results);
      }

      console.log(`[Web Search] Found ${results.length} results`);
    } catch (error: any) {
      console.error('[Web Search] Search error:', error);
      // 即使搜索失败，也返回空数组而不是抛出错误
      results = [];
    }

    if (results.length === 0) {
      return NextResponse.json({
        success: false,
        error: '没有找到相关的搜索结果。请尝试其他搜索词',
      });
    }

    return NextResponse.json({
      success: true,
      query: q,
      engine: engine,
      count: results.length,
      data: results,
    });
  } catch (error: any) {
    console.error('[Web Search Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '搜索失败，请稍后重试',
      },
      { status: 500 }
    );
  }
}
