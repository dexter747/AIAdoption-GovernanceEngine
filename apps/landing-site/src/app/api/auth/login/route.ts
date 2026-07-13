/**
 * Email/Password Login API
 * POST /api/auth/login
 * Authenticates with email+password, returns JWT session
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import supabase from '@/lib/supabase';
import { generateTokenPair } from '@/lib/jwt-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select(
        'id, email, full_name, avatar_url, plan, password_hash, email_verified, auth_provider'
      )
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if this is a Google-only account
    if (!user.password_hash) {
      return NextResponse.json(
        { error: 'This account uses Google sign-in. Please use "Continue with Google" instead.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check email verification
    if (!user.email_verified) {
      return NextResponse.json(
        {
          error:
            'Please verify your email before signing in. Check your inbox for the verification link.',
          requiresVerification: true,
        },
        { status: 403 }
      );
    }

    // Create user session object
    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.full_name || undefined,
      image: user.avatar_url || undefined,
      plan: (user.plan || 'free') as 'trial' | 'free' | 'professional' | 'team' | 'enterprise',
    };

    // Generate JWT tokens
    const tokens = await generateTokenPair(sessionUser);

    // Set session cookies
    const cookieStore = await cookies();

    cookieStore.set('user_session', JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    cookieStore.set('auth_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });

    cookieStore.set('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: sessionUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
