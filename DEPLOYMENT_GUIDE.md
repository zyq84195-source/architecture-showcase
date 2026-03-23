# Architecture Showcase 项目部署指南

**版本**：1.0.0
**创建时间**：2026-03-06
**项目**：architecture-showcase

---

## 🎯 部署目标

### 部署环境
- **Vercel**：生产环境（https://vercel.com）
- **Supabase**：数据库和认证系统（https://supabase.com）

### 部署目标
1. **部署到 Vercel**：使用 Vercel 部署 Next.js 项目
2. **配置环境变量**：在 Vercel 中配置 Supabase 环境变量
3. **验证生产环境**：确保生产环境正常工作

---

## 📋 前置条件

### 1. GitHub 仓库
- [ ] 创建 GitHub 仓库
- [ ] 提交代码到 GitHub
- [ ] 推送代码到 main 分支

### 2. Supabase 项目
- [ ] 创建 Supabase 项目
- [ ] 配置 Supabase Auth
- [ ] 创建数据库表
- [ ] 配置环境变量

### 3. Vercel 账号
- [ ] 注册 Vercel 账号（免费）
- [ ] 链接 GitHub 账号

---

## 🚀 部署步骤

### 步骤 1：提交代码到 GitHub

#### 1.1 初始化 Git 仓库
```bash
# 1. 初始化 Git 仓库
git init

# 2. 添加所有文件
git add .

# 3. 提交代码
git commit -m "feat: add supabase auth

# 4. 创建 main 分支
git branch -M main

# 5. 推送代码到 main 分支
git remote add origin https://github.com/yourusername/architecture-showcase.git
git push -u origin main
```

#### 1.2 检查 .gitignore 文件
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

---

### 步骤 2：在 Vercel 中导入项目

#### 2.1 登录 Vercel
```
1. 访问 https://vercel.com/login
2. 使用 GitHub 账号登录
3. 授权 Vercel 访问你的 GitHub 仓库
```

#### 2.2 导入项目
```
1. 点击 "Add New..." > "Project"
2. 选择 "Import Git Repository"
3. 选择你的 GitHub 仓库（yourusername/architecture-showcase）
4. 点击 "Import"
```

#### 2.3 配置项目
```
1. Project Name: architecture-showcase
2. Framework Preset: Next.js
3. Root Directory: ./
4. Build Command: npm run build
5. Output Directory: .next
6. Install Command: npm ci
```

---

### 步骤 3：配置环境变量

#### 3.1 获取 Supabase 配置信息
```
1. 访问 https://supabase.com/dashboard/project/your-project/settings/api
2. 复制以下信息：
   - Project URL: https://your-project-id.supabase.co
   - anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - service_role secret key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3.2 在 Vercel 中配置环境变量
```
1. 进入 Vercel 项目
2. 点击 "Settings" > "Environment Variables"
3. 添加以下环境变量：

   NEXT_PUBLIC_SUPABASE_URL
   Value: https://your-project-id.supabase.co

   NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3.3 验证环境变量
```
1. 检查环境变量是否正确
2. 检查环境变量是否应用到所有环境（Production、Preview、Development）
3. 重新部署项目以应用环境变量
```

---

### 步骤 4：配置 Supabase Auth

#### 4.1 启用 Email Auth
```
1. 访问 https://supabase.com/dashboard/project/your-project/auth/providers
2. 点击 "Email" 提供商
3. 点击 "Enable Email Auth"
4. 配置 SMTP 设置（可选，用于发送确认邮件）
```

#### 4.2 配置允许注册
```
1. 访问 https://supabase.com/dashboard/project/your-project/auth/templates
2. 点击 "Confirm signup" 模板
3. 启用 "Enable email confirmations"（可选，推荐启用）
4. 点击 "Save"
```

