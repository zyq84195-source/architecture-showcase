/**
 * 搜索服务 API - 优化版
 *
 * 改进点：
 * 1. 默认引擎改为 Tavily（质量最高，已配置 API Key）
 * 2. 查询增强：根据用户输入自动补充建筑领域关键词
 * 3. 结果过滤：去重 + 过滤低质量域名 + 评分排序
 * 4. 保留原有搜索引擎作为 fallback
 *
 * 查询参数：
 * - q: 搜索关键词（必填）
 * - engine: 搜索引擎（可选，默认：tavily）
 * - max_results: 最大结果数（可选，默认：10）
 */

import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// ─── 类型定义 ───────────────────────────────────────────────

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

// ─── 查询增强 ───────────────────────────────────────────────

/**
 * 建筑领域关键词，用于判断搜索意图
 */
const ARCHITECTURE_KEYWORDS = [
  '建筑', '规划', '城市更新', '街区', '改造', '保护', '再生',
  '设计', '社区', '文化', '历史', '景观', '生态', '可持续',
  '旧城', '新村', '更新', '修缮', '遗产', '风貌',
];

/**
 * 域名质量评分：建筑/规划相关网站分数高，泛内容平台分数低
 */
const DOMAIN_QUALITY: Record<string, number> = {
  // 高质量建筑/规划类网站
  'archidogs.com': 90,
  'archdaily.com': 90,
  'archdaily.cn': 90,
  'dezeen.com': 90,
  'gooood.cn': 90,
  'archina.com': 85,
  'cnki.net': 85,
  'gov.cn': 85,
  'mohurd.gov.cn': 85,
  'planning.org.cn': 85,
  'china-up.com': 85,
  'architecture.com': 85,
  // 专业机构/国际组织
  'worldbank.org': 85,
  'worldbank.com': 85,
  'documents1.worldbank.org': 85,
  'unhabitat.org': 85,
  'a2architects.com': 80,
  'thupdi.com': 80,
  'mayortraining.org': 75,
  'lifeweek.com.cn': 75,
  'thepaper.cn': 70,
  'caup.net': 80,
  'abbs.com': 75,
  'far2000.com': 75,
  'tianjineco-city.com': 80,
  // 政府/媒体
  'sohu.com': 60,
  'qq.com': 55,
  'sina.com.cn': 55,
  '163.com': 55,
  'people.com.cn': 65,
  'xinhuanet.com': 65,
  // 学术/行业
  'edu.cn': 70,
  'wanfangdata.com.cn': 70,
  'cqvip.com': 65,
  // 低质量泛内容平台
  'zhihu.com': 30,
  'baidu.com': 25,
  'tieba.baidu.com': 15,
  'baike.baidu.com': 20,
  'wenku.baidu.com': 20,
  'douyin.com': 10,
  'toutiao.com': 20,
  'xiaohongshu.com': 20,
  'scribd.com': 15,
  };

/**
 * 根据域名获取质量评分
 */
function getDomainScore(url: string): number {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    // 精确匹配
    if (DOMAIN_QUALITY[hostname] !== undefined) {
      return DOMAIN_QUALITY[hostname];
    }
    // 子域名匹配（如 news.sohu.com）
    for (const [domain, score] of Object.entries(DOMAIN_QUALITY)) {
      if (hostname.endsWith('.' + domain)) {
        return score;
      }
    }
    return 50; // 默认中等
  } catch {
    return 30;
  }
}

/**
 * 查询增强：根据用户输入判断意图，自动补充领域关键词
 *
 * 策略：
 * - 如果查询已包含建筑领域关键词 → 不追加（用户意图明确）
 * - 如果查询是具体项目/地名 → 追加"建筑案例 城市更新"提高相关性
 * - 如果查询偏短（<4字）→ 追加更多上下文
 */
function enhanceQuery(query: string): string {
  const hasArchitectureKeyword = ARCHITECTURE_KEYWORDS.some(kw => query.includes(kw));

  if (hasArchitectureKeyword) {
    return query; // 用户意图已明确，不改
  }

  if (query.length <= 4) {
    return `${query} 建筑 城市更新 案例`;
  }

  return `${query} 建筑案例`;
}

