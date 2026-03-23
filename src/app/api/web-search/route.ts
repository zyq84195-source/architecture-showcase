import { NextRequest, NextResponse } from 'next/server';
import { quickSearch, ModelProvider, SearchEngine, OutputFormat } from 'architecture-search-framework';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameter: q' },
      { status: 400 }
    );
  }

  try {
    console.log(`[Web Search API] Query: ${query}`);

    const results = await quickSearch(query, {
      model: {
        provider: ModelProvider.ZAI,
        model: 'qwen-7b',
        apiKey: process.env.ZAI_API_KEY
      },
      searchEngine: SearchEngine.TAVILY,
      outputFormat: OutputFormat.JSON
    });

    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      data: results
    });
  } catch (error: any) {
    console.error('[Web Search API Error]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
