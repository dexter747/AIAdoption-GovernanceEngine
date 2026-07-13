/**
 * Google OAuth Login API
 * Redirects to Google for authentication
 */

import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

/** Derive the OAuth redirect URI from the actual incoming request.
 *  Works correctly in all environments — localhost, Vercel preview, production. */
function getRedirectUri(request: NextRequest): string {
  const reqUrl = new URL(request.url);
  // Trust X-Forwarded-Host so Vercel proxy chains are handled correctly
  const host =
    request.headers.get('x-forwarded-host') || request.headers.get('host') || reqUrl.host;
  const proto = request.headers.get('x-forwarded-proto') ?? reqUrl.protocol.replace(':', '');
  return `${proto}://${host}/api/auth/google/callback`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isDesktop = searchParams.get('desktop') === 'true';
  const callbackUrl = searchParams.get('callbackUrl') || '/download';

  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
  }

  // Compute the redirect URI from this request so it always matches the environment
  const redirectUri = getRedirectUri(request);

  // Store state for CSRF protection, callback info, AND the redirect URI used
  // so the callback can pass the exact same value to Google's token endpoint
  const state = Buffer.from(
    JSON.stringify({
      isDesktop,
      callbackUrl,
      redirectUri,
      nonce: crypto.randomUUID(),
    })
  ).toString('base64url');

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'consent');

  return NextResponse.redirect(googleAuthUrl.toString());
}