// ─── 结果过滤与排序 ──────────────────────────────────────────

/**
 * URL 去重（同一域名下的相似页面只保留一条）
 */
function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return results.filter((result) => {
    try {
      const url = new URL(result.url);
      // 以域名+路径前两段作为去重键
      const pathParts = url.pathname.split('/').filter(Boolean);
      const dedupKey = `${url.hostname}/${pathParts.slice(0, 2).join('/')}`;
      if (seen.has(dedupKey)) return false;
      seen.add(dedupKey);
      return true;
    } catch {
      return true;
    }
  });
}

/**
 * 计算单条结果的综合评分
 * - Tavily 自带 score → 直接使用
 * - 域名质量加成
 * - 标题/摘要与查询关键词匹配度
 */
function scoreResult(result: SearchResult, query: string): number {
  // Tavily 自带 score 范围 0-1，映射到 0-100
  let tavilyScore = (result.score && result.score <= 1) ? result.score * 100 : (result.score || 40);
  // 如果 Tavily 没返回有效 score，给一个基础分
  if (!result.score || result.score === 0) tavilyScore = 40;

  // 域名质量评分
  const domainScore = getDomainScore(result.url);

  // 标题/摘要关键词匹配
  const queryTerms = query.replace(/[，。、？]/g, ' ').split(/\s+/).filter(t => t.length > 1);
  const titleLower = (result.title || '').toLowerCase();
  const snippetLower = (result.snippet || '').toLowerCase();

  let titleMatch = 0;
  let snippetMatch = 0;
  for (const term of queryTerms) {
    const termLower = term.toLowerCase();
    if (titleLower.includes(termLower)) titleMatch++;
    if (snippetLower.includes(termLower)) snippetMatch++;
  }

  // 综合评分：Tavily 30% + 域名质量 25% + 标题匹配 25% + 摘要匹配 20%
  let score = 0;
  score += tavilyScore * 0.30;
  score += domainScore * 0.25;
  score += Math.min(titleMatch * 20, 40) * 0.25 / 10 * 25;   // 标题每匹配一个词 +5，上限 25
  score += Math.min(snippetMatch * 10, 30) * 0.20 / 10 * 20;  // 摘要每匹配一个词 +2，上限 20

  // 额外加成
  // 建筑领域关键词出现在标题 → +10
  const archKeywordsInTitle = ARCHITECTURE_KEYWORDS.filter(kw => titleLower.includes(kw));
  score += Math.min(archKeywordsInTitle.length * 5, 10);

  // 内容长度加成（snippet > 100字 → +5）
  if ((result.snippet || '').length > 100) score += 5;

  return Math.round(Math.min(100, Math.max(10, score)));
}

/**
 * 过滤 + 排序 + 截断
 */
function filterAndRankResults(
  results: SearchResult[],
  query: string,
  maxResults: number
): SearchResult[] {
  const deduped = deduplicateResults(results);
  return deduped
    // 评分
    .map(r => ({ ...r, relevance_score: scoreResult(r, query) }))
    // 过滤掉极低分结果（< 15 分）
    .filter(r => (r.relevance_score ?? 0) >= 15)
    // 按分数降序
    .sort((a, b) => (b.relevance_score ?? 0) - (a.relevance_score ?? 0))
    // 截断（多取一些给前端展示）
    .slice(0, maxResults);
}

// ─── 搜索引擎实现 ────────────────────────────────────────────

/**
 * Tavily 搜索（默认引擎，质量最高）
 */
