import { NextRequest, NextResponse } from 'next/server';

/**
 * Legacy Dodo webhook route — redirects to Lemon Squeezy handler.
 * Kept for backward compatibility only.
 */
export async function POST(request: NextRequest) {
  // Forward to the new Lemon Squeezy webhook handler
  const url = new URL('/api/webhooks/lemonsqueezy', request.url);
  const body = await request.text();

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: Object.fromEntries(request.headers.entries()),
    body,
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
