# Architecture Showcase

建筑案例展示平台 - 基于现代 Web 技术栈的案例搜索与智能分析系统。

**状态**：✅ 生产就绪
**最后更新**：2026-04-02

---

## ⚠️ 项目核心原则（必须遵守）

### 🚨 黄金原则：每次整改都要保留回滚机制

**这是本项目的最高优先级原则，任何违反此原则的修改都是不被允许的！**

> **"任何代码整改、配置修改、功能更新，都必须在修改前创建备份，修改后进行测试，确保可以快速回滚。"**

#### 强制要求

1. ✅ **修改前必须备份** - 使用 `./backup.ps1` 创建备份
2. ✅ **修改后必须测试** - 测试所有受影响的功能
3. ✅ **Git 频繁提交** - 每完成一个小功能就提交一次
4. ✅ **推送到远程仓库** - 确保远程有完整备份

#### 执行流程

```
修改前：备份 → Git 提交 → 记录目的
   ↓
修改：小步修改 → 频繁测试 → 及时反馈
   ↓
修改后：测试验证 → Git 提交 → 推送远程
   ↓
问题：快速回滚 → 分析原因 → 重新修复
```

**详情**：请查看 [PROJECT_CONFIG.md](./PROJECT_CONFIG.md#项目核心原则必须遵守) 了解完整的回滚机制和执行检查清单。

---

## 📋 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [部署工具](#部署工具)
- [回滚机制](#回滚机制)
- [配置说明](#配置说明)
- [常见问题](#常见问题)
- [维护指南](#维护指南)

---

## ✨ 功能特性

### 核心功能
- ✅ **案例浏览** - 精选建筑案例展示
- ✅ **内部搜索** - 搜索本地案例数据
- ✅ **全网搜索** - 基于 Tavily API 的实时网络搜索
- ✅ **AI 智能比对** - 多案例智能分析与对比
- ✅ **用户认证** - 登录/注册功能（待完善）

### 搜索功能
- ✅ 支持中文和英文搜索
- ✅ 多种搜索引擎支持（Tavily、DuckDuckGo）
- ✅ 搜索结果高亮显示
- ✅ 快速标签搜索

### AI 功能
- ✅ 智能案例比对
- ✅ 设计理念分析
- ✅ 建筑风格对比
- ✅ 功能布局分析

---

## 🛠 技术栈

### 前端
- **框架**：Next.js 15 (App Router)
- **UI**：React 18 + TypeScript
- **样式**：Tailwind CSS
- **组件库**：自定义组件系统

### 后端
- **API**：Next.js API Routes
- **数据库**：Supabase (PostgreSQL)
- **搜索**：Tavily API + DuckDuckGo

### 开发工具
- **包管理**：npm
- **版本控制**：Git + GitHub
- **代码质量**：ESLint + TypeScript

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/zyq84195-source/architecture-showcase.git
cd architecture-showcase
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env.local` 文件：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_anon_key
SUPABASE_SERVICE_ROLE_KEY=placeholder_service_role_key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 搜索 API 配置
TAVILY_API_KEY=your_tavily_api_key

# Windows 兼容性
NEXT_PRIVATE_DISABLE_TURBO=1
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问：http://localhost:3000

---

## 📦 部署工具

### 1. 自动部署脚本

使用 `deploy.ps1` 快速部署：

```powershell
# 开发模式（默认）
.\deploy.ps1

# 或指定模式
.\deploy.ps1 -Mode dev     # 开发模式
.\deploy.ps1 -Mode test    # 测试模式
.\deploy.ps1 -Mode build   # 生产构建
```

**开发模式**：
- 自动检查依赖
- 检查环境变量
- 检查端口占用
- 启动开发服务器

**测试模式**：
- 测试首页访问
- 测试搜索功能
- 测试环境变量配置

**生产构建**：
- 自动创建备份
- 清理构建缓存
- 执行生产构建
- 可选启动生产服务器

### 2. 手动部署

**开发模式**：
```bash
npm run dev
```

**生产构建**：
```bash
npm run build
npm run start
```

---

## 🔄 回滚机制

### 1. 自动备份脚本

使用 `backup.ps1` 创建备份：

```powershell
# 使用默认描述
.\backup.ps1

# 或指定描述
.\backup.ps1 -Description "修复搜索功能"
```

**备份内容**：
- `app/` - 应用代码
- `src/` - 源代码
- `public/` - 静态资源
- `.env.local` - 环境变量
- `package.json` - 依赖配置
- 其他配置文件

**备份命名**：`backup-yyyy-MM-dd-HH-mm-ss/`

### 2. 快速回滚脚本

使用 `rollback.ps1` 快速回滚：

```powershell
.\rollback.ps1
```

**回滚选项**：
1. **Git 回滚**（推荐）- 回滚到之前的 Git 提交
2. **备份文件回滚** - 回滚到指定的备份文件夹
3. **查看备份列表** - 查看所有可用的备份
4. **退出** - 取消操作

**使用示例**：

```powershell
# 查看备份列表
.\rollback.ps1
# 选择：3

# 回滚到指定备份
.\rollback.ps1 "backup-2026-04-02-15-00-00"
```

### 3. Git 版本控制

**查看提交历史**：
```bash
git log --oneline
```

**回滚到指定提交**：
```bash
# 回滚一次提交
git reset --hard HEAD~1

# 回滚到指定提交
git reset --hard <commit-hash>
```

**查看标签**：
```bash
git tag
```

**回滚到标签**：
```bash
git checkout <tag-name>
```

---

## ⚙️ 配置说明

### 搜索服务配置

**默认搜索引擎**：Tavily

**API 配置**：
```javascript
// app/api/search-service/route.ts
const engine = searchParams.get('engine') || 'tavily';
```

**可用引擎**：
- `tavily` - Tavily API（推荐，免费 1000 次/月）
- `duckduckgo` - DuckDuckGo API（免费，但结果质量较低）
- `bing` - Bing Search API（需 API Key）

### 环境变量说明

| 变量 | 说明 | 必需 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ 是 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | ✅ 是 |
| `TAVILY_API_KEY` | Tavily API 密钥 | ✅ 是 |
| `ZAI_API_KEY` | ZAI API 密钥 | ⚠️ 可选 |
| `NEXT_PRIVATE_DISABLE_TURBO` | 禁用 Turbopack（Windows） | ✅ 是（Windows） |

### Next.js 配置

**文件**：`next.config.js`

**关键配置**：
```javascript
const nextConfig = {
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://localhost',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};
```

---

## ❓ 常见问题

### 1. 网站无法访问

**症状**：访问 `http://localhost:3000` 返回错误

**解决方案**：
```powershell
# 1. 检查服务器进程
Get-Process -Name node

# 2. 检查端口占用
netstat -ano | Select-String ":3000"

# 3. 重新启动服务器
npm run dev
```

### 2. 搜索功能失效

**症状**：搜索返回 0 个结果

**解决方案**：
```powershell
# 1. 检查 Tavily API Key
Get-Content .env.local

# 2. 测试搜索 API
curl http://localhost:3000/api/search-service?q=test

# 3. 检查 API 配置
# 确保 app/api/search-service/route.ts 中的默认引擎为 'tavily'
```

### 3. 端口被占用

**症状**：启动服务器时提示端口被占用

**解决方案**：
```powershell
# 1. 查找占用端口的进程
netstat -ano | Select-String ":3000"

# 2. 终止进程
Stop-Process -Id <PID> -Force

# 3. 或使用 deploy.ps1 自动处理
.\deploy.ps1
```

### 4. 依赖安装失败

**症状**：`npm install` 失败

**解决方案**：
```bash
# 1. 清理缓存
npm cache clean --force

# 2. 删除 node_modules 和 package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# 3. 重新安装
npm install
```

---

## 📚 维护指南

### 日常维护

**每日备份**：
```powershell
.\backup.ps1 -Description "每日备份"
```

**每周检查**：
- 检查服务器状态
- 测试搜索功能
- 检查日志文件

### 更新维护

**依赖更新**：
```bash
npm update
npm audit fix
```

**版本更新**：
```bash
# 更新 Next.js
npm install next@latest

# 更新 React
npm install react@latest react-dom@latest
```

### 性能优化

**清理构建缓存**：
```bash
Remove-Item -Recurse -Force .next
```

**优化图片**：
- 使用 WebP 格式
- 压缩图片大小
- 实施懒加载

---

## 📄 项目文档

- [项目配置文档](./PROJECT_CONFIG.md) - 详细配置说明
- [回滚计划](./PROJECT_CONFIG.md#回滚机制) - 回滚机制说明
- [修改历史](./PROJECT_CONFIG.md#修改历史) - 变更日志

---

## 🌟 总结

**当前状态**：✅ **生产就绪**

**核心功能**：
- ✅ 案例浏览与搜索
- ✅ 全网搜索（Tavily API）
- ✅ AI 智能比对
- ✅ 用户认证（部分实现）

**回滚机制**：
- ✅ 自动备份脚本
- ✅ 快速回滚脚本
- ✅ Git 版本控制

**开发工具**：
- ✅ 自动部署脚本
- ✅ 测试工具
- ✅ 完整文档

---

**支持**：
- 问题反馈：[GitHub Issues](https://github.com/zyq84195-source/architecture-showcase/issues)
- 文档：[PROJECT_CONFIG.md](./PROJECT_CONFIG.md)

---

**最后更新**：2026-04-02
**维护者**：Lotus AI Assistant
