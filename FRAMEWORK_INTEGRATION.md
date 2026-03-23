# 建筑案例网站项目 - 嵌套集成方案

**项目**: `architecture-showcase`
**集成目标**: Architecture Search Framework
**最后更新**: 2026-03-22

---

## 🎯 集成目标

将 Architecture Search Framework 安全地嵌套到建筑案例网站项目中，提供：
1. ✅ 智能搜索功能
2. ✅ 对比分析功能
3. ✅ 完整的回滚机制

---

## 🛡️ 安全机制

### 1. Git 分支策略

```
main (主分支，稳定版本)
  ↓
feature/framework-integration (功能分支，开发集成)
  ↓
backup/before-integration (备份分支，集成前的快照）
```

---

### 2. 回滚机制

- ✅ 完整的 Git 回滚
- ✅ 自动备份脚本
- ✅ 手动回滚脚本
- ✅ 配置文件备份

---

## 📋 集成步骤（完整流程）

### 步骤 0：安全检查（重要！）

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 1. 检查 Git 状态
git status

# 2. 确保没有未提交的更改
# 如果有未提交的更改，先提交
git add .
git commit -m "WIP: 保存当前状态"

# 3. 创建备份分支
git branch backup/before-integration
git push origin backup/before-integration

# 4. 创建功能分支
git checkout -b feature/framework-integration

# 5. 备份 package.json
Copy-Item package.json package.json.backup

# 6. 备份 next.config.js
Copy-Item next.config.js next.config.js.backup

# 7. 备份 tsconfig.json
Copy-Item tsconfig.json tsconfig.json.backup
```

---

### 步骤 1：添加依赖

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 安装框架（使用本地路径）
npm install --save ../architecture-search-framework

# 安装所有外部依赖（解决 Next.js 构建问题）
npm install --save anthropic openai @google/generative-ai axios cheerio

# 安装 TypeScript 类型
npm install --save-dev @types/axios @types/cheerio
```

---

### 步骤 2：更新 Next.js 配置

**文件**: `next.config.js`

**添加内容**：
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['architecture-search-framework'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      // 确保模块解析正确
    };
    return config;
  },
  env: {
    // 保留现有的环境变量
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // 新增：Search Framework
    ZAI_API_KEY: process.env.ZAI_API_KEY || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    ZHIPU_API_KEY: process.env.ZHIPU_API_KEY || '',
    TAVILY_API_KEY: process.env.TAVILY_API_KEY || '',
  },
};

module.exports = nextConfig;
```

---

### 步骤 3：更新 .env.local

**文件**: `.env.local`

**添加内容**：
```bash
# Search Framework API Keys
ZAI_API_KEY=your_zai_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ZHIPU_API_KEY=your_zhipu_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here

# 保留现有的 Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

### 步骤 4：创建 API 路由

#### 搜索 API

**文件**: `app/api/search/route.ts`

```typescript
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
    console.log(`[Search API] Query: ${query}`);

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
}
```

#### 对比分析 API

**文件**: `app/api/compare/route.ts`

```typescript
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
    console.log(`[Compare API] Results: ${results.length}, Semantic: ${enableSemantic}`);

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
        console.warn('[Compare API Semantic Warning]', semanticError.message);
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
    console.error('[Compare API Error]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

### 步骤 5：测试集成

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 1. 测试构建（可能需要开发模式）
npm run build

# 2. 如果构建失败，使用开发模式
npm run dev

# 3. 测试搜索 API
curl "http://localhost:3000/api/search?q=建筑案例 历史保护"

# 4. 测试对比分析 API
curl -X POST http://localhost:3000/api/compare \
  -H "Content-Type: application/json" \
  -d '{"results": [...], "enableSemantic": false}'
```

---

## 🔄 回滚机制

### 回滚方案 1：使用 Git（推荐）⭐

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 查看所有分支
git branch -a

# 回滚到集成前的状态
git checkout main

# 或者回滚到备份分支
git checkout backup/before-integration

# 删除功能分支
git branch -D feature/framework-integration

# 重新安装依赖（回滚）
npm install

# 重新启动开发服务器
npm run dev
```

---

### 回滚方案 2：使用备份文件

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 1. 恢复 package.json
Copy-Item package.json.backup package.json

# 2. 恢复 next.config.js
Copy-Item next.config.js.backup next.config.js

# 3. 恢复 tsconfig.json
Copy-Item tsconfig.json.backup tsconfig.json

# 4. 删除依赖并重新安装
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

### 回滚方案 3：使用回滚脚本

我已为你创建了完整的回滚脚本（见下文）。

---

## 📝 回滚脚本

### 自动备份脚本

**文件**: `scripts/backup-before-integration.js`

```javascript
const fs = require('fs');
const path = require('path');

