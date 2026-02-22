/**
 * Email Verification API
 * GET /api/auth/verify-email?token=xxx
 * Verifies the email and redirects to /email-verified
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import supabase from '@/lib/supabase';
import { sendEmailVerifiedConfirmation } from '@/services/email';

const TOKEN_SECRET = process.env.JWT_SECRET || 'velanova-jwt-secret';

function verifyToken(token: string): { uid: string; email: string } | null {
  try {
    const [payloadB64, sig] = token.split('.');
    if (!payloadB64 || !sig) return null;

    const payload = Buffer.from(payloadB64, 'base64url').toString();
    const expectedSig = createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');

    if (sig !== expectedSig) return null;

    const data = JSON.parse(payload);
    if (Date.now() > data.exp) return null;

    return { uid: data.uid, email: data.email };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(
      new URL('/email-verified?status=error&reason=missing_token', request.url)
    );
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.redirect(
      new URL('/email-verified?status=error&reason=invalid_token', request.url)
    );
  }

  try {
    // Update user as verified
    const { data: user, error } = await supabase
      .from('users')
      .update({
        email_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', decoded.uid)
      .eq('email', decoded.email)
      .select('id, email, full_name, email_verified')
      .single();

    if (error || !user) {
      console.error('Verify email update error:', error);
      return NextResponse.redirect(
        new URL('/email-verified?status=error&reason=user_not_found', request.url)
      );
    }

    // Send confirmation email (async)
    sendEmailVerifiedConfirmation(user.email, user.full_name || '').catch(err =>
      console.error('Verified confirmation email failed:', err)
    );

    return NextResponse.redirect(new URL('/email-verified?status=success', request.url));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(
      new URL('/email-verified?status=error&reason=server_error', request.url)
    );
  }
}
