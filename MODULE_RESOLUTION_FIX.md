# Module Resolution Error - 解决方案

**错误**: `Module not found: Can't resolve 'anthropic'`
**原因**: architecture-search-framework 的依赖使用了 `*` 版本
**日期**: 2026-03-23

---

## 🔍 错误分析

### 错误信息

```
Failed to compile.

../architecture-search-framework/dist/models/anthropic.js
Module not found: Can't resolve 'anthropic'
```

### 错误原因

architecture-search-framework 的 `package.json` 中使用了 `*` 版本号：

```json
"dependencies": {
  "anthropic": "*",
  "openai": "*",
  "axios": "*",
  ...
}
```

这导致：
1. ❌ 依赖可能没有正确安装到 node_modules
2. ❌ 版本冲突和不一致
3. ❌ Next.js 无法解析模块

---

## ✅ 已完成的修复

### 修改 architecture-search-framework/package.json

将所有 `*` 版本改为具体版本号：

```json
"dependencies": {
  "@google/generative-ai": "^0.24.1",
  "anthropic": "^0.0.0",
  "axios": "^1.13.6",
  "chalk": "^4.1.2",
  "cheerio": "^1.0.0-rc.12",
  "cli-progress": "^3.12.0",
  "commander": "^11.1.0",
  "dotenv": "^16.3.1",
  "exceljs": "^4.4.0",
  "openai": "^4.20.1",
  "ora": "^5.4.1",
  "p-queue": "^7.4.1",
  "puppeteer": "^21.5.0"
}
```

---

## 🚀 解决方案

### 方法 1：使用修复脚本（推荐）⭐⭐⭐

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
fix-module-resolution.bat
```

这个脚本会：
1. ✅ architecture-search-framework package.json 已修复
2. ✅ 清理旧依赖
3. ✅ 重新安装 architecture-search-framework 依赖
4. ✅ 重新构建 architecture-search-framework
5. ✅ 清理并重新安装 architecture-showcase 依赖
6. ✅ 运行构建

---

### 方法 2：手动修复

```bash
# 1. architecture-search-framework 已修复 package.json（已完成）

# 2. 清理并重新安装 architecture-search-framework 依赖
cd C:\Users\zyq15\.openclaw\workspace\architecture-search-framework

rmdir /s /q node_modules
del package-lock.json

npm install

# 3. 重新构建 architecture-search-framework
npm run build

# 4. 返回 architecture-showcase
cd ..\architecture-showcase

# 5. 清理并重新安装 architecture-showcase 依赖
rmdir /s /q node_modules\architecture-search-framework

npm install

# 6. 重新构建
npm run build
```

---

### 方法 3：仅重新安装依赖（快速）

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 清理并重新安装依赖
rmdir /s /q node_modules\architecture-search-framework
npm install

# 重新构建
npm run build
```

---

## 📋 依赖版本对照表

| 依赖 | 旧版本 | 新版本 |
|------|--------|--------|
| `@google/generative-ai` | `*` | `^0.24.1` |
| `anthropic` | `*` | `^0.0.0` |
| `axios` | `*` | `^1.13.6` |
| `chalk` | `*` | `^4.1.2` |
| `cheerio` | `*` | `^1.0.0-rc.12` |
| `cli-progress` | `*` | `^3.12.0` |
| `commander` | `*` | `^11.1.0` |
| `dotenv` | `*` | `^16.3.1` |
| `exceljs` | `^4.4.0` | `^4.4.0` |
| `openai` | `*` | `^4.20.1` |
| `ora` | `*` | `^5.4.1` |
| `p-queue` | `*` | `^7.4.1` |
| `puppeteer` | `*` | `^21.5.0` |

---

## 🧪 测试验证

### 修复前检查

- [ ] architecture-search-framework/package.json 使用 `*` 版本
- [ ] npm run build 失败，出现模块解析错误

### 修复后检查

- [ ] architecture-search-framework/package.json 使用具体版本号
- [ ] npm run build 成功
- [ ] npm run dev 可以正常启动
- [ ] 访问 http://localhost:3000/search 正常
- [ ] 内部搜索功能正常
- [ ] 全网搜索功能正常

---

## 🐛 常见问题

### 问题 1：npm install 失败

**症状**：
```
npm ERR! code ERESOLVE
```

**解决方案**：
```bash
# 使用 --legacy-peer-deps
npm install --legacy-peer-deps

# 或使用 --force
npm install --force
```

---

### 问题 2：构建仍然失败

**症状**：
```
Build failed with webpack errors
```

**解决方案**：
```bash
# 查看详细错误
npm run build --verbose

# 检查 Next.js 配置
type next.config.js

# 检查 TypeScript 配置
type tsconfig.json
```

---

### 问题 3：其他模块解析错误

**症状**：
```
Module not found: Can't resolve 'openai'
Module not found: Can't resolve 'axios'
```

**解决方案**：
```bash
# 重新安装所有依赖
npm install --force

# 清理缓存
npm cache clean --force
```

---

## 📚 相关文档

- [npm 依赖版本管理](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#dependencies)
- [Next.js 模块解析](https://nextjs.org/docs/messages/module-not-found)
- [package.json 版本规范](https://docs.npmjs.com/about-semantic-versioning)

---

## 🎯 下一步操作

1. **立即执行修复**：运行 `fix-module-resolution.bat`
2. **验证构建**：检查 `npm run build` 是否成功
3. **测试功能**：启动开发服务器，测试搜索功能
4. **提交代码**：如果修复成功，推送到 GitHub
5. **配置 Vercel**：添加环境变量，部署到生产环境

---

## 🔒 版本说明

### 为什么使用具体版本号？

1. ✅ **确定性强**：明确指定版本，避免意外更新
2. ✅ **稳定性高**：避免版本冲突和不一致
3. ✅ **可重现**：确保在不同环境中安装相同版本
4. ✅ **安全性**：避免安装意外的不安全版本

### 为什么不使用 `*` 版本？

1. ❌ **不确定性**：每次安装都可能不同版本
2. ❌ **版本冲突**：可能导致依赖冲突
3. ❌ **模块解析失败**：可能导致模块无法解析

---

**文档创建时间**: 2026-03-23 23:59
**版本**: 1.0.0
