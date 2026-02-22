/**
 * Cloud Backend JWT Auth Library
 * Pure JWT implementation - no Supabase Auth dependency
 */

import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'velanova-jwt-secret-change-in-production';
const JWT_ISSUER = 'velanova';

export interface JWTPayload {
  sub: string;
  email: string;
  name?: string;
  image?: string;
  plan?: 'trial' | 'free' | 'professional' | 'team' | 'enterprise';
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
  type?: 'access' | 'refresh';
}

export interface AuthResult {
  success: boolean;
  user?: JWTPayload;
  error?: string;
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

async function createSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = new Uint8Array(signature);

  let binary = '';
  signatureArray.forEach(byte => (binary += String.fromCharCode(byte)));

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function verifyToken(token: string): Promise<AuthResult> {
  try {
    const secret = process.env.JWT_SECRET || JWT_SECRET;
    const parts = token.split('.');

    if (parts.length !== 3) {
      return { success: false, error: 'Invalid token format' };
    }

    const [headerEncoded, payloadEncoded, signature] = parts;
    const expectedSignature = await createSignature(`${headerEncoded}.${payloadEncoded}`, secret);

    if (signature !== expectedSignature) {
      return { success: false, error: 'Invalid signature' };
    }

    const payload: JWTPayload = JSON.parse(base64UrlDecode(payloadEncoded));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { success: false, error: 'Token expired' };
    }

    if (payload.iss !== JWT_ISSUER) {
      return { success: false, error: 'Invalid issuer' };
    }

    return { success: true, user: payload };
  } catch (error) {
    return { success: false, error: 'Token verification failed' };
  }
}

export function extractTokenFromHeader(authHeader: string | undefined | null): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7);
  return authHeader;
}

export async function getUser(): Promise<{ user: JWTPayload | null; error: string | null }> {
  try {
    const cookieStore = await cookies();

    // Try auth_token cookie first
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { user: null, error: 'No auth token' };
    }

    const result = await verifyToken(token);

    if (!result.success || !result.user) {
      return { user: null, error: result.error || 'Invalid token' };
    }

    return {
      user: result.user,
      error: null,
    };
  } catch (error) {
    return { user: null, error: 'Failed to get user' };
  }
}

export async function getUserFromRequest(
  request: Request
): Promise<{ user: JWTPayload | null; error: string | null }> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return { user: null, error: 'No auth token' };
  }

  const result = await verifyToken(token);

  if (!result.success || !result.user) {
    return { user: null, error: result.error || 'Invalid token' };
  }

  return { user: result.user, error: null };
}
