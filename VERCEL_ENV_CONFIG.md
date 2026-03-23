# Vercel 环境变量配置指南

**集成时间**: 2026-03-23
**项目**: architecture-showcase

---

## 📋 需要配置的环境变量

### Architecture Search Framework 配置

在 Vercel 项目设置中，添加以下环境变量：

```
ZAI_API_KEY=9546abcd96dd456bbd880ae3bb1ac917.li0XljgB4bTXhinx
TAVILY_API_KEY=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
```

---

## 🚀 配置步骤

### 步骤 1：访问 Vercel 项目

1. 访问 https://vercel.com/dashboard
2. 找到你的 `architecture-showcase` 项目
3. 点击项目进入项目设置

---

### 步骤 2：添加环境变量

1. 点击 **Settings** 标签页
2. 点击左侧菜单的 **Environment Variables**
3. 点击 **Add New** 按钮
4. 添加第一个环境变量：

   ```
   Key: ZAI_API_KEY
   Value: 9546abcd96dd456bbd880ae3bb1ac917.li0XljgB4bTXhinx
   Environment: All (Production, Preview, Development)
   ```

5. 点击 **Save**
6. 重复步骤 4-5，添加第二个环境变量：

   ```
   Key: TAVILY_API_KEY
   Value: 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
   Environment: All (Production, Preview, Development)
   ```

7. 点击 **Save**

---

### 步骤 3：触发重新部署

添加环境变量后，Vercel 会自动触发重新部署。

如果你想手动触发：

1. 点击 **Deployments** 标签页
2. 找到最新的部署
3. 点击右侧的 **...** 菜单
4. 选择 **Redeploy**

---

### 步骤 4：验证部署

等待部署完成后，访问以下 URL 验证功能：

1. **搜索页面**: `https://architecture-showcase.vercel.app/search`
2. **全网搜索 API**: `https://architecture-showcase.vercel.app/api/web-search?q=建筑案例`
3. **对比分析 API**: `https://architecture-showcase.vercel.app/api/web-compare` (POST)

---

## 🧪 测试清单

### 1. 测试搜索页面

- [ ] 访问搜索页面，页面正常加载
- [ ] 可以切换搜索模式（内部搜索 / 全网搜索）
- [ ] 内部搜索功能正常
- [ ] 全网搜索功能正常
- [ ] 搜索结果正确显示

### 2. 测试全网搜索 API

使用 curl 测试：

```bash
curl "https://architecture-showcase.vercel.app/api/web-search?q=建筑案例 历史保护"
```

预期响应：

```json
{
  "success": true,
  "query": "建筑案例 历史保护",
  "count": 5,
  "data": [...]
}
```

### 3. 测试对比分析 API

使用 curl 测试：

```bash
curl -X POST https://architecture-showcase.vercel.app/api/web-compare \
  -H "Content-Type: application/json" \
  -d '{"results": [...], "enableSemantic": false}'
```

预期响应：

```json
{
  "success": true,
  "extractedFields": {...},
  "statistics": {...},
  "comparisonMarkdown": "..."
}
```

---

## ⚠️ 常见问题

### 问题 1：环境变量未生效

**症状**：
```
Error: ZAI_API_KEY is not defined
```

**解决方案**：
1. 检查 Vercel 项目设置中的环境变量是否正确添加
2. 确保环境变量添加到了所有环境（Production, Preview, Development）
3. 触发重新部署

---

### 问题 2：API Key 无效

**症状**：
```
Error: 401 Unauthorized
```

**解决方案**：
1. 检查 API Key 是否正确复制
2. 确认 API Key 余额充足
3. 查看 Vercel 部署日志，确认环境变量已正确加载

---

### 问题 3：搜索功能失败

**症状**：
```
Error: Search failed
```

**解决方案**：
1. 查看 Vercel 部署日志
2. 检查 API Key 是否有效
3. 确认网络连接正常

---

## 📝 补充说明

### 环境变量说明

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `ZAI_API_KEY` | Z.AI 模型 API Key | ✅ 是 |
| `TAVILY_API_KEY` | Tavily 搜索引擎 API Key | ✅ 是 |

### API Key 来源

- **Z.AI_API_KEY**: Architecture Search Framework 项目的 `.env` 文件
- **TAVILY_API_KEY**: Architecture Search Framework 项目的 `.env` 文件

---

## 🔒 安全提醒

⚠️ **重要安全提示**：

1. ✅ 环境变量已添加到 `.env.local`，不会被提交到 Git
2. ✅ 在 Vercel 中配置环境变量，不要直接写在代码中
3. ⚠️ 不要将真实的 API Keys 提交到 Git
4. ⚠️ 定期更换 API Keys，提高安全性

---

## 📚 相关文档

- [Architecture Search Framework 文档](../architecture-search-framework/README.md)
- [集成更新文档](FRAMEWORK_INTEGRATION_UPDATE.md)
- [Vercel 环境变量文档](https://vercel.com/docs/projects/environment-variables)

---

**文档创建时间**: 2026-03-23 21:00
**版本**: 1.0.0
