import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  return error ? null : user;
}

// GET: 获取某案例的评论列表（公开）
export async function GET(request: NextRequest) {
  const caseId = request.nextUrl.searchParams.get('case_id');
  if (!caseId) return NextResponse.json({ error: '缺少 case_id' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('id, user_id, case_id, content, created_at, updated_at, profiles(username, display_name, avatar_url)')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data });
}

// POST: 添加评论
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { case_id, content } = await request.json();
  if (!case_id || !content) {
    return NextResponse.json({ error: '缺少 case_id 或 content' }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: '评论内容不能超过2000字' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert({ user_id: user.id, case_id, content })
    .select('id, user_id, case_id, content, created_at, updated_at, profiles(username, display_name, avatar_url)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment: data });
}

// DELETE: 删除评论
export async function DELETE(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { comment_id } = await request.json();
  if (!comment_id) return NextResponse.json({ error: '缺少 comment_id' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('comments')
    .delete()
    .eq('id', comment_id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
