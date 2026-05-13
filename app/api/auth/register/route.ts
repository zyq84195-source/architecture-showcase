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

  if (username.length < 2) {
    return NextResponse.json(
      { error: '用户名至少需要 2 个字符' },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: '密码至少需要 6 位' },
      { status: 400 }
    );
  }

  // 检查用户名是否已存在
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (existingProfile) {
    return NextResponse.json(
      { error: '该用户名已被使用' },
      { status: 409 }
    );
  }

  // 自动生成内部 email
  const autoEmail = `${username}@archshowcase.local`;

  // 使用 admin API 直接创建用户（跳过邮件验证）
  // 先暂时禁用触发器可能导致的错误，用手动方式创建 profile
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: autoEmail,
    password,
    email_confirm: true,
    user_metadata: {
      username,
      display_name: username,
      name: username,
      role: 'user',
    },
  });

  if (error) {
    // 如果用户已存在但触发器创建 profile 失败，尝试修复
    if (error.message?.includes('Database error') || error.message?.includes('already been registered')) {
      // 尝试查找已创建的用户
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = users.find(u => u.email === autoEmail);
      
      if (existingUser) {
        // 手动创建 profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: existingUser.id,
            username,
            display_name: username,
            avatar_url: '',
            bio: '',
            role: 'user',
          });

        if (!profileError) {
          return NextResponse.json(
            { success: true, message: '注册成功', data: { user: { id: existingUser.id, username } } },
            { status: 201 }
          );
        }
      }
    }
    
    return NextResponse.json(
      { error: error.message || '注册失败' },
      { status: 400 }
    );
  }

  if (!data.user) {
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }

  // 手动创建 profile（以防触发器失败）
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: data.user.id,
      username,
      display_name: username,
      avatar_url: '',
      bio: '',
      role: 'user',
    });

  if (profileError) {
    console.error('Profile creation error:', profileError);
  }

  return NextResponse.json(
    {
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: username,
          username,
        },
      }
    },
    { status: 201 }
  );
}