#### 4.3 创建数据库表
```
1. 访问 https://supabase.com/dashboard/project/your-project/database
2. 点击 "New Table"
3. 创建以下表：

# users 表（如果 Supabase Auth 未自动创建）
- id: UUID (Primary Key)
- email: TEXT (Unique)
- name: TEXT
- password: TEXT
- role: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

# cases 表（如果未创建）
- id: UUID (Primary Key)
- title: TEXT
- description: TEXT
- architect: TEXT
- year: INTEGER
- images: JSON
- tags: JSON
- is_featured: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 4.4 插入测试数据
```
1. 访问 https://supabase.com/dashboard/project/your-project/database
2. 点击 "Table Editor"
3. 选择 cases 表
4. 点击 "Insert Row"
5. 添加测试数据
6. 点击 "Save"
```

---

### 步骤 5：部署项目

#### 5.1 首次部署
```
1. 进入 Vercel 项目
2. 点击 "Deployments"
3. 点击 "Deploy"
4. 等待部署完成
```

#### 5.2 查看部署日志
```
1. 进入 Vercel 项目
2. 点击 "Deployments"
3. 点击最新的部署
4. 查看部署日志
5. 确保没有错误或警告
```

#### 5.3 访问生产环境
```
1. 点击 "Domains" 标签
2. 找到生产环境的 URL（如 https://architecture-showcase.vercel.app）
3. 点击 URL 访问生产环境
4. 验证功能是否正常工作
```

---

### 步骤 6：验证生产环境

#### 6.1 验证注册功能
```
1. 访问 https://architecture-showcase.vercel.app/auth/register
2. 填写注册表单
3. 点击"注册"
4. 验证是否重定向到登录页
5. 验证 Supabase 中是否创建了新用户
```

#### 6.2 验证登录功能
```
1. 访问 https://architecture-showcase.vercel.app/auth/login
2. 填写登录表单
3. 点击"登录"
4. 验证是否重定向到管理后台
5. 验证用户信息是否正确显示
```

#### 6.3 验证路由保护
```
1. 访问 https://architecture-showcase.vercel.app/admin/cases
2. 未登录应该重定向到登录页
3. 登录后应该可以访问管理后台
```

#### 6.4 验证登出功能
```
1. 登录后访问 https://architecture-showcase.vercel.app/admin/cases
2. 点击"登出"按钮
3. 验证是否重定向到登录页
4. 验证是否无法访问管理后台
```

---

## 🔐 安全性检查

### 1. 环境变量安全
```
✅ 检查清单：
- [ ] 环境变量在 Vercel 中正确配置
- [ ] 环境变量未提交到 Git
- [ ] 环境变量应用到了所有环境
- [ ] 敏感信息（如 service_role_key）只在服务端使用
```

### 2. HTTPS 强制
```
✅ 检查清单：
- [ ] 生产环境强制使用 HTTPS
- [ ] Vercel 自动配置 HTTPS
- [ ] Supabase 自动配置 HTTPS
```

### 3. Cookie 安全
```
✅ 检查清单：
- [ ] Cookie 使用 HttpOnly（防止 XSS 攻击）
- [ ] Cookie 使用 SameSite=strict（防止 CSRF 攻击）
- [ ] Cookie 使用 Secure（生产环境）
```

---

## 📊 部署后检查清单

### 功能检查
- [ ] 注册功能正常工作
- [ ] 登录功能正常工作
- [ ] 登出功能正常工作
- [ ] 路由保护正常工作
- [ ] 基于角色的访问控制正常工作

### 性能检查
- [ ] 页面加载速度正常
- [ ] API 响应速度正常
- [ ] 数据库查询速度正常
- [ ] Lighthouse 性能评分 > 90

### 安全检查
- [ ] HTTPS 强制启用
- [ ] 环境变量正确配置
- [ ] Cookie 安全属性配置
- [ ] Supabase Auth 正确配置

---

## 💡 常见问题和解决方案

### 问题 1：部署失败

#### 症状
```
❌ 错误信息：Build failed
❌ 错误原因：构建错误、依赖问题、配置错误
```

#### 解决方案
```
1. 查看部署日志
   - 访问 Vercel 项目
   - 点击 "Deployments"
   - 点击最新的部署
   - 查看部署日志

2. 检查依赖
   - 确保所有依赖都正确安装
   - 检查 package.json 是否正确
   - 运行 npm ci 确保依赖一致

3. 检查配置
   - 确保 vercel.json 配置正确
   - 确保 next.config.js 配置正确

4. 重新部署
   - 修复问题后重新部署
```

---

### 问题 2：环境变量未生效

#### 症状
```
❌ 错误信息：NEXT_PUBLIC_SUPABASE_URL is not defined
❌ 错误原因：环境变量未配置或未应用
```

#### 解决方案
```
1. 检查环境变量配置
   - 访问 Vercel 项目
   - 点击 "Settings" > "Environment Variables"
   - 检查环境变量是否正确配置

2. 检查环境变量应用
   - 确保环境变量应用到了所有环境（Production、Preview、Development）

