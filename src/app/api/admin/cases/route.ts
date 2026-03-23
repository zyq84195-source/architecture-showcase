import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - 获取所有案例
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublished = searchParams.get('is_published');

    let query = supabaseAdmin
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (isPublished !== null && isPublished !== '') {
      query = query.eq('is_published', isPublished === 'true');
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || '获取案例失败',
        details: error
      },
      { status: 500 }
    );
  }
}

// POST - 创建新案例
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.title) {
      return NextResponse.json(
        { error: '标题不能为空' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('cases')
      .insert({
        title: body.title,
        description: body.description,
        category: body.category,
        architect: body.architect,
        location: body.location,
        year: body.year,
        area: body.area,
        height: body.height,
        style: body.style,
        image_url: body.image_url,
        is_published: body.is_published !== undefined ? body.is_published : true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        message: '案例创建成功',
        data
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || '创建案例失败',
        details: error
      },
      { status: 500 }
    );
  }
}
