import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 客户端（匿名权限，用于前端）
export const supabase: SupabaseClient =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : (null as unknown as SupabaseClient);

// 管理客户端（service_role 权限，用于 API 路由）
export const supabaseAdmin: SupabaseClient =
  supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : (null as unknown as SupabaseClient);

// 类型定义
export interface Case {
  id: string;
  title: string;
  description: string;
  images: CaseImage[];
  architect: string;
  location: string | string[];
  tags: string[];
  scale: string;
  investment: string;
  participants: string;
  start_date: string;
  awards: string;
  case_type: string;
  sustainable_goal: string;
  demo_significance: string;
  likes_count: number;
  reviews_count: number;
  ratings: {
    total: number;
    count: number;
    average: number;
  };
  created_at: string;
  updated_at: string;
}

export interface CaseImage {
  id: string;
  case_id: string;
  filename: string;
  url: string;
  caption: string;
  is_main: boolean;
  sort_order: number;
}
