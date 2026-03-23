import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json(
      {
        error: '登出失败',
        details: error.message
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: '登出成功'
    },
    { status: 200 }
  );
}
