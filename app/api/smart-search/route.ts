/**
 * 智能搜索 + 案例详细分析 API
 *
 * 功能：
 * 1. 调用 Tavily API 搜索真实案例信息
 * 2. 使用本地 Qwen 模型进行智能总结分析
 * 3. 提取完整的案例详细信息
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
 * 案例详细分析接口（完整字段）
 */
interface CaseAnalysis {
  // 基础信息
  caseName: string;              // 案例名称
  location: string;               // 所在区位
  projectScale: string;           // 项目规模
  totalInvestment: string;        // 总投资额
  participants: string;           // 参与主体
  startDate: string;             // 起止时间
  endDate: string;               // 结束时间
  awardStatus: string;            // 获奖情况
  caseType: string;              // 案例类型
  sustainabilityTargets: string[]; // 可持续目标
  demonstrationValue: string;     // 示范意义
  projectIntroduction: string;     // 项目介绍
  constructionPhase: string[];    // 建设阶段
  awardEvaluation: string;        // 项目获奖评价
  projectInitiatives: string[];  // 项目举措
  infoSource: string;            // 信息来源
  caseImages: string[];          // 案例图片

  // 智能分析
  summary: string;               // 总体总结
  keyInsights: string[];          // 关键洞察
  designConcepts: string[];      // 设计理念
  sustainabilityAnalysis: string[]; // 可持续性分析
  architecturalStyle: string;    // 建筑风格
  innovationPoints: string[];    // 创新点
  challenges: string[];          // 挑战与解决方案
  recommendations: string[];     // 建议
}

/**
 * 调用本地 Qwen 模型 API
 */
