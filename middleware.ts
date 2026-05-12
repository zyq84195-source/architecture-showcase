import { NextResponse, NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images/).*)'],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 公开路由
  const publicPaths = ['/auth/login', '/auth/register', '/auth/callback'];
  const isPublic = publicPaths.some(p => pathname.startsWith(p));
  const isApi = pathname.startsWith('/api/');
  const isStatic = pathname.includes('.') && !pathname.endsWith('/');

  if (isStatic || isApi) {
    return NextResponse.next();
  }

  // 检查 Supabase auth cookie（sb-<project-ref>-auth-token）
  // Supabase 在登录后会设置这个 cookie
  const authCookie = req.cookies.get('sb-klqucgcddojygevewnqv-auth-token');
  const hasSession = !!authCookie && authCookie.value.length > 10;

  // 未登录 → 跳转登录页
  if (!hasSession && !isPublic) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 已登录 → 访问登录页时跳转首页
  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}
