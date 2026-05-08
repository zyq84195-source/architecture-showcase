/**
 * 获取案例列表 API
 *
 * 功能：返回网站所有案例列表（用于智能搜索的对比功能）
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 读取案例数据
    const fs = await import('fs');
    const path = await import('path');
    
    const casesFilePath = path.join(process.cwd(), 'data', 'cases.json');
    const casesData = fs.readFileSync(casesFilePath, 'utf-8');
    const cases = JSON.parse(casesData);

    return NextResponse.json({
      success: true,
      cases: cases,
      count: cases.length,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Get Cases Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
