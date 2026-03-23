import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function requireAdmin() {
  const supabase = createServerComponentClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('未登录');
  }

  // 检查用户角色是否为管理员
  const role = session.user.user_metadata?.role;
  if (role !== 'admin') {
    throw new Error('权限不足');
  }

  return session;
}

export async function requireAuthenticated() {
  const supabase = createServerComponentClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('未登录');
  }

  return session;
}

export async function requireProfessor() {
  const supabase = createServerComponentClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('未登录');
  }

  // 检查用户角色是否为教授
  const role = session.user.user_metadata?.role;
  if (role !== 'professor') {
    throw new Error('权限不足');
  }

  return session;
}
