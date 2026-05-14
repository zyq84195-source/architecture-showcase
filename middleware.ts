import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 受保护路径前缀（需要登录）
const PROTECTED_PATHS = ['/search', '/smart-search', '/favorites', '/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 静态资源和 API 路由放行
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // 检查是否为受保护路径
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  // 案例详情页也是受保护的（/cases/xxx 但不是 /cases 本身）
  const isCaseDetail = pathname.match(/^\/cases\/[^/]+$/)

  if (!isProtected && !isCaseDetail) {
    return NextResponse.next()
  }

  // 检查是否有 session cookie（Supabase 的 auth token）
  // 轻量检查，客户端 AuthGuard 做完整检查
  const hasAuthCookie = request.cookies
    .getAll()
    .some(
      (c) => c.name.includes('auth-token') || c.name.includes('sb-')
    )

  if (!hasAuthCookie) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
