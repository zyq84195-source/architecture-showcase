# 搜索引擎收录指南

## 🌐 网站 URL
**主域名：** https://architecture-showcase.vercel.app

**重要链接：**
- 首页：https://architecture-showcase.vercel.app
- Sitemap：https://architecture-showcase.vercel.app/sitemap.xml
- Robots：https://architecture-showcase.vercel.app/robots.txt

---

## 📋 提交到 Google

### 1. Google Search Console
**访问：** https://search.google.com/search-console

**步骤：**

1. **添加网站**
   - 点击 "选择资源类型"
   - 选择 "网址前缀"
   - 输入：`https://architecture-showcase.vercel.app/`
   - 点击 "继续"

2. **验证网站所有权**
   - 选择 "HTML 标记" 验证方式
   - 复制 Google 提供的 meta 标签
   - 添加到 `src/app/layout.tsx` 的 `metadata` 中：
   ```typescript
   verification: {
     google: 'your-verification-code',
   },
   ```
   - 提交代码到 GitHub
   - 返回 Google Search Console 点击 "验证"

3. **提交 Sitemap**
   - 验证成功后，进入左侧菜单
   - 选择 "站点地图" (Sitemaps)
   - 输入：`sitemap.xml`
   - 点击 "提交"

### 2. Google 收录时间
- **主动提交 Sitemap：** 1-3天
- **自然收录：** 1-4周
- **完整收录：** 1-2个月

### 3. 加速收录技巧
- 持续更新网站内容
- 在其他网站建立外链
- 在社交媒体分享
- 使用 Google My Business（如有实体业务）

---

## 📋 提交到百度

### 1. 百度站长平台
**访问：** https://ziyuan.baidu.com/

**步骤：**

1. **注册/登录**
   - 使用百度账号登录

2. **添加网站**
   - 点击 "用户中心" → "站点管理" → "添加网站"
   - 输入：`https://architecture-showcase.vercel.app/`
   - 网站属性选择：个人博客/网站
   - 点击 "下一步"

3. **验证网站**
   - 选择 "HTML 标签验证"
   - 复制百度提供的 meta 标签
   - 添加到 `src/app/layout.tsx` 中（在 Google 验证后面）
   - 提交代码
   - 返回百度站长平台点击 "完成验证"

4. **提交 Sitemap**
   - 验证成功后，进入 "数据引入" → "链接提交" → "普通收录" → "Sitemap"
   - 输入：`https://architecture-showcase.vercel.app/sitemap.xml`
   - 点击 "提交"

### 2. 百度收录时间
- **主动提交 Sitemap：** 1-7天
- **自然收录：** 2-8周
- **完整收录：** 1-3个月

---

## 📋 提交到其他搜索引擎

### 360 搜索
**访问：** https://zhanzhang.so.com/
**步骤：** 类似百度站长平台

### 搜狗搜索
**访问：** http://zhanzhang.sogou.com/
**步骤：** 类似百度站长平台

### Bing 搜索
**访问：** https://www.bing.com/webmasters/
**步骤：** 类似 Google Search Console

---

## 🚀 加速收录的最佳实践

### 1. 内容质量
- ✅ 持续更新高质量内容
- ✅ 添加更多建筑案例
- ✅ 写原创文章和分析

### 2. 技术优化
- ✅ 已配置 Sitemap ✅
- ✅ 已配置 Robots.txt ✅
- ✅ 已优化 Meta 标签 ✅
- ✅ 已优化页面加载速度 ✅

### 3. 外链建设
- 在知乎、豆瓣、微博等平台分享
- 在建筑/设计论坛发帖
- 与相关网站交换友情链接
- 提交到建筑/设计目录网站

### 4. 社交媒体
- 在小红书分享建筑案例
- 在B站制作介绍视频
- 在微信公众号发布
- 在LinkedIn发布（针对专业人士）

---

## 📊 监控收录情况

### Google Search Console
- 查看 "索引" → "覆盖范围"
- 查看 "效果" → "搜索结果"
- 查看搜索查询和点击数据

### 百度站长平台
- 查看 "搜索展现量"
- 查看 "索引量"
- 查看用户搜索词

### 其他工具
- 使用 `site:` 命令检查：
  ```
  site:architecture-showcase.vercel.app
  ```

---

## ⏱️ 收录时间预估

| 搜索引擎 | 主动提交 | 自然收录 | 完整收录 |
|---------|---------|---------|---------|
| Google | 1-3天 | 1-4周 | 1-2月 |
| 百度 | 1-7天 | 2-8周 | 1-3月 |
| Bing | 1-3天 | 1-4周 | 1-2月 |
| 360 | 1-7天 | 2-8周 | 1-3月 |
| 搜狗 | 1-7天 | 2-8周 | 1-3月 |

---

## 📝 验证代码添加示例

在 `src/app/layout.tsx` 的 `metadata` 中添加：

```typescript
export const metadata: Metadata = {
  // ... 其他配置
  verification: {
    google: '你的Google验证码',
    baidu: '你的百度验证码',
  },
}
```

---

**现在就可以开始提交搜索引擎了！** 🎉

建议优先提交 Google 和 百度，这两个搜索引擎覆盖了大部分用户。
