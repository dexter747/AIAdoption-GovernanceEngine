/**
 * JWT Token Generation API
 * Generates tokens for authenticated users (after Google OAuth)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateTokenPair, verifyToken } from '@/lib/jwt-auth';

export async function GET(request: NextRequest) {
  try {
    // Get user info from session cookie (set after OAuth)
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user_session');
    
    if (!userCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = JSON.parse(userCookie.value);

    // Generate JWT tokens
    const tokens = await generateTokenPair({
      id: user.id || user.email,
      email: user.email,
      name: user.name,
      image: user.image,
      plan: user.plan || 'trial',
    });

    return NextResponse.json({
      success: true,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      user: tokens.user,
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 400 }
      );
    }

    // Verify and decode refresh token
    const result = await verifyToken(refreshToken);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || 'Invalid refresh token' },
        { status: 401 }
      );
    }

    if (result.user.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 401 }
      );
    }

    // Generate new token pair
    const tokens = await generateTokenPair({
      id: result.user.sub,
      email: result.user.email,
      name: result.user.name,
      image: result.user.image,
      plan: result.user.plan,
    });

    return NextResponse.json({
      success: true,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      user: tokens.user,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
