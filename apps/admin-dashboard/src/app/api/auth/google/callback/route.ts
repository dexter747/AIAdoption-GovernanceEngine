import { NextRequest, NextResponse } from 'next/server';
import { generateTokenPair, ADMIN_EMAILS } from '@/lib/jwt-auth';

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const stateParam = request.nextUrl.searchParams.get('state');
  
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  let callbackUrl = '/';
  try {
    if (stateParam) {
      const state = JSON.parse(Buffer.from(stateParam, 'base64url').toString());
      callbackUrl = state.callbackUrl || '/';
    }
  } catch {
    // Use default callback URL
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/auth/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Google token error:', error);
      return NextResponse.redirect(new URL('/login?error=token_exchange', request.url));
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL('/login?error=user_info', request.url));
    }

    const googleUser: GoogleUserInfo = await userResponse.json();

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(googleUser.email)) {
      return NextResponse.redirect(new URL('/login?error=not_admin', request.url));
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = await generateTokenPair({
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      image: googleUser.picture,
    });

    // Set cookies and redirect
    const response = NextResponse.redirect(new URL(callbackUrl, request.url));
    
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
      path: '/',
    });
    
    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=callback', request.url));
  }
}
