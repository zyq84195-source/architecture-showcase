import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * 创建浏览器端 Supabase 客户端（用于 Client Components）
 * 自动处理 cookie-based session
 */
export function createClientSupabase(): SupabaseClient {
  return createClientComponentClient();
}

/**
 * 创建服务器端 Supabase 客户端（用于 Server Components / Route Handlers）
 * 从请求 cookies 中读取 session
 */
export function createServerSupabase(): SupabaseClient {
  return createServerComponentClient({ cookies });
}
