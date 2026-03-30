import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

// 公开路由
const publicRoutes = ['/', '/cases', '/about', '/contact'];

// 受保护路由
const protectedRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 检查是否是公开路由
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 2. 检查是否是受保护的路由
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // 3. 检查用户登录状态
  if (!supabase) {
    // Supabase 未配置，允许访问
    return NextResponse.next();
  }

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    // 未登录，重定向到登录页
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. 检查用户角色和权限
  const user = session.user;
  const userRole = user.user_metadata?.role || 'visitor';

  // 检查是否有权限访问该路由
  const hasPermission = await checkPermission(pathname, userRole);

  if (!hasPermission) {
    // 无权限，重定向到首页
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 5. 已登录且有权限，继续
  return NextResponse.next();
}

// 辅助函数：检查权限
async function checkPermission(pathname: string, role: string) {
  // 定义角色和路由的映射
  const rolePermissions = {
    visitor: ['/', '/cases', '/about', '/contact'],
    professor: ['/', '/cases', '/about', '/contact', '/admin/cases'],
    admin: ['/', '/cases', '/about', '/contact', '/admin', '/admin/cases', '/admin/users'],
  };

  // 检查角色是否有权限访问该路由
  const permissions = rolePermissions[role as keyof typeof rolePermissions] || [];

  return permissions.some(route => pathname.startsWith(route));
}

// 中间件配置
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - public (公开文件)
     * - api (API 路由)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).)*',
  ],
};
