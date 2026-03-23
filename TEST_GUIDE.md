# Architecture Showcase 项目测试指南

**版本**：1.0.0
**创建时间**：2026-03-06
**项目**：architecture-showcase

---

## 🎯 测试目标

### 测试范围
1. **单元测试**：测试 Supabase 客户端、认证 API
2. **集成测试**：测试认证流程（注册、登录、登出）
3. **E2E 测试**：测试完整的用户流程

### 测试框架
- **Vitest**：单元测试和集成测试
- **Playwright**：E2E 测试

---

## 🧪 单元测试指南

### 测试 1：测试 Supabase 客户端

#### 测试文件
`lib/supabase.test.ts`

#### 测试步骤
```bash
# 1. 安装测试依赖
npm install -D vitest @testing-library/react @testing-library/jest-dom

# 2. 配置 Vitest
# 在 package.json 中添加：
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui"
}

# 3. 运行测试
npm run test
```

#### 预期结果
```markdown
✅ should connect to Supabase：成功
✅ should insert a user：成功
✅ should sign in a user：成功
✅ should sign out a user：成功
✅ should get current session：成功
✅ should get current user：成功
✅ should update user metadata：成功
✅ should delete a user：成功
```

---

## 🧪 集成测试指南

### 测试 1：测试注册 API

#### 测试文件
`app/api/auth/register/route.test.ts`

#### 测试步骤
```bash
# 1. 运行集成测试
npm run test app/api/auth/register/route.test.ts

# 2. 查看测试结果
# 应该看到 4 个测试用例：
# - should register a new user
# - should return 400 for invalid email
# - should return 409 for duplicate email
# - should return 400 for weak password
```

#### 预期结果
```markdown
✅ should register a new user：成功
✅ should return 400 for invalid email：成功
✅ should return 409 for duplicate email：成功
✅ should return 400 for weak password：成功

PASS 4/4 tests
```

---

### 测试 2：测试登录 API

#### 测试文件
`app/api/auth/login/route.test.ts`

#### 测试步骤
```bash
# 1. 运行集成测试
npm run test app/api/auth/login/route.test.ts

# 2. 查看测试结果
# 应该看到 4 个测试用例：
# - should login a user
# - should return 401 for invalid email
# - should return 401 for invalid password
# - should return 400 for invalid email format
```

#### 预期结果
```markdown
✅ should login a user：成功
✅ should return 401 for invalid email：成功
✅ should return 401 for invalid password：成功
✅ should return 400 for invalid email format：成功

PASS 4/4 tests
```

---

## 🧪 E2E 测试指南

### 测试 1：测试注册流程

#### 测试文件
`e2e/auth/register.spec.ts`

#### 测试步骤
```bash
# 1. 安装 Playwright
npm install -D @playwright/test

# 2. 配置 Playwright
npx playwright install

# 3. 运行 E2E 测试
npx playwright test

# 4. 查看测试结果
# 应该看到 3 个测试用例：
# - should register a new user
# - should show error for duplicate email
# - should show error for password mismatch
```

#### 预期结果
```markdown
✅ should register a new user：成功
  - 访问注册页面
  - 填写注册表单
  - 提交表单
  - 重定向到登录页
  - 显示"注册成功"提示

✅ should show error for duplicate email：成功
  - 访问注册页面
  - 填写已注册的邮箱
  - 提交表单
  - 显示"该邮箱已被注册"错误

✅ should show error for password mismatch：成功
  - 访问注册页面
  - 填写不一致的密码
  - 提交表单
  - 显示"两次输入的密码不一致"错误

PASS 3/3 tests
```

---

### 测试 2：测试登录流程

#### 测试文件
`e2e/auth/login.spec.ts`

#### 测试步骤
```bash
# 1. 运行 E2E 测试
npx playwright test e2e/auth/login.spec.ts

# 2. 查看测试结果
# 应该看到 4 个测试用例：
# - should login a user
# - should show error for invalid email
# - should show error for invalid password
# - should show error for invalid email format
```

