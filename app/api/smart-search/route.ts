// @ts-nocheck
/**
 * 智能搜索 API(全字段 AI 提取版)
 *
 * 核心策略:
 * 1. Tavily 搜索 + 多轮补充搜索
 * 2. 页面爬取获取真实内容
 * 3. AI 逐字段提取,严格基于原文
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

// AI 模型调用:优先使用智谱 GLM-4-Flash(云端),回退到本地 Ollama Qwen
async function callQwenModel(prompt: string, maxTokens: number = 2000): Promise<any> {
  const zhipuApiKey = process.env.ZAI_API_KEY;
  const useZhipu = !!zhipuApiKey;

  const apiUrl = useZhipu
    ? 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
    : (process.env.LOCAL_QWEN_API_URL || 'http://localhost:11434/v1') + '/chat/completions';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (useZhipu) {
    headers['Authorization'] = `Bearer ${zhipuApiKey}`;
  }

  console.log(`[AI Model] Using ${useZhipu ? 'Zhipu GLM-4-Flash (cloud)' : 'Local Ollama Qwen'}`);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: useZhipu ? 'glm-4-flash' : 'qwen2.5:7b',
      messages: [
        {
          role: 'system',
          content: '你是一名建筑案例信息提取专家。必须用中文回答。只返回合法 JSON,不要 markdown 代码块、不要额外文字。严格从提供的内容中提取真实信息,绝不编造、不虚构、不推测。如果内容中没有相关信息,对应字段填空字符串或空数组。忽略所有网站导航、欢迎语、登录注册等非正文内容。'
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
    throw new Error(`AI API error (${useZhipu ? 'Zhipu' : 'Ollama'}): ${response.status} - ${errorText}`);
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

      // 过滤导航文本:按短句分割,跳过无意义的片段
      // 先按空格拆成长词组
      const words = bodyText.split(/\s+/);
      const meaningfulWords: string[] = [];
      let skipCount = 0;
      for (const word of words) {
        if (word.length < 2) continue;
        // 导航关键词
        if (/^(首页|登录|注册|注销|导航|搜索|下载|上传|版权|ICP|备案|关于|联系|电话|热线|会员|中心|简介|介绍)$/.test(word)) {
          skipCount++;
          continue;
        }
        // 如果连续跳过太多短词,说明还在导航区域
        if (skipCount > 20 && word.length < 10) {
          skipCount++;
          continue;
        }
        skipCount = 0;
        meaningfulWords.push(word);
      }
      const cleanText = meaningfulWords.join(' ');

      return cleanText.substring(0, 15000);
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
    return { relevance_score: 0, relevance_reason: '通用链接页,已过滤' };
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
    relevance_reason: reasons.length > 0 ? reasons.join(';') : '基础相关性'
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
  const defaultValues = ['无', '未检索到', '未检索到获奖信息'];

  const isFilled = (val: any) => typeof val === 'string' && val.trim().length >= 5 && !defaultValues.some(d => val.startsWith(d));

  // 核心字段检查
  const requiredChecks: [string, string, number][] = [
    ['projectIntroduction', extraction.projectIntroduction, 300],
    ['demonstrationValue', extraction.demonstrationValue, 200],
  ];
  for (const [field, val, minLen] of requiredChecks) {
    if (!isFilled(val as string)) {
      checks.push({ field, passed: false, reason: `${field}为空或过短` });
    } else if ((val as string).length < minLen) {
      checks.push({ field, passed: false, reason: `${field}仅${(val as string).length}字,要求≥${minLen}字` });
    }
  }

  // 建设阶段
  const constructionText = (extraction.constructionPhase || []).join('');
  if (constructionText.length < 450) {
    checks.push({ field: 'constructionPhase', passed: false, reason: `建设阶段仅${constructionText.length}字,要求≥450字` });
  }

  // 项目举措
  const initiativesText = (extraction.projectInitiatives || []).join('');
  if (initiativesText.length < 700) {
    checks.push({ field: 'projectInitiatives', passed: false, reason: `项目举措仅${initiativesText.length}字,要求≥700字` });
  }

  // 位置格式检查
  if (extraction.location && !extraction.location.includes('-') && !extraction.location.includes('省') && !extraction.location.includes('市')) {
    checks.push({ field: 'location', passed: false, reason: '所在区位格式应为"省-市-区县"' });
  }

  // 必填字段空值检查
  const requiredFields = ['location', 'projectScale', 'participants', 'startDate', 'caseType', 'demonstrationValue', 'projectIntroduction'];
  for (const field of requiredFields) {
    const value = extraction[field as keyof CaseExtraction] as string;
    if (!isFilled(value)) {
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
  console.log(`[Extract Field] ${fieldName}: content length = ${content.length}, using first 8000 chars`);
  const prompt = `你是一名建筑案例信息提取专家。从以下网页内容中提取"${fieldName}"的信息。

## 字段要求
${requirements}

## 严格要求
- 只提取原文中真实存在的信息
- 用中文回答
- 不编造任何事实、数据或人名
- 如果原文中没有相关信息,JSON值设为空字符串""
- 忽略网站导航、菜单、登录注册等非正文内容
- 返回合法JSON

## 网页内容
${content.substring(0, 8000)}

返回合法JSON:{"result": "提取的结果"}`;

  try {
    const result = await callQwenModel(prompt, maxTokens);
    const raw = result.result !== undefined ? result.result : (result[field] || '');
    if (!raw || typeof raw !== 'string') return '';
    // 过滤 AI 返回的"无意义"值
    const cleaned = raw.trim();
    const meaningless = ['无', '未找到', '未检索到', 'None', 'N/A', 'null', '暂无', '不确定', '无法确定'];
    if (meaningless.includes(cleaned) || cleaned.length < 2) return '';
    console.log(`[Extract Field] ${fieldName}: result = '${cleaned.substring(0, 50)}' (${cleaned.length} chars)`);
    return cleaned;
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

// ==================== 核心提取函数 ====================

// 安全转换数组字段:确保每条都是字符串
function safeStringArray(arr: any[]): string[] {
  return (arr || []).map((item: any) => {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
      return Object.entries(item).map(([k, v]) => `${k}:${v}`).join(';');
    }
    return String(item);
  });
}

// 辅助函数:构建 infoSource 字符串(中文展示+网址)
function buildInfoSource(urlList: string[]): string {
  // 域名中文名映射
  const domainNames: Record<string, string> = {
    'worldbank.org': '世界银行',
    'documents1.worldbank.org': '世界银行文档库',
    'tianjineco-city.com': '中新天津生态城官网',
    'mayortraining.org': '中国市长培训网',
    'thupdi.com': '清华同衡规划设计研究院',
    'archdaily.cn': 'ArchDaily中国',
    'gooood.cn': '谷德设计网',
    'archidogs.com': '建筑学院',
    'archina.com': '建筑中国',
    'mohurd.gov.cn': '住房和城乡建设部',
    'gov.cn': '中国政府网',
    'people.com.cn': '人民网',
    'xinhuanet.com': '新华网',
    'thepaper.cn': '澎湃新闻',
    'sohu.com': '搜狐网',
    'qq.com': '腾讯网',
    'sina.com.cn': '新浪网',
    'eastasia.iclei.org': '宜可城-地方可持续发展协会',
    'gtn-caselibrary.org.cn': '全球技术案例库',
    'cnki.net': '中国知网',
    'lifeweek.com.cn': '三联生活周刊',
    'planning.org.cn': '中国城市规划网',
    'china-up.com': '中国城市规划设计研究院',
  };

  return urlList.slice(0, 5).map(url => {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      // 精确匹配
      const name = domainNames[hostname] || Object.entries(domainNames).find(([d]) => hostname.endsWith('.' + d) || hostname === d)?.[1] || hostname;
      return `${name}\n${url}`;
    } catch {
      return url;
    }
  }).join('\n\n');
}

async function extractAllFields(
  content: string,
  title: string,
  urls: string[],
  searchFn: (query: string) => Promise<SearchResult[]>
): Promise<CaseExtraction> {
  const cleanTitle = title.replace(/\[PDF\]|\[DOC\]/g, '').trim();
  console.log('[Extract All Fields] Starting 3-phase extraction for:', cleanTitle);

  // ====== Phase 1:一次批量提取所有字段 ======
  console.log('[Extract All Fields] Phase 1: Batch extraction from web content');

  const batchPrompt = `你是一名建筑/城市规划案例信息提取专家。请从以下网页内容中严格按照要求提取所有字段信息。

## 字段提取要求(逐字段详细说明)

### 1. caseName(案例名称)
正式项目全称,使用官方名称。

### 2. location(所在区位)
格式严格为"XX省-XX市-XX区县",用"-"分隔。如"江苏省-南京市-秦淮区"。

### 3. projectScale(项目规模)
- 如果是规划类项目:必须说明用地面积和规划等级
- 如果是导则或条例:必须说明针对对象或适用范围
- 示例:"用地面积约4.69公顷"或"适用于XX市城市更新区域"

### 4. totalInvestment(总投资额)
具体投资金额。示例:"总投资约15亿元"。如原文未提及,填""。

### 5. participants(参与主体)
必须分别列出以下角色(如果原文中有的话):
- 委托方
- 建设方
- 规划设计方
- 编制单位(必须写全,所有参与编制的单位都要说明)
格式示例:"委托方:XX;规划设计方:XX;编制单位:XX"

### 6. startDate(起止时间)
- 必须说明开始和结束时间,格式"xxxx年-yyyy年"
- 如果有编制时间,也要补充说明
- 如果存在相关的上位规划、先行文件,要说明其时间
- 示例:"2015年启动,2018年编制完成。上位规划《XX总规》于2010年获批"

### 7. endDate(结束时间)
单独填写结束时间。如项目仍在进行,填"持续中"。

### 8. awardStatus(获奖情况)
- 搜索并列出具体的奖项名称和颁奖机构
- 如果无获奖,填"未检索到获奖信息"

### 9. caseType(案例类型)
- 必须标清楚具体规划类型(如城市更新规划、乡村设计规划、生态城市规划、保护规划等,以实际类型为准)
- 如果是导则/条例,要说明类型
- 同时说明项目的建设实施状态(如持续实施中、持续建设中、已建成并持续运营中)
- 示例:"城市更新规划-已建成并持续运营中"

### 10. sustainabilityTargets(可持续目标)
从[宜居、智慧、人文、创新、绿色、韧性]中选择1-4个,返回纯字符串数组。

### 11. demonstrationValue(示范意义)
- 以关键词形式总结3个左右的创新点
- 每个创新点要具体说明:是否突破了当时的政策制度、组织形式或技术标准
- 总字数不少于200字
- 示例:"创新点1:小尺度微更新--突破了传统大拆大建的改造模式..."

### 12. projectIntroduction(项目介绍)
- 对项目背景进行说明
- 包括项目背景、历史沿革、区域位置等
- 不少于300字

### 13. constructionPhase(建设阶段)
- 必须体现阶段性特点
- 每个阶段要说明时间段、做了什么事、完成了什么目标
- 总字数不少于450字
- 返回纯字符串数组,每条≥80字
- 示例:["第一阶段(2015-2017):完成现状调研和规划编制,确定了保护与再生相结合的总体策略..."]

### 14. awardEvaluation(项目获奖评价)
- 必须说明评价者的身份(单位名称)
- 格式严格为"评价内容--评价者单位"
- 示例:"该项目在历史街区保护方面具有示范意义--住房和城乡建设部"

### 15. projectInitiatives(项目举措)
- 是"示范意义"部分的详细阐述
- 具体解释项目的措施和创新做法
- 总字数不少于700字
- 返回纯字符串数组,每条≥80字

### 16. infoSource(信息来源)
- 中文展示3-5条信息来源
- 每条格式为"来源网站名称\n网址"

## 严格规则
- 所有字段必须用中文
- 只提取原文中真实存在的信息,不编造、不推测
- 找不到的字段值设为空字符串""(字符串数组设为空数组[])
- 数组字段每条必须是纯字符串,不要返回对象
- 忽略网站导航、菜单、登录等非正文内容
- 返回合法JSON

## 网页内容
${content.substring(0, 16000)}`;

  let extraction: CaseExtraction;
  try {
    const batchResult = await callQwenModel(batchPrompt, 4000);
    console.log('[Extract All Fields] Phase 1 complete, got fields:', Object.keys(batchResult).join(', '));

    extraction = {
      caseName: batchResult.caseName || cleanTitle,
      location: batchResult.location || '',
      projectScale: batchResult.projectScale || '',
      totalInvestment: batchResult.totalInvestment || '',
      participants: batchResult.participants || '',
      startDate: batchResult.startDate || '',
      endDate: batchResult.endDate || '',
      awardStatus: batchResult.awardStatus || '',
      caseType: batchResult.caseType || '',
      sustainabilityTargets: safeStringArray(batchResult.sustainabilityTargets),
      demonstrationValue: batchResult.demonstrationValue || '',
      projectIntroduction: batchResult.projectIntroduction || '',
      constructionPhase: safeStringArray(batchResult.constructionPhase),
      awardEvaluation: batchResult.awardEvaluation || '',
      projectInitiatives: safeStringArray(batchResult.projectInitiatives),
      infoSource: buildInfoSource(urls),
      caseImages: [],
      extractionSource: '批量AI提取',
      dataQuality: '待评估',
    };
  } catch (error: any) {
    console.error('[Extract All Fields] Phase 1 failed:', error.message);
    extraction = {
      caseName: cleanTitle,
      location: '', projectScale: '', totalInvestment: '', participants: '',
      startDate: '', endDate: '', awardStatus: '', caseType: '',
      sustainabilityTargets: [], demonstrationValue: '', projectIntroduction: '',
      constructionPhase: [], awardEvaluation: '', projectInitiatives: [],
      infoSource: buildInfoSource(urls), caseImages: [],
      extractionSource: 'Phase1失败', dataQuality: '低',
    };
  }

  // ====== Phase 2:AI 知识补充空字段 ======
  const fieldChecks: [string, string][] = [
    ['location', extraction.location],
    ['projectScale', extraction.projectScale],
    ['totalInvestment', extraction.totalInvestment],
    ['participants', extraction.participants],
    ['startDate', extraction.startDate],
    ['caseType', extraction.caseType],
    ['demonstrationValue', extraction.demonstrationValue],
    ['projectIntroduction', extraction.projectIntroduction],
    ['awardStatus', extraction.awardStatus],
    ['awardEvaluation', extraction.awardEvaluation],
  ];
  const emptyFields: string[] = fieldChecks.filter(([_, v]) => !v || (typeof v === 'string' && v.trim().length < 5)).map(([f]) => f);
  if (extraction.constructionPhase.length === 0) emptyFields.push('constructionPhase');
  if (extraction.projectInitiatives.length === 0) emptyFields.push('projectInitiatives');
  if (extraction.sustainabilityTargets.length === 0) emptyFields.push('sustainabilityTargets');

  if (emptyFields.length > 0) {
    console.log(`[Extract All Fields] Phase 2: AI knowledge fill for ${emptyFields.length} empty fields:`, emptyFields);

    const knowledgePrompt = `你是一名建筑/城市规划领域的资深专家,对中国城市规划和建筑案例非常熟悉。以下是项目名称,请用你的专业知识尽可能完整地补充信息。

项目名称:${extraction.caseName || cleanTitle}

需要补充的字段:${emptyFields.join('、')}

## 字段详细说明
- location:"XX省-XX市-XX区县"格式(必须用"-"分隔)
- projectScale:如果是规划类项目,说明用地面积和规划等级;如果是导则/条例,说明针对对象或适用范围
- totalInvestment:具体投资金额(如"总投资约15亿元")
- participants:委托方、建设方、规划设计方、编制单位(格式:"委托方:XX;规划设计方:XX;编制单位:XX"),所有参与编制的单位都要写全
- startDate:必须包含开始和结束时间(xxxx年-yyyy年),如果有编制时间也要补充,有上位规划/先行文件的要说明时间
- endDate:结束时间,如仍在进行则填"持续中"
- caseType:具体规划类型(如城市更新规划、乡村设计规划、生态城市规划、保护规划等)+建设实施状态(如持续实施中、已建成并持续运营中)
- demonstrationValue:以关键词形式总结3个左右创新点,每个创新点具体说明是否突破了当时的政策制度、组织形式或技术标准,≥150字
- projectIntroduction:项目背景说明,包括历史沿革、区域位置等,≥200字
- awardStatus:具体奖项名称+颁奖机构,如无获奖则填"未检索到获奖信息"
- awardEvaluation:评价内容+评价者身份(单位),格式"评价内容--评价者单位"
- constructionPhase:建设阶段详情(纯字符串数组),体现阶段性特点,每个阶段说明时间段+做了什么+完成目标,总字数≥450字
- projectInitiatives:项目举措详情(纯字符串数组),是示范意义的详细阐述,总字数≥700字
- sustainabilityTargets:从[宜居、智慧、人文、创新、绿色、韧性]中选1-4个

## 规则
- 基于专业知识填写,不确定的留空
- 数组字段每条必须是纯字符串
- 对于知名项目,务必提供准确的参与主体、获奖等信息
- 所有内容必须使用中文
- 返回合法JSON,只包含你能补充的字段`;

    try {
      const knowledgeResult = await callQwenModel(knowledgePrompt, 3000);
      console.log('[Extract All Fields] Phase 2: Knowledge fill received');

      for (const field of emptyFields) {
        const val = knowledgeResult[field];
        if (!val) continue;
        if (Array.isArray(val) && val.length > 0) {
          const safeArr = safeStringArray(val);
          if (safeArr.length > 0) (extraction as any)[field] = safeArr;
        } else if (typeof val === 'string' && val.trim().length >= 5) {
          (extraction as any)[field] = val;
        }
      }
      extraction.extractionSource = '批量AI提取+知识补充';
    } catch (error: any) {
      console.error('[Extract All Fields] Phase 2 failed:', error.message);
    }
  }

  // ====== Phase 3: 补充搜索 + 质量循环(最多3轮) ======
  // 质量检查函数:评估提取结果是否满足最低要求
  function getQualityIssues(ext: CaseExtraction): string[] {
    const issues: string[] = [];
    const requiredFields: [string, string][] = [
      ['location', ext.location],
      ['projectScale', ext.projectScale],
      ['participants', ext.participants],
      ['startDate', ext.startDate],
      ['caseType', ext.caseType],
      ['demonstrationValue', ext.demonstrationValue],
      ['projectIntroduction', ext.projectIntroduction],
    ];
    for (const [field, val] of requiredFields) {
      if (!val || typeof val !== 'string' || val === '无' || val.trim().length < 5) issues.push(field);
    }
    // 字数检查
    if (ext.projectIntroduction && ext.projectIntroduction !== '无' && ext.projectIntroduction.length < 200) issues.push('projectIntroduction(字数不足)');
    if (ext.constructionPhase.length === 0 || ext.constructionPhase.join('').length < 200) issues.push('constructionPhase');
    if (ext.projectInitiatives.length === 0 || ext.projectInitiatives.join('').length < 300) issues.push('projectInitiatives');
    return issues;
  }

  const maxRetries = 3;
  for (let retry = 0; retry < maxRetries; retry++) {
    const issues = getQualityIssues(extraction);
    if (issues.length === 0) {
      console.log(`[Extract All Fields] Quality check passed on attempt ${retry}`);
      break;
    }
    console.log(`[Extract All Fields] Quality loop ${retry + 1}: ${issues.length} issues:`, issues);

    try {
      // 针对性补充搜索
      const searchTargets = issues.filter(f => !f.includes('字数不足')).slice(0, 3);
      const suppParts: string[] = [];
      for (const field of searchTargets) {
        const extra = await supplementarySearch(cleanTitle, field, searchFn);
        if (extra) suppParts.push(extra);
      }
      const suppContent = suppParts.join('\n\n');

      if (suppContent.length > 200) {
        const suppPrompt = `你是一名建筑/城市规划案例信息提取专家。从以下补充搜索内容中提取指定字段。

需要提取的字段:${issues.join('、')}

## 字段要求
- projectScale:如果是规划类项目,说明用地面积+规划等级;如果是导则/条例,说明针对对象或适用范围
- participants:委托方、建设方、规划设计方、编制单位(所有参与编制的单位都要写全)
- startDate:包含开始和结束时间(xxxx年-yyyy年),补充编制时间和上位规划/先行文件时间
- caseType:具体规划类型+建设实施状态
- demonstrationValue:3个创新点关键词+具体解释(是否突破政策/组织/技术),≥200字
- projectIntroduction:项目背景,≥300字
- constructionPhase:阶段性的建设详情(纯字符串数组,每条≥80字),总字数≥450字
- projectInitiatives:项目措施和创新(纯字符串数组,每条≥80字),总字数≥700字

## 规则
- 只提取原文真实信息
- 所有内容使用中文
- 找不到的留空
- 数组字段每条必须是纯字符串
- 返回合法JSON

## 补充内容
${suppContent.substring(0, 10000)}`;

        const suppResult = await callQwenModel(suppPrompt, 4000);
        for (const field of issues) {
          const cleanField = field.replace('(字数不足)', '');
          const val = suppResult[cleanField];
          if (!val) continue;
          if (Array.isArray(val) && val.length > 0) {
            const safeArr = safeStringArray(val);
            const existing = (extraction as any)[cleanField];
            // 如果新内容比旧内容更长/更多,才替换
            if (Array.isArray(existing)) {
              if (safeArr.join('').length > existing.join('').length) {
                (extraction as any)[cleanField] = safeArr;
              }
            } else if (safeArr.length > 0) {
              (extraction as any)[cleanField] = safeArr;
            }
          } else if (typeof val === 'string' && val.trim().length >= 5) {
            const existing = (extraction as any)[cleanField];
            // 如果新内容比旧内容更长,才替换
            if (!existing || existing === '无' || val.length > existing.length) {
              (extraction as any)[cleanField] = val;
            }
          }
        }
        extraction.extractionSource = retry === 0 ? '批量AI提取+知识补充+补充搜索' : `批量AI提取+知识补充+补充搜索(${retry + 1}轮)`;
      }
    } catch (error: any) {
      console.error(`[Extract All Fields] Quality loop ${retry + 1} failed:`, error.message);
    }
  }

  // ====== 最终填充: 确保无空白字段 ======
  const defaults: Record<string, string> = {
    location: '未检索到区位信息', projectScale: '未检索到规模信息', totalInvestment: '未检索到投资信息',
    participants: '未检索到参与主体信息', startDate: '未检索到时间信息', awardStatus: '未检索到获奖信息',
    caseType: '未检索到类型信息', demonstrationValue: '未检索到示范意义',
    projectIntroduction: '未检索到项目介绍', awardEvaluation: '未检索到获奖评价',
  };
  for (const [field, defaultVal] of Object.entries(defaults)) {
    const currentVal = (extraction as any)[field];
    if (!currentVal || (typeof currentVal === 'string' && currentVal.trim().length < 2)) {
      (extraction as any)[field] = defaultVal;
    }
  }
  // 确保数组字段不为空
  if (extraction.constructionPhase.length === 0) {
    extraction.constructionPhase = ['未检索到建设阶段信息'];
  }
  if (extraction.projectInitiatives.length === 0) {
    extraction.projectInitiatives = ['未检索到项目举措信息'];
  }
  if (extraction.sustainabilityTargets.length === 0) {
    extraction.sustainabilityTargets = ['宜居'];
  }

  // 提取图片(多策略)
  // 策略1: 从页面内容中提取图片 URL
  const imagePatterns = [
    /https?:\/\/[^\s"']+?\.(?:jpg|jpeg|png|gif|webp|bmp)(?:[^\s"']*)/gi,
  ];
  for (const pattern of imagePatterns) {
    const matches = content.match(pattern);
    if (matches) {
      extraction.caseImages.push(...matches.slice(0, 10));
    }
  }

  // 策略2: 过滤掉小图标/LOGO类图片
  extraction.caseImages = [...new Set(extraction.caseImages)].filter(img => {
    if (!img) return false;
    // 过滤掉常见小图标
    if (/icon|logo|avatar|favicon|banner|ad[sx]?/i.test(img)) return false;
    // 过滤掉 base64 data URL
    if (img.startsWith('data:')) return false;
    // 过滤掉太短的路径(通常是图标)
    if (img.length < 30) return false;
    return true;
  }).slice(0, 8);

  // 评估质量
  extraction.dataQuality = assessDataQuality(extraction);
  console.log('[Extract All Fields] Final extraction complete, quality:', extraction.dataQuality);

  return extraction;
}

function assessDataQuality(extraction: CaseExtraction): string {
  const defaultValues = ['无', '未检索到', '未检索到获奖信息', '未检索到'];
  const isFilled = (v: string) => v && v.length > 5 && !defaultValues.some(d => v.startsWith(d));

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
  ].filter(v => isFilled(v)).length;

  const textFields = [
    extraction.projectIntroduction.length >= 300 ? 1 : 0,
    extraction.constructionPhase.join('').length >= 450 ? 1 : 0,
    extraction.projectInitiatives.join('').length >= 700 ? 1 : 0,
    extraction.demonstrationValue.length >= 200 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  if (filledFields >= 7 && textFields >= 3) return '高（多字段已提取，字数达标）';
  if (filledFields >= 5 && textFields >= 2) return '中（部分字段已提取）';
  return '低（信息较少）';
}

// ==================== POST Handler ====================

export async function POST(request: NextRequest) {
  try {
    const { q, urls, max_results = 1, engine = 'baidu', snippet = '' } = await request.json();

    // 模式 1:URL 输入模式(用户直接提供 URL)
    if (urls && Array.isArray(urls) && urls.length > 0) {
      console.log(`[Smart Search] URL Mode: ${urls.length} URLs provided`);

      console.log('[Smart Search] Fetching page contents...');
      const contentMap = await fetchMultiplePages(urls);
      console.log(`[Smart Search] Fetched contents for ${contentMap.size} pages`);

      if (contentMap.size === 0) {
        throw new Error('无法爬取任何提供的 URL,请检查 URL 是否正确');
      }

      const mergedContent = Array.from(contentMap.entries())
        .map(([url, content]) => `=== URL: ${url} ===\n${content}`)
        .filter(item => item.length > 100)
        .join('\n\n');

      // 如果有前端传来的 snippet，也合并进去
      const contentWithSnippet = snippet ? `=== 搜索摘要 ===\n${snippet}\n\n${mergedContent}` : mergedContent;

      const firstUrl = urls[0];
      const caseExtraction = await extractAllFields(
        contentWithSnippet,
        '自定义案例',
        urls,
        async (query) => {
          return await searchWithTavily(query, 3);
        }
      );

      caseExtraction.dataQuality = contentMap.size > 0 ? '高(多来源信息补全)' : '中(单来源)';

      console.log('[Smart Search] All extraction completed!');

      return NextResponse.json({
        success: true,
        mode: 'url',
        urls,
        case_extraction: caseExtraction,
        metadata: {
          timestamp: new Date().toISOString(),
          extraction_mode: '全字段 AI 提取版(多轮搜索)',
          data_quality: caseExtraction.dataQuality,
          source_count: urls.length,
        },
      });
    }

    // 模式 2:搜索模式
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

    // 更智能的查询优化:根据查询内容补充关键词
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
      throw new Error('没有找到相关的搜索结果。请尝试:1) 使用其他搜索词;2) 使用 URL 输入模式直接提供网页链接');
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
        extraction_mode: '全字段 AI 提取版(多轮搜索)',
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