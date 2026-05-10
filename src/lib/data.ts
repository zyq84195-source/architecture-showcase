/**
 * 数据访问层
 * 开发环境：使用 cases.json（本地文件）
 * 生产环境：使用 Supabase
 */

import type { Case, CaseImage } from '@/lib/supabase';

// 判断是否使用 Supabase
const USE_SUPABASE =
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

/**
 * 获取所有案例
 */
export async function getAllCases(): Promise<Case[]> {
  if (USE_SUPABASE) {
    return getCasesFromSupabase();
  }
  return getCasesFromJson();
}

/**
 * 获取单个案例（含图片）
 */
export async function getCaseById(id: string): Promise<Case | null> {
  if (USE_SUPABASE) {
    return getCaseFromSupabase(id);
  }
  const cases = await getCasesFromJson();
  return cases.find(c => c.id === id) || null;
}

/**
 * 搜索案例
 */
export async function searchCases(params: {
  term?: string;
  type?: string;
  location?: string;
}): Promise<Case[]> {
  let cases = await getAllCases();

  if (params.term) {
    const term = params.term.toLowerCase();
    cases = cases.filter(item =>
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }

  if (params.type) {
    cases = cases.filter(item =>
      item.tags.includes(params.type!) ||
      (item as any).case_type?.includes(params.type!)
    );
  }

  if (params.location) {
    cases = cases.filter(item => {
      const locationText = Array.isArray(item.location)
        ? item.location.join(' ')
        : item.location;
      return locationText.includes(params.location!);
    });
  }

  return cases;
}

// ─── JSON 数据源 ───────────────────────────────────────

async function getCasesFromJson(): Promise<Case[]> {
  // Next.js 中 require 缓存 JSON
  const data = require('@/data/cases.json');
  return data;
}

async function getCaseFromJson(id: string): Promise<Case | null> {
  const data = require('@/data/cases.json');
  return data.find((c: Case) => c.id === id) || null;
}

// ─── Supabase 数据源 ──────────────────────────────────

async function getCasesFromSupabase(): Promise<Case[]> {
  const { supabase } = await import('@/lib/supabase');

  const { data, error } = await supabase
    .from('cases')
    .select('*, case_images(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase query error:', error);
    // 降级到 JSON
    return getCasesFromJson();
  }

  return (data || []).map(mapSupabaseCase);
}

async function getCaseFromSupabase(id: string): Promise<Case | null> {
  const { supabase } = await import('@/lib/supabase');

  const { data, error } = await supabase
    .from('cases')
    .select('*, case_images(*)')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Supabase query error:', error);
    return getCaseFromJson(id);
  }

  return mapSupabaseCase(data);
}

/**
 * 映射 Supabase 行 → Case 类型
 */
function mapSupabaseCase(row: any): Case {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    images: (row.case_images || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    architect: row.architect || '',
    location: row.location || [],
    tags: row.tags || [],
    scale: row.scale || '',
    investment: row.investment || '',
    participants: row.participants || '',
    start_date: row.start_date || '',
    awards: row.awards || '',
    case_type: row.case_type || '',
    sustainable_goal: row.sustainable_goal || '',
    demo_significance: row.demo_significance || '',
    likes_count: row.likes_count || 0,
    reviews_count: row.reviews_count || 0,
    ratings: row.ratings || { total: 0, count: 0, average: 0 },
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