async function generateLocalQwenSummary(detailedResults: DetailedResult[]): Promise<CaseAnalysis> {
  const localApiUrl = process.env.LOCAL_QWEN_API_URL || 'http://localhost:5000/v1';

  if (!localApiUrl) {
    throw new Error('LOCAL_QWEN_API_URL environment variable is not set');
  }

  // 构建 AI 提示词
  const prompt = `
你是一位专业的建筑学专家。请对以下 ${detailedResults.length} 个搜索到的建筑案例网页内容进行深度智能分析，并提取完整的案例详细信息：

## 案例列表

${detailedResults.map((item, i) => `
### 案例 ${i + 1}
- 案例名称：${item.title}
- 描述：${item.description}
- 来源 URL：${item.url}
- 来源：${item.source}
- 网页内容（前 3000 字符）：
${item.content ? item.content.substring(0, 3000) : item.snippet}
`).join('\n')}

## 分析要求

请以 JSON 格式输出完整的案例详细分析报告，包含以下所有字段：

{
  "caseName": "案例名称（必填）",
  "location": "所在区位（必填，省市区县）",
  "projectScale": "项目规模（必填，如：小型/中型/大型/特大型）",
  "totalInvestment": "总投资额（必填，如：5000万元/1.2亿元）",
  "participants": "参与主体（必填，如：政府/企业/社会组织/联合开发）",
  "startDate": "开始时间（必填，格式：YYYY-MM-DD）",
  "endDate": "结束时间（必填，格式：YYYY-MM-DD）",
  "awardStatus": "获奖情况（必填，如：无/省级奖/国家级奖/国际奖项）",
  "caseType": "案例类型（必填，如：城市更新/文化保护/历史街区/社区更新/绿色建筑/可持续建筑/旧城改造/乡村振兴/历史建筑活化/工业遗产再利用）",
  "sustainabilityTargets": ["可持续目标1", "可持续目标2", "可持续目标3"],
  "projectIntroduction": "项目介绍（必填，200-500字）",
  "constructionPhase": ["建设阶段1", "建设阶段2", "建设阶段3"],
  "awardEvaluation": "项目获奖评价（选填，100-200字）",
  "projectInitiatives": ["项目举措1", "项目举措2", "项目举措3"],
  "demonstrationValue": "示范意义（必填，200-300字）",
  "infoSource": "信息来源（必填，URL或网站名称）",
  "caseImages": ["案例图片URL1", "案例图片URL2", "案例图片URL3"],
  
  "summary": "总体总结（必填，500-800字）",
  "keyInsights": ["关键洞察1", "关键洞察2", "关键洞察3", "关键洞察4", "关键洞察5"],
  "architecturalStyle": "建筑风格（必填，如：现代主义/新中式/传统中式/工业风/生态建筑/文化适应性设计）",
  "designConcepts": ["设计理念1", "设计理念2", "设计理念3"],
  "innovationPoints": ["创新点1", "创新点2", "创新点3"],
  "sustainabilityAnalysis": ["可持续性分析1", "可持续性分析2", "可持续性分析3"],
  "challenges": ["挑战1", "挑战2", "挑战3"],
  "recommendations": ["建议1", "建议2", "建议3", "建议4"]
}

## 深度分析要求

### 1. 基础信息提取
- **案例名称**：从搜索结果中提取或推断完整的案例名称
- **所在区位**：提取具体的省市区县信息
- **项目规模**：推断项目规模（小型/中型/大型/特大型）
- **总投资额**：如果搜索结果中有投资信息，提取；否则根据项目规模合理推断
- **参与主体**：推断参与主体类型（政府/企业/社会组织/联合开发）
- **起止时间**：如果有时间信息，提取；否则根据建设阶段推断
- **获奖情况**：推断是否获奖及奖项级别
- **案例类型**：准确分类案例类型（城市更新/文化保护/历史街区等）
- **示范意义**：总结案例的示范意义和价值（200-300字）

### 2. 智能分析
- **总体总结**：对案例进行深度智能分析总结（500-800字）
- **关键洞察**：提取 5 个关键洞察和亮点
- **建筑风格**：分析并总结建筑风格特征
- **设计理念**：提取 3 个核心设计理念
- **创新点**：识别 3 个技术创新或设计创新点
- **可持续性分析**：从环保、节能、资源利用等方面分析
- **挑战与解决方案**：分析项目面临的 3 个主要挑战及解决方案
- **建议**：提供 4 条可借鉴的经验和建议

### 3. 建设与创新
- **项目介绍**：详细介绍项目的背景、目标和意义（200-500字）
- **建设阶段**：列出 3 个主要建设阶段
- **项目举措**：列出 3 个重要的项目举措和创新实践

### 4. 信息来源与图片
- **信息来源**：标注信息来源 URL 或网站名称
- **案例图片**：如果网页中有图片链接，提取前 3 个；否则标注为"需要实地拍摄"

## 输出要求

1. **所有字段都是必填的**（除了 awardEvaluation、projectInitiatives、caseImages 是选填的）
2. 基于搜索结果的实际内容进行分析和推断
3. 推断的信息要合理且符合建筑领域的实际情况
4. 如果某些信息确实缺失，标注为"信息缺失"而不是编造
5. 案例类型要准确分类（城市更新/文化保护/历史街区等）
6. 可持续目标要具体（绿色建材/节能建筑/雨水回收/生态修复/社区参与等）
7. 所有日期格式必须统一为 YYYY-MM-DD
8. 所有投资额都要包含货币单位和量词（如：5000万元/1.2亿元）
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
            content: '你是一位专业的建筑学专家，擅长建筑案例深度分析和案例详细信息提取。请以 JSON 格式输出完整的案例详细分析报告。'
          },
          {
            role: 'user',
            content: prompt,
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
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
      caseName: report.caseName || '未命名案例',
      location: report.location || '信息缺失',
      projectScale: report.projectScale || '信息缺失',
      totalInvestment: report.totalInvestment || '信息缺失',
      participants: report.participants || '信息缺失',
      startDate: report.startDate || '信息缺失',
      endDate: report.endDate || '信息缺失',
      awardStatus: report.awardStatus || '无',
      caseType: report.caseType || '信息缺失',
      sustainabilityTargets: report.sustainabilityTargets || [],
      demonstrationValue: report.demonstrationValue || '暂无详细评估',
      projectIntroduction: report.projectIntroduction || '暂无详细介绍',
      constructionPhase: report.constructionPhase || [],
      awardEvaluation: report.awardEvaluation || '',
      projectInitiatives: report.projectInitiatives || [],
      infoSource: report.infoSource || item.url,
      caseImages: report.caseImages || [],
      
      summary: report.summary || '',
      keyInsights: report.keyInsights || [],
      architecturalStyle: report.architecturalStyle || '信息缺失',
      designConcepts: report.designConcepts || [],
      innovationPoints: report.innovationPoints || [],
      sustainabilityAnalysis: report.sustainabilityAnalysis || [],
      challenges: report.challenges || [],
      recommendations: report.recommendations || [],
    };
  } catch (error: any) {
    console.error('[Smart Search] Local Qwen API error:', error);
    throw new Error(`本地 Qwen 案例分析失败: ${error.message}`);
  }
}

/**
 * 使用 Tavily API 搜索
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
      query: `${query} 建筑案例 项目`,
      search_depth: 'advanced',
      max_results: max_results,
      include_answer: true,
      include_raw_content: false,
      include_images: true,
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
 * 智能搜索 + 案例详细分析 API
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
    const searchResults = await searchWithTavily(q, max_results);
    console.log(`[Smart Search] Found ${searchResults.length} search results`);

    // 步骤 2：爬取详细信息
    console.log('[Smart Search] Step 2: Crawling detailed information...');
    const detailedResults = await crawlWebPages(searchResults);
    console.log(`[Smart Search] Crawled ${detailedResults.length} detailed results`);

    // 步骤 3：生成 AI 案例详细分析
    console.log('[Smart Search] Step 3: Generating detailed case analysis with Local Qwen...');
    const caseAnalysis = await generateLocalQwenSummary(detailedResults);
    console.log('[Smart Search] Case analysis generated successfully');

    // 返回结果
    return NextResponse.json({
      success: true,
      query: q,
      search_results: searchResults,
      detailed_results: detailedResults,
      case_analysis: caseAnalysis,
      metadata: {
        timestamp: new Date().toISOString(),
        search_engine: 'Tavily',
        ai_model: 'Local Qwen (Qwen2.5-7B-Instruct)',
        total_results: searchResults.length,
        crawled_results: detailedResults.length,
        analysis_fields: '16 fields (caseName, location, projectScale, totalInvestment, participants, startDate, endDate, awardStatus, caseType, sustainabilityTargets, demonstrationValue, projectIntroduction, constructionPhase, awardEvaluation, projectInitiatives, infoSource, caseImages)',
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
