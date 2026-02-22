/**
 * Session API
 * Returns current user session from JWT
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt-auth';

export async function GET(request: NextRequest) {
  try {
    // Check Authorization header first
    const authHeader = request.headers.get('authorization');
    let token = extractTokenFromHeader(authHeader || undefined);

    // Fallback to cookie
    if (!token) {
      const cookieStore = await cookies();
      const tokenCookie = cookieStore.get('auth_token');
      token = tokenCookie?.value || null;
    }

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const result = await verifyToken(token);

    if (!result.success || !result.user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: result.user.sub,
        email: result.user.email,
        name: result.user.name,
        image: result.user.image,
        plan: result.user.plan || 'trial',
      },
      expiresAt: result.user.exp ? result.user.exp * 1000 : null,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}

export async function DELETE(request: NextRequest) {
  // Logout - clear cookies
  const cookieStore = await cookies();

  cookieStore.delete('user_session');
  cookieStore.delete('auth_token');
  cookieStore.delete('refresh_token');

  return NextResponse.json({ success: true });
}
