/**
 * Email/Password Signup API
 * POST /api/auth/signup
 * Creates user with hashed password, sends verification email
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomBytes, createHmac } from 'crypto';
import supabase from '@/lib/supabase';
import { sendVerificationEmail, sendWelcomeEmail } from '@/services/email';

const SALT_ROUNDS = 10;
const TOKEN_SECRET = process.env.JWT_SECRET || 'velanova-jwt-secret';

function createVerificationToken(userId: string, email: string): string {
  const payload = JSON.stringify({
    uid: userId,
    email,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    nonce: randomBytes(8).toString('hex'),
  });
  const sig = createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64url') + '.' + sig;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, auth_provider, email_verified, password_hash')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      // If user exists via Google OAuth, tell them
      if (existingUser.auth_provider === 'nextauth' && !existingUser.password_hash) {
        return NextResponse.json(
          { error: 'This email is linked to a Google account. Please sign in with Google.' },
          { status: 409 }
        );
      }
      // If user signed up with email but hasn't verified
      if (existingUser.password_hash && !existingUser.email_verified) {
        // Re-send verification email
        const token = createVerificationToken(existingUser.id, email.toLowerCase());
        await sendVerificationEmail(email.toLowerCase(), name || '', token);
        return NextResponse.json({
          message: 'A verification email has been re-sent. Please check your inbox.',
          requiresVerification: true,
        });
      }
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        full_name: name || null,
        password_hash: passwordHash,
        email_verified: false,
        auth_provider: 'email',
        plan: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Signup insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      );
    }

    // Generate verification token
    const verificationToken = createVerificationToken(newUser.id, email.toLowerCase());

    // Send verification email
    await sendVerificationEmail(email.toLowerCase(), name || '', verificationToken);

    // Send welcome email (async, don't block)
    sendWelcomeEmail(email.toLowerCase(), name || '').catch(err =>
      console.error('Welcome email failed:', err)
    );

    return NextResponse.json({
      message: 'Account created! Please check your email to verify your address.',
      requiresVerification: true,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
