/**
 * Authentication Middleware
 * Validates API keys and JWT tokens
 */

import jwt from 'jsonwebtoken';
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
export function validateJwt(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Bearer token required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
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
