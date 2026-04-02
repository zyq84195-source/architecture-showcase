/**
 * 智能搜索 + 本地 Qwen 模型总结 API
 *
 * 功能：
 * 1. 调用 Tavily API 搜索真实案例信息
 * 2. 使用本地 Qwen 模型进行智能总结
 * 3. 标注信息来源
 *
 * 请求参数：
 * - q: 搜索关键词（必填）
 * - max_results: 最大结果数（可选，默认：3）
 * - summary_length: 总结长度（可选，默认：500字）
 *
 * 环境变量：
 * - TAVILY_API_KEY: Tavily API 密钥（必填）
 * - LOCAL_QWEN_API_URL: 本地 Qwen 模型 API 端点（必填）
 *   - 示例：http://localhost:5000/v1
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * 搜索结果接口
 */
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

/**
 * 详细结果接口（爬取后）
 */
interface DetailedResult extends SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  description: string;
  content?: string;
  crawled_at?: string;
}

/**
 * AI 总结接口
 */
interface AISummary {
  summary: string;
  key_projects: string[];
  architectural_insights: string[];
  design_concepts: string[];
  sustainability: string[];
  source_analysis: {
    most_reliable: string;
    information_quality: string;
  };
}

/**
 * 调用本地 Qwen 模型 API
 */
async function generateLocalQwenSummary(detailedResults: DetailedResult[], summaryLength: number): Promise<AISummary> {
  const localApiUrl = process.env.LOCAL_QWEN_API_URL || 'http://localhost:5000/v1';

  if (!localApiUrl) {
    throw new Error('LOCAL_QWEN_API_URL environment variable is not set');
  }

  // 构建 AI 提示词
  const prompt = `
你是一位专业的建筑学专家。请对以下 ${detailedResults.length} 个搜索到的建筑案例网页内容进行智能总结分析：

## 案例列表

${detailedResults.map((item, i) => `
### 案例 ${i + 1}
- 标题：${item.title}
- 描述：${item.description}
- 来源 URL：${item.url}
- 来源：${item.source}
- 网页内容（前 2000 字符）：
${item.content ? item.content.substring(0, 2000) : item.snippet}
`).join('\n')}

## 分析要求

请以 JSON 格式输出分析报告，包含以下字段：

{
  "summary": "总体总结（${summaryLength}字）",
  "key_projects": ["关键项目1", "关键项目2", "关键项目3"],
  "architectural_insights": ["建筑洞察1", "建筑洞察2", "建筑洞察3"],
  "design_concepts": ["设计理念1", "设计理念2", "设计理念3"],
  "sustainability": ["可持续性1", "可持续性2", "可持续性3"],
  "source_analysis": {
    "most_reliable": "最可靠的来源（URL）",
    "information_quality": "信息质量评估（高质量/中等/低质量）"
  }
}

注意：
- 总结要基于实际网页内容，不要编造
- 明确标注每个信息的来源 URL
- 评估信息质量和可靠性
- 识别关键项目、建筑洞察、设计理念
`;

  try {
    const response = await fetch(`${localApiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-7B-Instruct',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的建筑学专家，擅长建筑案例对比分析和总结。请以 JSON 格式输出分析结果。'
          },
          {
            role: 'user',
            content: prompt,
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Local Qwen API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // 解析 JSON
    const report = JSON.parse(content);

    return {
      summary: report.summary || '',
      key_projects: report.key_projects || [],
      architectural_insights: report.architectural_insights || [],
      design_concepts: report.design_concepts || [],
      sustainability: report.sustainability || [],
      source_analysis: {
        most_reliable: report.source_analysis?.most_reliable || '',
        information_quality: report.source_analysis?.information_quality || '',
      },
    };
  } catch (error: any) {
    console.error('[Smart Search] Local Qwen API error:', error);
    throw new Error(`本地 Qwen 总结失败: ${error.message}`);
  }
}

/**
 * 调用 Tavily API 搜索
 */
async function searchWithTavily(query: string, maxResults: number): Promise<SearchResult[]> {
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
      query: `${query} 建筑案例 项目`,
      search_depth: 'advanced',
      max_results: maxResults,
      include_answer: true,
      include_raw_content: false,
      include_images: false,
      include_domains: ['archdaily.com', 'archinect.com', 'gooood.cn'],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  return data.results.map((item: any) => ({
    title: item.title,
    url: item.url,
    snippet: item.content.substring(0, 200),
    source: 'tavily',
  }));
}

/**
 * 爬取网页详细信息（简化版）
 */
async function crawlWebPages(searchResults: SearchResult[]): Promise<DetailedResult[]> {
  // 简化版：不实际爬取，直接使用 Tavily 的结果
  console.log('[Smart Search] Using simplified crawling (no actual page fetching)');
  
  return searchResults.map((result) => ({
    ...result,
    description: result.snippet,
    content: '',
    crawled_at: new Date().toISOString(),
  }));
}

/**
 * 智能搜索 + 本地 Qwen 总结 API
 */
export async function POST(request: NextRequest) {
  try {
    const { q, max_results = 3, summary_length = 500 } = await request.json();

    // 验证参数
    if (!q) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: q' },
        { status: 400 }
      );
    }

    console.log(`[Smart Search] Query: ${q}, Max Results: ${max_results}, Summary Length: ${summary_length}`);
    console.log(`[Smart Search] Using Local Qwen Model: ${process.env.LOCAL_QWEN_API_URL}`);

    // 步骤 1：搜索真实案例信息
    console.log('[Smart Search] Step 1: Searching with Tavily API...');
    const searchResults = await searchWithTavily(q, maxResults);
    console.log(`[Smart Search] Found ${searchResults.length} search results`);

    // 步骤 2：爬取详细信息
    console.log('[Smart Search] Step 2: Crawling detailed information...');
    const detailedResults = await crawlWebPages(searchResults);
    console.log(`[Smart Search] Crawled ${detailedResults.length} detailed results`);

    // 步骤 3：生成 AI 总结
    console.log('[Smart Search] Step 3: Generating AI summary with Local Qwen...');
    const aiSummary = await generateLocalQwenSummary(detailedResults, summaryLength);
    console.log('[Smart Search] AI summary generated successfully');

    // 返回结果
    return NextResponse.json({
      success: true,
      query: q,
      search_results: searchResults,
      detailed_results: detailedResults,
      ai_summary: aiSummary,
      metadata: {
        timestamp: new Date().toISOString(),
        search_engine: 'Tavily',
        ai_model: 'Local Qwen (Qwen2.5-7B-Instruct)',
        total_results: searchResults.length,
        crawled_results: detailedResults.length,
      },
    });
  } catch (error: any) {
    console.error('[Smart Search Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.toString(),
        hint: '请检查 LOCAL_QWEN_API_URL 环境变量是否正确配置为 http://localhost:5000/v1',
      },
      { status: 500 }
    );
  }
}
