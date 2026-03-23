# Architecture Showcase 项目测试代码

**版本**：1.0.0
**创建时间**：2026-03-06
**项目**：architecture-showcase

---

## 🧪 单元测试

### 测试框架：Vitest

### 1. 测试 Supabase 客户端

```typescript
// lib/supabase.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { supabase } from './supabase';

describe('Supabase Client', () => {
  beforeEach(() => {
    // 清理测试数据
  });

  it('should connect to Supabase', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should insert a user', async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'test_password_123',
      options: {
        data: {
          name: 'Test User',
          role: 'professor',
        },
      },
    });

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe('test@example.com');
    expect(data.user.user_metadata.name).toBe('Test User');
    expect(data.user.user_metadata.role).toBe('professor');
  });

  it('should sign in a user', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test_password_123',
    });

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.session).toBeDefined();
    expect(data.session.access_token).toBeDefined();
  });

  it('should sign out a user', async () => {
    const { error } = await supabase.auth.signOut();

    expect(error).toBeNull();
  });

  it('should get current session', async () => {
    const { data, error } = await supabase.auth.getSession();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.session).toBeDefined();
  });

  it('should get current user', async () => {
    const { data, error } = await supabase.auth.getUser();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.user).toBeDefined();
  });

  it('should update user metadata', async () => {
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'test_password_123',
      options: {
        data: {
          name: 'Test User',
          role: 'professor',
        },
      },
    });

    expect(signUpError).toBeNull();

    const { data, error } = await supabase.auth.updateUser({
      data: {
        name: 'Updated User',
      },
    });

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.user.user_metadata.name).toBe('Updated User');
  });

  it('should delete a user', async () => {
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'test_password_123',
      options: {
        data: {
          name: 'Test User',
          role: 'professor',
        },
      },
    });

    expect(signUpError).toBeNull();

    const { error } = await supabase.auth.admin.deleteUser(user.id);

    expect(error).toBeNull();
  });
});
```

---

### 2. 测试认证 API

```typescript
// app/api/auth/register/route.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { POST } from '../route';
import { supabase } from '@/lib/supabase';

describe('POST /api/auth/register', () => {
  let testEmail: string;
  let testName: string;
  let testPassword: string;

  beforeAll(() => {
    testEmail = `test_${Date.now()}@example.com`;
    testName = `Test User ${Date.now()}`;
    testPassword = 'test_password_123';
  });

  afterAll(async () => {
    // 清理测试用户
    const { data: { users } } = await supabase
      .from('users')
      .select('*')
      .ilike('email', `${testEmail.split('@')[0]}%`)
      .limit(1);

    if (users.length > 0) {
      await supabase.auth.admin.deleteUser(users[0].id);
    }
  });

  it('should register a new user', async () => {
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        name: testName,
        password: testPassword,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('注册成功');
    expect(data.data).toBeDefined();
    expect(data.data.email).toBe(testEmail);
    expect(data.data.name).toBe(testName);
    expect(data.data.role).toBe('professor');
  });

  it('should return 400 for invalid email', async () => {
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email',
        name: testName,
        password: testPassword,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 409 for duplicate email', async () => {
    // 先注册一个用户
    await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName,
          role: 'professor',
        },
      },
    });

    // 再注册相同的邮箱
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        name: 'Test User 2',
        password: 'test_password_456',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBeDefined();
    expect(data.error).toBe('该邮箱已被注册');
  });

  it('should return 400 for weak password', async () => {
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test_weak_${Date.now()}@example.com`,
        name: 'Test User',
        password: '123',  // 弱密码（少于 8 个字符）
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
```

```typescript
// app/api/auth/login/route.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { POST } from '../route';
import { supabase } from '@/lib/supabase';

