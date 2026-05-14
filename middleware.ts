// Middleware disabled — client-side AuthGuard handles route protection
// Next.js 16 deprecates middleware.ts, using client-side auth guard instead
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
