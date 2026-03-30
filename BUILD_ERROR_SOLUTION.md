# Build Error Diagnosis and Solutions

**问题**: `npm run build` 退出时出现了 1（构建失败）
**日期**: 2026-03-23

---

## 🔍 问题诊断

### 可能的原因

1. **architecture-search-framework 依赖问题**
   - architecture-search-framework 的 `package.json` 中使用了 `*` 版本
   - 这可能导致依赖解析问题

2. **Next.js 配置问题**
   - `transpilePackages` 配置可能不正确
   - Webpack 配置可能有问题

3. **TypeScript 编译错误**
   - API 路由文件可能有 TypeScript 错误
   - 类型定义可能不匹配

---

## 🚀 解决方案

### 方案 1：重新构建 architecture-search-framework（推荐）⭐⭐⭐

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-search-framework

# 1. 清理旧构建
npm run clean

# 2. 重新构建
npm run build

# 3. 返回 architecture-showcase
cd ..\architecture-showcase

# 4. 重新安装依赖
npm install

# 5. 重新构建
npm run build
```

---

### 方案 2：使用修复脚本（快速）⭐⭐

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
fix-build.bat
```

这个脚本会：
1. 检查并构建 architecture-search-framework
2. 重新安装依赖
3. 运行构建

---

### 方案 3：清理并重新安装（彻底）

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 1. 清理 node_modules
rmdir /s /q node_modules

# 2. 删除 package-lock.json
del package-lock.json

# 3. 重新安装依赖
npm install

# 4. 重新构建
npm run build
```

---

### 方案 4：检查 Next.js 配置

检查 `next.config.js` 文件：

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
```

确保 `transpilePackages` 包含 `'architecture-search-framework'`。

---

### 方案 5：修改 package.json 依赖方式

将 architecture-search-framework 的依赖从本地路径改为 npm 包（如果已发布）：

```json
{
  "dependencies": {
    "architecture-search-framework": "^1.0.0"
  }
}
```

或者保留本地路径，但确保 architecture-search-framework 已正确构建。

---

## 🧪 诊断步骤

### 步骤 1：检查 architecture-search-framework 构建状态

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-search-framework

# 检查 dist 目录
dir dist

# 检查是否有 index.js
type dist\index.js | findstr /C:"export"
```

### 步骤 2：检查依赖是否正确安装

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 检查 node_modules 中的 architecture-search-framework
dir node_modules\architecture-search-framework
```

### 步骤 3：运行构建并查看详细错误

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 运行构建并查看详细输出
npm run build --verbose
```

---

## 📝 常见错误和解决方案

### 错误 1：Module not found: Can't resolve 'architecture-search-framework'

**原因**：依赖没有正确安装或 architecture-search-framework 没有正确构建

**解决方案**：
```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
npm install architecture-search-framework --save
```

---

### 错误 2：SyntaxError: Cannot use import statement outside a module

**原因**：Next.js 无法正确转译 architecture-search-framework

**解决方案**：检查 `next.config.js` 中的 `transpilePackages` 配置

```javascript
const nextConfig = {
  transpilePackages: ['architecture-search-framework'],
  // ...
};
```

---

### 错误 3：TypeScript compilation errors

**原因**：API 路由文件有 TypeScript 错误

**解决方案**：
```bash
# 运行 TypeScript 编译检查
npx tsc --noEmit

# 查看具体错误信息
```

---

## 🔧 快速修复命令

### 一键修复（推荐）

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 使用修复脚本
fix-build.bat
```

### 手动修复

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 1. 重新构建 architecture-search-framework
cd ..\architecture-search-framework
npm run build
cd ..\architecture-showcase

# 2. 重新安装依赖
npm install

# 3. 重新构建
npm run build
```

---

## 📋 检查清单

修复前检查：

- [ ] architecture-search-framework\dist\index.js 存在
- [ ] architecture-showcase\node_modules\architecture-search-framework 存在
- [ ] next.config.js 包含 transpilePackages
- [ ] package.json 包含 architecture-search-framework 依赖

修复后检查：

- [ ] npm run build 成功
- [ ] npm run dev 可以启动
- [ ] 访问 http://localhost:3000/search 正常
- [ ] 内部搜索功能正常
- [ ] 全网搜索功能正常

---

## 📚 相关文档

- [Next.js Transpile Packages](https://nextjs.org/docs/architecture/webpack#transpile-packages)
- [architecture-search-framework README](../architecture-search-framework/README.md)
- [集成文档](FRAMEWORK_INTEGRATION.md)

---

## 🆘 如果问题仍然存在

如果上述解决方案都无法解决问题，请：

1. 运行诊断脚本：
```bash
powershell -ExecutionPolicy Bypass -File diagnose-build.ps1
```

2. 查看详细的构建错误：
```bash
npm run build --verbose
```

3. 检查 Vercel 部署日志（如果已部署）

4. 联系技术支持或查看 GitHub Issues

---

**文档创建时间**: 2026-03-23 23:55
**版本**: 1.0.0
