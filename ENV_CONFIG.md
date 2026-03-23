# Architecture Showcase 项目环境变量配置

**版本**：1.0.0
**创建时间**：2026-03-05
**项目**：architecture-showcase

---

## 🔐 Supabase 配置

### 获取 Supabase 配置信息

1. 访问 https://supabase.com/
2. 选择项目：Architecture Showcase
3. 点击 "Settings" > "API"
4. 复制以下信息：
   - Project URL
   - anon public key
   - service_role secret key

---

## 📝 环境变量文件

### .env.local 文件

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### .env.example 文件

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## 🚀 配置步骤

### 步骤 1：创建 .env.local 文件

```bash
# 在项目根目录创建 .env.local 文件
touch .env.local
```

### 步骤 2：填入 Supabase 配置信息

```bash
# 编辑 .env.local 文件
nano .env.local
```

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 步骤 3：重启开发服务器

```bash
# 停止开发服务器
Ctrl + C

# 重新启动开发服务器
npm run dev
```

---

## 🧠 测试配置

### 测试 1：检查环境变量

```bash
# 在 .env.local 文件中打印环境变量
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);
```

### 测试 2：测试 Supabase 连接

```typescript
// lib/test-supabase.ts
import { supabase } from '@/lib/supabase';

async function testSupabaseConnection() {
  const { data, error } = await supabase.from('users').select('*').limit(1);

  if (error) {
    console.error('Supabase 连接失败:', error);
  } else {
    console.log('Supabase 连接成功:', data);
  }
}

testSupabaseConnection();
```

---

## 💡 注意事项

### 1. 不要提交 .env.local 文件

```markdown
⚠️ **重要**：不要将 .env.local 文件提交到 Git

原因：
- .env.local 文件包含敏感信息（API 密钥、数据库密码等）
- 提交到 Git 会导致敏感信息泄露

解决方案：
- 使用 .gitignore 文件忽略 .env.local 文件
- 使用 .env.example 文件提供环境变量模板
```

### 2. .gitignore 文件

```gitignore
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env.local
```

### 3. 环境变量类型

```markdown
NEXT_PUBLIC_*：公开变量
- 可以在客户端访问
- 用于 Supabase 客户端连接

NEXT_SECRET_* 或无 NEXT_PUBLIC_*：私有变量
- 只能在服务端访问
- 用于 Supabase 服务端连接（service_role key）
```

---

## 📊 环境变量优先级

```
开发环境：
1. .env.local（最高优先级）
2. .env.development.local
3. .env.local
4. .env.development

生产环境：
1. .env.production.local
2. .env.production
3. .env
```

---

**配置指南创建时间**：2026-03-05 22:20
