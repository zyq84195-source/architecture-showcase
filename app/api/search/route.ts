import { NextRequest, NextResponse } from 'next/server';
import { ComparisonEngine } from 'architecture-search-framework/comparison';

/**
 * 搜索 API（暂时禁用，由于 Next.js 模块解析问题）
 *
 * 错误: Module not found: Can't resolve 'anthropic'
 * 原因: Next.js 在开发模式下无法正确解析 CommonJS 模块依赖
 *
 * TODO: 解决方案
 * 1. 使用 Express 示例（推荐）
 * 2. 将框架迁移到 ESM
 * 3. 配置 Webpack module resolution
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: '搜索 API 暂时禁用',
    message: '由于 Next.js 模块解析问题，搜索功能暂时不可用。请使用对比分析 API 或 Express 示例。',
    workaround: '建议使用 Express 示例: ../architecture-search-framework/examples/embedding/express-app'
  }, { status: 503 });
}
