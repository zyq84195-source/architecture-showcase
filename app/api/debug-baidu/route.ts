import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const r = await fetch('https://www.baidu.com/s?wd=test&ie=utf-8', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await r.text();
    return NextResponse.json({
      ok: r.ok,
      status: r.status,
      length: html.length,
      hasCContainer: html.includes('c-container'),
      hasResult: html.includes('result'),
      hasVerify: html.includes('verify') || html.includes('captcha') || html.includes('验证'),
      sample: html.substring(0, 500),
    });
  } catch(e: any) {
    return NextResponse.json({ error: e.message });
  }
}
