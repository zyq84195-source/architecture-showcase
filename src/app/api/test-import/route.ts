import { NextRequest, NextResponse } from 'next/server';
import { quickSearch, ModelProvider, SearchEngine, OutputFormat } from 'architecture-search-framework';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Import test successful',
    exports: {
      quickSearch: typeof quickSearch,
      ModelProvider: typeof ModelProvider,
      SearchEngine: typeof SearchEngine,
      OutputFormat: typeof OutputFormat
    }
  });
}
