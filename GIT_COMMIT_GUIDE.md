# Git Commit 脚本使用指南

**创建时间**: 2026-03-23
**用途**: 提交 Architecture Search Framework 集成代码到 GitHub

---

## 🚀 快速开始

### 方法 1：使用 PowerShell 脚本（推荐）⭐⭐⭐

```powershell
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
powershell -ExecutionPolicy Bypass -File commit-framework-integration.ps1
```

### 方法 2：使用批处理脚本

```cmd
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
commit-simple.bat
```

### 方法 3：手动执行

```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
git add .
git commit -m "feat: integrate Architecture Search Framework"
git push
```

---

## 📋 脚本说明

### commit-framework-integration.ps1

**类型**: PowerShell 脚本
**优点**: 完整的错误处理，支持中文输出

**功能**：
1. ✅ 检查 Git 状态
2. ✅ 添加所有文件到 Git
3. ✅ 提交更改（包含详细的 commit message）
4. ✅ 推送到 GitHub
5. ✅ 完整的错误处理
6. ✅ 友好的输出信息

**使用方法**：
```powershell
powershell -ExecutionPolicy Bypass -File commit-framework-integration.ps1
```

---

### commit-simple.bat

**类型**: 批处理文件
**优点**: 简单直接，无中文字符乱码

**功能**：
1. ✅ 添加所有文件到 Git
2. ✅ 提交更改
3. ✅ 推送到 GitHub
4. ✅ 错误处理

**使用方法**：
```cmd
commit-simple.bat
```

---

## 🔒 解决编码问题

### 问题：批处理文件中文字符乱码

**原因**：Windows 命令行默认使用 GBK/CP936 编码，但批处理文件使用 UTF-8 编码。

**解决方案**：

#### 方案 1：使用 PowerShell 脚本（推荐）

PowerShell 对 UTF-8 编码的支持更好，不会出现中文字符乱码。

```powershell
powershell -ExecutionPolicy Bypass -File commit-framework-integration.ps1
```

#### 方案 2：使用简化的批处理脚本

不包含中文字符，只使用英文输出。

```cmd
commit-simple.bat
```

#### 方案 3：使用 chcp 命令

在批处理文件开头添加 `chcp 65001`，设置命令行编码为 UTF-8。

```batch
@echo off
chcp 65001 >nul
```

---

## 🧪 测试清单

### 本地测试

- [ ] 进入项目目录
- [ ] 运行提交脚本
- [ ] 检查 Git 状态（`git status`）
- [ ] 检查 commit 记录（`git log -1`）
- [ ] 验证远程仓库（`git remote -v`）

### 远程测试

- [ ] 访问 GitHub 仓库
- [ ] 检查 commit 是否成功推送
- [ ] 检查文件是否正确上传
- [ ] 验证 commit message 是否正确

---

## 🐛 常见问题

### 问题 1：PowerShell 执行策略错误

**症状**：
```
无法加载文件 ...，因为在此系统上禁止运行脚本
```

**解决方案**：

```powershell
# 方法 1：临时绕过执行策略
powershell -ExecutionPolicy Bypass -File commit-framework-integration.ps1

# 方法 2：设置执行策略
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### 问题 2：Git 认证失败

**症状**：
```
fatal: Authentication failed for 'https://github.com/...'
```

**解决方案**：

```bash
# 方法 1：使用 GitHub Personal Access Token
git remote set-url origin https://<token>@github.com/<username>/<repo>.git

# 方法 2：使用 Git Credential Manager
git config --global credential.helper manager-core
```

---

### 问题 3：网络连接失败

**症状**：
```
fatal: unable to access 'https://github.com/...': Failed to connect
```

**解决方案**：

```bash
# 检查网络连接
ping github.com

# 检查 Git 远程仓库
git remote -v

# 检查 Git 配置
git config --list
```

---

### 问题 4：提交失败 - 没有更改

**症状**：
```
nothing to commit, working tree clean
```

**解决方案**：

```bash
# 检查 Git 状态
git status

# 如果真的没有更改，跳过提交步骤
```

---

## 📝 Commit Message 说明

### 自动生成的 Commit Message

```
feat: integrate Architecture Search Framework

- Add web search API (/api/web-search)
- Add comparison API (/api/web-compare)
- Update search page with mode switch (internal / web)
- Keep original internal search functionality
- Update environment variables (ZAI_API_KEY, TAVILY_API_KEY)
- Add integration documentation
```

### Commit Message 规范

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

---

## 🎯 下一步操作

### 1. 配置 Vercel 环境变量

访问 Vercel 项目设置，添加以下环境变量：

```
ZAI_API_KEY=9546abcd96dd456bbd880ae3bb1ac917.li0XljgB4bTXhinx
TAVILY_API_KEY=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
```

### 2. 验证部署

等待 Vercel 自动部署完成后，验证：

- [ ] 访问生产环境
- [ ] 测试内部搜索功能
- [ ] 测试全网搜索功能
- [ ] 测试搜索 API 端点

### 3. 功能测试

```bash
# 测试全网搜索 API
curl "https://architecture-showcase.vercel.app/api/web-search?q=建筑案例"

# 测试对比分析 API
curl -X POST https://architecture-showcase.vercel.app/api/web-compare \
  -H "Content-Type: application/json" \
  -d '{"results": [...], "enableSemantic": false}'
```

---

## 📚 相关文档

- [Architecture Search Framework 文档](../architecture-search-framework/README.md)
- [集成完成报告](INTEGRATION_COMPLETE_REPORT.md)
- [Vercel 环境变量配置指南](VERCEL_ENV_CONFIG.md)
- [集成更新文档](FRAMEWORK_INTEGRATION_UPDATE.md)

---

**文档创建时间**: 2026-03-23 22:50
**版本**: 1.0.0
