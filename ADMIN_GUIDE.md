# 后台管理系统使用指南

## 功能概述

已实现的案例管理后台功能：

### 1. 案例管理
- ✅ 案例列表展示（分页、搜索、过滤）
- ✅ 新增案例
- ✅ 编辑案例
- ✅ 删除案例
- ✅ 图片上传（使用 Supabase Storage）

### 2. 权限控制
- ✅ 管理员认证
- ✅ 角色验证（只有管理员可以访问后台）
- ✅ 会话管理

### 3. 数据库集成
- ✅ Supabase 数据库集成
- ✅ 案例数据存储
- ✅ 图片存储

---

## 快速开始

### 步骤 1: 安装依赖

```bash
cd architecture-showcase
npm install
```

### 步骤 2: 配置环境变量

编辑 `.env.local` 文件，填入你的 Supabase 信息：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 步骤 3: 初始化数据库

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 执行 `migrations/001_create_cases_table.sql` 中的 SQL 语句

### 步骤 4: 创建管理员用户

#### 方法 1: 通过 Supabase Dashboard

1. 进入 Authentication → Users
2. 点击 "Add User"
3. 输入邮箱和密码
4. 在 User Attributes 中添加自定义角色：
   ```json
   {
     "role": "admin"
   }
   ```

#### 方法 2: 通过 API（需要管理员权限）

```bash
# 注册用户
curl -X POST https://your-project.supabase.co/auth/v1/register \
  -H "apikey: your_service_role_key" \
  -H "Authorization: Bearer your_service_role_key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "user_metadata": {
      "role": "admin"
    }
  }'

# 获取登录 token
curl -X POST https://your-project.supabase.co/auth/v1/token \
  -H "apikey: your_service_role_key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### 步骤 5: 启动开发服务器

```bash
npm run dev
```

### 步骤 6: 访问管理后台

1. 打开浏览器访问：`http://localhost:3000/admin`
2. 使用管理员账号登录
3. 进入案例管理页面

---

## 功能使用说明

### 案例列表

- **搜索**：在搜索框中输入关键词，按回车搜索
- **分类过滤**：选择分类过滤案例
- **新增案例**：点击右上角"新增案例"按钮
- **编辑案例**：点击案例卡片上的编辑图标
- **删除案例**：点击删除图标，确认后删除

### 新增/编辑案例

填写以下信息：

1. **必填项**：
   - 标题

2. **可选项**：
   - 分类
   - 图片（支持上传）
   - 描述
   - 建筑师
   - 地点
   - 年份
   - 建筑面积
   - 建筑高度
   - 风格

3. **发布状态**：
   - 默认发布状态为"已发布"
   - 可以在保存后修改

### 图片上传

- 点击"选择图片"按钮上传图片
- 支持格式：JPG、PNG、GIF
- 文件大小限制：10MB
- 图片会自动上传到 Supabase Storage
- 生成公开 URL 用于展示

---

## API 文档

### 获取所有案例

```
GET /api/admin/cases
```

**查询参数**：
- `q`: 搜索关键词
- `category`: 分类
- `is_published`: 是否发布（true/false）

