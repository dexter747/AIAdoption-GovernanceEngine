/**
 * Google OAuth Callback API
 * Handles the callback from Google after authentication
 * Stores/updates user in Supabase (synced with admin dashboard)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateTokenPair } from '@/lib/jwt-auth';
import supabase from '@/lib/supabase';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 
  `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  id_token: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_error', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  // Parse state
  let stateData: { isDesktop?: boolean; callbackUrl?: string } = {};
  try {
    if (state) {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    }
  } catch {
    console.error('Failed to parse state');
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(new URL('/login?error=userinfo_failed', request.url));
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json();

    // Store user in Supabase (synced with admin dashboard)
    let dbUserId = googleUser.id;
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', googleUser.email)
        .single();

      if (existingUser) {
        // Update existing user
        await supabase
          .from('users')
          .update({
            full_name: googleUser.name,
            avatar_url: googleUser.picture,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingUser.id);
        dbUserId = existingUser.id;
        console.log('✅ User updated in Supabase:', existingUser.id);
      } else {
        // Create new user
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            email: googleUser.email,
            full_name: googleUser.name,
            avatar_url: googleUser.picture,
            plan: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Supabase insert error:', insertError);
        } else if (newUser) {
          dbUserId = newUser.id;
          console.log('✅ New user created in Supabase:', newUser.id);
        }
      }
    } catch (dbError) {
      console.error('Supabase error (continuing):', dbError);
      // Continue without database if it fails
    }

    // Create user object for JWT
    const user = {
      id: dbUserId,
      email: googleUser.email,
      name: googleUser.name,
      image: googleUser.picture,
      plan: 'free' as const,
    };

    // Generate JWT tokens
    const tokens = await generateTokenPair(user);

    // Set session cookies
    const cookieStore = await cookies();
    
    cookieStore.set('user_session', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    cookieStore.set('auth_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    cookieStore.set('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    console.log('✅ User authenticated:', user.email);

    // Handle desktop app callback
    if (stateData.isDesktop) {
      const desktopCallbackUrl = new URL('/auth/desktop-callback', request.url);
      desktopCallbackUrl.searchParams.set('token', tokens.accessToken);
      desktopCallbackUrl.searchParams.set('refresh', tokens.refreshToken);
      return NextResponse.redirect(desktopCallbackUrl.toString());
    }

    // Web callback - redirect to download page after auth
    const callbackUrl = stateData.callbackUrl || '/download';
    return NextResponse.redirect(new URL(callbackUrl, request.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=callback_failed', request.url));
  }
}
