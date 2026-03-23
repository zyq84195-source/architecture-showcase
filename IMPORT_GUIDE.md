# 案例数据导入指南

## 📋 准备工作

### 1. 获取 Supabase Service Role Key

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目 **showcase-website**
3. 进入 **Settings** → **API**
4. 在 **Project API keys** 中找到 **service_role** key
5. 复制这个 key（⚠️ 请妥善保管，不要暴露在前端）

---

## 🚀 快速导入（推荐）

### Windows 用户

1. **复制 Supabase Service Role Key**

2. **运行导入脚本**

双击运行：`import.bat`

或者在命令行中：
```bash
cd C:\Users\zyq15\.openclaw\workspace\architecture-showcase
set SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
node scripts/full-import.js
```

---

## 🔧 手动导入

### 方式 A：使用批处理脚本（推荐）

```bash
# 设置环境变量
set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 运行导入
node scripts/full-import.js
```

### 方式 B：直接运行 Node.js 脚本

```bash
# 设置环境变量
set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 运行完整导入（案例数据 + 图片）
node scripts/full-import.js
```

### 方式 C：只导入案例数据（不包含图片）

```bash
# 设置环境变量
set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 只导入案例数据
node scripts/import-cases.js
```

---

## 📊 导入内容

### full-import.js 包含：

1. **案例数据导入**
   - 读取 `src/data/cases.json` 中的所有案例
   - 自动识别分类（住宅、商业、公共建筑等）
   - 提取关键信息（标题、描述、地点、面积、年份等）
   - 自动跳过已存在的案例

2. **图片导入**（可选）
   - 上传案例图片到 Supabase Storage
   - 更新数据库中的图片 URL
   - 支持多张图片的案例

---

## 📈 导入进度

脚本运行时会显示详细进度：

```
============================================================
📋 案例数据导入工具
============================================================
📊 读取到 20 个案例
🔗 Supabase 项目: https://showcase-website.supabase.co
============================================================

🚀 开始导入案例数据...

[001] 南京老城南小西湖街区保护与再生项目
   ✅ 导入成功 (ID: 123e4567-e89b-12d3-a456-426614174000)
      分类: 住宅
      地点: 江苏省, 南京, 秦淮
      面积: 46,900 ㎡
      年份: 2015
      图片: 有

[002] ...
   ✅ 导入成功
   ...

============================================================
📊 导入总结
============================================================
✅ 成功导入: 20 个案例
⏭️  跳过已存在: 0 个案例
❌ 导入失败: 0 个案例
============================================================
```

---

## ⚠️ 注意事项

### 1. Service Role Key 安全性

⚠️ **重要**：`service_role` key 具有完全访问权限，可以绕过所有 RLS 策略。

- **不要**在前端代码中使用
- **不要**提交到 Git
- **只**在服务器端或脚本中使用

### 2. 数据库表结构

确保数据库中已创建 `cases` 表：

```sql
CREATE TABLE cases (
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

CREATE INDEX idx_cases_category ON cases(category);
CREATE INDEX idx_cases_is_published ON cases(is_published);
```

### 3. 存储桶

确保已创建 `cases_images` 存储桶并设置权限为 **Public**。

### 4. 图片文件

图片文件位于 `src/public/images/cases/` 目录。

如果图片文件不存在，导入脚本会跳过该图片。

---

## 🐛 常见问题

### Q1: 导入时提示 "未找到 SUPABASE_SERVICE_ROLE_KEY"

**A**: 按照上述步骤设置环境变量：

```bash
set SUPABASE_SERVICE_ROLE_KEY=your_actual_key
```

### Q2: 导入失败，提示权限错误

**A**:
1. 检查 Supabase 项目名称是否正确
2. 确认已登录正确的 Supabase 账号
3. 检查网络连接

### Q3: 图片导入失败

**A**:
1. 检查图片文件是否存在：`src/public/images/cases/`
2. 检查存储桶 `cases_images` 是否已创建
3. 检查存储桶权限是否设置为 Public

### Q4: 数据重复导入

**A**: 脚本会自动跳过已存在的案例（根据标题判断），不会重复导入。

### Q5: 数据库连接失败

**A**:
1. 检查 Supabase 项目 URL 是否正确
2. 检查网络连接
3. 确认 Supabase 项目已启动

---

## 📝 数据映射说明

导入脚本会自动转换以下字段：

| 源字段 | 目标字段 | 说明 |
|--------|----------|------|
| tags | category | 根据 tags 内容自动分类 |
| location (数组) | location | 合并为字符串 |
| scale | area | 提取数字 |
| _raw.起止时间 | year | 提取年份 |
| _raw.参与主体 | architect | 复制参与主体信息 |
| images (数组) | image_url | 使用第一张图片 |

---

## 🔄 更新已有案例

如果需要更新已导入的案例数据，可以直接修改 `src/data/cases.json`，然后重新运行导入脚本。

脚本会自动检测已存在的案例并跳过。

---

## 🎯 下一步

导入完成后：

1. **访问管理后台**：打开浏览器访问 `http://localhost:3000/admin`
2. **登录管理员账号**：使用之前创建的管理员账号登录
3. **查看案例列表**：确认所有案例都已成功导入
4. **测试图片上传**：尝试上传新的案例图片

---

**需要帮助？**

如果遇到问题，请检查：
1. 环境变量是否正确设置
2. Supabase 项目是否正常运行
3. 数据库表和存储桶是否已创建
4. 图片文件是否存在

**祝导入成功！** 🎉
