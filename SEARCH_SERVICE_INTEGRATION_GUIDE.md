# 搜索服务集成指南

**目标**：将独立的搜索服务集成到案例网站中。

---

## 🎯 集成方案

### 方案 A：客户端直接调用（推荐）

**流程**：
```
案例网站前端 → 直接调用搜索服务 API → 返回结果
```

**优点**：
- ✅ 简单直接
- ✅ 前端控制
- ✅ 易于调试

**缺点**：
- ❌ 服务地址暴露给前端

---

### 方案 B：通过 Next.js API 代理

**流程**：
```
案例网站前端 → Next.js API → 搜索服务 API → 返回结果
```

**优点**：
- ✅ 服务地址不暴露给前端
- ✅ 可以添加缓存、限流等功能
- ✅ 统一 API 风格

**缺点**：
- ❌ 增加一层调用

---

## 🚀 集成步骤（方案 B）

### 第一步：创建 Next.js API 路由

**文件**：`src/app/api/search/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const SEARCH_SERVICE_URL = process.env.SEARCH_SERVICE_URL || 'http://localhost:3002';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const mode = searchParams.get('mode') || 'search-only';

  if (!query) {
    return NextResponse.json(
      { success: false, error: 'Missing required parameter: q' },
      { status: 400 }
    );
  }

  try {
    console.log(`[API Proxy] Query: ${query}, Mode: ${mode}`);

    // 调用搜索服务
    const response = await fetch(`${SEARCH_SERVICE_URL}/api/search?q=${encodeURIComponent(query)}&mode=${mode}`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Proxy Error]', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        suggestion: '请检查搜索服务是否运行'
      },
      { status: 500 }
    );
  }
}
```

### 第二步：配置环境变量

**文件**：`.env.local`

```env
# 搜索服务地址
SEARCH_SERVICE_URL=http://localhost:3002
```

### 第三步：更新搜索页面

**文件**：`src/app/search/page.tsx`

修改 API 调用地址：

```typescript
// 从
const response = await fetch('/api/web-search?q=' + query + '&mode=' + mode);

// 改为
const response = await fetch('/api/search?q=' + query + '&mode=' + mode);
```

---

## 🧪 测试

### 1. 启动搜索服务

```bash
cd search-service
npm start
```

服务将在 `http://localhost:3002` 运行。

### 2. 启动案例网站

```bash
cd architecture-showcase
npm run dev
```

网站将在 `http://localhost:3000` 运行。

### 3. 测试搜索功能

访问 `http://localhost:3000/search`，输入搜索关键词测试。

---

## 📊 状态

- ✅ 搜索服务开发完成
- ✅ API 接口测试通过
- ⏸️ 案例网站集成（待执行）
- ⏸️ 端到端测试（待执行）

---

## 🔗 相关文档

- 搜索服务：`../search-service/README.md`
- 案例网站：`./README.md`
- 搜索框架：`../architecture-search-framework/README.md`

---

**创建者**：Lotus
**创建时间**：2026-03-26