**响应示例**：
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "案例标题",
      "category": "住宅",
      "architect": "建筑师",
      "location": "地点",
      "year": 2020,
      "area": 5000,
      "height": 50,
      "style": "现代简约",
      "image_url": "https://...",
      "is_published": true,
      "created_at": "2026-03-10T00:00:00Z",
      "updated_at": "2026-03-10T00:00:00Z"
    }
  ]
}
```

### 创建案例

```
POST /api/admin/cases
```

**请求体**：
```json
{
  "title": "案例标题",
  "description": "案例描述",
  "category": "住宅",
  "architect": "建筑师",
  "location": "地点",
  "year": 2020,
  "area": 5000,
  "height": 50,
  "style": "现代简约",
  "image_url": "https://...",
  "is_published": true
}
```

### 更新案例

```
PUT /api/admin/cases/[id]
```

### 删除案例

```
DELETE /api/admin/cases/[id]
```

### 上传图片

```
POST /api/admin/upload
```

**请求体**：
- `file`: 图片文件

**响应示例**：
```json
{
  "success": true,
  "url": "https://...",
  "filename": "cases/1234567890-abc123.jpg"
}
```

---

## 数据库表结构

### cases 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |
| title | VARCHAR(255) | 标题 |
| description | TEXT | 描述 |
| category | VARCHAR(100) | 分类 |
| architect | VARCHAR(100) | 建筑师 |
| location | VARCHAR(255) | 地点 |
| year | INTEGER | 年份 |
| area | FLOAT | 建筑面积 |
| height | FLOAT | 建筑高度 |
| style | VARCHAR(100) | 风格 |
| image_url | VARCHAR(500) | 图片 URL |
| is_published | BOOLEAN | 是否发布 |

---

## Supabase Storage 配置

已创建的存储桶：

- **名称**：cases_images
- **权限**：
  - Usage: authenticated
  - Read: authenticated
  - Insert: authenticated
  - Update: authenticated

确保在 Supabase Dashboard 中配置了正确的 RLS 策略。

---

## 安全注意事项

1. **保护 Service Role Key**：
   - `SUPABASE_SERVICE_ROLE_KEY` 具有完全访问权限，**绝不要**暴露在前端
   - 只在后端 API 中使用

2. **验证用户身份**：
   - 所有管理员 API 都需要用户登录
   - 只有管理员角色可以访问

3. **文件上传验证**：
   - 限制文件类型（只允许图片）
   - 限制文件大小（10MB）
   - 验证文件内容

4. **SQL 注入防护**：
   - 使用 Supabase 的参数化查询
   - 避免直接拼接 SQL 语句

---

## 常见问题

### Q: 如何重置管理员密码？

A: 在 Supabase Dashboard 中进入 Authentication → Users，找到管理员用户，点击 "Reset password"。

### Q: 如何添加更多管理员？

A: 按照上面的步骤 4 方法 1，为每个管理员设置 `"role": "admin"`。

### Q: 图片上传失败？

A: 检查：
1. Supabase Storage 存储桶是否存在
2. RLS 策略是否正确配置
3. 文件大小是否超过 10MB
4. 文件类型是否正确

### Q: 删除案例后如何恢复？

A: 数据库不支持软删除，建议在删除前备份。可以通过数据库备份功能恢复数据。

### Q: 如何批量导入案例？

A: 可以创建一个批量导入脚本，一次性插入多个案例。参考 `migrations/001_create_cases_table.sql` 的结构。

---

## 下一步改进建议

1. **分页功能**：添加案例分页支持，提高大数据量下的性能
2. **缓存优化**：添加 Redis 缓存，减少数据库查询
3. **审核流程**：添加案例审核机制（需要教授审核）
4. **导出功能**：支持导出案例为 Excel 或 PDF
5. **权限细化**：添加更多角色（编辑、审核员等）
6. **日志记录**：记录所有管理操作，便于审计
7. **图片优化**：自动压缩和优化上传的图片
8. **搜索优化**：添加全文搜索支持
9. **REST API**：提供完整的 REST API 文档
10. **测试覆盖**：添加单元测试和集成测试

---

## 技术栈

- **前端**：Next.js 14 (App Router)、React 18、TypeScript、Tailwind CSS
- **后端**：Next.js API Routes
- **数据库**：Supabase PostgreSQL
- **存储**：Supabase Storage
- **认证**：Supabase Auth
- **UI 组件**：Lucide React、Radix UI

---

## 更新日志

### 2026-03-11

- ✅ 实现案例管理列表页面
- ✅ 实现新增/编辑案例表单
- ✅ 实现图片上传功能
- ✅ 实现权限验证（管理员角色）
- ✅ 创建 API 路由（CRUD）
- ✅ 创建数据库迁移脚本
- ✅ 创建管理后台布局
- ✅ 创建认证工具函数

---

**维护者**：Lotus (主智能体)
**最后更新**：2026-03-11
