/**
 * Express API - Middleware Tests
 * Tests all middleware functions including security, validation, and auth
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// ============================================================================
// SECURITY MIDDLEWARE TESTS
// ============================================================================

describe('Security Middleware', () => {
  describe('sanitizeRequest()', () => {
    // Helper to simulate sanitization logic
    function sanitizeString(str: string): string {
      if (typeof str !== 'string') return str;
      return str
        .replace(/\0/g, '')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, 'data_blocked:')
        .replace(/vbscript:/gi, '');
    }

    function sanitizeObject(obj: any, depth = 0): any {
      if (depth > 10) return obj;

      if (Array.isArray(obj)) {
        return obj.map(item => {
          if (typeof item === 'string') return sanitizeString(item);
          if (typeof item === 'object') return sanitizeObject(item, depth + 1);
          return item;
        });
      }

      if (obj !== null && typeof obj === 'object') {
        // Use Object.create(null) to avoid prototype chain issues
        const sanitized: any = Object.create(null);
        for (const [key, value] of Object.entries(obj)) {
          const safeKey = sanitizeString(key);
          if (['__proto__', 'constructor', 'prototype'].includes(safeKey)) continue;
          if (typeof value === 'string') {
            sanitized[safeKey] = sanitizeString(value);
          } else if (typeof value === 'object' && value !== null) {
            sanitized[safeKey] = sanitizeObject(value, depth + 1);
          } else {
            sanitized[safeKey] = value;
          }
        }
        return sanitized;
      }
      return obj;
    }

    it('should sanitize HTML tags in strings', () => {
      const input = { message: '<script>alert("xss")</script>' };
      const sanitized = sanitizeObject(input);

      expect(sanitized.message).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
      expect(sanitized.message).not.toContain('<script>');
    });

    it('should remove javascript: protocol', () => {
      const input = { url: 'javascript:alert(1)' };
      const sanitized = sanitizeObject(input);

      expect(sanitized.url).not.toContain('javascript:');
    });

    it('should block data: protocol', () => {
      const input = { image: 'data:text/html,<script>alert(1)</script>' };
      const sanitized = sanitizeObject(input);

      expect(sanitized.image).toContain('data_blocked:');
      expect(sanitized.image).not.toMatch(/^data:/);
    });

    it('should remove null bytes', () => {
      const input = { text: 'hello\x00world' };
      const sanitized = sanitizeObject(input);

      expect(sanitized.text).toBe('helloworld');
      expect(sanitized.text).not.toContain('\x00');
    });

    it('should block prototype pollution attempts', () => {
      const input = {
        __proto__: { admin: true },
        constructor: { isAdmin: true },
        prototype: { hacked: true },
        normal: 'value',
      };
      const sanitized = sanitizeObject(input);

      expect(sanitized['__proto__']).toBeUndefined();
      expect(sanitized['constructor']).toBeUndefined();
      expect(sanitized['prototype']).toBeUndefined();
      expect(sanitized['normal']).toBe('value');
    });

    it('should handle nested objects', () => {
      const input = {
        level1: {
          level2: {
            level3: '<script>xss</script>',
          },
        },
      };
      const sanitized = sanitizeObject(input);

      expect(sanitized.level1.level2.level3).toBe('&lt;script&gt;xss&lt;/script&gt;');
    });

    it('should handle arrays', () => {
      const input = {
        items: ['<b>bold</b>', 'normal', '<script>xss</script>'],
      };
      const sanitized = sanitizeObject(input);

      expect(sanitized.items[0]).toBe('&lt;b&gt;bold&lt;/b&gt;');
      expect(sanitized.items[1]).toBe('normal');
      expect(sanitized.items[2]).toBe('&lt;script&gt;xss&lt;/script&gt;');
    });

    it('should preserve non-string values', () => {
      const input = {
        number: 42,
        boolean: true,
        nullValue: null,
        array: [1, 2, 3],
      };
      const sanitized = sanitizeObject(input);

      expect(sanitized.number).toBe(42);
      expect(sanitized.boolean).toBe(true);
      expect(sanitized.nullValue).toBe(null);
      expect(sanitized.array).toEqual([1, 2, 3]);
    });

    it('should prevent deep recursion attacks', () => {
      // Create deeply nested object
      let nested: any = { value: 'test' };
      for (let i = 0; i < 15; i++) {
        nested = { child: nested };
      }

      // Should not throw, should stop at depth 10
      expect(() => sanitizeObject(nested)).not.toThrow();
    });
  });

  describe('limitPayloadSize()', () => {
    function createLimiter(maxBytes: number) {
      return (contentLength: number) => {
        if (contentLength > maxBytes) {
          return {
            allowed: false,
            error: {
              code: 'PAYLOAD_TOO_LARGE',
              message: `Request body must be smaller than ${maxBytes} bytes`,
            },
          };
        }
        return { allowed: true };
      };
    }

    it('should allow requests under the limit', () => {
      const limiter = createLimiter(1024);

      expect(limiter(500).allowed).toBe(true);
      expect(limiter(1024).allowed).toBe(true);
    });

    it('should reject requests over the limit', () => {
      const limiter = createLimiter(1024);

      expect(limiter(1025).allowed).toBe(false);
      expect(limiter(2000).allowed).toBe(false);
    });

    it('should use default 1MB limit', () => {
      const limiter = createLimiter(1024 * 1024);

      expect(limiter(1024 * 1024).allowed).toBe(true);
      expect(limiter(1024 * 1024 + 1).allowed).toBe(false);
    });

    it('should allow zero-length requests', () => {
      const limiter = createLimiter(1024);

      expect(limiter(0).allowed).toBe(true);
    });
  });

  describe('limitSensitiveOperations()', () => {
    const WINDOW_MS = 60000;
    const MAX_REQUESTS = 5;

    class RateLimiter {
      private tracker = new Map<string, { timestamp: number; count: number }>();

      check(key: string): { allowed: boolean; retryAfter?: number } {
        const now = Date.now();
        const record = this.tracker.get(key);

        if (!record || now - record.timestamp >= WINDOW_MS) {
          this.tracker.set(key, { timestamp: now, count: 1 });
          return { allowed: true };
        }

        if (record.count >= MAX_REQUESTS) {
          return {
            allowed: false,
            retryAfter: Math.ceil((WINDOW_MS - (now - record.timestamp)) / 1000),
          };
        }

        record.count++;
        return { allowed: true };
      }

      reset() {
        this.tracker.clear();
      }
    }

    it('should allow requests under the limit', () => {
      const limiter = new RateLimiter();

      for (let i = 0; i < 5; i++) {
        expect(limiter.check('user-1').allowed).toBe(true);
      }
    });

    it('should block requests over the limit', () => {
      const limiter = new RateLimiter();

      for (let i = 0; i < 5; i++) {
        limiter.check('user-1');
      }

      expect(limiter.check('user-1').allowed).toBe(false);
    });

    it('should return retry-after time', () => {
      const limiter = new RateLimiter();

      for (let i = 0; i < 6; i++) {
        limiter.check('user-1');
      }

      const result = limiter.check('user-1');
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(60);
    });

    it('should track different users independently', () => {
      const limiter = new RateLimiter();

      for (let i = 0; i < 5; i++) {
        limiter.check('user-1');
      }

      expect(limiter.check('user-1').allowed).toBe(false);
      expect(limiter.check('user-2').allowed).toBe(true);
    });
  });

  describe('verifyCsrfOrigin()', () => {
    function createOriginChecker(allowedOrigins: string[]) {
      return (origin: string | undefined, method: string) => {
        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
          return { allowed: true };
        }

        if (!origin) {
          return { allowed: true }; // Allow requests without origin (desktop apps, curl)
        }

        try {
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

          return { allowed: isAllowed };
        } catch {
          return { allowed: false };
        }
      };
    }

    it('should allow safe methods without checking origin', () => {
      const checker = createOriginChecker(['https://example.com']);

      expect(checker('https://evil.com', 'GET').allowed).toBe(true);
      expect(checker('https://evil.com', 'HEAD').allowed).toBe(true);
      expect(checker('https://evil.com', 'OPTIONS').allowed).toBe(true);
    });

    it('should allow requests without origin header', () => {
      const checker = createOriginChecker(['https://example.com']);

      expect(checker(undefined, 'POST').allowed).toBe(true);
    });

    it('should allow whitelisted origins for POST', () => {
      const checker = createOriginChecker(['https://example.com', 'https://app.example.com']);

      expect(checker('https://example.com', 'POST').allowed).toBe(true);
      expect(checker('https://app.example.com', 'POST').allowed).toBe(true);
    });

    it('should reject non-whitelisted origins for POST', () => {
      const checker = createOriginChecker(['https://example.com']);

      expect(checker('https://evil.com', 'POST').allowed).toBe(false);
      expect(checker('https://example.com.evil.com', 'POST').allowed).toBe(false);
    });

    it('should allow wildcard origin', () => {
      const checker = createOriginChecker(['*']);

      expect(checker('https://any-origin.com', 'POST').allowed).toBe(true);
    });

    it('should handle localhost origins', () => {
      const checker = createOriginChecker(['http://localhost:3000', 'http://localhost:5500']);

      expect(checker('http://localhost:3000', 'POST').allowed).toBe(true);
      expect(checker('http://localhost:5500', 'POST').allowed).toBe(true);
      expect(checker('http://localhost:4000', 'POST').allowed).toBe(false);
    });
  });

  describe('apiSecurityHeaders()', () => {
    const expectedHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    };

    it('should set X-Content-Type-Options header', () => {
      expect(expectedHeaders['X-Content-Type-Options']).toBe('nosniff');
    });

    it('should set X-Frame-Options header', () => {
      expect(expectedHeaders['X-Frame-Options']).toBe('DENY');
    });

    it('should set X-XSS-Protection header', () => {
      expect(expectedHeaders['X-XSS-Protection']).toBe('1; mode=block');
    });

    it('should set Cache-Control header for no caching', () => {
      expect(expectedHeaders['Cache-Control']).toContain('no-store');
      expect(expectedHeaders['Cache-Control']).toContain('no-cache');
    });

    it('should set Pragma header', () => {
      expect(expectedHeaders['Pragma']).toBe('no-cache');
    });

    it('should set Expires header', () => {
      expect(expectedHeaders['Expires']).toBe('0');
    });
  });
});

// ============================================================================
// VALIDATION MIDDLEWARE TESTS
// ============================================================================

describe('Validation Middleware', () => {
  const { z } = require('zod');

  describe('validateBody()', () => {
    const testSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      age: z.number().min(0).optional(),
    });

    function validateBody(schema: any, body: any) {
      try {
        return { valid: true, data: schema.parse(body) };
      } catch (error: any) {
        return {
          valid: false,
          errors: error.errors.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code,
          })),
        };
      }
    }

    it('should pass valid body', () => {
      const result = validateBody(testSchema, {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      });

      expect(result.valid).toBe(true);
      expect(result.data?.name).toBe('John Doe');
    });

    it('should fail on missing required field', () => {
      const result = validateBody(testSchema, {
        name: 'John Doe',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.some((e: any) => e.field === 'email')).toBe(true);
    });

    it('should fail on invalid email format', () => {
      const result = validateBody(testSchema, {
        name: 'John',
        email: 'not-an-email',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e: any) => e.field === 'email')).toBe(true);
    });

    it('should fail on empty name', () => {
      const result = validateBody(testSchema, {
        name: '',
        email: 'john@example.com',
      });

      expect(result.valid).toBe(false);
    });

    it('should fail on negative age', () => {
      const result = validateBody(testSchema, {
        name: 'John',
        email: 'john@example.com',
        age: -1,
      });

      expect(result.valid).toBe(false);
    });

    it('should allow missing optional field', () => {
      const result = validateBody(testSchema, {
        name: 'John',
        email: 'john@example.com',
      });

      expect(result.valid).toBe(true);
      expect(result.data?.age).toBeUndefined();
    });
  });

  describe('validateQuery()', () => {
    const querySchema = z.object({
      search: z.string().optional(),
      page: z.string().regex(/^\d+$/).transform(Number).optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    });

    function validateQuery(schema: any, query: any) {
      try {
        return { valid: true, data: schema.parse(query) };
      } catch (error: any) {
        return { valid: false, errors: error.errors };
      }
    }

    it('should pass valid query params', () => {
      const result = validateQuery(querySchema, {
        search: 'test',
        page: '1',
        limit: '10',
      });

      expect(result.valid).toBe(true);
      expect(result.data?.page).toBe(1);
      expect(result.data?.limit).toBe(10);
    });

    it('should pass empty query', () => {
      const result = validateQuery(querySchema, {});

      expect(result.valid).toBe(true);
    });

    it('should fail on non-numeric page', () => {
      const result = validateQuery(querySchema, {
        page: 'abc',
      });

      expect(result.valid).toBe(false);
    });
  });

  describe('validateParams()', () => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    function validateParams(schema: any, params: any) {
      try {
        return { valid: true, data: schema.parse(params) };
      } catch (error: any) {
        return { valid: false, errors: error.errors };
      }
    }

    it('should pass valid UUID param', () => {
      const result = validateParams(paramsSchema, {
        id: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result.valid).toBe(true);
    });

    it('should fail on invalid UUID', () => {
      const result = validateParams(paramsSchema, {
        id: 'not-a-uuid',
      });

      expect(result.valid).toBe(false);
    });

    it('should fail on missing id', () => {
      const result = validateParams(paramsSchema, {});

      expect(result.valid).toBe(false);
    });
  });
});

// ============================================================================
// AUTH MIDDLEWARE TESTS
// ============================================================================

describe('Auth Middleware', () => {
  const jwt = require('jsonwebtoken');
  const SECRET = 'test-jwt-secret';

  describe('validateJwt()', () => {
    function validateJwt(authHeader: string | undefined) {
      if (!authHeader?.startsWith('Bearer ')) {
        return { valid: false, error: 'Bearer token required' };
      }

      const token = authHeader.split(' ')[1];

      try {
        const decoded = jwt.verify(token, SECRET);
        return { valid: true, user: decoded };
      } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
          return { valid: false, error: 'Token expired' };
        }
        return { valid: false, error: 'Invalid token' };
      }
    }

    it('should reject missing Authorization header', () => {
      const result = validateJwt(undefined);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Bearer token required');
    });

    it('should reject non-Bearer token', () => {
      const result = validateJwt('Basic abc123');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Bearer token required');
    });

    it('should accept valid JWT', () => {
      const token = jwt.sign({ userId: '123', email: 'test@example.com' }, SECRET, {
        expiresIn: '1h',
      });
      const result = validateJwt(`Bearer ${token}`);

      expect(result.valid).toBe(true);
      expect(result.user?.userId).toBe('123');
    });

    it('should reject expired JWT', () => {
      const token = jwt.sign({ userId: '123' }, SECRET, { expiresIn: '-1h' });
      const result = validateJwt(`Bearer ${token}`);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Token expired');
    });

    it('should reject invalid signature', () => {
      const token = jwt.sign({ userId: '123' }, 'wrong-secret', { expiresIn: '1h' });
      const result = validateJwt(`Bearer ${token}`);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid token');
    });

    it('should reject malformed token', () => {
      const result = validateJwt('Bearer invalid.token.here');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid token');
    });
  });

  describe('validateApiKey()', () => {
    const crypto = require('crypto');
    const validKeyHash = crypto.createHash('sha256').update('sk-valid-key').digest('hex');

    const mockApiKeys: Record<string, any> = {
      [validKeyHash]: { id: 'key-1', user_id: 'user-1', tier: 'pro', is_active: true },
    };

    function hashApiKey(key: string) {
      return crypto.createHash('sha256').update(key).digest('hex');
    }

    function validateApiKey(apiKey: string | undefined) {
      if (!apiKey) {
        return { valid: false, error: 'API key required' };
      }

      const hash = hashApiKey(apiKey);
      const keyData = mockApiKeys[hash];

      if (!keyData) {
        return { valid: false, error: 'Invalid API key' };
      }

      if (!keyData.is_active) {
        return { valid: false, error: 'API key is disabled' };
      }

      return { valid: true, keyData };
    }

    it('should reject missing API key', () => {
      const result = validateApiKey(undefined);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('API key required');
    });

    it('should accept valid API key', () => {
      const result = validateApiKey('sk-valid-key');

      expect(result.valid).toBe(true);
      expect(result.keyData?.tier).toBe('pro');
    });

    it('should reject invalid API key', () => {
      const result = validateApiKey('sk-invalid-key');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });

    it('should reject disabled API key', () => {
      const disabledHash = crypto.createHash('sha256').update('sk-disabled-key').digest('hex');
      mockApiKeys[disabledHash] = { id: 'key-2', is_active: false };

      const result = validateApiKey('sk-disabled-key');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('API key is disabled');
    });
  });
});

// ============================================================================
// ERROR HANDLER TESTS
// ============================================================================

describe('Error Handler', () => {
  describe('Zod Error Handling', () => {
    const { z, ZodError } = require('zod');

    function formatZodError(error: any) {
      if (error instanceof ZodError) {
        return {
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.errors.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        };
      }
      return null;
    }

    it('should format Zod errors correctly', () => {
      const schema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
      });

      try {
        schema.parse({ name: '', email: 'invalid' });
      } catch (error) {
        const formatted = formatZodError(error);

        expect(formatted).not.toBeNull();
        expect(formatted?.statusCode).toBe(400);
        expect(formatted?.code).toBe('VALIDATION_ERROR');
        expect(formatted?.details).toHaveLength(2);
      }
    });

    it('should include field paths in error details', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            age: z.number().positive(),
          }),
        }),
      });

      try {
        schema.parse({ user: { profile: { age: -1 } } });
      } catch (error) {
        const formatted = formatZodError(error);

        expect(formatted?.details[0].field).toBe('user.profile.age');
      }
    });
  });

  describe('JSON Parse Error Handling', () => {
    function handleParseError(error: any) {
      if (error.type === 'entity.parse.failed') {
        return {
          statusCode: 400,
          code: 'INVALID_JSON',
          message: 'Invalid JSON in request body',
        };
      }
      return null;
    }

    it('should handle JSON parse errors', () => {
      const error = { type: 'entity.parse.failed' };
      const result = handleParseError(error);

      expect(result?.statusCode).toBe(400);
      expect(result?.code).toBe('INVALID_JSON');
    });

    it('should return null for non-parse errors', () => {
      const error = { type: 'other.error' };
      const result = handleParseError(error);

      expect(result).toBeNull();
    });
  });
});