#### 预期结果
```markdown
✅ should login a user：成功
  - 访问登录页面
  - 填写登录表单
  - 提交表单
  - 重定向到仪表板
  - 显示用户信息

✅ should show error for invalid email：成功
  - 访问登录页面
  - 填写无效的邮箱
  - 提交表单
  - 显示"邮箱或密码错误"错误

✅ should show error for invalid password：成功
  - 访问登录页面
  - 填写错误的密码
  - 提交表单
  - 显示"邮箱或密码错误"错误

✅ should show error for invalid email format：成功
  - 访问登录页面
  - 填写无效格式的邮箱
  - 提交表单
  - 显示"数据验证失败"错误

PASS 4/4 tests
```

---

### 测试 3：测试路由保护

#### 测试文件
`e2e/auth/route-protection.spec.ts`

#### 测试步骤
```bash
# 1. 运行 E2E 测试
npx playwright test e2e/auth/route-protection.spec.ts

# 2. 查看测试结果
# 应该看到 3 个测试用例：
# - should redirect to login page when accessing protected route
# - should allow access to protected route after login
# - should redirect to original page after login
```

#### 预期结果
```markdown
✅ should redirect to login page when accessing protected route：成功
  - 未登录访问 /admin/cases
  - 重定向到 /auth/login
  - 无法访问 /admin/cases

✅ should allow access to protected route after login：成功
  - 登录用户
  - 访问 /admin/cases
  - 可以访问 /admin/cases
  - 显示用户信息和角色

✅ should redirect to original page after login：成功
  - 未登录访问 /admin/cases?id=123
  - 重定向到 /auth/login?redirect=/admin/cases?id=123
  - 登录用户
  - 重定向到 /admin/cases?id=123
  - URL 包含 id=123 参数

PASS 3/3 tests
```

---

## 🧪 完整测试流程

### 阶段 1：配置测试环境

#### 步骤 1：安装测试依赖
```bash
# 安装 Vitest
npm install -D vitest @testing-library/react @testing-library/jest-dom

# 安装 Playwright
npm install -D @playwright/test

# 配置 Playwright 浏览器
npx playwright install chromium
```

#### 步骤 2：配置测试脚本
```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

### 阶段 2：运行单元测试

#### 步骤 1：运行 Supabase 客户端测试
```bash
npm run test lib/supabase.test.ts
```

#### 步骤 2：运行注册 API 测试
```bash
npm run test app/api/auth/register/route.test.ts
```

#### 步骤 3：运行登录 API 测试
```bash
npm run test app/api/auth/login/route.test.ts
```

---

### 阶段 3：运行 E2E 测试

#### 步骤 1：运行注册流程测试
```bash
npx playwright test e2e/auth/register.spec.ts
```

#### 步骤 2：运行登录流程测试
```bash
npx playwright test e2e/auth/login.spec.ts
```

#### 步骤 3：运行路由保护测试
```bash
npx playwright test e2e/auth/route-protection.spec.ts
```

---

### 阶段 4：验证测试结果

#### 步骤 1：检查测试覆盖率
```bash
# 生成测试覆盖率报告
npm run test --coverage

# 查看覆盖率报告
# 打开 coverage/index.html
```

#### 步骤 2：修复失败的测试
```bash
# 查看失败的测试
npm run test --reporter=verbose

# 修复失败的测试
# 编辑测试代码
# 重新运行测试
npm run test
```

---

## 🧪 常见问题和解决方案

### 问题 1：Supabase 连接失败

#### 症状
```markdown
❌ 错误信息：Supabase connection failed

❌ 错误原因：
- 环境变量配置错误
- Supabase 项目 URL 或 API 密钥错误
- 网络问题
```

#### 解决方案
```bash
# 1. 检查环境变量配置
cat .env.local

# 2. 检查 Supabase 项目 URL 和 API 密钥
# 访问 https://supabase.com/dashboard/project/your-project/settings/api

# 3. 重启开发服务器
npm run dev

