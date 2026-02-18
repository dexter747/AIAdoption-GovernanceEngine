/**
 * Admin Dashboard JWT Auth Library
 * Pure JWT implementation - no NextAuth, no Supabase
 */

const JWT_SECRET = process.env.JWT_SECRET || 'ai-nexus-jwt-secret-change-in-production';
const JWT_ISSUER = 'ai-nexus';

// Only allow specific admin emails
export const ADMIN_EMAILS = [
  'admin@gmail.com',
  'maitreyak1806@gmail.com',
  // Add more admin emails here
];

export interface JWTPayload {
  sub: string;
  email: string;
  name?: string;
  image?: string;
  role?: 'admin' | 'user';
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

function base64UrlEncode(str: string): string {
  const utf8 = Buffer.from(str).toString('base64');
  return utf8.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function signToken(payload: Partial<JWTPayload>, expiresIn: number = 3600): Promise<string> {
  const secret = process.env.JWT_SECRET || JWT_SECRET;
  const now = Math.floor(Date.now() / 1000);
  
  const header = { alg: 'HS256', typ: 'JWT' };
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
    iss: JWT_ISSUER,
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = await createSignature(`${headerEncoded}.${payloadEncoded}`, secret);
  
  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

export async function generateTokenPair(user: { id: string; email: string; name?: string; image?: string }) {
  // Check if admin
  if (!ADMIN_EMAILS.includes(user.email)) {
    throw new Error('Not authorized as admin');
  }
  
  const accessPayload: Partial<JWTPayload> = {
    sub: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: 'admin',
    type: 'access',
  };
  
  const refreshPayload: Partial<JWTPayload> = {
    sub: user.id,
    email: user.email,
    type: 'refresh',
  };

  const accessToken = await signToken(accessPayload, 3600); // 1 hour
  const refreshToken = await signToken(refreshPayload, 604800); // 7 days

  return { accessToken, refreshToken };
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
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = new Uint8Array(signature);
  
  let binary = '';
  signatureArray.forEach(byte => binary += String.fromCharCode(byte));
  
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

    // Check if user is admin
    if (!payload.email || !ADMIN_EMAILS.includes(payload.email)) {
      return { success: false, error: 'Not authorized as admin' };
    }

    return { success: true, user: { ...payload, role: 'admin' } };
  } catch (error) {
    return { success: false, error: 'Token verification failed' };
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7);
  return authHeader;
}

export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

// Legacy compatibility
export async function auth() {
  return null;
}

export async function signIn() {
  throw new Error('Use /api/auth/google endpoint for sign in');
}

export async function signOut() {
  throw new Error('Use /api/auth/session endpoint for sign out');
}
