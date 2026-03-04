# 部署指南 - Architecture Showcase

## 🚀 快速部署到 Vercel

### 方法一：通过 Vercel 网站部署（推荐，最简单）

1. **准备代码仓库**
   ```bash
   # 初始化 Git
   cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
   git init
   git add .
   git commit -m "Initial commit - Architecture Showcase"
   ```

2. **推送到 GitHub**
   - 在 GitHub 创建新仓库
   - 推送代码到 GitHub
   ```bash
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git branch -M main
   git push -u origin main
   ```

3. **在 Vercel 部署**
   - 访问 https://vercel.com
   - 登录（使用 GitHub 账号）
   - 点击 "Add New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Deploy"

### 方法二：使用 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
   vercel
   ```

## 📋 部署后的配置

### 1. 更新域名
- 部署完成后，Vercel 会给你一个默认域名
- 可以绑定自定义域名（如：architecture-showcase.com）

### 2. SEO 优化
网站已配置以下 SEO 优化：
- ✅ Meta 标签（title, description, keywords）
- ✅ Open Graph（社交分享）
- ✅ Twitter Card
- ✅ Sitemap（站点地图）
- ✅ Robots.txt（搜索引擎规则）

### 3. 更新 Sitemap 和 Robots 中的域名
部署成功后，需要更新以下文件中的域名：
- `src/app/sitemap.ts` - 修改 baseUrl
- `src/app/robots.ts` - 修改 baseUrl

示例：
```typescript
const baseUrl = 'https://你的域名.vercel.app'
// 或
const baseUrl = 'https://你的自定义域名.com'
```

### 4. 提交到搜索引擎

#### Google Search Console
1. 访问 https://search.google.com/search-console
2. 添加你的网站域名
3. 验证网站所有权（推荐使用 HTML 标签方式）
4. 将验证码添加到 `src/app/layout.tsx` 的 `verification.google` 字段
5. 提交 Sitemap：`https://你的域名/sitemap.xml`

#### 百度站长平台
1. 访问 https://ziyuan.baidu.com/
2. 添加网站
3. 验证网站所有权
4. 提交 Sitemap：`https://你的域名/sitemap.xml`

### 5. 提交到导航网站
- 百度收录
- 360收录
- 搜狗收录
- 各大建筑/设计社区

## 🎯 让更多人找到你的网站

### 搜索引擎优化（SEO）
- ✅ 已配置结构化数据
- ✅ 已生成 Sitemap
- ✅ 已配置 Robots.txt
- ✅ 已优化页面标题和描述

### 社交媒体推广
- 在微博、小红书、知乎分享
- 在建筑/设计论坛发布
- 联系相关媒体报道

### 其他推广方式
- 交换友情链接
- 发布高质量内容
- 参与 Google My Business（如果有实体业务）

## 🔧 常见问题

### Q: 部署后页面打不开？
A: 检查构建日志，确保所有依赖都安装成功。

### Q: 图片无法加载？
A: 确保图片路径正确，且 public/images/cases/ 目录下有图片。

### Q: 搜索引擎多久能收录？
A: 通常 1-4 周，可以主动提交 Sitemap 加速收录。

### Q: 如何查看网站流量？
A: 使用 Google Analytics、Vercel Analytics 或百度统计。

## 📞 需要帮助？

如果遇到问题：
1. 查看 Vercel 构建日志
2. 检查浏览器控制台错误
3. 确认所有文件都已提交到 Git

---

**祝你部署成功！** 🎉
