import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!supabase || !supabaseAdmin) {
    return NextResponse.json(
      { error: '系统未配置，请联系管理员' },
      { status: 500 }
    );
  }

  if (!username || !password) {
    return NextResponse.json(
      { error: '请输入用户名和密码' },
      { status: 400 }
    );
  }

  // 1. 通过 profiles 表查找用户名对应的 auth user id
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: '用户名或密码错误' },
      { status: 401 }
    );
  }

  // 2. 通过 admin API 获取用户的 email
  const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.id);

  if (userError || !user) {
    return NextResponse.json(
      { error: '用户名或密码错误' },
      { status: 401 }
    );
  }

  // 3. 用 email + password 验证密码
  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password,
  });

  if (error) {
    return NextResponse.json(
      { error: '用户名或密码错误' },
      { status: 401 }
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
          username: data.user.user_metadata?.username,
          role: data.user.user_metadata?.role,
        },
        session: data.session,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      }
    },
    { status: 200 }
  );
}
