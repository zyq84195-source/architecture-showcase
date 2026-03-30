# Dynamic Require Error - 最终解决方案

**错误**: `Module not found: Can't resolve 'anthropic'`
**根本原因**: architecture-search-framework 源代码使用动态 `require()`
**日期**: 2026-03-24

---

## 🔍 问题分析

### 根本原因

architecture-search-framework 的源代码中使用了动态 `require()` 来加载依赖：

```typescript
// src/models/anthropic.ts
this.client = require('anthropic').default;

// src/models/openai.ts
this.client = require('openai').default;

// src/models/google.ts
this.client = require('@google/generative-ai');
```

### 为什么 Next.js 无法解析？

1. **静态分析**: Next.js 的 webpack 在构建时会静态分析所有依赖
2. **动态加载**: `require()` 是动态的，webpack 无法确定模块路径
3. **模块解析失败**: webpack 尝试从 `node_modules` 解析模块时失败

### 为什么开发环境可以工作？

- 开发环境不进行静态分析
- `require()` 在运行时动态加载
- 所有依赖都已安装在 `node_modules` 中

---

## 🚀 解决方案

### 方案 1：禁用转译（推荐）⭐⭐⭐

**原理**: architecture-search-framework 已经被编译为 JavaScript，不需要 Next.js 再次转译。

**步骤**：

```powershell
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
powershell -ExecutionPolicy Bypass -File simple-build-fix.ps1
```

这个脚本会：
1. ✅ 备份 `next.config.js`
2. ✅ 禁用 `transpilePackages`（注释掉）
3. ✅ 运行构建
4. ✅ 如果失败，自动恢复配置

**优点**：
- ✅ 简单快速
- ✅ 不需要修改源代码
- ✅ 风险低

**缺点**：
- ⚠️ 如果 architecture-search-framework 有 TypeScript 代码，可能无法工作
- ✅ 但 framework 已经被构建为 JavaScript，所以这不是问题

---

### 方案 2：修复动态 require（彻底）⭐⭐

**原理**: 将源代码中的 `require()` 改为 ES6 `import`。

**步骤**：

```powershell
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
powershell -ExecutionPolicy Bypass -File fix-dynamic-require.ps1
```

这个脚本会：
1. ✅ 备份源文件
2. ✅ 修复 `anthropic.ts`
3. ✅ 修复 `openai.ts`
4. ✅ 修复 `google.ts`
5. ✅ 重新构建 architecture-search-framework
6. ✅ 删除备份文件

**优点**：
- ✅ 彻底解决问题
- ✅ 符合现代 JavaScript 标准

**缺点**：
- ⚠️ 需要修改源代码
- ⚠️ 需要重新构建 architecture-search-framework
- ⚠️ 需要提交代码到 GitHub

---

### 方案 3：手动修复（备用）

如果你想手动修复，可以：

#### 步骤 1：禁用转译

编辑 `next.config.js`：

```javascript
const nextConfig = {
  // transpilePackages: ['architecture-search-framework'], // 注释掉这一行
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};
```

#### 步骤 2：运行构建

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
npm run build
```

---

## 📋 方案对比

| 方案 | 复杂度 | 时间 | 风险 | 推荐度 |
|------|--------|------|------|--------|
| **方案 1: 禁用转译** | 低 | 1 分钟 | 低 | ⭐⭐⭐ |
| **方案 2: 修复动态 require** | 中 | 3 分钟 | 中 | ⭐⭐ |
| **方案 3: 手动修复** | 中 | 2 分钟 | 中 | ⭐ |

---

## 🎯 推荐操作

### 立即执行（推荐）

```powershell
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
powershell -ExecutionPolicy Bypass -File simple-build-fix.ps1
```

### 如果方案 1 失败

尝试方案 2：

```powershell
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
powershell -ExecutionPolicy Bypass -File fix-dynamic-require.ps1
```

### 如果两个方案都失败

尝试手动修改 `next.config.js`，禁用 `transpilePackages`。

---

## 🧪 验证步骤

### 修复后检查

1. ✅ 构建成功：`npm run build` 成功完成
2. ✅ 开发服务器启动：`npm run dev` 正常启动
3. ✅ 搜索页面访问：`http://localhost:3000/search` 正常加载
4. ✅ 内部搜索功能：正常工作
5. ✅ 全网搜索功能：正常工作

### 提交到 Vercel

如果修复成功，提交代码并推送到 Vercel。

---

## 📚 相关文档

- [Next.js Transpile Packages](https://nextjs.org/docs/architecture/webpack#transpile-packages)
- [Webpack Module Resolution](https://webpack.js.org/configuration/resolve/)
- [ES6 Import vs Require](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)

---

## 🐛 常见问题

### 问题 1：构建仍然失败

**解决方案**：
```bash
# 清理缓存
npm cache clean --force

# 重新安装依赖
rmdir /s /q node_modules
del package-lock.json
npm install

# 再次尝试修复
powershell -ExecutionPolicy Bypass -File simple-build-fix.ps1
```

### 问题 2：开发服务器启动失败

**解决方案**：
```bash
# 检查 Next.js 版本
npm list next

# 重新安装 Next.js
npm install next@latest --save
```

### 问题 3：修复后功能无法工作

**解决方案**：
1. 检查浏览器控制台错误
2. 检查网络请求
3. 查看服务器日志

---

## 🎉 总结

**问题根源**: architecture-search-framework 使用动态 `require()`
**推荐方案**: 禁用转译（方案 1）
**备用方案**: 修复动态 require（方案 2）
**预期时间**: 1-3 分钟

---

**文档创建时间**: 2026-03-24 00:55
**版本**: 1.0.0