describe('POST /api/auth/login', () => {
  let testEmail: string;
  let testName: string;
  let testPassword: string;

  beforeAll(async () => {
    testEmail = `test_${Date.now()}@example.com`;
    testName = `Test User ${Date.now()}`;
    testPassword = 'test_password_123';

    // 先注册一个用户
    await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName,
          role: 'professor',
        },
      },
    });
  });

  afterAll(async () => {
    // 清理测试用户
    const { data: { users } } = await supabase
      .from('users')
      .select('*')
      .ilike('email', `${testEmail.split('@')[0]}%`)
      .limit(1);

    if (users.length > 0) {
      await supabase.auth.admin.deleteUser(users[0].id);
    }
  });

  it('should login a user', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('登录成功');
    expect(data.data.user).toBeDefined();
    expect(data.data.user.email).toBe(testEmail);
    expect(data.data.token).toBeDefined();
  });

  it('should return 401 for invalid email', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email@example.com',
        password: testPassword,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBeDefined();
    expect(data.error).toBe('邮箱或密码错误');
  });

  it('should return 401 for invalid password', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrong-password',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBeDefined();
    expect(data.error).toBe('邮箱或密码错误');
  });

  it('should return 400 for invalid email format', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email',
        password: testPassword,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});
```

---

## 🧪 集成测试

### 测试框架：Playwright

### 1. 测试注册流程

```typescript
// e2e/auth/register.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
  test('should register a new user', async ({ page }) => {
    // 1. 访问注册页面
    await page.goto('/auth/register');

    // 2. 填写注册表单
    await page.fill('input[name="email"]', `test_${Date.now()}@example.com`);
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="password"]', 'test_password_123');
    await page.fill('input[name="confirmPassword"]', 'test_password_123');

    // 3. 提交表单
    await page.click('button[type="submit"]');

    // 4. 等待重定向
    await page.waitForURL('/auth/login?registered=true');

    // 5. 验证重定向
    expect(page.url()).toContain('/auth/login');
    expect(page.url()).toContain('registered=true');
  });

  test('should show error for duplicate email', async ({ page }) => {
    // 1. 注册第一个用户
    const testEmail = `test_duplicate_${Date.now()}@example.com`;
    await page.goto('/auth/register');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="name"]', 'Test User 1');
    await page.fill('input[name="password"]', 'test_password_123');
    await page.fill('input[name="confirmPassword"]', 'test_password_123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/auth/login?registered=true');

    // 2. 注册相同的邮箱
    await page.goto('/auth/register');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="name"]', 'Test User 2');
    await page.fill('input[name="password"]', 'test_password_456');
    await page.fill('input[name="confirmPassword"]', 'test_password_456');
    await page.click('button[type="submit"]');

    // 3. 等待错误提示
    await page.waitForSelector('text=该邮箱已被注册');

    // 4. 验证错误提示
    expect(await page.textContent('div:has-text("该邮箱已被注册")')).toContain('该邮箱已被注册');
  });

  test('should show error for password mismatch', async ({ page }) => {
    // 1. 访问注册页面
    await page.goto('/auth/register');

    // 2. 填写不一致的密码
    await page.fill('input[name="email"]', `test_mismatch_${Date.now()}@example.com`);
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="password"]', 'test_password_123');
    await page.fill('input[name="confirmPassword"]', 'test_password_456');

    // 3. 提交表单
    await page.click('button[type="submit"]');

    // 4. 等待错误提示
    await page.waitForSelector('text=两次输入的密码不一致');

    // 5. 验证错误提示
    expect(await page.textContent('div:has-text("两次输入的密码不一致")')).toContain('两次输入的密码不一致');
  });
});
```

---

### 2. 测试登录流程

```typescript
// e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeAll(async ({ page }) => {
    // 1. 注册一个测试用户
    const testEmail = `test_login_${Date.now()}@example.com`;
    await page.goto('/auth/register');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="password"]', 'test_password_123');
    await page.fill('input[name="confirmPassword"]', 'test_password_123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/auth/login?registered=true');
  });

  test('should login a user', async ({ page }) => {
    // 1. 访问登录页面
    await page.goto('/auth/login');

    // 2. 填写登录表单
    const testEmail = `test_login_${Date.now() - 86400000}@example.com`; // 1 天前的
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'test_password_123');

    // 3. 提交表单
    await page.click('button[type="submit"]');

    // 4. 等待重定向到仪表板
    await page.waitForURL('/admin/cases');

    // 5. 验证重定向
    expect(page.url()).toContain('/admin/cases');

    // 6. 验证用户信息
    await expect(page.locator('text=' + testEmail + "'")).toBeVisible();
  });

  test('should show error for invalid email', async ({ page }) => {
    // 1. 访问登录页面
    await page.goto('/auth/login');

    // 2. 填写无效的邮箱
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'test_password_123');

    // 3. 提交表单
    await page.click('button[type="submit"]');

    // 4. 等待错误提示
    await page.waitForSelector('text=邮箱或密码错误');

    // 5. 验证错误提示
    expect(await page.textContent('div:has-text("邮箱或密码错误")')).toContain('邮箱或密码错误');
  });

  test('should show error for invalid password', async ({ page }) => {
    // 1. 访问登录页面
    await page.goto('/auth/login');

    // 2. 填写错误的密码
    const testEmail = `test_invalid_${Date.now()}@example.com`;
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'wrong-password');

    // 3. 提交表单
    await page.click('button[type="submit"]');

    // 4. 等待错误提示
    await page.waitForSelector('text=邮箱或密码错误');

    // 5. 验证错误提示
    expect(await page.textContent('div:has-text("邮箱或密码错误")')).toContain('邮箱或密码错误');
  });
});
```

---

### 3. 测试路由保护

```typescript
// e2e/auth/route-protection.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Route Protection', () => {
  test.beforeEach(async ({ page }) => {
    // 1. 登出（如果已登录）
    await page.goto('/api/auth/logout');
    await page.request('http://localhost:3000/api/auth/logout', {
      method: 'POST',
    });
  });

  test('should redirect to login page when accessing protected route', async ({ page }) => {
    // 1. 未登录访问受保护路由
    await page.goto('/admin/cases');

    // 2. 验证重定向到登录页
    expect(page.url()).toContain('/auth/login');
  });

  test('should allow access to protected route after login', async ({ page }) => {
    // 1. 注册并登录
    const testEmail = `test_protected_${Date.now()}@example.com`;
    await page.goto('/auth/register');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="password"]', 'test_password_123');
    await page.fill('input[name="confirmPassword"]', 'test_password_123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/auth/login?registered=true');

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'test_password_123');
    await page.click('button[type="submit"]');

    // 2. 访问受保护路由
    await page.waitForURL('/admin/cases');

    // 3. 验证可以访问
    expect(page.url()).toContain('/admin/cases');
    expect(await page.textContent('h1')).toContain('Admin');
  });

  test('should redirect to original page after login', async ({ page }) => {
    // 1. 未登录访问受保护路由
    await page.goto('/admin/cases?id=123');

    // 2. 验证重定向到登录页
    expect(page.url()).toContain('/auth/login');
    expect(page.url()).toContain('redirect=/admin/cases?id=123');

    // 3. 注册并登录
    const testEmail = `test_redirect_${Date.now()}@example.com`;
    await page.goto('/auth/register');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="password"]', 'test_password_123');
    await page.fill('input[name="confirmPassword"]', 'test_password_123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/auth/login?registered=true');

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'test_password_123');
    await page.click('button[type="submit"]');

    // 4. 验证重定向到原始页面
    await page.waitForURL('/admin/cases?id=123');

    // 5. 验证 URL 参数
    expect(page.url()).toContain('id=123');
  });
});
```

---

## 🧪 组件测试

### 测试框架：Vitest + Testing Library

```typescript
// components/ui/button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button Component', () => {
  it('should render a button', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
  });

  it('should render a disabled button', () => {
    render(<Button disabled>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeDisabled();
  });

  it('should render a button with variant', () => {
    render(<Button variant="destructive">Delete</Button>);

    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toHaveClass('bg-red-600');
  });

  it('should render a button with size', () => {
    render(<Button size="lg">Large Button</Button>);

    const button = screen.getByRole('button', { name: 'Large Button' });
    expect(button).toHaveClass('h-11');
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

**测试代码创建时间**：2026-03-06 00:10
