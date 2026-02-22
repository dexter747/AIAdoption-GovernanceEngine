/**
 * API Route Auth Guard
 * Verifies the admin JWT token from cookies before allowing access to data API routes.
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken } from './jwt-auth';

export async function requireAdmin(): Promise<{ authorized: true; user: { email: string; sub: string } } | NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const result = await verifyToken(token);

  if (!result.success || !result.user) {
    return NextResponse.json(
      { error: result.error || 'Invalid or expired token' },
      { status: 401 }
    );
  }

  return { authorized: true, user: { email: result.user.email!, sub: result.user.sub! } };
}