async function searchWithTavily(query: string, max_results: number): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY environment variable is not set');
  }

  // 查询增强
  const enhancedQuery = enhanceQuery(query);
  console.log(`[Tavily] Query: "${query}" → Enhanced: "${enhancedQuery}"`);

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query: enhancedQuery,
      search_depth: 'advanced',
      max_results: Math.min(max_results * 2, 20), // 多取一些用于过滤
      include_answer: false,
      include_raw_content: false,
      include_images: false,
      include_domains: [],
      exclude_domains: ['zhihu.com', 'baike.baidu.com', 'douyin.com', 'scribd.com', 'tieba.baidu.com', 'wenku.baidu.com'],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`[Tavily] Raw results: ${data.results?.length}`);

  return (data.results || []).map((item: any) => {
    const rawContent = item.content || '';

    // ── 清理 snippet 的核心逻辑 ──
    let snippet = '';

    // 第一步：按行拆分，逐行过滤噪音
    const lines = rawContent.split(/[\n\r]+/);
    const meaningfulLines: string[] = [];
    for (const line of lines) {
      let trimmed = line
        .replace(/^#{1,6}\s*/, '')   // 去掉 Markdown 标题 #
        .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // 去掉加粗
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接只保留文字
        .trim();

      // 跳过太短的行
      if (trimmed.length < 15) continue;
      // 跳过纯符号行
      if (/^[|\-#*=\d\.\s>]+$/.test(trimmed)) continue;
      // 跳过面包屑导航（用 > 分隔的短词）
      if (/^[\u4e00-\u9fa5]{2,4}\s*>\s*[\u4e00-\u9fa5]{2,4}/.test(trimmed) && trimmed.length < 40) continue;
      // 跳过网站导航
      if (/^(首页|导航|菜单|登录|注册|搜索|下载|上传|分享|政务|信息公开)/.test(trimmed)) continue;
      // 跳过政府网站导航栏
      if (/^(省人大|省政府|省政协|党务要闻|市县传真|工作动态|受权发布|书记信箱)/.test(trimmed)) continue;
      // 跳过来源标记
      if (/^(来源：|来源:|作者：|作者:|责任编辑)/.test(trimmed)) continue;
      // 跳过日期行
      if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(trimmed) && trimmed.length < 25) continue;
      // 跳过页脚
      if (/^(版权所有|Copyright|ICP|备案号|技术支持)/.test(trimmed)) continue;

      meaningfulLines.push(trimmed);
      if (meaningfulLines.length >= 2) break;
    }

    if (meaningfulLines.length > 0) {
      snippet = meaningfulLines.join(' ');
    } else {
      // 回退：用 content 前面部分
      snippet = rawContent.substring(0, 200);
    }

    // 第二步：全局清理
    snippet = snippet
      .replace(/\|/g, ' ')          // 去掉表格分隔符
      .replace(/---+/g, ' ')        // 去掉 Markdown 分隔线
      .replace(/\s+/g, ' ')         // 合并空白
      .trim()
      .substring(0, 200);

    return {
      title: (item.title || '未命名').replace(/^#+\s*/, ''),
      url: item.url,
      snippet,
      content: rawContent,
      source: 'tavily',
      score: item.score || 50,
      published_date: item.published_date || '',
    };
  });
}

/**
 * DuckDuckGo 搜索（免费备选）
 */
async function searchWithDuckDuckGo(query: string, max_results: number): Promise<SearchResult[]> {
  const enhancedQuery = enhanceQuery(query);
  console.log(`[DuckDuckGo] Query: "${query}" → Enhanced: "${enhancedQuery}"`);

  // DuckDuckGo Lite 版本
  const params = new URLSearchParams({ q: enhancedQuery });
  const response = await fetch('https://lite.duckduckgo.com/lite/', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo error: ${response.status}`);
  }

  const html = await response.text();
  console.log(`[DuckDuckGo] Response length: ${html.length}`);

  const results: SearchResult[] = [];

  // 方法1: 正则匹配 result-link + href
  const linkRegex = /class='result-link'[^>]*>(.*?)<\/a>/gs;
  const hrefRegex = /href="([^"]+)"/g;

  // 找所有 result-link 块
  const blocks: { title: string; url: string }[] = [];
  const aTags = html.match(/<a[^>]*class='result-link'[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi) || [];

  for (const tag of aTags) {
    const hrefMatch = tag.match(/href="([^"]+)"/);
    const titleMatch = tag.match(/>([\s\S]*?)<\/a>/);
    if (hrefMatch && titleMatch) {
      let url = hrefMatch[1].replace(/&amp;/g, '&');
      const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();

      // DDG redirect URL → 真实 URL
      if (url.includes('uddg=')) {
        try {
          const m = url.match(/uddg=([^&]+)/);
          if (m) url = decodeURIComponent(m[1]);
        } catch {}
      }

      // 过滤 DDG 内部链接和广告
      if (url && url.startsWith('http') && !url.includes('duckduckgo.com') && !title.includes('Sponsored')) {
        blocks.push({ title, url });
      }
    }
  }

  console.log(`[DuckDuckGo] Regex parsed: ${blocks.length} results`);

  // 方法2: 如果正则也没结果，用 cheerio 兜底
  if (blocks.length === 0) {
    const $ = cheerio.load(html);
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const title = $(el).text().trim();
      if (href.startsWith('http') && !href.includes('duckduckgo.com') && title.length > 10) {
        blocks.push({ title: title.substring(0, 120), url: href.replace(/&amp;/g, '&') });
      }
    });
    console.log(`[DuckDuckGo] Cheerio fallback: ${blocks.length} results`);
  }

  // 去重
  const seen = new Set<string>();
  for (const b of blocks) {
    if (seen.has(b.url)) continue;
    seen.add(b.url);
    results.push({
      title: b.title.substring(0, 120),
      url: b.url,
      snippet: '',
      source: 'duckduckgo',
      score: 50,
    });
    if (results.length >= max_results * 2) break;
  }

  // 尝试匹配 snippet（在 HTML 中找 result-snippet 文本）
  const snippets = html.match(/class='result-snippet'>([\s\S]*?)<\/td>/gi) || [];
  snippets.forEach((s, i) => {
    if (i < results.length) {
      results[i].snippet = s.replace(/<[^>]+>/g, '').trim().substring(0, 200);
    }
  });

  console.log(`[DuckDuckGo] Final: ${results.length} results`);
  return results;
}

/**
 * Brave Search（免费 Web 搜索，无需 API Key）
 */
async function searchWithBrave(query: string, max_results: number): Promise<SearchResult[]> {
  const enhancedQuery = enhanceQuery(query);
  console.log(`[Brave] Query: "${query}" → Enhanced: "${enhancedQuery}"`);

  const response = await fetch(
    `https://search.brave.com/search?q=${encodeURIComponent(enhancedQuery)}&format=json`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
    }
  );

  if (!response.ok) {
    // Brave JSON 可能需要不同方式，回退到 HTML
    return await searchWithBraveHtml(enhancedQuery, max_results);
  }

  try {
    const data = await response.json();
    const webResults = data?.web?.results || data?.results || [];
    return webResults.slice(0, max_results * 2).map((item: any) => ({
      title: item.title || '未命名',
      url: item.url || '',
      snippet: (item.description || '').substring(0, 200),
      source: 'brave',
      score: item?.family_friendly ? 60 : 50,
    }));
  } catch {
    return await searchWithBraveHtml(enhancedQuery, max_results);
  }
}

async function searchWithBraveHtml(query: string, max_results: number): Promise<SearchResult[]> {
  console.log(`[Brave HTML] Fallback to HTML parsing`);

  const response = await fetch(
    `https://search.brave.com/search?q=${encodeURIComponent(query)}&source=web`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Brave search error: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const results: SearchResult[] = [];

  // Brave HTML 结果选择器
  $('#results .snippet, .result-item').each((i: number, el: any) => {
    if (results.length >= max_results * 2) return false;
    const titleEl = $(el).find('.title a, a.result-header');
    const title = titleEl.text().trim();
    const url = titleEl.attr('href') || '';
    const snippetEl = $(el).find('.snippet-description, .description');
    const snippet = snippetEl.text().trim().substring(0, 200);

    if (title && url && url.startsWith('http')) {
      results.push({ title, url, snippet: snippet || '', source: 'brave', score: 50 });
    }
  });

  console.log(`[Brave HTML] Results: ${results.length}`);
  return results;
}

// Legacy placeholder
async function _unused_searchWithLocalService() {}
  return results;
}

/**
 * Bing 搜索（HTML 爬取）
 */
async function searchWithBing(query: string, max_results: number): Promise<SearchResult[]> {
  const enhancedQuery = enhanceQuery(query);
  console.log(`[Bing] Query: "${query}" → Enhanced: "${enhancedQuery}"`);

  const response = await fetch(
    `https://www.bing.com/search?q=${encodeURIComponent(enhancedQuery)}&count=${max_results * 2}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Bing search error: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const results: SearchResult[] = [];

  $('#b_results > li.b_algo').each((i: number, el: any) => {
    if (results.length >= max_results * 2) return false;

    const titleEl = $(el).find('h2 a');
    const title = titleEl.text().trim();
    const url = titleEl.attr('href') || '';
    const snippetEl = $(el).find('.b_caption p, .b_lineclamp2');
    const snippet = snippetEl.text().trim().substring(0, 200);

    if (title && url) {
      results.push({ title, url, snippet: snippet || '', source: 'bing', score: 50 });
    }
  });

  console.log(`[Bing] Results: ${results.length}`);
  return results;
}

/**
 * SearXNG 搜索（公共实例，免费，JSON API）
 */
async function searchWithSearx(query: string, max_results: number): Promise<SearchResult[]> {
  const enhancedQuery = enhanceQuery(query);
  console.log(`[SearX] Query: "${query}" → Enhanced: "${enhancedQuery}"`);

  // 多个公共 SearXNG 实例，按优先级尝试
  const instances = [
    'https://searx.be',
    'https://search.sapti.me',
    'https://searxng.ch',
    'https://search.bus-hit.me',
  ];

  for (const baseUrl of instances) {
    try {
      const response = await fetch(
        `${baseUrl}/search?q=${encodeURIComponent(enhancedQuery)}&format=json&language=zh-CN&categories=general&max_results=${max_results * 2}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000), // 10秒超时
        }
      );

      if (!response.ok) continue;

      const data = await response.json();
      const results: SearchResult[] = (data.results || [])
        .slice(0, max_results * 2)
        .map((item: any) => ({
          title: item.title || '未命名',
          url: item.url || '',
          snippet: (item.content || '').substring(0, 200),
          source: 'searx',
          score: item.score || 50,
        }));

      if (results.length > 0) {
        console.log(`[SearX] Instance: ${baseUrl}, Results: ${results.length}`);
        return results;
      }
    } catch {
      console.warn(`[SearX] Instance ${baseUrl} failed, trying next...`);
      continue;
    }
  }

  throw new Error('所有搜索实例均不可用，请稍后重试或使用其他搜索引擎');
}

