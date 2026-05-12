import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const r = await fetch('https://api.duckduckgo.com/?q=green+building&format=json&no_html=1');
    const text = await r.text();
    
    let parsed: any = null;
    try { parsed = JSON.parse(text); } catch {}
    
    return NextResponse.json({
      ok: r.ok,
      status: r.status,
      length: text.length,
      isJson: !!parsed,
      hasAbstract: !!parsed?.Abstract,
      abstractLength: parsed?.Abstract?.length || 0,
      relatedTopics: parsed?.RelatedTopics?.length || 0,
      firstTopic: parsed?.RelatedTopics?.[0] ? {
        hasUrl: !!parsed.RelatedTopics[0].FirstURL,
        hasText: !!parsed.RelatedTopics[0].Text,
        textPreview: parsed.RelatedTopics[0].Text?.substring(0, 80),
      } : null,
      sample: text.substring(0, 200),
    });
  } catch(e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.substring(0, 300) });
  }
}
