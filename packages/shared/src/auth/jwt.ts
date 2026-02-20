/**
 * Universal JWT Authentication Library
 * Works across all apps: landing-site, express-api, desktop-app, admin-dashboard
 * No dependency on Supabase or NextAuth
 */

import * as crypto from 'crypto';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'velanova-jwt-secret-change-in-production';
const JWT_ISSUER = 'velanova';
const JWT_AUDIENCE = 'velanova-apps';
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  sub: string; // User ID
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

/**
 * Base64URL encode
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64URL decode
 */
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

/**
 * Create HMAC-SHA256 signature
 */
function createSignature(data: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Parse expiry string to seconds
 */
function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 3600; // Default 1 hour
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 3600;
  }
}

/**
 * Generate a JWT token
 */
export function signToken(
  payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'>,
  options?: { expiresIn?: string; type?: 'access' | 'refresh' }
): string {
  const secret = process.env.JWT_SECRET || JWT_SECRET;
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = options?.expiresIn || ACCESS_TOKEN_EXPIRY;
  const expirySeconds = parseExpiry(expiresIn);

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

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
  const signature = createSignature(`${headerEncoded}.${payloadEncoded}`, secret);

  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): AuthResult {
  try {
    const secret = process.env.JWT_SECRET || JWT_SECRET;
    const parts = token.split('.');

    if (parts.length !== 3) {
      return { success: false, error: 'Invalid token format' };
    }

    const [headerEncoded, payloadEncoded, signature] = parts;

    // Verify signature
    const expectedSignature = createSignature(`${headerEncoded}.${payloadEncoded}`, secret);
    if (signature !== expectedSignature) {
      return { success: false, error: 'Invalid signature' };
    }

    // Decode payload
    const payload: JWTPayload = JSON.parse(base64UrlDecode(payloadEncoded));

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { success: false, error: 'Token expired' };
    }

    // Verify issuer
    if (payload.iss !== JWT_ISSUER) {
      return { success: false, error: 'Invalid issuer' };
    }

    return { success: true, user: payload };
  } catch (error) {
    return { success: false, error: 'Token verification failed' };
  }
}

/**
 * Decode a JWT token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
}

/**
 * Generate access and refresh token pair
 */
export function generateTokenPair(user: {
  id: string;
  email: string;
  name?: string;
  image?: string;
  plan?: string;
}): TokenPair {
  const accessToken = signToken(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      plan: user.plan as JWTPayload['plan'],
    },
    { expiresIn: ACCESS_TOKEN_EXPIRY, type: 'access' }
  );

  const refreshToken = signToken(
    {
      sub: user.id,
      email: user.email,
    },
    { expiresIn: REFRESH_TOKEN_EXPIRY, type: 'refresh' }
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

/**
 * Refresh an access token using a refresh token
 */
export function refreshAccessToken(refreshToken: string): TokenPair | null {
  const result = verifyToken(refreshToken);
  
  if (!result.success || !result.user) {
    return null;
  }

  if (result.user.type !== 'refresh') {
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

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  return authHeader;
}

/**
 * Hash a password using PBKDF2
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

/**
 * Generate a random token (for email verification, password reset, etc.)
 */
export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a secure API key
 */
export function generateApiKey(prefix: string = 'ainx'): string {
  const key = crypto.randomBytes(24).toString('base64url');
  return `${prefix}_${key}`;
}