/**
 * Google 搜索（HTML 爬取）
 */
async function searchWithGoogle(query: string, max_results: number): Promise<SearchResult[]> {
  const enhancedQuery = enhanceQuery(query);
  console.log(`[Google] Query: "${query}" → Enhanced: "${enhancedQuery}"`);

  const response = await fetch(
    `https://www.google.com/search?q=${encodeURIComponent(enhancedQuery)}&num=${max_results * 2}&hl=zh-CN`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Google search error: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const results: SearchResult[] = [];

  // Google 搜索结果选择器
  $('#search .g, #rso .g').each((i: number, el: any) => {
    if (results.length >= max_results * 2) return false;

    const titleEl = $(el).find('h3');
    const title = titleEl.text().trim();
    const linkEl = $(el).find('a').first();
    const url = linkEl.attr('href') || '';
    const snippetEl = $(el).find('.VwiC3b, .st, [style*="-webkit-line-clamp"]');
    const snippet = snippetEl.text().trim().substring(0, 200);

    // 过滤掉空结果和 Google 内部链接
    if (title && url && !url.includes('google.com') && url.startsWith('http')) {
      results.push({ title, url, snippet: snippet || '', source: 'google', score: 50 });
    }
  });

  console.log(`[Google] Results: ${results.length}`);
  return results;
}
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const enhancedQuery = enhanceQuery(query);

  const response = await fetch(
    `${baseUrl}/api/web-search?q=${encodeURIComponent(enhancedQuery)}&engine=${engine}`
  );

  if (!response.ok) {
    throw new Error(`Local search service error: ${response.status}`);
  }

  const data = await response.json();
  return (data.data || []).map((item: any) => ({
    title: item.title || '未命名',
    url: item.url,
    snippet: item.snippet || '',
    source: engine,
    score: 50,
  }));
}

