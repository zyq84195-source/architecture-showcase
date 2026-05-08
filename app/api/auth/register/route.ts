import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json();

  if (!supabase) {
    return NextResponse.json(
      { error: '系统未配置，请联系管理员' },
      { status: 500 }
    );
  }

  // 使用 Supabase Auth 注册
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: 'professor',  // 默认角色为教授
      },
    },
  });

  if (error) {
    return NextResponse.json(
      {
        error: error.message || '注册失败',
        details: error
      },
      { status: 400 }  // Bad Request
    );
  }

  if (!data.user) {
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata.name,
          role: data.user.user_metadata.role,
        },
        session: data.session,
      }
    },
    { status: 201 }  // Created
  );
}
