import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'arch2026admin';

function hashToken(input: string): string {
  return createHash('sha256').update(input + Date.now().toString()).digest('hex');
}

// POST - 验证管理员密码
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: '请输入密码' },
        { status: 400 }
      );
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      );
    }

    // 生成 session token
    const token = hashToken(ADMIN_PASSWORD);

    return NextResponse.json({
      success: true,
      token,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '验证失败' },
      { status: 500 }
    );
  }
}
