import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - 获取单个案例
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('cases')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: '案例不存在' },
        { status: 404 }
      );
    }

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

// PUT - 更新案例
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.title) {
      return NextResponse.json(
        { error: '标题不能为空' },
        { status: 400 }
      );
    }

    const updateData: any = {
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
    };

    // 只更新提供的字段
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    const { data, error } = await supabaseAdmin
      .from('cases')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        message: '案例更新成功',
        data
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || '更新案例失败',
        details: error
      },
      { status: 500 }
    );
  }
}

// DELETE - 删除案例
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('cases')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        message: '案例删除成功'
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || '删除案例失败',
        details: error
      },
      { status: 500 }
    );
  }
}
