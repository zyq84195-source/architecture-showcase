import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: '系统未配置，请联系管理员' },
      { status: 500 }
    );
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json(
      {
        error: '登出失败',
        details: error.message
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: '登出成功'
    },
    { status: 200 }
  );
}
