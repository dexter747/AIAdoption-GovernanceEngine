/**
 * Reset Password API
 * POST /api/auth/reset-password
 * Validates token and sets new password
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import supabase from '@/lib/supabase';

const SALT_ROUNDS = 10;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Find valid token
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('id, user_id, expires_at')
      .eq('token', token)
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date(tokenRecord.expires_at) < new Date()) {
      // Delete expired token
      await supabase.from('password_reset_tokens').delete().eq('id', tokenRecord.id);
      return NextResponse.json(
        { error: 'This reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Update user password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        email_verified: true, // Also verify email since they clicked the email link
        updated_at: new Date().toISOString(),
      })
      .eq('id', tokenRecord.user_id);

    if (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password. Please try again.' },
        { status: 500 }
      );
    }

    // Delete the used token + any other tokens for this user
    await supabase.from('password_reset_tokens').delete().eq('user_id', tokenRecord.user_id);

    return NextResponse.json({
      message: 'Password reset successfully. You can now sign in.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
