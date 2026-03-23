import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  // 使用 Supabase Auth 登录
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      {
        error: error.message || '登录失败',
        details: error
      },
      { status: 401 }  // Unauthorized
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name,
          role: data.user.user_metadata?.role,
        },
        session: data.session,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      }
    },
    { status: 200 }  // OK
  );
}
