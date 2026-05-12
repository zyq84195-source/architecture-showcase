import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  return error ? null : user;
}

// GET: 获取当前用户的收藏列表
export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ favorites: data });
}

// POST: 添加收藏
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { case_id } = await request.json();
  if (!case_id) return NextResponse.json({ error: '缺少 case_id' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('favorites')
    .insert({ user_id: user.id, case_id })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: '已收藏过该案例' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ favorite: data });
}

// DELETE: 取消收藏
export async function DELETE(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { case_id } = await request.json();
  if (!case_id) return NextResponse.json({ error: '缺少 case_id' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('case_id', case_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
