// @ts-nocheck
/**
 * 智能搜索 API（全字段 AI 提取版）
 *
 * 核心策略：
 * 1. Tavily 搜索 + 多轮补充搜索
 * 2. 页面爬取获取真实内容
 * 3. AI 逐字段提取，严格基于原文
 * 4. 质量检查 + 补充搜索循环
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
          content: '你是一名建筑案例信息提取专家。必须用中文回答。只返回合法 JSON，不要 markdown 代码块、不要额外文字。严格从提供的内容中提取真实信息，绝不编造、不虚构、不推测。如果内容中没有相关信息，对应字段填空字符串或空数组。忽略所有网站导航、欢迎语、登录注册等非正文内容。'
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

// ==================== 搜索和爬取函数 ====================

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
      search_depth: 'advanced',
      max_results: max_results * 2,
      include_answer: true,
      include_raw_content: false,
      include_images: true,
      include_domains: [],
      exclude_domains: ['zhihu.com', 'baike.baidu.com', 'douyin.com', 'scribd.com', 'tieba.baidu.com', 'wenku.baidu.com', 'toutiao.com'],
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

async function fetchPageContent(url: string): Promise<string> {
  try {
    console.log(`[Fetch Page Content] Fetching: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    console.log(`[Fetch Page Content] Fetched ${html.length} characters`);

    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      const bodyText = bodyMatch[1]
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
        .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
        .replace(/&[a-zA-Z]+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const lines = bodyText.split(/[.。!?！？\n]/);
      const meaningfulLines: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length < 10) continue;
        if (/^(首页|登录|注册|注销|导航|搜索|下载|上传|版权|ICP|备案)/.test(trimmed)) continue;
        if (/^(您\s*的\s*位\s*置|当前位置|面包屑)/.test(trimmed)) continue;
        meaningfulLines.push(trimmed);
      }
      const cleanText = meaningfulLines.join(' ');

      return cleanText.substring(0, 10000);
    }

    return '';
  } catch (error: any) {
    console.error(`[Fetch Page Content] Error for ${url}:`, error.message);
    return '';
  }
}

async function fetchMultiplePages(urls: string[]): Promise<Map<string, string>> {
  const contentMap = new Map<string, string>();

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

function evaluateRelevanceSimple(query: string, searchResult: SearchResult): { relevance_score: number; relevance_reason: string } {
  if (searchResult.url.includes('baidu.com/link') ||
      searchResult.url.includes('bing.com/search') ||
      searchResult.url.includes('sogou.com/link')) {
    return { relevance_score: 0, relevance_reason: '通用链接页，已过滤' };
  }

  const queryTerms = query.split(/\s+/).filter(t => t.length > 1);
  const title = searchResult.title.toLowerCase();
  const snippet = (searchResult.snippet || '').toLowerCase();
  const url = searchResult.url.toLowerCase();
  const combined = `${title} ${snippet}`;

  let score = 40;
  let reasons: string[] = [];

  for (const term of queryTerms) {
    const termLower = term.toLowerCase();
    if (title.includes(termLower)) { score += 20; reasons.push(`标题匹配"${term}"`); }
    else if (snippet.includes(termLower)) { score += 10; reasons.push(`摘要匹配"${term}"`); }
  }

  const highQualityPatterns = ['gov.cn', 'edu.cn', 'archdaily', 'gooood', 'archidogs', 'archina', 'mohurd', 'people.com', 'xinhuanet', 'lifeweek', 'souhu.com/a/', 'thepaper'];
  for (const pattern of highQualityPatterns) {
    if (url.includes(pattern)) { score += 10; reasons.push('高质量来源'); break; }
  }

  if (title.includes('[PDF]') || title.includes('[DOC]')) { score -= 10; }

  if (searchResult.score && searchResult.score > 0) {
    score = Math.round(score * 0.6 + searchResult.score * 0.4);
  }

  score = Math.min(100, Math.max(0, score));

  return {
    relevance_score: score,
    relevance_reason: reasons.length > 0 ? reasons.join('；') : '基础相关性'
  };
}

// ==================== 质量检查函数 ====================

interface QualityReport {
  field: string;
  passed: boolean;
  reason: string;
}

function checkFieldQuality(extraction: CaseExtraction): QualityReport[] {
  const checks: QualityReport[] = [];

  // 字数检查
  if ((extraction.projectIntroduction || '').length < 300) {
    checks.push({ field: 'projectIntroduction', passed: false, reason: `项目介绍仅${(extraction.projectIntroduction || '').length}字，要求≥300字` });
  }

  const constructionText = (extraction.constructionPhase || []).join('');
  if (constructionText.length < 450) {
    checks.push({ field: 'constructionPhase', passed: false, reason: `建设阶段仅${constructionText.length}字，要求≥450字` });
  }

  const initiativesText = (extraction.projectInitiatives || []).join('');
  if (initiativesText.length < 700) {
    checks.push({ field: 'projectInitiatives', passed: false, reason: `项目举措仅${initiativesText.length}字，要求≥700字` });
  }

  // 格式检查
  if (extraction.location && !extraction.location.includes('-') && !extraction.location.includes('省') && !extraction.location.includes('市')) {
    checks.push({ field: 'location', passed: false, reason: '所在区位格式应为"省-市-区县"' });
  }

  // 空值检查
  const requiredFields = ['location', 'projectScale', 'participants', 'startDate', 'caseType', 'demonstrationValue', 'projectIntroduction'];
  for (const field of requiredFields) {
    const value = extraction[field];
    if (!value || (typeof value === 'string' && value.length < 5)) {
      checks.push({ field, passed: false, reason: `${field}为空或过短` });
    }
  }

  return checks;
}

// ==================== 字段名中英文映射 ====================
const FIELD_NAMES: Record<string, string> = {
  caseName: '案例名称',
  location: '所在区位',
  projectScale: '项目规模',
  totalInvestment: '总投资额',
  participants: '参与主体',
  startDate: '起止时间',
  awardStatus: '获奖情况',
  caseType: '案例类型',
  sustainabilityTargets: '可持续目标',
  demonstrationValue: '示范意义',
  projectIntroduction: '项目介绍',
  constructionPhase: '建设阶段',
  awardEvaluation: '项目获奖评价',
  projectInitiatives: '项目举措',
  infoSource: '信息来源',
};

// ==================== 单字段 AI 提取函数 ====================

async function extractField(field: string, content: string, requirements: string, maxTokens: number = 1000): Promise<any> {
  const fieldName = FIELD_NAMES[field] || field;
  const prompt = `你是一名建筑案例信息提取专家。从以下网页内容中提取"${fieldName}"的信息。

## 字段要求
${requirements}

## 严格要求
- 只提取原文中真实存在的信息
- 用中文回答
- 不编造任何事实、数据或人名
- 如果原文中没有相关信息，JSON值设为空字符串""
- 返回合法JSON

## 网页内容
${content.substring(0, 4000)}

返回合法JSON：{"result": "提取的结果"}`;

  try {
    const result = await callQwenModel(prompt, maxTokens);
    const value = result.result !== undefined ? result.result : (result[field] || '');
    if (!value || (typeof value === 'string' && value.length < 2)) {
      return '';
    }
    return value;
  } catch (error: any) {
    console.error(`[Extract Field] Error for ${fieldName}:`, error.message);
    return '';
  }
}

// ==================== 补充搜索函数 ====================

async function supplementarySearch(
  baseQuery: string,
  field: string,
  searchFn: (query: string) => Promise<SearchResult[]>
): Promise<string> {
  const fieldQueries: Record<string, string> = {
    'projectIntroduction': `${baseQuery} 项目背景 简介`,
    'constructionPhase': `${baseQuery} 建设历程 实施阶段`,
    'projectInitiatives': `${baseQuery} 技术措施 创新做法`,
    'participants': `${baseQuery} 设计单位 编制单位 委托方`,
    'totalInvestment': `${baseQuery} 投资金额 造价`,
    'startDate': `${baseQuery} 开工时间 竣工 编制时间`,
    'awardStatus': `${baseQuery} 获奖 评价`,
    'demonstrationValue': `${baseQuery} 示范意义 创新点`,
    'projectScale': `${baseQuery} 项目规模 面积`,
  };

  const query = fieldQueries[field] || `${baseQuery} ${field}`;
  console.log(`[Supplementary Search] Searching for field "${field}": ${query}`);

  try {
    const results = await searchFn(query);
    if (results.length === 0) return '';

    const urls = results.slice(0, 3).map(r => r.url);
    const contentMap = await fetchMultiplePages(urls);
    const additionalContent = Array.from(contentMap.values())
      .filter(c => c.length > 100)
      .join('\n\n');

    console.log(`[Supplementary Search] Got ${additionalContent.length} chars for field "${field}"`);
    return additionalContent;
  } catch (error: any) {
    console.error(`[Supplementary Search] Error for field "${field}":`, error.message);
    return '';
  }
}

// ==================== 核心提取函数 ====================

async function extractAllFields(
  content: string,
  title: string,
  urls: string[],
  searchFn: (query: string) => Promise<SearchResult[]>
): Promise<CaseExtraction> {
  console.log('[Extract All Fields] Starting extraction for:', title);

  const MAX_ROUNDS = 2;
  let supplementaryContent = '';

  // 辅助函数：构建 infoSource 字符串
  const buildInfoSource = (urlList: string[]): string => {
    return urlList.slice(0, 5).map(url => {
      // 尝试提取域名作为来源名
      try {
        const hostname = new URL(url).hostname;
        return `${hostname}\n${url}`;
      } catch {
        return url;
      }
    }).join('\n\n');
  };

  for (let round = 0; round < MAX_ROUNDS; round++) {
    console.log(`[Extract All Fields] Round ${round + 1}/${MAX_ROUNDS}`);

    const currentContent = round === 0 ? content : content + '\n\n' + supplementaryContent;

    // ====== 第一轮：逐字段提取 ======

    // 1. caseName（案例名称）
    const caseName = await extractField('caseName', currentContent,
      '从搜索结果中提取正式项目名称。去掉PDF、DOC等前缀。返回项目全称。', 300);

    // 2. location（所在区位）
    const location = await extractField('location', currentContent,
      '格式为"XX省-XX市-XX区县"。如果只能找到省市，就写"XX省-XX市"。如果找不到具体区县，根据内容推断。必须包含"-"分隔符。', 300);

    // 3. projectScale（项目规模）
    const projectScale = await extractField('projectScale', currentContent,
      '如果是规划类：说明用地面积+规划等级。如果是导则/条例：说明适用范围/针对对象。示例："用地面积约4.69公顷，属于市级历史文化街区保护规划"', 300);

    // 4. totalInvestment（总投资额）
    const totalInvestment = await extractField('totalInvestment', currentContent,
      '提取具体投资金额，如"总投资约15亿元人民币"。找不到就写"经多轮检索未找到投资信息"', 300);

    // 5. participants（参与主体）
    const participants = await extractField('participants', currentContent,
      '分别列出：委托方、建设方、规划设计方、编制单位。编制单位要写全称，所有参与单位都要列出。格式示例："委托方：南京市秦淮区人民政府；规划设计方：东南大学建筑设计研究院；编制单位：XX规划设计院"。找不到就写"经多轮检索未找到参与单位信息"', 800);

    // 6. startDate（起止时间）
    const startDate = await extractField('startDate', currentContent,
      '格式："XXXX年-X月 起至 XXXX年-X月"。补充编制时间、是否有上位规划/先行文件及其时间。示例："2017年启动规划编制，2019年完成并实施。上位规划：《南京市总体规划(2018-2035)>"。找不到就写"经多轮检索未找到时间信息"', 500);

    // 7. awardStatus（获奖情况）
    const awardStatus = await extractField('awardStatus', currentContent,
      '列出具体奖项名称，包括颁奖机构和奖项级别。无获奖标明"未检索到获奖信息"', 400);

    // 8. caseType（案例类型）
    const caseType = await extractField('caseType', currentContent,
      '标明规划类型（城市更新规划、乡村设计规划、生态城市规划等）+ 建设状态（持续实施中、已建成并持续运营中等）。示例："城市更新规划（已建成并持续运营中）"', 300);

    // 9. sustainabilityTargets（可持续目标）
    let sustainabilityTargets: string[] = [];
    try {
      const stPrompt = `你是一名建筑案例信息提取专家。从以下内容中判断该项目体现了哪些可持续目标。

## 可选目标（只能从中选择1-4个）
宜居、智慧、人文、创新、绿色、韧性

## 严格要求
- 只返回项目实际体现的目标
- 用中文
- 返回合法JSON

## 网页内容
${currentContent.substring(0, 4000)}

返回合法JSON：{"sustainabilityTargets": ["目标1", "目标2"]}`;

      const stResult = await callQwenModel(stPrompt, 300);
      sustainabilityTargets = stResult.sustainabilityTargets || [];
    } catch (error: any) {
      console.error('[Extract All Fields] sustainabilityTargets error:', error.message);
    }

    // 10. demonstrationValue（示范意义）
    const demonstrationValue = await extractField('demonstrationValue', currentContent,
      '格式：第一行3个关键词，如"关键词：社区参与、微更新、历史保护"，然后分点说明每个创新点，解释是否突破了政策制度、组织形式或技术标准。示例："关键词：社区参与、规划创新、历史保护\\n\\n创新点1：首创\\"院落\\"为单元的渐进式更新模式，突破了传统\\"大拆大建\\"的组织形式。\\n创新点2：建立居民协商机制，突破了自上而下的规划制度。"', 1500);

    // 11. projectIntroduction（项目介绍，≥300字）
    const projectIntroduction = await extractField('projectIntroduction', currentContent,
      '项目背景介绍，不少于300字。内容应包括：项目所在地背景、面临的问题、更新目标。只从原文提取，不编造。如果原文内容不足，尽可能详细描述。', 2000);

    // 12. constructionPhase（建设阶段，≥450字）
    let constructionPhase: string[] = [];
    try {
      const cpPrompt = `你是一名建筑案例信息提取专家。从以下内容中提取项目建设阶段信息。

## 严格要求
- 用中文回答
- 只提取原文中真实存在的时间节点和建设内容
- 体现阶段性特点，每个阶段说明时间段+做了什么+完成了什么目标
- 总字数不少于450字
- 尽可能详细，从原文中提取所有阶段信息
- 返回字符串数组，每条一个阶段的详细说明
- 不编造
- 返回合法JSON

## 网页内容
${currentContent.substring(0, 5000)}

返回合法JSON：{"constructionPhase": ["阶段1详细说明（时间段+做了什么+完成目标）", "阶段2详细说明..."]}`;

      const cpResult = await callQwenModel(cpPrompt, 2500);
      constructionPhase = cpResult.constructionPhase || [];
    } catch (error: any) {
      console.error('[Extract All Fields] constructionPhase error:', error.message);
    }

    // 13. awardEvaluation（项目获奖评价）
    const awardEvaluation = await extractField('awardEvaluation', currentContent,
      '格式："评价者单位——评价者姓名"。示例："中国城市规划学会——张某某"。找不到就写"经多轮检索未找到获奖评价信息"', 400);

    // 14. projectInitiatives（项目举措，≥700字）
    let projectInitiatives: string[] = [];
    try {
      const piPrompt = `你是一名建筑案例信息提取专家。从以下内容中提取项目举措和实施措施。

## 严格要求
- 用中文回答
- 只提取原文中真实存在的举措
- 是"示范意义"的详细阐述，具体解释措施和创新
- 总字数不少于700字，尽可能详细
- 返回字符串数组，每条一个举措的详细说明
- 不编造
- 返回合法JSON

## 网页内容
${currentContent.substring(0, 5000)}

返回合法JSON：{"projectInitiatives": ["举措1详细说明（包括具体做法、创新点、效果）", "举措2详细说明..."]}`;

      const piResult = await callQwenModel(piPrompt, 3000);
      projectInitiatives = piResult.projectInitiatives || [];
    } catch (error: any) {
      console.error('[Extract All Fields] projectInitiatives error:', error.message);
    }

    // 15. infoSource（信息来源）
    const infoSource = buildInfoSource(urls);

    // 16. caseImages（示意图片）
    const imagePatterns = [
      /https?:\/\/[^\s"']+?\.(?:jpg|jpeg|png|gif|webp|bmp)(?:[^\s"']*)/gi,
    ];
    const caseImages: string[] = [];
    for (const pattern of imagePatterns) {
      const matches = currentContent.match(pattern);
      if (matches) {
        caseImages.push(...matches.slice(0, 10));
      }
    }

    // ====== 构建提取结果 ======
    const extraction: CaseExtraction = {
      caseName: caseName || title.replace(/\[PDF\]|\[DOC\]/g, '').trim(),
      location: location || '无',
      projectScale: projectScale || '无',
      totalInvestment: totalInvestment || '无',
      participants: participants || '无',
      startDate: startDate || '无',
      endDate: '',
      awardStatus: awardStatus || '未检索到获奖信息',
      caseType: caseType || '无',
      sustainabilityTargets,
      demonstrationValue: demonstrationValue || '无',
      projectIntroduction: projectIntroduction || '无',
      constructionPhase,
      awardEvaluation: awardEvaluation || '无',
      projectInitiatives,
      infoSource,
      caseImages,
      extractionSource: `全字段 AI 提取版（${round + 1}轮）`,
      dataQuality: '待评估',
    };

    // ====== 质量检查 ======
    if (round < MAX_ROUNDS - 1) {
      const qualityReports = checkFieldQuality(extraction);
      const failedFields = qualityReports.filter(r => !r.passed);

      if (failedFields.length === 0) {
        console.log('[Extract All Fields] All quality checks passed!');
        // 评估数据质量
        extraction.dataQuality = assessDataQuality(extraction);
        return extraction;
      }

      console.log(`[Extract All Fields] ${failedFields.length} fields need improvement:`, failedFields.map(f => f.field));

      // 补充搜索失败字段的内容
      const supplementaryParts: string[] = [];
      const baseQuery = title.replace(/\[PDF\]|\[DOC\]/g, '').trim();

      for (const failed of failedFields) {
        const extra = await supplementarySearch(baseQuery, failed.field, searchFn);
        if (extra) {
          supplementaryParts.push(extra);
        }
      }

      supplementaryContent = supplementaryParts.join('\n\n');

      if (supplementaryContent.length < 200) {
        console.log('[Extract All Fields] Supplementary content too short, stopping');
        extraction.dataQuality = assessDataQuality(extraction);
        return extraction;
      }
    } else {
      // 最后一轮，直接返回
      extraction.dataQuality = assessDataQuality(extraction);
      return extraction;
    }
  }

  // 不应到达这里，但安全起见
  return {
    caseName: title,
    location: '无',
    projectScale: '无',
    totalInvestment: '无',
    participants: '无',
    startDate: '无',
    endDate: '',
    awardStatus: '未检索到获奖信息',
    caseType: '无',
    sustainabilityTargets: [],
    demonstrationValue: '无',
    projectIntroduction: '无',
    constructionPhase: [],
    awardEvaluation: '无',
    projectInitiatives: [],
    infoSource: urls.slice(0, 5).join('\n'),
    caseImages: [],
    extractionSource: '全字段 AI 提取版（失败）',
    dataQuality: '低（提取失败）',
  };
}

function assessDataQuality(extraction: CaseExtraction): string {
  const filledFields = [
    extraction.location,
    extraction.projectScale,
    extraction.totalInvestment,
    extraction.participants,
    extraction.startDate,
    extraction.awardStatus,
    extraction.caseType,
    extraction.projectIntroduction,
    extraction.demonstrationValue,
  ].filter(v => v && v.length > 0 && !v.startsWith('经多轮') && !v.startsWith('未')).length;

  if (filledFields >= 7) {
    return '高（多字段已提取）';
  } else if (filledFields >= 3) {
    return '中（部分字段已提取）';
  } else {
    return '低（信息较少）';
  }
}

// ==================== POST Handler ====================

export async function POST(request: NextRequest) {
  try {
    const { q, urls, max_results = 1, engine = 'baidu' } = await request.json();

    // 模式 1：URL 输入模式（用户直接提供 URL）
    if (urls && Array.isArray(urls) && urls.length > 0) {
      console.log(`[Smart Search] URL Mode: ${urls.length} URLs provided`);

      console.log('[Smart Search] Fetching page contents...');
      const contentMap = await fetchMultiplePages(urls);
      console.log(`[Smart Search] Fetched contents for ${contentMap.size} pages`);

      if (contentMap.size === 0) {
        throw new Error('无法爬取任何提供的 URL，请检查 URL 是否正确');
      }

      const mergedContent = Array.from(contentMap.entries())
        .map(([url, content]) => `=== URL: ${url} ===\n${content}`)
        .filter(item => item.length > 100)
        .join('\n\n');

      const firstUrl = urls[0];
      const caseExtraction = await extractAllFields(
        mergedContent,
        '自定义案例',
        urls,
        async (query) => {
          return await searchWithTavily(query, 3);
        }
      );

      caseExtraction.dataQuality = contentMap.size > 0 ? '高（多来源信息补全）' : '中（单来源）';

      console.log('[Smart Search] All extraction completed!');

      return NextResponse.json({
        success: true,
        mode: 'url',
        urls,
        case_extraction: caseExtraction,
        metadata: {
          timestamp: new Date().toISOString(),
          extraction_mode: '全字段 AI 提取版（多轮搜索）',
          data_quality: caseExtraction.dataQuality,
          source_count: urls.length,
        },
      });
    }

    // 模式 2：搜索模式
    if (!q) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: q (for search mode) or urls (for URL mode)' },
        { status: 400 }
      );
    }

    console.log(`[Smart Search] Query: ${q}, Max Results: ${max_results}`);
    console.log(`[Smart Search] Using Local Qwen Model: ${process.env.LOCAL_QWEN_API_URL}`);

    // ====== 搜索阶段 ======
    console.log('[Smart Search] Step 1: Searching with Tavily...');

    // 更智能的查询优化：根据查询内容补充关键词
    let optimizedQuery = q;
    if (!q.includes('案例') && !q.includes('项目') && !q.includes('规划')) {
      optimizedQuery = `${q} 项目案例 规划`;
    }
    console.log(`[Smart Search] Optimized query: "${q}" → "${optimizedQuery}"`);

    let rawSearchResults: SearchResult[] = [];

    try {
      rawSearchResults = await searchWithTavily(optimizedQuery, Math.max(max_results, 5));
      console.log(`[Smart Search] Tavily returned ${rawSearchResults.length} results`);
    } catch (tavilyError: any) {
      console.warn('[Smart Search] Tavily failed, falling back to web-search:', tavilyError.message);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const webSearchUrl = `${baseUrl}/api/web-search`;
      const searchResponse = await fetch(`${webSearchUrl}?q=${encodeURIComponent(optimizedQuery)}&engine=${engine}`);
      if (!searchResponse.ok) {
        throw new Error(`Search service error: ${searchResponse.status}`);
      }
      const searchData = await searchResponse.json();
      rawSearchResults = searchData.data || [];
    }

    if (rawSearchResults.length === 0) {
      throw new Error('没有找到相关的搜索结果。请尝试：1) 使用其他搜索词；2) 使用 URL 输入模式直接提供网页链接');
    }

    // ====== 页面爬取阶段 ======
    console.log('[Smart Search] Step 2: Fetching page contents...');
    const searchUrls = rawSearchResults.slice(0, max_results * 10).map(r => r.url);
    const contentMap = await fetchMultiplePages(searchUrls);
    console.log(`[Smart Search] Fetched contents for ${contentMap.size} pages`);

    // 格式化搜索结果
    const searchResults = rawSearchResults.map((item: any) => {
      const evaluation = evaluateRelevanceSimple(q, item);
      return {
        title: item.title || '未命名',
        url: item.url,
        snippet: item.snippet || '',
        content: contentMap.get(item.url) || item.content || '',
        source: item.source || 'tavily',
        score: item.score || 0,
        relevance_score: evaluation.relevance_score,
        relevance_reason: evaluation.relevance_reason,
      };
    });

    // ====== 内容合并 ======
    console.log('[Smart Search] Step 3: Merging contents...');
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

    const topResult = searchResults[0];
    const enrichedContent = (topResult.content || '') + '\n\n' + mergedContent;

    // ====== 信息来源 URL 列表 ======
    const infoSources = Array.from(contentMap.keys()).slice(0, 10);

    // ====== 全字段提取 ======
    console.log('[Smart Search] Step 4: Extracting all fields...');
    const caseExtraction = await extractAllFields(
      enrichedContent,
      topResult.title,
      infoSources,
      async (query: string) => {
        return await searchWithTavily(query, 3);
      }
    );

    console.log('[Smart Search] All extraction completed!');
    console.log('[Smart Search] Final extraction:', JSON.stringify(caseExtraction, null, 2));

    const avgRelevanceScore = searchResults.reduce((sum: number, r: any) => sum + (r.relevance_score || 0), 0) / searchResults.length;

    return NextResponse.json({
      success: true,
      query: q,
      search_results: searchResults,
      case_extraction: caseExtraction,
      metadata: {
        timestamp: new Date().toISOString(),
        extraction_mode: '全字段 AI 提取版（多轮搜索）',
        data_quality: caseExtraction.dataQuality,
        relevance_score: avgRelevanceScore,
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