const projectDir = process.cwd();
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupDir = path.join(projectDir, `backup-${timestamp}`);

console.log(`📦 创建备份: ${backupDir}`);

// 创建备份目录
fs.mkdirSync(backupDir, { recursive: true });

// 备份关键文件
const filesToBackup = [
  'package.json',
  'package-lock.json',
  'next.config.js',
  'tsconfig.json',
  '.env.local'
];

filesToBackup.forEach(file => {
  const src = path.join(projectDir, file);
  const dst = path.join(backupDir, file);

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`✅ 已备份: ${file}`);
  }
});

console.log(`✅ 备份完成: ${backupDir}`);
```

---

### 自动回滚脚本

**文件**: `scripts/rollback-integration.js`

```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectDir = process.cwd();

console.log('🔄 开始回滚集成...');

try {
  // 1. 恢复 package.json
  if (fs.existsSync('package.json.backup')) {
    fs.copyFileSync('package.json.backup', 'package.json');
    console.log('✅ 已恢复: package.json');
  }

  // 2. 恢复 next.config.js
  if (fs.existsSync('next.config.js.backup')) {
    fs.copyFileSync('next.config.js.backup', 'next.config.js');
    console.log('✅ 已恢复: next.config.js');
  }

  // 3. 恢复 tsconfig.json
  if (fs.existsSync('tsconfig.json.backup')) {
    fs.copyFileSync('tsconfig.json.backup', 'tsconfig.json');
    console.log('✅ 已恢复: tsconfig.json');
  }

  // 4. 删除 node_modules
  if (fs.existsSync('node_modules')) {
    fs.rmSync('node_modules', { recursive: true, force: true });
    console.log('✅ 已删除: node_modules');
  }

  // 5. 删除 package-lock.json
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
    console.log('✅ 已删除: package-lock.json');
  }

  console.log('✅ 回滚完成，请运行 npm install');
} catch (error) {
  console.error('❌ 回滚失败:', error.message);
  process.exit(1);
}
```

---

## 📊 集成检查清单

### 集成前检查

- [ ] 当前工作状态已提交（`git status` 显示 clean）
- [ ] 备份分支已创建（`backup/before-integration`）
- [ ] 功能分支已创建（`feature/framework-integration`）
- [ ] 关键文件已备份（package.json、next.config.js、tsconfig.json）

---

### 集成步骤检查

- [ ] 依赖已安装（`npm install`）
- [ ] next.config.js 已更新
- [ ] .env.local 已更新
- [ ] 搜索 API 路由已创建（`app/api/search/route.ts`）
- [ ] 对比分析 API 路由已创建（`app/api/compare/route.ts`）

---

### 集成后测试

- [ ] 开发服务器可以启动（`npm run dev`）
- [ ] 搜索 API 可以正常响应（`/api/search`）
- [ ] 对比分析 API 可以正常响应（`/api/compare`）
- [ ] 现有功能不受影响（页面、数据导入等）

---

### 回滚机制检查

- [ ] Git 回滚测试通过
- [ ] 备份文件恢复测试通过
- [ ] 回滚脚本测试通过

---

## 🚨 常见问题

### 问题 1：Next.js 构建失败

**症状**：
```
Module not found: Can't resolve 'anthropic'
```

**解决方案**：
1. 使用开发模式：`npm run dev`
2. 确保所有外部依赖已安装
3. 检查 next.config.js 中的 `transpilePackages` 配置

---

### 问题 2：API Key 无效

**症状**：
```
Error: 401 Unauthorized
```

**解决方案**：
1. 检查 `.env.local` 文件中的 API Key
2. 确认 API Key 余额充足
3. 查看控制台错误信息

---

### 问题 3：回滚后依赖冲突

**症状**：
```
Error: Cannot find module 'architecture-search-framework'
```

**解决方案**：
```bash
# 完全清理并重新安装
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## 📚 相关文档

- [嵌套使用指南](../architecture-search-framework/EMBEDDING_GUIDE.md)
- [Express 示例](../architecture-search-framework/examples/embedding/express-app/README.md)
- [Next.js 示例](../architecture-search-framework/examples/embedding/nextjs-app/README.md)
- [测试报告](../architecture-search-framework/examples/embedding/TEST_REPORT_2026-03-22.md)

---

**最后更新**: 2026-03-22
**版本**: 1.0.0
