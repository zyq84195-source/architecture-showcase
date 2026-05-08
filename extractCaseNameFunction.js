/**
 * 辅助函数：从内容中提取真正的案例名称（不是搜索标题）
 */

async function extractCaseNameFromContent(content: string): Promise<string> {
  const localApiUrl = 'http://localhost:11434/v1';

  const prompt = `
Extract the actual case name (not article title, not news headline) from the following content.

## CRITICAL REQUIREMENTS
- Look for proper case name, case study name, project name, building name
- DO NOT use article titles like "2017 News" or "Latest Report"
- Look for patterns like "XXX Case Study", "XXX Project", "XXX Building"
- If no clear case name is found, use "未命名案例"

Content: ${content}

Return ONLY valid JSON:
{
  "caseName": "string (the actual case name, not article title)"
}
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
            content: 'You are an architecture expert. Always return valid JSON only, no markdown, no extra text. Be extremely detailed and accurate.'
          },
          {
            role: 'user',
            content: prompt,
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Local Qwen API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;

    let result: any;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(aiContent);
      }
    } catch (e: any) {
      throw new Error(`无法解析 AI 返回的JSON: ${e.message}`);
    }

    return result.caseName || '未命名案例';
  } catch (error) {
    console.error('[Extract Case Name] Error:', error);
    return '未命名案例';
  }
}
