import { NextRequest, NextResponse } from 'next/server';
import { ComparisonEngine } from 'architecture-search-framework/comparison';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { results, enableSemantic = false } = body;

  if (!results || !Array.isArray(results)) {
    return NextResponse.json(
      { success: false, error: 'Missing or invalid parameter: results' },
      { status: 400 }
    );
  }

  try {
    console.log(`[Web Compare API] Results: ${results.length}, Semantic: ${enableSemantic}`);

    const engine = new ComparisonEngine();
    const structuredResult = await engine.compareStructured(results);

    // 语义对比（可选）
    let semanticResult = null;
    if (enableSemantic && process.env.ZAI_API_KEY) {
      try {
        const fullResult = await engine.compare(results, {
          enableStructured: true,
          enableSemantic: true,
          customPrompt: '请重点分析建筑方案的优缺点'
        });
        semanticResult = fullResult.semanticComparison;
      } catch (semanticError: any) {
        console.warn('[Web Compare API Semantic Warning]', semanticError.message);
        semanticResult = {
          error: 'Semantic comparison failed',
          message: semanticError.message
        };
      }
    }

    // 导出为 Markdown
    const comparisonMd = engine.exportComparison({
      structuredComparison: structuredResult,
      semanticComparison: semanticResult,
      metadata: structuredResult.statistics
    }, 'markdown');

    return NextResponse.json({
      success: true,
      extractedFields: structuredResult.extractedFields,
      statistics: structuredResult.statistics,
      semanticComparison: semanticResult,
      comparisonMarkdown: comparisonMd
    });
  } catch (error: any) {
    console.error('[Web Compare API Error]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
