# Clean Rebuild - 彻底清理并重新构建

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

### 为什么仍然显示旧错误？

1. **Next.js 构建缓存**：`.next` 缓存可能没有更新
2. **文件系统缓存**：Windows 文件系统可能缓存了旧内容
3. **构建进程问题**：构建进程可能使用了旧的文件句柄
4. **文件编码问题**：文件可能有隐藏字符

---

## 🚀 彻底清理并重新构建

### 步骤 1：停止所有进程

```bash
# 停止开发服务器（如果在运行）
Ctrl + C
```

---

### 步骤 2：清理所有缓存

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase

# 清理 Next.js 缓存
rmdir /s /q ".next"

# 清理 node_modules
rmdir /s /q "node_modules"

# 删除 package-lock.json
del "package-lock.json"

# 删除 .next 目录（如果有）
if exist ".next" rmdir /s /q ".next"

# 删除所有 .bak 文件
del *.bak /s /q

# 删除 .next 目录的所有内容
if exist ".next" rmdir /s /q ".next"
```

---

### 步骤 3：验证文件内容

```bash
# 检查 supabase.ts 文件内容
type src\lib\supabase.ts

# 确保看到：
# import { createClient } from '@supabase/supabase-js';
# ...
# export const supabase = ...
```

---

### 步骤 4：重新安装依赖

```bash
npm install
```

---

### 步骤 5：重新构建

```bash
npm run build
```

---

### 步骤 6：测试开发服务器

```bash
npm run dev
```

---

## 📋 验证检查清单

### 文件内容检查

- [ ] `src/lib/supabase.ts` 内容正确
- [ ] `next.config.js` transpilePackages 已禁用
- [ ] 没有隐藏字符或 BOM

### 清理检查

- [ ] `.next` 目录已删除
- [ ] `node_modules` 目录已删除
- [ ] `package-lock.json` 已删除
- [ ] 所有 `.bak` 文件已删除

### 构建检查

- [ ] `npm install` 成功
- [ ] `npm run build` 成功
- [ ] 没有 TypeScript 错误
- [ ] 没有 webpack 错误

### 功能检查

- [ ] `npm run dev` 成功启动
- [ ] 访问 `http://localhost:3000/search` 正常
- [ ] 内部搜索功能正常
- [ ] 全网搜索功能正常

---

## 🐛 如果仍然失败

### 方案 1：删除并重新创建文件

```bash
# 删除 supabase.ts
del src\lib\supabase.ts

# 重新创建 supabase.ts
echo import { createClient } from '@supabase/supabase-js'; > src\lib\supabase.ts
echo. >> src\lib\supabase.ts
echo const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; >> src\lib\supabase.ts
echo. >> src\lib\supabase.ts
echo if (supabaseUrl && !supabaseUrl.includes('placeholder')) { >> src\lib\supabase.ts
echo   export const supabase = createClient( >> src\lib\supabase.ts
echo     process.env.NEXT_PUBLIC_SUPABASE_URL!, >> src\lib\supabase.ts
echo     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! >> src\lib\supabase.ts
echo   ); >> src\lib\supabase.ts
echo   export const supabaseAdmin = createClient( >> src\lib\supabase.ts
echo     process.env.NEXT_PUBLIC_SUPABASE_URL!, >> src\lib\supabase.ts
echo     process.env.SUPABASE_SERVICE_ROLE_KEY! >> src\lib\supabase.ts
echo   ); >> src\lib\supabase.ts
echo } else { >> src\lib\supabase.ts
echo   console.log('Supabase is disabled (using placeholder config)'); >> src\lib\supabase.ts
echo   export const supabase = null; >> src\lib\supabase.ts
echo   export const supabaseAdmin = null; >> src\lib\supabase.ts
echo } >> src\lib\supabase.ts

# 重新构建
npm run build
```

---

### 方案 2：使用 PowerShell 重启

```powershell
# 停止所有 Node.js 进程
Get-Process node | Stop-Process -Force

# 清理并重新构建
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
rmdir -Recurse -Force ".next"
rmdir -Recurse -Force "node_modules"
npm install
npm run build
```

---

### 方案 3：完全从头开始

```bash
# 删除项目中的所有生成文件
cd C:\Users\zyq15\.openclaw\workspace

# 备份项目文件（可选）
xcopy architecture-showcase architecture-showcase-backup /E /I

# 删除所有缓存和依赖
cd architecture-showcase
rmdir /s /q ".next"
rmdir /s /q "node_modules"
del "package-lock.json"

# 重新安装
npm install

# 重新构建
npm run build
```

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
- [TypeScript Configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json)
- [Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**文档创建时间**: 2026-03-24 01:02
**版本**: 1.0.0
