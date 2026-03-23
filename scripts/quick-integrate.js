/**
 * 快速集成脚本 - 自动执行集成步骤
 *
 * 使用方法：
 * node scripts/quick-integrate.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectDir = process.cwd();

console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                            ║
║   建筑案例网站项目 - 快速集成工具                       ║
║                                                            ║
╚══════════════════════════════════════════════════════════╝
`);

console.log('🚀 开始集成 Architecture Search Framework...\n');

// 步骤 1：运行备份
console.log('📦 步骤 1/7: 创建备份...');
try {
  execSync('node scripts/backup-before-integration.js', { stdio: 'inherit' });
  console.log('✅ 备份完成\n');
} catch (error) {
  console.error('❌ 备份失败，停止集成');
  process.exit(1);
}

// 步骤 2：检查 Git 状态
console.log('🔍 步骤 2/7: 检查 Git 状态...');
try {
  const gitStatus = execSync('git status --short', { encoding: 'utf-8' }).trim();
  if (gitStatus) {
    console.warn('⚠️  Git 状态不干净，建议先提交更改');
    console.log(`   运行: git add . && git commit -m "WIP: 保存当前状态"`);
  } else {
    console.log('✅ Git 状态干净\n');
  }
} catch (error) {
  console.warn('⚠️  无法获取 Git 状态\n');
}

// 步骤 3：安装框架
console.log('📦 步骤 3/7: 安装 Architecture Search Framework...');
try {
  console.log('   执行: npm install --save ../architecture-search-framework');
  execSync('npm install --save ../architecture-search-framework', { stdio: 'inherit' });
  console.log('✅ 框架安装完成\n');
} catch (error) {
  console.error('❌ 框架安装失败');
  console.error('   建议: 手动运行 npm install --save ../architecture-search-framework');
  process.exit(1);
}

// 步骤 4：安装外部依赖
console.log('📦 步骤 4/7: 安装外部依赖...');
try {
  console.log('   执行: npm install --save anthropic openai @google/generative-ai axios cheerio');
  execSync('npm install --save anthropic openai @google/generative-ai axios cheerio', { stdio: 'inherit' });
  console.log('✅ 外部依赖安装完成\n');
} catch (error) {
  console.error('❌ 外部依赖安装失败');
  console.error('   建议: 手动运行 npm install --save anthropic openai @google/generative-ai axios cheerio');
  process.exit(1);
}

// 步骤 5：更新 next.config.js
console.log('📝 步骤 5/7: 更新 next.config.js...');
try {
  const nextConfigPath = path.join(projectDir, 'next.config.js');
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf-8');

  if (nextConfig.includes('transpilePackages')) {
    console.log('ℹ️  next.config.js 已包含 transpilePackages');
  } else {
    // 备份原文件
    fs.copyFileSync(nextConfigPath, 'next.config.js.backup');

    // 添加 transpilePackages
    const updatedConfig = nextConfig.replace(
      /(const nextConfig = \{)/,
      `$1\n  transpilePackages: ['architecture-search-framework'],`
    );

    fs.writeFileSync(nextConfigPath, updatedConfig);
    console.log('✅ next.config.js 已更新');
  }
  console.log();
} catch (error) {
  console.error('❌ 更新 next.config.js 失败:', error.message);
  process.exit(1);
}

// 步骤 6：更新 .env.local
console.log('📝 步骤 6/7: 更新 .env.local...');
try {
  const envPath = path.join(projectDir, '.env.local');

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');

    if (envContent.includes('ZAI_API_KEY')) {
      console.log('ℹ️  .env.local 已包含 Search Framework 配置');
    } else {
      // 备份原文件
      fs.copyFileSync(envPath, '.env.local.backup');

      // 添加配置
      const newContent = envContent + '\n\n# Search Framework API Keys\nZAI_API_KEY=your_zai_api_key_here\nOPENAI_API_KEY=your_openai_api_key_here\nZHIPU_API_KEY=your_zhipu_api_key_here\nTAVILY_API_KEY=your_tavily_api_key_here\n';

      fs.writeFileSync(envPath, newContent);
      console.log('✅ .env.local 已更新');
      console.log('⚠️  请手动编辑 .env.local，填入真实的 API Keys');
    }
  } else {
    console.warn('⚠️  .env.local 不存在，跳过更新');
  }
  console.log();
} catch (error) {
  console.error('❌ 更新 .env.local 失败:', error.message);
  process.exit(1);
}

// 步骤 7：创建 API 路由
console.log('📝 步骤 7/7: 创建 API 路由...');
const apiRoutes = [
  {
    path: 'app/api/search/route.ts',
    content: `import { NextRequest, NextResponse } from 'next/server';
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
    console.log(\`[Search API] Query: \${query}\`);

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
    console.error('[Search API Error]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}`
  },
  {
    path: 'app/api/compare/route.ts',
    content: `import { NextRequest, NextResponse } from 'next/server';
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
    console.log(\`[Compare API] Results: \${results.length}, Semantic: \${enableSemantic}\`);

    const engine = new ComparisonEngine();
    const structuredResult = await engine.compareStructured(results);

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
        console.warn('[Compare API Semantic Warning]', semanticError.message);
        semanticResult = {
          error: 'Semantic comparison failed',
          message: semanticError.message
        };
      }
    }

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
    console.error('[Compare API Error]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}`
  }
];

let createdRoutes = 0;

apiRoutes.forEach(route => {
  const routePath = path.join(projectDir, route.path);
  const routeDir = path.dirname(routePath);

  try {
    // 创建目录
    fs.mkdirSync(routeDir, { recursive: true });

    // 创建文件
    if (fs.existsSync(routePath)) {
      console.log(`⚠️  路由已存在: ${route.path}`);
    } else {
      fs.writeFileSync(routePath, route.content);
      console.log(`✅ 已创建: ${route.path}`);
      createdRoutes++;
    }
  } catch (error) {
    console.error(`❌ 创建路由失败: ${route.path}`, error.message);
  }
});

console.log(`\n✅ 集成完成！`);
console.log(`   创建路由数: ${createdRoutes}`);
console.log(`\n📝 下一步操作:`);
console.log(`   1. 编辑 .env.local，填入真实的 API Keys`);
console.log(`   2. 安装依赖: npm install`);
console.log(`   3. 启动开发服务器: npm run dev`);
console.log(`   4. 测试搜索 API: curl "http://localhost:3000/api/search?q=建筑案例"`);
console.log(`\n🔄 回滚方法:`);
console.log(`   如需回滚，运行: node scripts/rollback-integration.js`);
