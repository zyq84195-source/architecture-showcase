import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    await supabaseAdmin.auth.exchangeCodeForSession(code);
  }

  // 重定向到首页
  return NextResponse.redirect(requestUrl.origin);
}
