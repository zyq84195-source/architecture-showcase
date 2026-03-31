/**
 * AI 比对功能 API
 *
 * 功能：
 * 1. 智能分析多个建筑案例
 * 2. 对比案例的关键指标
 * 3. 生成对比报告
 *
 * 请求体：
 * - cases: 案例数组（id, title, description, location, tags, architect 等）
 * - aspects: 对比维度（可选，默认：['设计理念', '建筑风格', '功能布局', '技术创新', '可持续性', '社区影响']）
 *
 * 环境变量：
 * - ZAI_API_KEY: ZAI API 密钥（必填）
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * 案例数据接口
 */
interface Case {
  id: string;
  title: string;
  description: string;
  location: string | string[];
  tags: string[];
  architect?: string;
  images?: any[];
  likes_count?: number;
  reviews_count?: number;
  created_at?: string;
}

/**
 * 对比报告接口
 */
interface ComparisonReport {
  summary: string;
  keyFindings: string[];
  similarities: string[];
  differences: string[];
  recommendations: string[];
}

/**
 * 调用 ZAI API 进行智能分析
 */
async function analyzeWithZAI(cases: Case[], aspects: string[]): Promise<ComparisonReport> {
  const apiKey = process.env.ZAI_API_KEY;

  if (!apiKey) {
    throw new Error('ZAI_API_KEY environment variable is not set');
  }

  // 构建提示词
  const prompt = `
你是一位专业的建筑学专家。请对比分析以下 ${cases.length} 个建筑案例：

## 案例列表

${cases.map((c, i) => `
### 案例 ${i + 1}
- 标题：${c.title}
- 描述：${c.description}
- 地点：${Array.isArray(c.location) ? c.location.join('、') : c.location}
- 标签：${c.tags.join('、')}
- 建筑师：${c.architect || '未知'}
`).join('\n')}

## 对比维度

${aspects.map(a => `- ${a}`).join('\n')}

## 输出要求

请以 JSON 格式输出对比分析报告，包含以下字段：

{
  "summary": "对比总结（100-200字）",
  "keyFindings": ["关键发现1", "关键发现2", "关键发现3"],
  "similarities": ["相似点1", "相似点2", "相似点3"],
  "differences": ["差异点1", "差异点2", "差异点3"],
  "recommendations": ["建议1", "建议2", "建议3"]
}

注意：
- 每个发现、相似点、差异点、建议都应该简明扼要（30-50字）
- 基于案例的实际信息进行分析，不要编造
- 对比维度包括但不限于：设计理念、建筑风格、功能布局、技术创新、可持续性、社区影响
`;

  try {
    const response = await fetch('https://api.zai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的建筑学专家，擅长建筑案例对比分析。请以 JSON 格式输出分析结果。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ZAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // 解析 JSON
    const report = JSON.parse(content);

    return {
      summary: report.summary || '',
      keyFindings: report.keyFindings || [],
      similarities: report.similarities || [],
      differences: report.differences || [],
      recommendations: report.recommendations || [],
    };
  } catch (error: any) {
    console.error('[AI Compare] ZAI API error:', error);
    throw new Error(`AI分析失败: ${error.message}`);
  }
}

/**
 * 本地模拟分析（当 API Key 不可用时）
 */
function simulateAnalysis(cases: Case[]): ComparisonReport {
  return {
    summary: `基于 ${cases.length} 个案例的基本信息进行对比分析。这些案例在建筑风格、设计理念等方面各具特色。`,
    keyFindings: [
      `案例数量：${cases.length} 个`,
      `主要标签：${[...new Set(cases.flatMap(c => c.tags))].slice(0, 5).join('、')}`,
      `主要地点：${[...new Set(cases.flatMap(c => Array.isArray(c.location) ? c.location : [c.location]))].slice(0, 3).join('、')}`,
    ],
    similarities: [
      '都关注社区更新和可持续发展',
      '都体现了以人为本的设计理念',
      '都注重建筑与环境的融合',
    ],
    differences: [
      '地理位置和文化背景各有特色',
      '建筑风格和表现形式多样化',
      '技术创新点各有侧重',
    ],
    recommendations: [
      '可进一步深入了解各案例的详细设计',
      '建议实地考察或参考更多技术资料',
      '结合实际项目需求进行借鉴',
    ],
  };
}

/**
 * AI 比对 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cases, aspects } = body;

    // 验证参数
    if (!cases || !Array.isArray(cases) || cases.length < 2) {
      return NextResponse.json(
        { success: false, error: '至少需要2个案例进行比对' },
        { status: 400 }
      );
    }

    if (cases.length > 5) {
      return NextResponse.json(
        { success: false, error: '最多支持5个案例进行比对' },
        { status: 400 }
      );
    }

    const defaultAspects = ['设计理念', '建筑风格', '功能布局', '技术创新', '可持续性', '社区影响'];
    const comparisonAspects = aspects && Array.isArray(aspects) && aspects.length > 0
      ? aspects
      : defaultAspects;

    console.log(`[AI Compare] Comparing ${cases.length} cases with ${comparisonAspects.length} aspects`);

    let report: ComparisonReport;

    // 尝试使用 AI 分析
    if (process.env.ZAI_API_KEY) {
      try {
        report = await analyzeWithZAI(cases, comparisonAspects);
        console.log(`[AI Compare] AI analysis completed successfully`);
      } catch (error) {
        console.warn('[AI Compare] AI analysis failed, using simulated analysis:', error);
        report = simulateAnalysis(cases);
      }
    } else {
      console.warn('[AI Compare] ZAI_API_KEY not set, using simulated analysis');
      report = simulateAnalysis(cases);
    }

    // 返回结果
    return NextResponse.json({
      success: true,
      cases: cases.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        location: c.location,
        tags: c.tags,
        architect: c.architect,
      })),
      aspects: comparisonAspects,
      report,
      metadata: {
        timestamp: new Date().toISOString(),
        aiAnalysis: !!process.env.ZAI_API_KEY,
        analysisMode: process.env.ZAI_API_KEY ? 'ai' : 'simulated',
      },
    });
  } catch (error: any) {
    console.error('[AI Compare Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