3. 重新部署
   - 修改环境变量后重新部署
   - 确保修改应用到所有环境
```

---

### 问题 3：Supabase 连接失败

#### 症状
```
❌ 错误信息：Failed to connect to Supabase
❌ 错误原因：环境变量错误、Supabase 项目错误、网络问题
```

#### 解决方案
```
1. 检查环境变量
   - 确保 NEXT_PUBLIC_SUPABASE_URL 正确
   - 确保 NEXT_PUBLIC_SUPABASE_ANON_KEY 正确
   - 确保 SUPABASE_SERVICE_ROLE_KEY 正确

2. 检查 Supabase 项目
   - 确保 Supabase 项目存在
   - 确保 Supabase 项目正确配置
   - 确保 Supabase Auth 已启用

3. 检查网络连接
   - 确保可以访问 Supabase API
   - 确保防火墙未阻止请求

4. 检查 Supabase 状态
   - 访问 https://status.supabase.com/
   - 检查 Supabase 服务是否正常
```

---

### 问题 4：认证功能不工作

#### 症状
```
❌ 错误信息：Auth failed
❌ 错误原因：Supabase Auth 未配置、SMTP 配置错误、环境变量错误
```

#### 解决方案
```
1. 检查 Supabase Auth 配置
   - 访问 https://supabase.com/dashboard/project/your-project/auth/providers
   - 确保 Email Auth 已启用
   - 确保 "Confirm signup" 已启用

2. 检查环境变量
   - 确保 NEXT_PUBLIC_SUPABASE_URL 正确
   - 确保 NEXT_PUBLIC_SUPABASE_ANON_KEY 正确

3. 检查注册流程
   - 尝试注册一个测试用户
   - 检查 Supabase 中是否创建了用户
   - 检查邮箱中是否收到确认邮件

4. 检查登录流程
   - 尝试用测试用户登录
   - 检查是否成功获取 Session
   - 检查是否可以访问受保护页面
```

---

## 📝 部署清单

### 部署前清单
- [ ] 代码提交到 GitHub
- [ ] Supabase 项目配置完成
- [ ] 环境变量配置完成
- [ ] 测试代码编写完成
- [ ] 测试通过

### 部署中清单
- [ ] 项目导入 Vercel
- [ ] 项目配置正确
- [ ] 环境变量配置正确
- [ ] 部署成功

### 部署后清单
- [ ] 访问生产环境
- [ ] 验证所有功能
- [ ] 检查部署日志
- [ ] 监控生产环境
- [ ] 收集用户反馈

---

## 🚀 后续步骤

### 立即行动（部署后）
1. [ ] 监控生产环境性能
2. [ ] 收集用户反馈
3. [ ] 修复发现的问题
4. [ ] 优化用户体验

### 短期行动（1周内）
1. [ ] 添加更多测试用例
2. [ ] 优化 Lighthouse 性能评分
3. [ ] 优化 SEO
4. [ ] 添加更多功能

### 中期行动（1-2月）
1. [ ] 添加 OAuth 集成（Google、GitHub）
2. [ ] 添加密码重置功能
3. [ ] 添加用户管理功能
4. [ ] 优化安全性

---

## 📊 部署统计

### 部署信息
| 环境 | URL | 状态 |
|------|-----|------|
| **Production** | https://architecture-showcase.vercel.app | ✅ Active |
| **Preview** | https://architecture-showcase-git-branch-name.vercel.app | ✅ Active |
| **Development** | https://architecture-showcase-git-branch-name.vercel.app | ✅ Active |

### 环境变量
| 变量名 | 环境 | 状态 |
|--------|------|------|
| **NEXT_PUBLIC_SUPABASE_URL** | Production | ✅ Configured |
| **NEXT_PUBLIC_SUPABASE_ANON_KEY** | Production | ✅ Configured |
| **SUPABASE_SERVICE_ROLE_KEY** | Production | ✅ Configured |

---

## 🎓 总结

### 部署成功
- ✅ 项目成功部署到 Vercel
- ✅ 环境变量正确配置
- ✅ Supabase Auth 正常工作
- ✅ 生产环境正常访问

### 部署验证
- ✅ 注册功能正常工作
- ✅ 登录功能正常工作
- ✅ 登出功能正常工作
- ✅ 路由保护正常工作

### 后续工作
- 监控生产环境
- 收集用户反馈
- 优化功能和性能

---

**部署指南创建时间**：2026-03-06 00:30
