# Architecture Showcase - Vercel 部署指南

## 前置条件

1. [Vercel 账号](https://vercel.com)
2. [Supabase 项目](https://supabase.com)
3. [GitHub 仓库](https://github.com)

---

## 步骤 1：创建 Supabase 项目

1. 登录 [supabase.com](https://supabase.com)
2. 点击 **New Project**
3. 填写项目名称和数据库密码
4. 选择区域（推荐：Northeast Asia / Singapore）
5. 等待项目创建完成

## 步骤 2：初始化数据库

1. 在 Supabase Dashboard 中，进入 **SQL Editor**
2. 复制 `supabase/schema.sql` 的全部内容
3. 粘贴并点击 **Run** 执行
4. 确认所有表已创建（Table Editor 中可见 cases, case_images, smart_cases）

## 步骤 3：获取 API 密钥

在 Supabase Dashboard → **Settings** → **API** 中：
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## 步骤 4：导入数据

1. 更新 `.env.local` 中的 Supabase 凭证
2. 运行导入脚本：
   ```bash
   node scripts/import-to-supabase.js
   ```
3. 确认 10 个案例全部导入成功

## 步骤 5：推送到 GitHub

```bash
git add .
git commit -m "feat: add Supabase migration and Vercel deployment config"
git push origin main
```

## 步骤 6：部署到 Vercel

1. 登录 [vercel.com](https://vercel.com)
2. 点击 **Add New** → **Project**
3. 导入 GitHub 仓库
4. 配置环境变量（Settings → Environment Variables）：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase Service Role Key |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | 应用 URL |
| `ZAI_API_KEY` | `xxx` | 智谱 API Key |
| `TAVILY_API_KEY` | `tvly-xxx` | Tavily API Key |

5. 点击 **Deploy**
6. 等待部署完成

## 步骤 7：验证

- 访问 `https://your-domain.vercel.app`
- 确认首页案例加载正常
- 测试搜索功能
- 测试全网搜索 → AI 提取

---

## 注意事项

### 图片路径
- 本地图片（`/images/cases/`）需要上传到 Supabase Storage 或使用外部 CDN
- 建议将图片上传到 Supabase Storage 的 `case-images` bucket

### 环境变量
- `service_role` key 永远不要暴露到客户端
- 只在 API 路由（`app/api/`）中使用 `supabaseAdmin`

### 性能优化
- Supabase 查询已配置索引
- 前端可使用 Next.js ISR 或 SSG 缓存
- 考虑添加 Redis 缓存热门查询
