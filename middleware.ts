import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 公开路由：不需要登录
  const publicPaths = ['/auth/login', '/auth/register', '/auth/callback'];
  const isPublic = publicPaths.some(p => pathname.startsWith(p));
  const isApi = pathname.startsWith('/api/');
  const isStatic = pathname.startsWith('/_next/') || pathname.startsWith('/images/') || pathname.includes('.');

  // 静态资源和 API 路由不需要保护
  if (isStatic || isApi) {
    return NextResponse.next();
  }

  // 从 cookie 中检查 Supabase auth token
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // 获取所有 sb-xxx-auth-token 相关的 cookies
  const cookies = req.cookies;
  let hasSession = false;
  
  // Supabase 将 session 存在名为 sb-<ref>-auth-token 的 cookie 中
  const authCookies = cookies.getAll().filter(c => c.name.includes('auth-token'));
  if (authCookies.length > 0) {
    try {
      // 创建临时 Supabase 客户端验证 session
      const supabase = createClient(supabaseUrl, supabaseKey);
      // 从 cookie 构建 session
      for (const cookie of authCookies) {
        if (cookie.value && cookie.value.length > 10) {
          hasSession = true;
          break;
        }
      }
    } catch {
      hasSession = false;
    }
  }

  // 未登录 → 跳转登录页
  if (!hasSession && !isPublic) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 已登录 → 访问登录/注册页时跳转首页
  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
