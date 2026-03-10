/**
 * Authentication Middleware
 * Validates API keys and JWT tokens
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config, supabase } from '../config/index.js';
import { ApiError } from './errorHandler.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('auth');

/**
 * Validate API Key from header
 */
export async function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return next(ApiError.unauthorized('API key required'));
  }

  try {
    // Validate API key against database
    if (!supabase) {
      // Development mode - allow any key
      if (config.env === 'development') {
        req.apiKey = { id: 'dev', tier: 'pro' };
        return next();
      }
      return next(ApiError.serviceUnavailable('Database not configured'));
    }

    const { data: keyData, error } = await supabase
      .from('api_keys')
      .select('id, user_id, tier, is_active, rate_limit')
      .eq('key_hash', hashApiKey(apiKey))
      .single();

    if (error || !keyData) {
      logger.warn({ apiKey: apiKey.slice(0, 8) + '...' }, 'Invalid API key');
      return next(ApiError.unauthorized('Invalid API key'));
    }

    if (!keyData.is_active) {
      return next(ApiError.forbidden('API key is disabled'));
    }

    // Attach key info to request
    req.apiKey = keyData;
    next();
  } catch (err) {
    logger.error({ error: err.message }, 'API key validation error');
    next(ApiError.internal('Authentication failed'));
  }
}

/**
 * Validate JWT token from Authorization header
 */
// UUID v4 pattern
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Derive a deterministic v5-style UUID from an arbitrary string so that
 * non-UUID identifiers (e.g. Google numeric IDs, emails) can be used safely
 * as a Supabase `user_id` column filter without triggering PostgreSQL 22P02.
 */
function toUuid(value) {
  if (UUID_RE.test(value)) return value;
  const hash = crypto.createHash('sha256').update(value).digest('hex');
  // Format as UUID v4-like: 8-4-4-4-12
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '4' + hash.slice(13, 16),          // version nibble = 4
    ((parseInt(hash[16], 16) & 0x3) | 0x8).toString(16) + hash.slice(17, 20), // variant
    hash.slice(20, 32),
  ].join('-');
}

export function validateJwt(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Bearer token required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    // Normalise: Supabase JWTs use `sub` for the user UUID, but our
    // route handlers expect `req.user.id`.
    decoded.id = decoded.id || decoded.sub;

    // Ensure user id is always a valid UUID – some OAuth flows may pass
    // a Google numeric ID or email instead of a UUID.
    if (decoded.id) {
      decoded.id = toUuid(decoded.id);
    } else {
      return next(ApiError.unauthorized('Token missing user identity'));
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token expired'));
    }
    return next(ApiError.unauthorized('Invalid token'));
  }
}

/**
 * Optional JWT - doesn't fail if missing
 */
export function optionalJwt(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
  } catch (err) {
    // Ignore invalid tokens for optional auth
  }

  next();
}

/**
 * Validate license key
 */
export function validateLicense(req, res, next) {
  const licenseKey = req.headers['x-license-key'];

  if (!licenseKey) {
    return next(ApiError.unauthorized('License key required'));
  }

  try {
    const decoded = jwt.verify(licenseKey, config.license.jwtSecret);
    req.license = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('License expired'));
    }
    return next(ApiError.unauthorized('Invalid license'));
  }
}

/**
 * Hash API key for storage/lookup
 */
function hashApiKey(apiKey) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}
