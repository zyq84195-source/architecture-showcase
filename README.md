# Architecture Showcase Website

An architecture case showcase website built with Next.js 15, React 18, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Production
```bash
npm run build
npm start
```

## 📋 Project Structure

```
architecture-showcase/
├── src/
│   ├── app/
│   │   ├── (admin)/          # 管理后台
│   │   │   ├── cases/        # 案例管理
│   │   │   └── layout.tsx    # 管理员布局
│   │   ├── api/
│   │   │   └── admin/        # 管理员 API
│   │   ├── (public)/         # 公开页面
│   │   ├── cases/            # 案例详情
│   │   ├── search/           # 搜索
│   │   ├── auth/             # 认证
│   │   └── layout.tsx        # 公开布局
│   ├── components/
│   │   ├── admin/            # 管理组件
│   │   │   └── CaseForm.tsx  # 案例表单
│   │   └── ui/               # UI 组件
│   ├── lib/
│   │   ├── auth.ts           # 权限验证
│   │   └── supabase.ts       # Supabase 客户端
│   └── data/
│       └── cases.json        # 案例数据
├── public/
│   ├── images/
│   │   └── cases/            # 案例图片
│   └── data/
│       └── cases.json
├── scripts/
│   ├── import-cases.js       # 案例数据导入
│   ├── upload-image.js       # 图片上传
│   └── full-import.js        # 完整导入（推荐）
├── migrations/
│   └── 001_create_cases_table.sql  # 数据库迁移
├── ADMIN_GUIDE.md            # 管理后台详细指南
├── IMPORT_GUIDE.md           # 数据导入详细指南
└── QUICKSTART.md             # 快速开始指南
```

## 🎨 Features

- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Dark mode support
- ✅ TypeScript with strict mode
- ✅ ESLint configuration
- ✅ Tailwind CSS v3.3
- ✅ Case listing and details
- ✅ Search and filtering
- ✅ User authentication (UI ready)
- ✅ Admin dashboard (案例管理、图片上传)
- ✅ Optimized images (AVIF, WebP)

## 📊 Data

- 20 architecture cases
- 78 images
- 12 structured fields per case
- 57.9% extraction rate

## 🗄️ Database

项目使用 Supabase 作为数据库和存储服务。

### 初始化数据库

在 Supabase SQL Editor 中执行 `migrations/001_create_cases_table.sql`：

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

## 📤 Import Data

### 快速导入（推荐）

1. **复制 Supabase Service Role Key**

   在 Supabase Dashboard 中：
   - 进入 **Settings** → **API**
   - 复制 **service_role** key

2. **运行导入脚本**

   ```bash
   # Windows
   set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   node scripts/full-import.js

   # 或者直接运行批处理脚本
   import.bat
   ```

3. **查看导入结果**

   脚本会自动：
   - 导入所有案例数据
   - 上传案例图片到 Supabase Storage
   - 跳过已存在的案例

**详细指南**：查看 [IMPORT_GUIDE.md](IMPORT_GUIDE.md)

## 🔐 Admin Dashboard

### 访问管理后台

1. 启动开发服务器：`npm run dev`
2. 访问：`http://localhost:3000/admin`
3. 使用管理员账号登录

### 创建管理员账号

在 Supabase Dashboard 中：
- 进入 **Authentication** → **Users**
- 点击 **Add user**
- 设置邮箱和密码
- 在 **User Attributes** 中添加：
  ```json
  {
    "role": "admin"
  }
  ```

**详细指南**：查看 [ADMIN_GUIDE.md](ADMIN_GUIDE.md)

## 🚀 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Initialize database: 执行 SQL 迁移脚本
3. ✅ Import data: 运行 `node scripts/full-import.js`
4. ✅ Create admin: 在 Supabase Dashboard 创建管理员
5. ✅ Start development: `npm run dev`
6. ✅ Access admin: `http://localhost:3000/admin`

## 📚 Documentation

- [IMPORT_GUIDE.md](IMPORT_GUIDE.md) - 数据导入详细指南
- [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - 管理后台详细指南
- [QUICKSTART.md](QUICKSTART.md) - 快速开始指南

## 🔑 Environment Variables

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🐛 Troubleshooting

### Import failed
- Check if SUPABASE_SERVICE_ROLE_KEY is set
- Verify database table exists
- Check network connection

### Admin access denied
- Ensure you are logged in as admin user
- Check user role in User Attributes

### Images not showing
- Verify images folder exists
- Check Supabase Storage permissions

---

Built with ❤️ using Next.js 15
