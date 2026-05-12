import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = '绿色建筑';
    const params = new URLSearchParams({ q: query });
    
    const r = await fetch('https://lite.duckduckgo.com/lite/', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html',
      },
      body: params.toString(),
    });

    const html = await r.text();
    
    // 正则匹配
    const regex = /<a[^>]*class='result-link'[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    const matches = [...html.matchAll(regex)];
    
    // 通用 a 标签
    const allLinks = [...html.matchAll(/href="(https?:\/\/[^"]+)"/gi)];

    return NextResponse.json({
      ok: r.ok,
      status: r.status,
      length: html.length,
      hasResultLink: html.includes('result-link'),
      hasResultSnippet: html.includes('result-snippet'),
      regexMatches: matches.length,
      allLinksCount: allLinks.length,
      sampleLinks: allLinks.slice(0, 5).map(m => m[1]),
      sampleHtml: html.substring(html.indexOf('result-link') > -1 ? Math.max(0, html.indexOf('result-link') - 200) : 0, 
                                  html.indexOf('result-link') > -1 ? html.indexOf('result-link') + 500 : 500),
    });
  } catch(e: any) {
    return NextResponse.json({ error: e.message });
  }
}
