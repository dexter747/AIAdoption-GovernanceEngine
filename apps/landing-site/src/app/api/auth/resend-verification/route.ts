/**
 * Resend Verification Email API
 * POST /api/auth/resend-verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHmac } from 'crypto';
import supabase from '@/lib/supabase';
import { sendVerificationEmail } from '@/services/email';

const TOKEN_SECRET = process.env.JWT_SECRET || 'velanova-jwt-secret';

function createVerificationToken(userId: string, email: string): string {
  const payload = JSON.stringify({
    uid: userId,
    email,
    exp: Date.now() + 24 * 60 * 60 * 1000,
    nonce: randomBytes(8).toString('hex'),
  });
  const sig = createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64url') + '.' + sig;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user
    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name, email_verified, password_hash')
      .eq('email', email.toLowerCase())
      .single();

    // Always return success to prevent enumeration
    const successResponse = {
      message: "If that email needs verification, we've sent a new link.",
    };

    if (!user || !user.password_hash || user.email_verified) {
      return NextResponse.json(successResponse);
    }

    const token = createVerificationToken(user.id, user.email);
    await sendVerificationEmail(user.email, user.full_name || '', token);

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
