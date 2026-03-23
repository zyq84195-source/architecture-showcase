# 建筑案例网站 - Framework 集成快速参考

**最后更新**: 2026-03-22

---

## 🚀 快速开始（推荐）⭐

### 一键集成（自动完成所有步骤）

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 一键集成（推荐）
npm run framework:integrate

# 下一步：
# 1. 编辑 .env.local，填入 API Keys
# 2. 运行 npm install
# 3. 运行 npm run dev
```

**脚本说明**：
- ✅ 自动创建备份
- ✅ 检查 Git 状态
- ✅ 安装框架和依赖
- ✅ 更新 next.config.js
- ✅ 更新 .env.local
- ✅ 创建 API 路由（搜索、对比分析）

---

## 🔄 回滚方法

### 方法 1：自动回滚（推荐）⭐

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 自动回滚
npm run framework:rollback

# 下一步：
# 1. 运行 npm install
# 2. 运行 npm run dev
```

---

### 方法 2：Git 回滚

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 回滚到集成前的状态
git checkout main

# 或使用备份分支
git checkout backup/before-integration

# 删除功能分支
git branch -D feature/framework-integration

# 重新安装依赖
npm install

# 重新启动
npm run dev
```

---

### 方法 3：手动回滚

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 恢复关键文件
Copy-Item package.json.backup package.json
Copy-Item next.config.js.backup next.config.js
Copy-Item tsconfig.json.backup tsconfig.json

# 删除依赖
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# 重新安装
npm install
```

---

## 📡 API 端点

### 搜索 API

**端点**: `GET /api/search`

**参数**:
- `q` (string, 必填): 搜索关键词

**示例**:
```bash
curl "http://localhost:3000/api/search?q=建筑案例 历史保护"
```

**响应**:
```json
{
  "success": true,
  "query": "建筑案例 历史保护",
  "count": 5,
  "data": [...]
}
```

---

### 对比分析 API

**端点**: `POST /api/compare`

**参数**:
- `results` (array, 必填): 搜索结果数组
- `enableSemantic` (boolean, 可选): 是否启用语义对比（默认: false）

**示例**:
```bash
curl -X POST http://localhost:3000/api/compare \
  -H "Content-Type: application/json" \
  -d '{
    "results": [...],
    "enableSemantic": false
  }'
```

**响应**:
```json
{
  "success": true,
  "extractedFields": {...},
  "statistics": {...},
  "semanticComparison": null,
  "comparisonMarkdown": "..."
}
```

---

## 📋 手动集成步骤（如果自动脚本失败）

### 步骤 1：创建备份

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 运行备份脚本
npm run framework:backup

# 或手动备份
git branch backup/before-integration
Copy-Item package.json package.json.backup
Copy-Item next.config.js next.config.js.backup
Copy-Item tsconfig.json tsconfig.json.backup
```

---

### 步骤 2：安装依赖

```bash
# 安装框架
npm install --save ../architecture-search-framework

# 安装外部依赖
npm install --save anthropic openai @google/generative-ai axios cheerio

# 安装 TypeScript 类型
npm install --save-dev @types/axios @types/cheerio
```

---

### 步骤 3：更新配置

**next.config.js**:
```javascript
const nextConfig = {
  transpilePackages: ['architecture-search-framework'],
  // ... 其他配置
};
```

**.env.local**:
```bash
# Search Framework API Keys
ZAI_API_KEY=your_zai_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ZHIPU_API_KEY=your_zhipu_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

---

### 步骤 4：创建 API 路由

**搜索 API** (`app/api/search/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { quickSearch, ModelProvider, SearchEngine, OutputFormat } from 'architecture-search-framework';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  const results = await quickSearch(query, {
    model: { provider: ModelProvider.ZAI, model: 'qwen-7b', apiKey: process.env.ZAI_API_KEY },
    searchEngine: SearchEngine.TAVILY,
    outputFormat: OutputFormat.JSON
  });

  return NextResponse.json({ success: true, data: results });
}
```

---

## 🐛 常见问题

### 问题 1：Next.js 构建失败

**症状**: `Module not found: Can't resolve 'anthropic'`

**解决方案**:
1. 使用开发模式：`npm run dev`
2. 确保所有外部依赖已安装
3. 检查 `transpilePackages` 配置

---

### 问题 2：API Key 无效

**症状**: `Error: 401 Unauthorized`

**解决方案**:
1. 检查 `.env.local` 中的 API Key
2. 确认 API Key 余额充足
3. 查看控制台错误信息

---

### 问题 3：回滚后依赖冲突

**症状**: `Cannot find module 'architecture-search-framework'`

**解决方案**:
```bash
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## 📚 相关文档

- [完整集成指南](FRAMEWORK_INTEGRATION.md)
- [嵌套使用指南](../architecture-search-framework/EMBEDDING_GUIDE.md)
- [测试报告](../architecture-search-framework/examples/embedding/TEST_REPORT_2026-03-22.md)

---

## 📊 脚本对照表

| 脚本 | 命令 | 说明 |
|------|------|------|
| 自动集成 | `npm run framework:integrate` | 一键完成所有集成步骤 |
| 备份 | `npm run framework:backup` | 集成前创建备份 |
| 回滚 | `npm run framework:rollback` | 回滚到集成前的状态 |

---

**最后更新**: 2026-03-22
