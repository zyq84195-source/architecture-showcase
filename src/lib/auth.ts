import { supabase } from './supabase';

export async function requireAdmin() {
  if (!supabase) {
    throw new Error('系统未配置，请联系管理员');
  }

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
  if (!supabase) {
    throw new Error('系统未配置，请联系管理员');
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('未登录');
  }

  return session;
}

export async function requireProfessor() {
  if (!supabase) {
    throw new Error('系统未配置，请联系管理员');
  }

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
