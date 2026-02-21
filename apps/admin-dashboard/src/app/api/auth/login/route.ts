import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateTokenPair, ADMIN_EMAILS } from '@/lib/jwt-auth';

// ---------------------------------------------------------------------------
// In-memory rate limiter — max 5 attempts per IP per 15 minutes
// ---------------------------------------------------------------------------
const attempts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSecs: number } {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSecs: 0 };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSecs: Math.ceil((record.resetAt - now) / 1000) };
  }

  record.count++;
  return { allowed: true, retryAfterSecs: 0 };
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${rateCheck.retryAfterSecs}s.` },
        { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfterSecs) } }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminPasswordHash) {
      console.error('ADMIN_PASSWORD_HASH env var is not set');
      return NextResponse.json({ error: 'Server misconfiguration — ADMIN_PASSWORD_HASH not set' }, { status: 500 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isInAdminList = ADMIN_EMAILS.includes(normalizedEmail);

    // Always run bcrypt.compare even on email mismatch to prevent timing attacks
    const passwordMatches = await bcrypt.compare(password, adminPasswordHash);

    if (!isInAdminList || !passwordMatches) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Clear rate limit record on success
    attempts.delete(ip);

    // Generate JWT pair
    const { accessToken, refreshToken } = await generateTokenPair({
      id: 'admin-01',
      email: normalizedEmail,
      name: 'Admin',
    });

    const response = NextResponse.json(
      { success: true, user: { email: normalizedEmail, name: 'Admin', role: 'admin' } },
      { status: 200 }
    );

    // Set HttpOnly cookies
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
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
