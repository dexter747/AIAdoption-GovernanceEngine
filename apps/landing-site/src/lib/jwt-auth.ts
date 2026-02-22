/**
 * Universal JWT Auth Library for Landing Site
 * Pure JWT implementation - no NextAuth, no Supabase
 */

// Re-export from shared package for convenience
// In production, import directly from @shared/types

const JWT_SECRET = process.env.JWT_SECRET || 'velanova-jwt-secret-change-in-production';
const JWT_ISSUER = 'velanova';
const JWT_AUDIENCE = 'velanova-apps';

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

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
    plan?: string;
  };
}

export interface AuthResult {
  success: boolean;
  user?: JWTPayload;
  error?: string;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
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

function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 3600;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    case 'd':
      return value * 86400;
    default:
      return 3600;
  }
}

export async function signToken(
  payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'>,
  options?: { expiresIn?: string; type?: 'access' | 'refresh' }
): Promise<string> {
  const secret = process.env.JWT_SECRET || JWT_SECRET;
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = options?.expiresIn || '1h';
  const expirySeconds = parseExpiry(expiresIn);

  const header = { alg: 'HS256', typ: 'JWT' };

  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expirySeconds,
    iss: JWT_ISSUER,
    aud: JWT_AUDIENCE,
    type: options?.type || 'access',
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = await createSignature(`${headerEncoded}.${payloadEncoded}`, secret);

  return `${headerEncoded}.${payloadEncoded}.${signature}`;
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

export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
}

export async function generateTokenPair(user: {
  id: string;
  email: string;
  name?: string;
  image?: string;
  plan?: string;
}): Promise<TokenPair> {
  const accessToken = await signToken(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      plan: user.plan as JWTPayload['plan'],
    },
    { expiresIn: '1h', type: 'access' }
  );

  const refreshToken = await signToken(
    { sub: user.id, email: user.email },
    { expiresIn: '7d', type: 'refresh' }
  );

  const decoded = decodeToken(accessToken);
  const expiresAt = decoded?.exp ? decoded.exp * 1000 : Date.now() + 3600000;

  return {
    accessToken,
    refreshToken,
    expiresAt,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      plan: user.plan,
    },
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
  const result = await verifyToken(refreshToken);

  if (!result.success || !result.user || result.user.type !== 'refresh') {
    return null;
  }

  return generateTokenPair({
    id: result.user.sub,
    email: result.user.email,
    name: result.user.name,
    image: result.user.image,
    plan: result.user.plan,
  });
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7);
  return authHeader;
}

// Password hashing for email/password auth
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const passwordData = encoder.encode(password + saltHex);
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
  const hashArray = new Uint8Array(hashBuffer);
  const hashHex = Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;

  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
  const hashArray = new Uint8Array(hashBuffer);
  const verifyHash = Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return hash === verifyHash;
}

export function generateRandomToken(length: number = 32): string {
  const array = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
