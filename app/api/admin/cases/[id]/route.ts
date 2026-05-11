import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - 获取单个案例
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: '系统未配置，请联系管理员' }, { status: 500 });
    }

    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('cases')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '案例不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '获取案例失败' }, { status: 500 });
  }
}

// PUT - 更新案例
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: '系统未配置，请联系管理员' }, { status: 500 });
    }

    const { id } = await params;
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 });
    }

    const updateData: any = {
      title: body.title,
      description: body.description || null,
      architect: body.architect || null,
      location: body.location || null,
      tags: body.tags || null,
      scale: body.scale || null,
      investment: body.investment || null,
      participants: body.participants || null,
      start_date: body.start_date || null,
      awards: body.awards || null,
      case_type: body.case_type || null,
      sustainable_goal: body.sustainable_goal || null,
      demo_significance: body.demo_significance || null,
      images: body.images || null,
      is_published: body.is_published !== undefined ? body.is_published : true,
    };

    // Remove null/undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const { data, error } = await supabaseAdmin
      .from('cases')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message: '案例更新成功', data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '更新案例失败' }, { status: 500 });
  }
}

// DELETE - 删除案例
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: '系统未配置，请联系管理员' }, { status: 500 });
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('cases')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: '案例删除成功' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '删除案例失败' }, { status: 500 });
  }
}
