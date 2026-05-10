# Architecture Showcase - 项目状态

**更新时间**：2026-05-10 22:03
**总体进度**：~85%
**⭐ V2 正式版**：所有后续开发以 V2 版本为准
**⚠️ 有重要未提交变更（需提交到 Git）**

---

## 📊 当前进度

| 阶段 | 进度 | 状态 |
|------|------|------|
| 本地开发功能 | 100% | ✅ 已完成 |
| ⭐ V2 三阶段智能提取 | 100% | ✅ 已完成（正式版，需提交） |
| AI 集成（智谱 GLM-4-Flash） | 100% | ✅ 已完成 |
| 管理后台（密码保护） | 100% | ✅ 已完成 |
| SEO 优化 | 100% | ✅ 已完成 |
| Supabase 迁移准备 | 100% | ✅ 代码就绪（需提交） |
| Supabase 实际迁移 | 0% | ❌ 待执行 |
| Vercel 部署 | 0% | ❌ 待执行 |
| 图片迁移到 CDN | 0% | ❌ 待执行 |
| **Git 提交 V2 变更** | **0%** | **❌ 优先待执行** |

---

## ⭐ V2 版三阶段智能提取系统（正式版）

**决策**：V2 在架构、Prompt 精细度、质量循环、域名映射等方面全面优于 V1，已确立为项目正式版本。

**文件**：`app/api/smart-search/route.ts`（~1070 行，从 V1 ~751 行重写）

### 三阶段架构

| 阶段 | 功能 | 说明 |
|------|------|------|
| **Phase 1** | 批量 AI 提取 | 一次 AI 调用提取全部 16 字段（16000 字符上下文） |
| **Phase 2** | AI 知识补充 | 对 Phase 1 的空字段，用 AI 专业知识补充 |
| **Phase 3** | 补充搜索 + 质量循环 | 最多 3 轮：针对性搜索 → 重新提取 → 质量检查 |

### 16 字段全提取

caseName, location, projectScale, totalInvestment, participants, startDate, endDate, awardStatus, caseType, sustainabilityTargets, demonstrationValue, projectIntroduction, constructionPhase, projectInitiatives, awardEvaluation, infoSource

### 字数质量要求

- 项目介绍 ≥ 300 字
- 建设阶段 ≥ 450 字
- 项目举措 ≥ 700 字
- 示范意义 ≥ 200 字

### 双模式

- **搜索模式**：Tavily 搜索 → 页面爬取 → 三阶段提取
- **URL 模式**：用户直接提供 URL → 页面爬取 → 三阶段提取

---

## 🏗 技术架构

- **前端**：Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **数据库**：Supabase（PostgreSQL）— 迁移代码已就绪
- **AI 模型**：智谱 GLM-4-Flash（云端）→ Ollama Qwen（本地回退）
- **搜索**：Tavily API + 本地 web-search 双引擎
- **部署目标**：Vercel

---

## ⚠️ 未提交变更（重要）

```
M .env.example                    (环境变量模板更新)
M app/api/search-service/route.ts  (搜索服务 API 增强)
M app/api/smart-search/route.ts    (⭐ V2 三阶段提取，核心升级)
M app/search/page.tsx              (搜索页面增强)
M src/lib/supabase.ts              (Supabase 双客户端)
?? DEPLOY.md                       (Vercel 部署指南)
?? PROJECT_STATUS.md               (项目状态文件)
?? scripts/import-to-supabase.js   (数据导入脚本)
?? src/components/web-case-card.tsx (全网案例卡片组件)
?? src/lib/data.ts                 (数据访问层：JSON/Supabase 自动切换)
?? supabase/schema.sql             (数据库建表 SQL)
```

---

## 📂 关键文件

| 文件 | 用途 |
|------|------|
| `app/api/smart-search/route.ts` | ⭐ V2 三阶段智能提取（核心） |
| `app/api/smart-search-v2/route.ts` | 基于规则的评分版（备用） |
| `app/smart-search/page.tsx` | 智能搜索前端页面 |
| `supabase/schema.sql` | 数据库建表 SQL（3 张表） |
| `scripts/import-to-supabase.js` | 数据导入脚本 |
| `src/lib/data.ts` | 数据访问层（JSON/Supabase 自动切换） |
| `src/lib/supabase.ts` | Supabase 客户端配置 |
| `app/search/page.tsx` | 搜索页面（本地 + 全网 + AI 提取） |
| `DEPLOY.md` | Vercel 部署指南 |
| `.env.example` | 环境变量模板 |

---

## 🔑 环境变量（需要配置）

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
ZAI_API_KEY=
TAVILY_API_KEY=
```

---

## 🚀 下一步行动

1. **⚠️ 优先：提交 V2 变更** — git add + commit + push
2. 创建 Supabase 项目，执行 `schema.sql`
3. 配置 `.env.local`，运行 `node scripts/import-to-supabase.js`
4. 将本地图片上传到 Supabase Storage
5. 推送到 GitHub，在 Vercel 部署
6. 线上验证所有功能

---

## 📜 最近 Git 提交（HEAD: 821a598）

```
821a598 feat: 三阶段智能提取 - 批量提取+AI知识补充+补充搜索
8d4ff51 feat: 管理页面添加密码验证，非管理员无法进入
9aa53a4 fix: 导航栏所有屏幕可见，去掉hidden md:flex限制
4ea447c feat: 主页导航栏添加'管理'入口链接
b0e4ca3 fix: AI返回对象时安全转换为字符串，防止React渲染报错
263cec7 feat: 切换AI模型到智谱GLM-4-Flash云端API
62601d4 fix: 核心问题修复 - 导航文本过滤+内容截取扩大
bd33978 fix: 关闭raw_content减少超时+修复重复参数
7c7de94 fix: 字段名中英文映射+去掉英文字段名泄露+搜索量增加
13a8a54 fix: 16个字段全部展示，去掉所有隐藏条件，空值显示'无'
```