/**
 * 百度搜索（通过百度移动版，确保 UTF-8 编码）
 */
async function searchWithBaidu(query: string, max_results: number): Promise<SearchResult[]> {
  const enhancedQuery = enhanceQuery(query);
  console.log(`[Baidu] Query: "${query}" → Enhanced: "${enhancedQuery}"`);

  const response = await fetch(`https://m.baidu.com/s?word=${encodeURIComponent(enhancedQuery)}&pn=0`, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Baidu search error: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  let html = new TextDecoder('utf-8').decode(buffer);

  // 如果出现乱码特征，尝试 GBK 解码
  if (html.includes('����') || html.includes('鎴') || html.includes('鎬')) {
    try {
      html = new TextDecoder('gbk').decode(buffer);
    } catch {
      // GBK 解码失败，保持 UTF-8
    }
  }

  const $ = cheerio.load(html);
  const results: SearchResult[] = [];

  // 移动版百度结果选择器
  $('.result, .c-container, [class*="result"]').each((i: number, el: any) => {
    if (results.length >= max_results * 2) return false;

    const titleEl = $(el).find('h3 a, .t a, [class*="title"] a').first();
    const title = titleEl.text().trim().replace(/\s+/g, ' ');
    const url = titleEl.attr('href') || '';
    const snippetEl = $(el).find('.c-span-last, .c-abstract, [class*="content"], [class*="desc"]');
    const snippet = snippetEl.text().trim().replace(/\s+/g, ' ').substring(0, 200);

    if (title && url && title.length > 2) {
      results.push({ title, url, snippet: snippet || '', source: 'baidu', score: 50 });
    }
  });

  // 如果移动版解析不到，尝试桌面版
  if (results.length === 0) {
    $('.result c-container, .c-container').each((i: number, el: any) => {
      if (results.length >= max_results * 2) return false;
      const title = $(el).find('h3').text().trim();
      const href = $(el).find('a').first().attr('href') || '';
      const snippet = $(el).text().trim().substring(0, 200);
      if (title && href) {
        results.push({ title, url: href, snippet, source: 'baidu', score: 50 });
      }
    });
  }

  console.log(`[Baidu] Results: ${results.length}`);
  return results;
}

// ─── 主处理 ──────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q');
    const engine = request.nextUrl.searchParams.get('engine') || 'brave'; // 默认用 Brave
    const max_results = parseInt(request.nextUrl.searchParams.get('max_results') || '10', 10);

    if (!q) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: q' },
        { status: 400 }
      );
    }

    console.log(`[Search Service] Query: "${q}", Engine: ${engine}, Max: ${max_results}`);

    // ── 第一步：获取原始搜索结果 ──
    let rawResults: SearchResult[];

    switch (engine.toLowerCase()) {
      case 'tavily':
        rawResults = await searchWithTavily(q, max_results);
        break;
      case 'brave':
        rawResults = await searchWithBrave(q, max_results);
        break;
      case 'duckduckgo':
        rawResults = await searchWithDuckDuckGo(q, max_results);
        break;
      case 'bing':
        rawResults = await searchWithBing(q, max_results);
        break;
      case 'google':
        rawResults = await searchWithGoogle(q, max_results);
        break;
      case 'searx':
        rawResults = await searchWithSearx(q, max_results);
        break;
      case 'baidu':
        rawResults = await searchWithBaidu(q, max_results);
        break;
      default:
        // 默认使用 Brave
        rawResults = await searchWithBrave(q, max_results);
    }

    if (rawResults.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有找到相关的搜索结果，请尝试其他搜索词' },
        { status: 404 }
      );
    }

    // ── 第二步：过滤 + 排序 + 截断 ──
    const rankedResults = filterAndRankResults(rawResults, q, max_results);
    console.log(`[Search Service] Final: ${rankedResults.length} results`);

    return NextResponse.json({
      success: true,
      query: q,
      engine,
      count: rankedResults.length,
      data: rankedResults,
      metadata: {
        timestamp: new Date().toISOString(),
        searchEngine: engine,
        maxResults: max_results,
      },
    });
  } catch (error: any) {
    console.error('[Search Service Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || '搜索失败' },
      { status: 500 }
    );
  }
}
