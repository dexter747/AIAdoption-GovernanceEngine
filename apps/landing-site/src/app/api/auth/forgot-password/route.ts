/**
 * Forgot Password API
 * POST /api/auth/forgot-password
 * Sends password reset email
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import supabase from '@/lib/supabase';
import { sendPasswordResetEmail } from '@/services/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const successResponse = {
      message: "If an account with that email exists, we've sent a password reset link.",
    };

    // Find user
    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name, password_hash')
      .eq('email', email.toLowerCase())
      .single();

    if (!user || !user.password_hash) {
      // Don't reveal whether user exists
      return NextResponse.json(successResponse);
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Store token in password_reset_tokens table
    const { error: tokenError } = await supabase.from('password_reset_tokens').insert({
      user_id: user.id,
      token: resetToken,
      expires_at: expiresAt,
    });

    if (tokenError) {
      console.error('Token insert error:', tokenError);
      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again.' },
        { status: 500 }
      );
    }

    // Send reset email
    await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
