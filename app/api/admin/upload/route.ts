import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// 图片上传
export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: '系统未配置，请联系管理员' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '请选择文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '只能上传图片文件' },
        { status: 400 }
      );
    }

    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '文件大小不能超过 10MB' },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const filename = `cases/${timestamp}-${random}.${file.name.split('.').pop()}`;

    // 上传到 Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('cases_images')
      .upload(filename, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) throw error;

    // 获取公开 URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('cases_images')
      .getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || '上传失败',
        details: error
      },
      { status: 500 }
    );
  }
}
