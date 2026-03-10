/**
 * Desktop Token API Route
 * Generates a proper JWT token for the desktop app to use with the Express API
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';

// Use the same JWT secret as the Express API
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Derive a deterministic UUID from an arbitrary string so that tokens
 * always contain a valid UUID for downstream Supabase queries.
 */
function toUuid(value: string): string {
  if (UUID_RE.test(value)) return value;
  const hash = createHash('sha256').update(value).digest('hex');
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '4' + hash.slice(13, 16),
    ((parseInt(hash[16], 16) & 0x3) | 0x8).toString(16) + hash.slice(17, 20),
    hash.slice(20, 32),
  ].join('-');
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = toUuid(session.user.id || session.user.email || '');

    // Create a JWT token that the Express API can verify
    const token = jwt.sign(
      {
        id: userId,
        sub: userId,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      },
      JWT_SECRET,
      {
        expiresIn: '7d',
        issuer: 'velanova',
        audience: 'desktop-app',
      }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      },
    });
  } catch (error) {
    console.error('Failed to generate desktop token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
