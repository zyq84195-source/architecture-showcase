import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = body?.userId;

    // 如果传了 userId，用 admin 强制登出该用户的所有 session
    if (userId && supabaseAdmin) {
      await supabaseAdmin.auth.admin.signOut(userId);
    }
  } catch {
    // 忽略所有错误，登出不应失败
  }

  return NextResponse.json({ success: true, message: '登出成功' });
}
