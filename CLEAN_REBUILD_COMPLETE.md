# Clean Rebuild - Deep Clean and Rebuild Guide

**问题**: `supabase.ts` 显示旧的错误（已修复但构建时仍显示）
**原因**: 构建缓存或文件系统缓存问题
**日期**: 2026-03-24

---

## 🔍 问题分析

### 错误信息

```
Error:
 × 'import', and 'export' cannot be used outside of module code
 ╭─[C:\Users\zyq15\.openclaw\workspace\architecture-showcase\src\lib\supabase.ts:4:1]
 4 │ const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
```

### 为什么仍显示旧错误？

1. **Next.js 构建缓存**：`.next` 缓存可能没有更新
2. **文件系统缓存**：Windows 可能缓存了旧文件内容
3. **构建进程问题**：构建进程可能使用了旧的文件句柄
4. **文件编码问题**：文件可能有隐藏字符或 BOM

---

## 🚀 彻底清理并重新构建

### 方案 1：使用深度清理脚本（推荐）⭐⭐⭐

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
deep-clean-rebuild.bat
```

这个脚本会：
1. ✅ 停止所有 Node.js 进程
2. ✅ 清理所有 Next.js 缓存
3. ✅ 清理所有 node_modules
4. ✅ 删除 package-lock.json
5. ✅ 验证文件内容
6. ✅ 重新安装依赖
7. ✅ 重新构建

---

### 方案 2：手动深度清理

#### 步骤 1：停止所有进程

```bash
# 停止开发服务器（如果在运行）
Ctrl + C

# 停止所有 Node.js 进程
taskkill /F /IM node.exe
```

---

#### 步骤 2：清理所有缓存

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 删除 Next.js 缓存
rmdir /s /q ".next"

# 删除 node_modules
rmdir /s /q "node_modules"

# 删除 package-lock.json
del "package-lock.json"

# 删除 yarn.lock（如果有）
del "yarn.lock"

# 删除所有 .bak 文件
del *.bak /s /q

# 删除 .next 目录的所有内容
if exist ".next" rmdir /s /q ".next"
```

---

#### 步骤 3：验证文件内容

```bash
# 检查 supabase.ts 内容
type src\lib\supabase.ts

# 确保看到：
# import { createClient } from '@supabase/supabase-js';
# ...
# export const supabase = ...
```

---

#### 步骤 4：重新安装依赖

```bash
# 清理 npm 缓存
npm cache clean --force

# 重新安装依赖
npm install
```

---

#### 步骤 5：重新构建

```bash
# 重新构建
npm run build
```

---

### 方案 3：完全从头开始（最彻底）

#### 步骤 1：备份项目

```bash
cd C:\Users\zyq15\.openclaw\workspace

# 备份项目
xcopy architecture-showcase architecture-showcase-backup /E /I
```

---

#### 步骤 2：删除所有生成文件

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 删除所有生成文件
rmdir /s /q ".next"
rmdir /s /q "node_modules"
del "package-lock.json"
```

---

#### 步骤 3：删除并重新创建 supabase.ts

```bash
# 删除文件
del src\lib\supabase.ts

# 重新创建文件
echo import { createClient } from '@supabase/supabase-js'; > src\lib\supabase.ts
echo. >> src\lib\supabase.ts
echo const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; >> src\lib\supabase.ts
echo. >> src\lib\supabase.ts
echo if (supabaseUrl && !supabaseUrl.includes('placeholder')) { >> src\lib\supabase.ts
echo   export const supabase = createClient( >> src\lib\supabase.ts
echo     process.env.NEXT_PUBLIC_SUPABASE_URL!, >> src\lib\supabase.ts
echo     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! >> src\lib\supabase.ts
echo   ); >> src\lib\supabase.ts
echo. >> src\lib\supabase.ts
echo   export const supabaseAdmin = createClient( >> src\lib\supabase.ts
echo     process.env.NEXT_PUBLIC_SUPABASE_URL!, >> src\lib\supabase.ts
echo     process.env.SUPABASE_SERVICE_ROLE_KEY! >> src\lib\supabase.ts
echo   ); >> src\lib\supabase.ts
echo } else { >> src\lib\supabase.ts
echo   console.log('Supabase is disabled (using placeholder config)'); >> src\lib\supabase.ts
echo   export const supabase = null; >> src\lib\supabase.ts
echo   export const supabaseAdmin = null; >> src\lib\supabase.ts
echo } >> src\lib\supabase.ts
```

---

#### 步骤 4：重新安装和构建

```bash
# 重新安装
npm install

# 重新构建
npm run build
```

---

## 📋 清理检查清单

### 构建前检查

- [ ] 所有 Node.js 进程已停止
- [ ] `.next` 目录已删除
- [ ] `node_modules` 目录已删除
- [ ] `package-lock.json` 已删除
- [ ] 所有 `.bak` 文件已删除
- [ ] `src/lib/supabase.ts` 内容正确

### 重新安装检查

- [ ] `npm install` 成功
- [ ] 依赖已正确安装
- [ ] `node_modules/architecture-search-framework` 存在

### 构建后检查

- [ ] `npm run build` 成功
- [ ] 没有编译错误
- [ ] 没有模块解析错误
- [ ] 构建输出显示 "Compiled successfully"

---

## 🧪 验证步骤

### 本地测试

1. **启动开发服务器**

```bash
npm run dev
```

2. **访问搜索页面**

```
http://localhost:3000/search
```

3. **测试搜索功能**

- [ ] 搜索页面正常加载
- [ ] 内部搜索功能正常
- [ ] 全网搜索功能正常
- [ ] 没有控制台错误

---

## 🐛 常见问题

### 问题 1：清理后仍然失败

**解决方案**：

```bash
# 完全重启电脑
# 重新打开项目目录
# 重新运行清理脚本
```

---

### 问题 2：npm install 失败

**解决方案**：

```bash
# 清理 npm 缓存
npm cache clean --force

# 删除 .npmrc（如果有）
del %USERPROFILE%\.npmrc

# 重新安装
npm install
```

---

### 问题 3：构建成功但功能无法工作

**解决方案**：

1. 检查浏览器控制台错误
2. 检查网络请求
3. 查看服务器日志

---

## 📝 预期结果

### 成功的构建输出

```
> architecture-showcase@0.1.0 build
> next build

 ▲ Next.js 14.2.35
 - Environments: .env.local

Creating an optimized production build ...
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (3/3)
✓ Finalizing page optimization

Route (app)                              /                                            0 B
...

Build completed successfully
```

### 成功的开发服务器输出

```
> next dev
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## 📚 相关文档

- [Next.js Build Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Next.js Module Resolution](https://nextjs.org/docs/architecture/webpack)
- [npm Cache Management](https://docs.npmjs.com/cli/v6/commands/npm-cache)
- [Windows File System Caching](https://docs.microsoft.com/en-us/windows/win32/fileio/file-caching)

---

**文档创建时间**: 2026-03-24 01:03
**版本**: 1.0.0
