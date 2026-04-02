# 快速使用指南

**最后更新**：2026-04-02 17:30
**项目状态**：✅ 生产就绪

---

## 🚀 日常使用

### 1. 启动开发服务器

```powershell
.\deploy.ps1
```

**自动执行**：
- ✅ 检查依赖
- ✅ 检查环境变量
- ✅ 检查端口占用
- ✅ 启动开发服务器

**访问地址**：
- 主页：http://localhost:3000
- 搜索：http://localhost:3000/search
- 案例：http://localhost:3000/cases

---

## 📦 修改前准备

### 1. 创建备份

```powershell
# 使用默认描述
.\backup.ps1

# 或指定描述
.\backup.ps1 -Description "修复搜索功能"
```

**自动备份内容**：
- `app/` - 应用代码
- `src/` - 源代码
- `public/` - 静态资源
- `.env.local` - 环境变量
- `package.json` - 依赖配置
- 其他配置文件

**备份命名**：`backup-yyyy-MM-dd-HH-mm-ss/`

### 2. Git 提交

```bash
# 添加所有更改
git add .

# 提交更改
git commit -m "feat: 新功能描述"

# 推送到远程
git push origin main
```

---

## 🔄 修改后回滚

### 场景 1：快速回滚（推荐）

```powershell
.\rollback.ps1
```

**选择**：
1. **Git 回滚** - 回滚到之前的 Git 提交
2. **备份文件回滚** - 回滚到指定的备份文件夹
3. **查看备份列表** - 查看所有可用的备份
4. **退出** - 取消操作

### 场景 2：Git 回滚

```bash
# 回滚一次提交
git reset --hard HEAD~1

# 回滚到指定提交
git reset --hard <commit-hash>

# 查看提交历史
git log --oneline
```

### 场景 3：回滚到备份

```powershell
# 查看备份列表
.\rollback.ps1
# 选择：3

# 或直接指定备份
.\rollback.ps1 "backup-2026-04-02-15-00-00"
```

---

## 🧪 测试验证

### 运行测试脚本

```powershell
.\deploy.ps1 -Mode test
```

**自动测试**：
- ✅ 首页访问
- ✅ 搜索功能
- ✅ 环境变量配置

### 手动测试

**测试 1：首页**
```powershell
curl http://localhost:3000
```

**测试 2：搜索**
```powershell
curl http://localhost:3000/api/search-service?q=React
```

**测试 3：中文搜索**
```powershell
curl http://localhost:3000/api/search-service?q=建筑案例
```

---

## 📊 维护任务

### 每日维护

```powershell
# 1. 创建每日备份
.\backup.ps1 -Description "每日备份"

# 2. 检查服务器状态
# 访问 http://localhost:3000
# 访问 http://localhost:3000/search

# 3. 测试搜索功能
# 在浏览器中测试搜索
```

### 每周维护

```bash
# 1. 更新依赖
npm update

# 2. 检查安全漏洞
npm audit

# 3. 清理旧备份
# 删除超过 7 天的备份文件夹

# 4. 检查 Git 状态
git status
git log --oneline -10
```

### 每月维护

```bash
# 1. 完整备份
.\backup.ps1 -Description "月度完整备份"

# 2. 清理构建缓存
Remove-Item -Recurse -Force .next

# 3. 重新构建
npm run build

# 4. 创建 Git 标签
git tag -a v1.0.0 -m "月度版本"

# 5. 推送到远程
git push origin main --tags
```

---

## 🚨 紧急恢复

### 网站无法访问

**步骤**：
```powershell
# 1. 检查服务器进程
Get-Process -Name node

# 2. 检查端口占用
netstat -ano | Select-String ":3000"

# 3. 终止占用进程
Stop-Process -Id <PID> -Force

# 4. 重启服务器
.\deploy.ps1
```

### 搜索功能失效

**步骤**：
```powershell
# 1. 检查 API Key
Get-Content .env.local

# 2. 测试搜索 API
curl http://localhost:3000/api/search-service?q=test

# 3. 如有问题，回滚配置
git checkout HEAD~1 -- app/api/search-service/route.ts

# 4. 重启服务器
npm run dev
```

### 配置文件损坏

**步骤**：
```powershell
# 1. 回滚环境变量
git checkout HEAD~1 -- .env.local

# 2. 回滚配置文件
git checkout HEAD~1 -- next.config.js
git checkout HEAD~1 -- package.json

# 3. 重新安装依赖
npm install

# 4. 重启服务器
.\deploy.ps1
```

---

## 📝 修改历史

### 2026-04-02 17:30 - 添加回滚机制 ✅

**新增文件**：
- `PROJECT_CONFIG.md` - 项目配置文档
- `README.md` - 完整项目说明
- `backup.ps1` - 自动备份脚本
- `rollback.ps1` - 快速回滚脚本
- `deploy.ps1` - 自动部署脚本
- `QUICK_START.md` - 快速使用指南（本文件）

**Git 提交**：`dfcb02f`

**推送状态**：✅ 成功推送到 GitHub

### 2026-04-02 15:13 - 搜索功能修复 ✅

**修改内容**：
- 修改默认搜索引擎为 `tavily`
- 修改前端搜索请求为 `engine=tavily`
- 测试确认搜索功能正常

**修改文件**：
- `app/api/search-service/route.ts`
- `app/search/page.tsx`

### 2026-04-02 10:48 - 目录结构修复 ✅

**修改内容**：
- 修复 Next.js App Router 目录结构
- 将 `src/app` 移动到根目录 `app`
- 恢复 API 路由到 `app/api/`

---

## 🎯 最佳实践

### 修改流程

```
1. 创建备份
   ↓
2. Git 提交
   ↓
3. 进行修改
   ↓
4. 测试验证
   ↓
5. Git 提交
   ↓
6. 推送到远程
```

### 回滚流程

```
1. 评估问题
   ↓
2. 选择回滚方式
   ↓
3. 执行回滚
   ↓
4. 测试验证
   ↓
5. 记录问题
```

### 维护流程

```
每日：备份 + 检查
   ↓
每周：更新 + 清理
   ↓
每月：完整备份 + 标签
```

---

## 📞 获取帮助

### 文档资源

- [项目配置文档](./PROJECT_CONFIG.md) - 详细配置说明
- [完整项目说明](./README.md) - 项目文档
- [回滚机制](./PROJECT_CONFIG.md#回滚机制) - 回滚指南

### 常见问题

- 网站无法访问 → [查看解决方案](./PROJECT_CONFIG.md#紧急回滚指南)
- 搜索功能失效 → [查看解决方案](./PROJECT_CONFIG.md#紧急回滚指南)
- 端口被占用 → [查看解决方案](./README.md#常见问题)

### 技术支持

- 问题反馈：[GitHub Issues](https://github.com/zyq84195-source/architecture-showcase/issues)
- 维护者：Lotus AI Assistant

---

**总结**：完整的回滚机制已建立，所有修改都可以快速回滚！

**核心优势**：
- ✅ 自动备份脚本
- ✅ 快速回滚工具
- ✅ Git 版本控制
- ✅ 完整文档支持
- ✅ 自动部署工具

**下一步**：按照最佳实践进行修改，保持频繁备份！
