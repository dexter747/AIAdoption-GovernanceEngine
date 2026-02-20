import { NextRequest, NextResponse } from 'next/server';

const cache = new Map<string, { arrayBuffer: ArrayBuffer; contentType: string; ts: number }>();

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url || !url.startsWith('https://')) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  // Check cache (1 hour TTL)
  const cached = cache.get(url);
  if (cached && Date.now() - cached.ts < 3600000) {
    return new NextResponse(cached.arrayBuffer, {
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Velanova/1.0' },
    });

    if (!resp.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: resp.status });
    }

    const arrayBuffer = await resp.arrayBuffer();
    const contentType = resp.headers.get('content-type') || 'image/jpeg';

    cache.set(url, { arrayBuffer, contentType, ts: Date.now() });

    // Cap cache at 500 entries
    if (cache.size > 500) {
      const oldest = cache.keys().next().value;
      if (oldest) cache.delete(oldest);
    }

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
  }
}
