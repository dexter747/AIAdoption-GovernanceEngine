/**
 * Security Middleware
 * Additional security measures including sanitization and security headers
 */

import { createLogger } from '../utils/logger.js';

const logger = createLogger('security');

/**
 * Sanitize request body to prevent XSS and injection attacks
 * Removes potentially dangerous HTML/script content from strings
 */
export function sanitizeRequest(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  next();
}

function sanitizeObject(obj, depth = 0) {
  // Prevent deep recursion attacks
  if (depth > 10) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeValue(item, depth));
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key as well (prevent prototype pollution)
      const safeKey = sanitizeString(key);
      if (safeKey === '__proto__' || safeKey === 'constructor' || safeKey === 'prototype') {
        logger.warn({ key }, 'Blocked potentially dangerous key');
        continue;
      }
      sanitized[safeKey] = sanitizeValue(value, depth);
    }
    return sanitized;
  }

  return obj;
}

function sanitizeValue(value, depth) {
  if (typeof value === 'string') {
    return sanitizeString(value);
  }
  if (typeof value === 'object' && value !== null) {
    return sanitizeObject(value, depth + 1);
  }
  return value;
}

function sanitizeString(str) {
  if (typeof str !== 'string') return str;

  // Remove null bytes
  str = str.replace(/\0/g, '');

  // Basic HTML entity encoding for common dangerous characters
  // Note: This is a lightweight sanitization - for full HTML, use a library like DOMPurify
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, 'data_blocked:')
    .replace(/vbscript:/gi, '');
}

/**
 * Request size limiter - prevents large payload attacks
 * Applied per-route for fine-grained control
 */
export function limitPayloadSize(maxBytes = 1024 * 1024) {
  // Default 1MB
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > maxBytes) {
      return res.status(413).json({
        error: 'Payload Too Large',
        message: `Request body must be smaller than ${maxBytes} bytes`,
        code: 'PAYLOAD_TOO_LARGE',
      });
    }
    next();
  };
}

/**
 * IP-based rate limiting for sensitive operations
 * Stricter than the global rate limiter
 */
const sensitiveOpTracker = new Map();
const SENSITIVE_WINDOW_MS = 60 * 1000; // 1 minute
const SENSITIVE_MAX_REQUESTS = 5;

export function limitSensitiveOperations(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const key = `${ip}:${req.path}`;
  const now = Date.now();

  // Clean up old entries
  for (const [k, v] of sensitiveOpTracker.entries()) {
    if (now - v.timestamp > SENSITIVE_WINDOW_MS) {
      sensitiveOpTracker.delete(k);
    }
  }

  const record = sensitiveOpTracker.get(key);

  if (record) {
    if (now - record.timestamp < SENSITIVE_WINDOW_MS) {
      if (record.count >= SENSITIVE_MAX_REQUESTS) {
        logger.warn(
          { ip, path: req.path, count: record.count },
          'Rate limited sensitive operation'
        );
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Please wait before trying again',
          retryAfter: Math.ceil((SENSITIVE_WINDOW_MS - (now - record.timestamp)) / 1000),
        });
      }
      record.count++;
    } else {
      record.timestamp = now;
      record.count = 1;
    }
  } else {
    sensitiveOpTracker.set(key, { timestamp: now, count: 1 });
  }

  next();
}

/**
 * Verify origin for CSRF protection
 * Checks that requests come from allowed origins
 */
export function verifyCsrfOrigin(allowedOrigins = []) {
  return (req, res, next) => {
    // Skip for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const origin = req.headers.origin || req.headers.referer;

    // Allow requests without origin (e.g., from desktop apps, curl)
    if (!origin) {
      return next();
    }

    // Check if origin is allowed
    const originUrl = new URL(origin);
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      try {
        const allowedUrl = new URL(allowed);
        return originUrl.host === allowedUrl.host;
      } catch {
        return originUrl.host === allowed;
      }
    });

    if (!isAllowed) {
      logger.warn({ origin, ip: req.ip }, 'CSRF origin check failed');
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid request origin',
        code: 'CSRF_ORIGIN_MISMATCH',
      });
    }

    next();
  };
}

/**
 * Security headers for API responses
 * Complements helmet for API-specific headers
 */
export function apiSecurityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Don't cache sensitive API responses by default
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Remove powered-by header
  res.removeHeader('X-Powered-By');

  next();
}

/**
 * Log security events
 */
export function logSecurityEvent(eventType, details) {
  logger.info(
    {
      eventType,
      ...details,
      timestamp: new Date().toISOString(),
    },
    `Security event: ${eventType}`
  );
}
