# 搜索框架集成问题诊断报告

**时间**：2026-03-26
**状态**：⚠️ 模块解析问题阻塞

---

## 🔴 当前问题

### 问题描述

尝试将搜索框架集成到案例网站时，遇到 Next.js 模块解析错误：

```
Attempted import error: 'quickSearch' is not exported from 'architecture-search-framework/comparison'
Attempted import error: 'ModelProvider' is not exported from 'architecture-search-framework/comparison'
Attempted import error: 'SearchEngine' is not exported from 'architecture-search-framework/comparison'
Attempted import error: 'OutputFormat' is not exported from 'architecture-search-framework/comparison'
```

**关键发现**：
- ✅ 导入语句是正确的：`import { ... } from 'architecture-search-framework'`
- ❌ Next.js 试图从 `architecture-search-framework/comparison` 导入
- ❌ 这个路径在代码中不存在

### 根本原因

**模块解析冲突**：

1. 框架的 `package.json` 定义了 `exports` 字段：
   ```json
   "exports": {
     ".": { "import": "./dist/index.js", ... },
     "./comparison": { "import": "./dist/core/comparison-engine.js", ... },
     "./types": { "import": "./dist/types/index.js", ... }
   }
   ```

2. Next.js 的模块解析器似乎对 `exports` 字段的解析有误，导致它试图从 `./comparison` 路径导入，而不是从主入口点 `.` 导入。

3. 这个问题可能是 Next.js 14.2.35 的一个 bug 或与特定配置不兼容。

---

## 🛠️ 已尝试的解决方案

### 1. 修复导入路径
- ✅ 尝试：检查并确认导入语句正确
- ❌ 结果：无效，Next.js 仍从错误路径导入

### 2. 重新编译框架
- ✅ 尝试：`cd architecture-search-framework && npm run build`
- ✅ 结果：框架编译成功，类型定义正确
- ❌ 影响：Next.js 仍有模块解析问题

### 3. 清理构建缓存
- ✅ 尝试：`rm -rf .next`
- ❌ 结果：无效，缓存清理后问题仍然存在

### 4. 重新安装依赖
- ✅ 尝试：`rm -rf node_modules && npm install`
- ✅ 结果：依赖安装成功
- ❌ 影响：Next.js 仍有模块解析问题

### 5. 使用动态导入
- ✅ 尝试：`const framework = await import('architecture-search-framework')`
- ❌ 结果：无效，Next.js 仍从错误路径导入

### 6. 修改 tsconfig.json
- ✅ 尝试：添加路径别名
- ❌ 结果：无效，Next.js 仍有模块解析问题

### 7. 使用模拟数据
- ✅ 尝试：替换为模拟数据 API
- ❌ 结果：无效，Next.js 仍报告导入错误（可能是缓存）

---

## 💡 推荐解决方案

### 方案 1：移除框架依赖（临时方案）

**操作**：
1. 从 `package.json` 中移除 `architecture-search-framework` 依赖
2. 删除 `src/app/api/web-search/route.ts`
3. 重新构建网站

**优点**：
- ✅ 网站可以构建成功
- ✅ 不影响现有功能

**缺点**：
- ❌ 搜索功能暂时不可用

---

### 方案 2：独立部署搜索服务（推荐）

**架构**：
```
┌─────────────────────┐
│  案例网站          │
│  (现有功能)        │
└──────────┬──────────┘
           │
           │ HTTP API
           │
┌──────────▼──────────┐
│  搜索服务           │
│  (独立 Node.js)     │
│  - 搜索框架        │
│  - API 接口         │
└─────────────────────┘
```

**操作**：
1. 创建一个独立的 Node.js 服务（`search-service`）
2. 在该服务中集成搜索框架
3. 案例网站通过 HTTP API 调用搜索服务

**优点**：
- ✅ 解耦：网站和搜索服务独立开发和部署
- ✅ 灵活性：搜索服务可以独立更新和扩展
- ✅ 可维护性：问题隔离，易于调试

**缺点**：
- ❌ 需要额外的服务部署
- ❌ 网络延迟

---

### 方案 3：创建简化版搜索功能

**操作**：
1. 不使用搜索框架
2. 直接使用 Tavily API 进行搜索
3. 实现简单的搜索 API

**优点**：
- ✅ 快速实现
- ✅ 无需复杂的模块解析

**缺点**：
- ❌ 功能受限（无 AI 分析）
- ❌ 需要维护两套代码

---

### 方案 4：升级 Next.js 版本

**操作**：
1. 尝试升级到 Next.js 14.2.35 或更高版本
2. 检查是否修复了模块解析问题

**优点**：
- ✅ 可能从根本上解决问题

**缺点**：
- ❌ 可能引入其他兼容性问题
- ❌ 需要测试所有功能

---

## 📊 风险评估

| 方案 | 风险等级 | 实施难度 | 时间成本 |
|------|---------|---------|---------|
| **方案 1**：移除依赖 | 🟢 低 | 🟢 简单 | 10 分钟 |
| **方案 2**：独立部署 | 🟡 中 | 🟡 中等 | 2-4 小时 |
| **方案 3**：简化版 | 🟢 低 | 🟢 简单 | 1-2 小时 |
| **方案 4**：升级版本 | 🔴 高 | 🔴 困难 | 1-2 小时 + 测试 |

---

## 🎯 推荐行动

### 短期（立即执行）

**选择方案 1**：移除框架依赖，确保网站可以构建

1. 编辑 `package.json`，删除 `architecture-search-framework` 依赖
2. 删除 `src/app/api/web-search/route.ts`
3. 运行 `npm install` 和 `npm run build`
4. 验证网站构建成功

### 中期（1-2 天内）

**选择方案 2**：独立部署搜索服务

1. 创建 `search-service` 目录
2. 初始化 Node.js 项目
3. 集成搜索框架
4. 实现 API 接口
5. 案例网站通过 API 调用搜索服务

### 长期（1-2 周内）

**评估方案 4**：升级 Next.js 版本

1. 测试 Next.js 最新版本
2. 如果修复了模块解析问题，重新集成框架
3. 迁移到独立服务架构（方案 2）

---

## 📝 总结

**问题**：Next.js 模块解析与框架 `exports` 字段不兼容

**影响**：搜索功能无法集成

**推荐**：
1. ✅ **短期**：移除依赖，确保网站可构建
2. ✅ **中期**：独立部署搜索服务
3. ⏸️ **长期**：评估 Next.js 升级

**下一步**：等待用户确认推荐方案，然后执行短期方案。

---

**报告创建者**：Lotus
**报告时间**：2026-03-26