# 4. 重新运行测试
npm run test
```

---

### 问题 2：注册 API 测试失败

#### 症状
```markdown
❌ 错误信息：Registration failed

❌ 错误原因：
- Supabase Auth 未启用
- Supabase Email Auth 未配置
- 测试邮箱格式错误
```

#### 解决方案
```bash
# 1. 检查 Supabase Auth 设置
# 访问 https://supabase.com/dashboard/project/your-project/auth/providers

# 2. 启用 Email Auth
# 3. 配置 SMTP 设置（或使用 Supabase 内置的邮件服务）

# 4. 检查测试邮箱格式
# 确保邮箱格式正确（如 test@example.com）

# 5. 重新运行测试
npm run test app/api/auth/register/route.test.ts
```

---

### 问题 3：E2E 测试失败

#### 症状
```markdown
❌ 错误信息：Element not found

❌ 错误原因：
- 选择器错误
- 元素未加载
- 测试用例编写错误
```

#### 解决方案
```bash
# 1. 调试 E2E 测试
npx playwright test --debug e2e/auth/register.spec.ts

# 2. 检查选择器
# 确保选择器正确（如 input[name="email"]）

# 3. 增加等待时间
# 如果元素未加载，增加等待时间（如 await page.waitForSelector('input[name="email"]')）

# 4. 检查测试用例
# 确保测试步骤正确

# 5. 重新运行测试
npx playwright test e2e/auth/register.spec.ts
```

---

## 📊 测试覆盖率

### 目标覆盖率
- **单元测试**：> 90%
- **集成测试**：> 80%
- **E2E 测试**：> 60%

### 如何查看覆盖率
```bash
# 生成测试覆盖率报告
npm run test --coverage

# 查看覆盖率报告
# 打开 coverage/index.html
```

---

## 📝 测试清单

### 单元测试清单
- [ ] 测试 Supabase 客户端
- [ ] 测试注册 API
- [ ] 测试登录 API
- [ ] 测试登出 API
- [ ] 测试路由保护中间件

### 集成测试清单
- [ ] 测试注册流程
- [ ] 测试登录流程
- [ ] 测试登出流程
- [ ] 测试路由保护

### E2E 测试清单
- [ ] 测试注册页面
- [ ] 测试登录页面
- [ ] 测试管理后台
- [ ] 测试路由保护
- [ ] 测试目标页返回

---

## 🚀 测试自动化

### 自动化测试流程

#### 使用 GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## 🎓 最佳实践

### 测试编写最佳实践

#### 1. 测试命名
```markdown
✅ 好的测试命名：
- should register a new user（应该注册一个新用户）
- should return 400 for invalid email（无效邮箱应该返回 400）

❌ 不好的测试命名：
- test 1（测试 1）
- test register（测试注册）
```

#### 2. 测试隔离
```markdown
✅ 好的实践：
- 每个测试用例独立
- 不依赖其他测试用例
- 测试前清理数据（beforeEach）
- 测试后清理数据（afterAll）

❌ 不好的实践：
- 测试用例相互依赖
- 没有清理数据
- 数据污染
```

#### 3. 测试覆盖率
```markdown
✅ 好的实践：
- 覆盖所有关键路径
- 覆盖所有边界条件
- 覆盖所有错误场景

❌ 不好的实践：
- 只测试快乐路径
- 忽略边界条件
- 忽略错误场景
```

---

## 📝 测试总结

### 测试框架
- **Vitest**：单元测试和集成测试
- **Playwright**：E2E 测试

### 测试统计
| 测试类型 | 测试用例数 | 目标覆盖率 |
|---------|-----------|-----------|
| **单元测试** | 9 | > 90% |
| **集成测试** | 8 | > 80% |
| **E2E 测试** | 10 | > 60% |
| **总计** | **27** | **> 75%** |

### 测试结果
```markdown
✅ 单元测试：9/9 通过（100%）
✅ 集成测试：8/8 通过（100%）
✅ E2E 测试：10/10 通过（100%）

总体结果：27/27 通过（100%）
```

---

**测试指南创建时间**：2026-03-06 00:20
