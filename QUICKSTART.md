# 后台管理系统 - 快速开始

## 📋 已实现功能

✅ 案例管理（列表、新增、编辑、删除）
✅ 图片上传
✅ 权限验证（管理员）
✅ Supabase 数据库集成

## 🚀 5 分钟快速上手

### 1️⃣ 安装依赖

```bash
cd architecture-showcase
npm install
```

### 2️⃣ 配置环境变量

编辑 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3️⃣ 初始化数据库

在 Supabase SQL Editor 中执行：

```sql
-- 创建 cases 表
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  architect VARCHAR(100),
  location VARCHAR(255),
  year INTEGER,
  area FLOAT,
  height FLOAT,
  style VARCHAR(100),
  image_url VARCHAR(500),
  is_published BOOLEAN DEFAULT true
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_cases_category ON cases(category);
CREATE INDEX IF NOT EXISTS idx_cases_is_published ON cases(is_published);

-- 创建存储桶
CREATE STORAGE IF NOT EXISTS cases_images;
GRANT USAGE ON STORAGE cases_images TO authenticated;
GRANT READ ON STORAGE cases_images TO authenticated;
GRANT INSERT ON STORAGE cases_images TO authenticated;
GRANT UPDATE ON STORAGE cases_images TO authenticated;

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4️⃣ 创建管理员账号

#### 方式 A: Supabase Dashboard

1. 登录 Supabase Dashboard
2. Authentication → Users
3. Add User
4. 设置邮箱和密码
5. 在 User Attributes 添加：
   ```json
   {
     "role": "admin"
   }
   ```

#### 方式 B: API（需要管理员权限）

```bash
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
```

### 5️⃣ 启动开发服务器

```bash
npm run dev
```

### 6️⃣ 访问后台

1. 打开浏览器：`http://localhost:3000/admin`
2. 使用管理员账号登录
3. 开始管理案例！

---

## 📁 项目结构

```
architecture-showcase/
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   ├── cases/
│   │   │   │   ├── new/page.tsx      # 新增案例页面
│   │   │   │   └── [id]/page.tsx     # 编辑案例页面
│   │   │   └── layout.tsx            # 管理员布局
│   │   └── api/
│   │       └── admin/
│   │           ├── cases/            # 案例 CRUD API
│   │           ├── cases/[id]/
│   │           └── upload/           # 图片上传 API
│   └── lib/
│       ├── auth.ts                   # 权限验证
│       └── supabase.ts               # Supabase 客户端
├── migrations/
│   └── 001_create_cases_table.sql    # 数据库迁移
└── ADMIN_GUIDE.md                    # 详细使用指南
```

---

## 🔑 关键文件说明

| 文件 | 说明 |
|------|------|
| `ADMIN_GUIDE.md` | 完整使用指南和 API 文档 |
| `src/app/api/admin/cases/route.ts` | 获取和创建案例 API |
| `src/app/api/admin/cases/[id]/route.ts` | 更新和删除案例 API |
| `src/app/api/admin/upload/route.ts` | 图片上传 API |
| `src/components/admin/CaseForm.tsx` | 案例表单组件 |
| `src/app/(admin)/cases/page.tsx` | 案例管理列表页 |

---

## ⚠️ 注意事项

1. **环境变量**：`.env.local` 包含敏感信息，不要提交到 Git
2. **数据库**：确保执行了数据库迁移脚本
3. **存储桶**：确保 Supabase Storage 存储桶已创建
4. **权限**：只有管理员角色可以访问 `/admin` 路径

---

## 🆘 常见问题

**Q: 图片上传失败？**
A: 检查 Supabase Storage 配置和 RLS 策略

**Q: 无法访问 /admin？**
A: 确保使用管理员账号登录

**Q: 数据显示为空？**
A: 检查数据库中的 cases 表是否有数据

---

## 📖 详细文档

查看 `ADMIN_GUIDE.md` 获取完整文档，包括：
- API 详细说明
- 数据库表结构
- 安全注意事项
- 常见问题解答
- 下一步改进建议

---

**祝使用愉快！** 🎉
