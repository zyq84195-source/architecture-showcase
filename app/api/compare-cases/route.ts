/**
 * 案例对比分析 API
 *
 * 功能：
 * 1. 对比搜索结果中的案例与网站已有案例
 * 2. 使用本地 Qwen 模型进行深度对比分析
 * 3. 生成详细的对比报告
 *
 * 请求参数：
 * - search_result: 搜索结果中的案例信息（必填）
 * - existing_case: 网站已有案例信息（必填）
 *
 * 环境变量：
 * - LOCAL_QWEN_API_URL: 本地 Qwen 模型 API 端点（必填）
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * 对比分析结果接口
 */
interface ComparisonAnalysis {
  similarity: number;              // 相似度评分（0-100）
  similarity_level: string;        // 相似度等级（高/中/低）
  common_points: string[];        // 共同点
  differences: string[];          // 差异点
  lessons: string[];              // 可借鉴的经验
  suggestions: string[];          // 建议
  detailed_comparison: string;      // 详细对比分析
}

/**
 * 调用本地 Qwen 模型进行对比分析
 */
async function generateComparisonAnalysis(searchCase: any, existingCase: any): Promise<ComparisonAnalysis> {
  const localApiUrl = process.env.LOCAL_QWEN_API_URL || 'http://localhost:11434/v1';

  if (!localApiUrl) {
    throw new Error('LOCAL_QWEN_API_URL environment variable is not set');
  }

  // 构建 AI 提示词
  const prompt = `
你是一位专业的建筑学专家。请对以下两个建筑案例进行深度对比分析。

## 搜索结果中的案例

### 基本信息
- 案例名称：${searchCase.caseName}
- 所在区位：${searchCase.location}
- 项目规模：${searchCase.projectScale}
- 案例类型：${searchCase.caseType}

### 项目介绍
${searchCase.projectIntroduction}

### 示范意义
${searchCase.demonstrationValue}

---

## 网站已有案例

### 基本信息
- 案例名称：${existingCase.title}
- 描述：${existingCase.description}

---

## 对比分析要求

请以 JSON 格式输出详细的对比分析报告，包含以下字段：

{
  "similarity": 相似度评分（0-100的数字）,
  "similarity_level": "相似度等级（高/中/低，根据similarity评分）",
  "common_points": ["共同点1", "共同点2", "共同点3", "共同点4", "共同点5"],
  "differences": ["差异点1", "差异点2", "差异点3", "差异点4", "差异点5"],
  "lessons": ["可借鉴的经验1", "可借鉴的经验2", "可借鉴的经验3", "可借鉴的经验4"],
  "suggestions": ["建议1", "建议2", "建议3", "建议4", "建议5"],
  "detailed_comparison": "详细对比分析（500-800字，包括相似点、差异点、可借鉴经验）"
}

## 分析重点

1. **相似度评分**：根据案例类型、所在区位、项目规模等因素评估相似度（0-100）
2. **共同点**：找出两个案例在功能、设计理念、可持续目标等方面的共同点
3. **差异点**：分析两个案例在规模、技术、设计手法等方面的差异
4. **可借鉴经验**：提取搜索结果案例的成功经验，供网站已有案例参考
5. **建议**：针对网站已有案例提出具体改进建议

## 输出要求

- 返回 ONLY valid JSON，no markdown, no extra text
- 相似度评分为 0-100 的数字
- 相似度等级根据评分确定：>=80 为高，50-79 为中，<50 为低
- 每个数组至少包含 3-5 个条目
- 详细对比分析 500-800 字
`;

  try {
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
            content: 'You are an architecture expert. Always return valid JSON only, no markdown, no extra text.'
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
    let content = data.choices[0].message.content;

    console.log('[Compare Cases] Raw AI response length:', content.length);
    console.log('[Compare Cases] Raw AI response (first 500 chars):', content.substring(0, 500));

    // 尝试直接解析
    let report: any;
    try {
      report = JSON.parse(content);
      console.log('[Compare Cases] JSON parsed successfully on first attempt');
    } catch (e: any) {
      console.log('[Compare Cases] First parse attempt failed:', e.message);

      // 如果直接解析失败，尝试提取 JSON 对象
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        console.log('[Compare Cases] Extracted JSON using regex match, length:', jsonStr.length);

        try {
          report = JSON.parse(jsonStr);
          console.log('[Compare Cases] JSON parsed successfully after extraction');
        } catch (e2: any) {
          console.log('[Compare Cases] Second parse attempt failed:', e2.message);
          throw new Error(`无法解析 AI 返回的 JSON: ${e2.message}`);
        }
      } else {
        throw new Error('AI 返回的内容中没有找到 JSON 对象');
      }
    }

    return {
      similarity: report.similarity || 0,
      similarity_level: report.similarity_level || '低',
      common_points: report.common_points || [],
      differences: report.differences || [],
      lessons: report.lessons || [],
      suggestions: report.suggestions || [],
      detailed_comparison: report.detailed_comparison || '',
    };
  } catch (error: any) {
    console.error('[Compare Cases] Local Qwen API error:', error);
    throw new Error(`本地 Qwen 对比分析失败: ${error.message}`);
  }
}

/**
 * 获取网站已有案例列表
 */
async function getExistingCases() {
  try {
    const cases = await import('@/data/cases.json');
    return cases.default || [];
  } catch (error) {
    console.error('[Compare Cases] Failed to load cases.json:', error);
    return [];
  }
}

/**
 * 案例对比分析 API
 */
export async function POST(request: NextRequest) {
  try {
    const { search_result, existing_case_id } = await request.json();

    // 验证参数
    if (!search_result) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: search_result' },
        { status: 400 }
      );
    }

    if (!existing_case_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: existing_case_id' },
        { status: 400 }
      );
    }

    console.log(`[Compare Cases] Search Result: ${search_result.caseName}, Existing Case ID: ${existing_case_id}`);

    // 获取网站已有案例
    console.log('[Compare Cases] Loading existing cases...');
    const existingCases = await getExistingCases();
    console.log(`[Compare Cases] Loaded ${existingCases.length} existing cases`);

    // 查找指定案例
    const existingCase = existingCases.find((c: any) => c.id === existing_case_id);
    if (!existingCase) {
      return NextResponse.json(
        { success: false, error: 'Existing case not found' },
        { status: 404 }
      );
    }

    console.log('[Compare Cases] Existing case found:', existingCase.title);

    // 进行对比分析
    console.log('[Compare Cases] Generating comparison analysis with Local Qwen...');
    const comparisonAnalysis = await generateComparisonAnalysis(search_result, existingCase);
    console.log('[Compare Cases] Comparison analysis generated successfully');

    // 返回结果
    return NextResponse.json({
      success: true,
      search_case: search_result,
      existing_case: {
        id: existingCase.id,
        title: existingCase.title,
        description: existingCase.description,
      },
      comparison_analysis: comparisonAnalysis,
      metadata: {
        timestamp: new Date().toISOString(),
        ai_model: 'Local Ollama Qwen (qwen2.5:7b)',
        similarity_score: comparisonAnalysis.similarity,
        similarity_level: comparisonAnalysis.similarity_level,
      },
    });
  } catch (error: any) {
    console.error('[Compare Cases Error]', error);
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
