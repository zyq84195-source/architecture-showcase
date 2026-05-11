import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - 获取所有案例
export async function GET(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: '系统未配置，请联系管理员' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const caseType = searchParams.get('case_type');

    let query = supabaseAdmin
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }
    if (caseType) {
      query = query.eq('case_type', caseType);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '获取案例失败' }, { status: 500 });
  }
}

// POST - 创建新案例
export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: '系统未配置，请联系管理员' }, { status: 500 });
    }

    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 });
    }

    const insertData: any = {
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

    // Remove null fields
    Object.keys(insertData).forEach(key => {
      if (insertData[key] === undefined) delete insertData[key];
    });

    const { data, error } = await supabaseAdmin
      .from('cases')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message: '案例创建成功', data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '创建案例失败' }, { status: 500 });
  }
}
