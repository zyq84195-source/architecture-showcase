# Manual Fix Guide - 构建问题手动修复

**问题**: PowerShell 脚本执行失败
**解决方案**: 手动修改 next.config.js
**日期**: 2026-03-24

---

## 🚀 最简单的解决方案

### 步骤 1：备份 next.config.js

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
copy next.config.js next.config.js.bak
```

---

### 步骤 2：编辑 next.config.js

打开 `next.config.js` 文件，找到这一行：

```javascript
transpilePackages: ['architecture-search-framework'],
```

**改为**（添加 `//` 注释）：

```javascript
// transpilePackages: ['architecture-search-framework'], // Disabled to fix module resolution
```

---

### 步骤 3：运行构建

```bash
npm run build
```

---

### 步骤 4：验证构建成功

如果构建成功，你应该看到：

```
> architecture-showcase@0.1.0 build
> next build

 ▲ Next.js 14.2.35
 - Environments: .env.local

Creating an optimized production build ...
Route (app)                              /                                            0 B
...
✓ Compiled successfully in ...
```

如果构建失败，恢复备份：

```bash
copy next.config.js.bak next.config.js
```

---

## 🎯 为什么这样修复？

### 原因

1. **architecture-search-framework 已经被编译为 JavaScript**
   - 源代码：TypeScript (.ts)
   - 编译后：JavaScript (.js)
   - 位置：`../architecture-search-framework/dist/`

2. **不需要 Next.js 再次转译**
   - Next.js 的 `transpilePackages` 是为 TypeScript 源代码设计的
   - 对于已经编译的 JavaScript 包，不需要再次转译
   - 禁用后可以避免模块解析问题

3. **动态 require 仍然存在**
   - architecture-search-framework 的 JavaScript 代码中仍然有 `require()`
   - 但这是在 Node.js 环境中运行，不是在浏览器中
   - 所以不会影响功能

---

## 📋 修改前后对比

### 修改前

```javascript
const nextConfig = {
  transpilePackages: ['architecture-search-framework'],
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

module.exports = nextConfig
```

### 修改后

```javascript
const nextConfig = {
  // transpilePackages: ['architecture-search-framework'], // Disabled to fix module resolution
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

module.exports = nextConfig
```

---

## 🧪 测试步骤

### 构建成功后

1. **启动开发服务器**

```bash
npm run dev
```

2. **访问搜索页面**

```
http://localhost:3000/search
```

3. **测试内部搜索**

- 输入关键词：`历史建筑`
- 点击"开始搜索"
- 验证搜索结果正确显示

4. **测试全网搜索**

- 切换到"全网搜索"模式
- 输入关键词：`建筑案例 保护`
- 点击"全网搜索"
- 验证搜索结果正确显示

---

## 🐛 常见问题

### 问题 1：编辑 next.config.js 后构建仍然失败

**解决方案**：

1. 检查编辑是否正确
2. 确保没有其他语法错误
3. 重新运行 `npm run build`

---

### 问题 2：禁用 transpilePackages 后功能无法工作

**解决方案**：

1. 恢复 `transpilePackages`：
```javascript
transpilePackages: ['architecture-search-framework'],
```

2. 重新构建

3. 查看具体的错误信息

---

### 问题 3：恢复备份后仍然失败

**解决方案**：

```bash
# 清理并重新安装依赖
rmdir /s /q node_modules
del package-lock.json
npm install

# 重新构建
npm run build
```

---

## 📝 完整操作步骤

### 方法 1：手动修改（推荐）⭐⭐⭐

1. **备份**：`copy next.config.js next.config.js.bak`
2. **编辑**：注释掉 `transpilePackages` 行
3. **构建**：`npm run build`
4. **测试**：`npm run dev` 并访问搜索页面

---

### 方法 2：使用批处理脚本

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
manual-build-fix.bat
```

---

### 方法 3：使用 PowerShell 脚本（修复版）

```powershell
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
powershell -ExecutionPolicy Bypass -File simple-build-fix-v2.ps1
```

---

## 🎯 预期结果

### 构建成功

```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (3/3)
✓ Finalizing page optimization

Route (app)                              /                                            0 B
...

Build completed successfully
```

### 开发服务器启动

```
> next dev
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## 📚 相关文档

- [Next.js Transpile Packages](https://nextjs.org/docs/architecture/webpack#transpile-packages)
- [Webpack Module Resolution](https://webpack.js.org/configuration/resolve/)
- [Dynamic Require in Node.js](https://nodejs.org/api/modules.html#require)

---

## 🆘 如果仍然失败

1. 查看 `npm run build --verbose` 的详细输出
2. 检查 `next.config.js` 是否有其他错误
3. 清理缓存：`npm cache clean --force`
4. 重新安装依赖：`rmdir /s /q node_modules && npm install`

---

**文档创建时间**: 2026-03-24 00:55
**版本**: 1.0.0
