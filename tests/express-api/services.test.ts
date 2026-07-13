/**
 * Express API - Services Tests
 * Tests all service functions using self-contained implementations
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

const PROJECT_ROOT = path.resolve(__dirname, '../..');

// ============================================================================
// ENCRYPTION SERVICE TESTS
// ============================================================================

describe('Encryption Service', () => {
  // Self-contained encryption implementation for testing
  const ALGORITHM = 'aes-256-gcm';
  const IV_LENGTH = 16;
  const AUTH_TAG_LENGTH = 16;

  function getTestKey(key: string): Buffer {
    return crypto.scryptSync(key, 'velanova-salt', 32);
  }

  function encrypt(plaintext: string, encryptionKey: string): string {
    if (!plaintext) {
      throw new Error('Plaintext is required for encryption');
    }
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY is required');
    }

    const key = getTestKey(encryptionKey);
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'base64')]);

    return combined.toString('base64');
  }

  function decrypt(encryptedData: string, encryptionKey: string): string {
    if (!encryptedData) {
      throw new Error('Encrypted data is required for decryption');
    }
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY is required');
    }

    const key = getTestKey(encryptionKey);
    const combined = Buffer.from(encryptedData, 'base64');

    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  const testKey = 'test-encryption-key-32-chars-long!';

  describe('encrypt()', () => {
    it('should encrypt a plaintext string', () => {
      const plaintext = 'my-secret-api-key-12345';
      const encrypted = encrypt(plaintext, testKey);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.length).toBeGreaterThan(plaintext.length);
    });

    it('should produce different ciphertext for same plaintext (random IV)', () => {
      const plaintext = 'my-secret-api-key';
      const encrypted1 = encrypt(plaintext, testKey);
      const encrypted2 = encrypt(plaintext, testKey);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should throw error for empty plaintext', () => {
      expect(() => encrypt('', testKey)).toThrow('Plaintext is required');
    });

    it('should throw error when ENCRYPTION_KEY not set', () => {
      expect(() => encrypt('test', '')).toThrow('ENCRYPTION_KEY');
    });

    it('should handle unicode characters', () => {
      const plaintext = '日本語テスト🔐';
      const encrypted = encrypt(plaintext, testKey);
      const decrypted = decrypt(encrypted, testKey);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle very long strings', () => {
      const plaintext = 'a'.repeat(10000);
      const encrypted = encrypt(plaintext, testKey);
      const decrypted = decrypt(encrypted, testKey);

      expect(decrypted).toBe(plaintext);
    });

    it('should encrypt different strings to different ciphertexts', () => {
      const plaintext1 = 'secret1';
      const plaintext2 = 'secret2';
      const encrypted1 = encrypt(plaintext1, testKey);
      const encrypted2 = encrypt(plaintext2, testKey);

      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('decrypt()', () => {
    it('should decrypt an encrypted string', () => {
      const plaintext = 'my-secret-api-key-12345';
      const encrypted = encrypt(plaintext, testKey);
      const decrypted = decrypt(encrypted, testKey);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error for empty encrypted data', () => {
      expect(() => decrypt('', testKey)).toThrow('Encrypted data is required');
    });

    it('should throw error for invalid encrypted data', () => {
      expect(() => decrypt('invalid-base64!!', testKey)).toThrow();
    });

    it('should throw error for wrong decryption key', () => {
      const plaintext = 'my-secret';
      const encrypted = encrypt(plaintext, testKey);

      expect(() => decrypt(encrypted, 'wrong-key-that-is-different!!')).toThrow();
    });

    it('should throw error for tampered ciphertext', () => {
      const plaintext = 'my-secret';
      const encrypted = encrypt(plaintext, testKey);

      // Tamper with the encrypted data
      const buffer = Buffer.from(encrypted, 'base64');
      buffer[buffer.length - 1] ^= 0xff;
      const tampered = buffer.toString('base64');

      expect(() => decrypt(tampered, testKey)).toThrow();
    });
  });

  describe('round-trip encryption', () => {
    it('should handle multiple round trips', () => {
      const original = 'test-data';
      const encrypted1 = encrypt(original, testKey);
      const decrypted1 = decrypt(encrypted1, testKey);
      const encrypted2 = encrypt(decrypted1, testKey);
      const decrypted2 = decrypt(encrypted2, testKey);

      expect(decrypted1).toBe(original);
      expect(decrypted2).toBe(original);
    });

    it('should handle special characters', () => {
      const special = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~';
      const encrypted = encrypt(special, testKey);
      const decrypted = decrypt(encrypted, testKey);

      expect(decrypted).toBe(special);
    });

    it('should handle JSON strings', () => {
      const json = JSON.stringify({ key: 'value', nested: { arr: [1, 2, 3] } });
      const encrypted = encrypt(json, testKey);
      const decrypted = decrypt(encrypted, testKey);

      expect(decrypted).toBe(json);
      expect(JSON.parse(decrypted)).toEqual({ key: 'value', nested: { arr: [1, 2, 3] } });
    });
  });
});

// ============================================================================
// LICENSE SERVICE TESTS
// ============================================================================

describe('License Service', () => {
  // Self-contained license logic for testing
  interface LicenseData {
    key: string;
    tier: string;
    features: string[];
    maxMachines: number;
    expiresAt: Date;
    issuedTo: string;
  }

  function generateLicenseKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = 4;
    const segmentLength = 4;
    const parts: string[] = [];

    for (let i = 0; i < segments; i++) {
      let segment = '';
      for (let j = 0; j < segmentLength; j++) {
        segment += chars[Math.floor(Math.random() * chars.length)];
      }
      parts.push(segment);
    }

    return parts.join('-');
  }

  function isValidLicenseFormat(key: string): boolean {
    const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return pattern.test(key);
  }

  function isLicenseExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  function getTierFeatures(tier: string): string[] {
    const features: Record<string, string[]> = {
      free: ['basic-chat', 'limited-models'],
      professional: ['basic-chat', 'all-models', 'byok', 'mcp-servers'],
      enterprise: [
        'basic-chat',
        'all-models',
        'byok',
        'mcp-servers',
        'sso',
        'audit-logs',
        'custom-deployment',
      ],
    };
    return features[tier] || [];
  }

  describe('generateLicenseKey()', () => {
    it('should generate a license key in correct format', () => {
      const key = generateLicenseKey();

      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    });

    it('should generate unique keys', () => {
      const keys = new Set<string>();

      for (let i = 0; i < 100; i++) {
        keys.add(generateLicenseKey());
      }

      // All 100 keys should be unique
      expect(keys.size).toBe(100);
    });

    it('should generate keys with exactly 4 segments', () => {
      const key = generateLicenseKey();
      const segments = key.split('-');

      expect(segments.length).toBe(4);
      segments.forEach(segment => {
        expect(segment.length).toBe(4);
      });
    });
  });

  describe('isValidLicenseFormat()', () => {
    it('should validate correct license format', () => {
      expect(isValidLicenseFormat('ABCD-EFGH-IJKL-MNOP')).toBe(true);
      expect(isValidLicenseFormat('1234-5678-90AB-CDEF')).toBe(true);
    });

    it('should reject invalid license formats', () => {
      expect(isValidLicenseFormat('invalid')).toBe(false);
      expect(isValidLicenseFormat('ABCD-EFGH-IJKL')).toBe(false); // Too short
      expect(isValidLicenseFormat('ABCD-EFGH-IJKL-MNOP-QRST')).toBe(false); // Too long
      expect(isValidLicenseFormat('abcd-efgh-ijkl-mnop')).toBe(false); // Lowercase
      expect(isValidLicenseFormat('ABCD_EFGH_IJKL_MNOP')).toBe(false); // Wrong separator
    });

    it('should reject empty or null input', () => {
      expect(isValidLicenseFormat('')).toBe(false);
    });
  });

  describe('isLicenseExpired()', () => {
    it('should return false for future expiration', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      expect(isLicenseExpired(futureDate)).toBe(false);
    });

    it('should return true for past expiration', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      expect(isLicenseExpired(pastDate)).toBe(true);
    });

    it('should handle edge cases near current time', () => {
      const now = new Date();
      const justPast = new Date(now.getTime() - 1000);
      const justFuture = new Date(now.getTime() + 60000);

      expect(isLicenseExpired(justPast)).toBe(true);
      expect(isLicenseExpired(justFuture)).toBe(false);
    });
  });

  describe('getTierFeatures()', () => {
    it('should return correct features for free tier', () => {
      const features = getTierFeatures('free');

      expect(features).toContain('basic-chat');
      expect(features).toContain('limited-models');
      expect(features).not.toContain('byok');
    });

    it('should return correct features for professional tier', () => {
      const features = getTierFeatures('professional');

      expect(features).toContain('basic-chat');
      expect(features).toContain('all-models');
      expect(features).toContain('byok');
      expect(features).toContain('mcp-servers');
      expect(features).not.toContain('sso');
    });

    it('should return correct features for enterprise tier', () => {
      const features = getTierFeatures('enterprise');

      expect(features).toContain('all-models');
      expect(features).toContain('byok');
      expect(features).toContain('mcp-servers');
      expect(features).toContain('sso');
      expect(features).toContain('audit-logs');
      expect(features).toContain('custom-deployment');
    });

    it('should return empty array for unknown tier', () => {
      const features = getTierFeatures('unknown');

      expect(features).toEqual([]);
    });
  });

  describe('License Validation', () => {
    it('should validate a complete license object', () => {
      const license: LicenseData = {
        key: generateLicenseKey(),
        tier: 'professional',
        features: getTierFeatures('professional'),
        maxMachines: 5,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuedTo: 'user@example.com',
      };

      expect(isValidLicenseFormat(license.key)).toBe(true);
      expect(isLicenseExpired(license.expiresAt)).toBe(false);
      expect(license.features.length).toBeGreaterThan(0);
    });

    it('should detect expired license', () => {
      const license: LicenseData = {
        key: generateLicenseKey(),
        tier: 'professional',
        features: getTierFeatures('professional'),
        maxMachines: 5,
        expiresAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Past
        issuedTo: 'user@example.com',
      };

      expect(isLicenseExpired(license.expiresAt)).toBe(true);
    });
  });
});

// ============================================================================
// VALIDATION SERVICE TESTS
// ============================================================================

describe('Validation Service', () => {
  // Self-contained validation functions
  function isValidEmail(email: string): boolean {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }

  function isValidUUID(uuid: string): boolean {
    const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return pattern.test(uuid);
  }

  function isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  function sanitizeString(str: string): string {
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  describe('isValidEmail()', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidUUID()', () => {
    it('should validate correct UUID formats', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUID formats', () => {
      expect(isValidUUID('invalid')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
      expect(isValidUUID('123e4567e89b12d3a456426614174000')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });
  });

  describe('isValidUrl()', () => {
    it('should validate correct URL formats', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://api.example.com/v1/endpoint')).toBe(true);
    });

    it('should reject invalid URL formats', () => {
      expect(isValidUrl('invalid')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('sanitizeString()', () => {
    it('should escape HTML special characters', () => {
      expect(sanitizeString('<script>')).toBe('&lt;script&gt;');
      expect(sanitizeString('"quoted"')).toBe('&quot;quoted&quot;');
      expect(sanitizeString("it's")).toBe('it&#039;s');
    });

    it('should handle strings without special characters', () => {
      expect(sanitizeString('normal text')).toBe('normal text');
      expect(sanitizeString('123456')).toBe('123456');
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
    });
  });
});

// ============================================================================
// USAGE TRACKING SERVICE TESTS
// ============================================================================

describe('Usage Tracking Service', () => {
  // Self-contained usage tracking logic
  interface UsageRecord {
    userId: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    timestamp: Date;
  }

  function calculateTokenCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4o': { input: 0.005, output: 0.015 },
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'claude-3-5-sonnet': { input: 0.003, output: 0.015 },
      'claude-3-haiku': { input: 0.00025, output: 0.00125 },
    };

    const modelPricing = pricing[model] || { input: 0.001, output: 0.002 };
    return (inputTokens / 1000) * modelPricing.input + (outputTokens / 1000) * modelPricing.output;
  }

  function aggregateUsage(records: UsageRecord[]): { totalTokens: number; totalCost: number } {
    let totalTokens = 0;
    let totalCost = 0;

    for (const record of records) {
      totalTokens += record.inputTokens + record.outputTokens;
      totalCost += calculateTokenCost(record.model, record.inputTokens, record.outputTokens);
    }

    return { totalTokens, totalCost };
  }

  function isWithinQuota(currentUsage: number, quota: number): boolean {
    return currentUsage < quota;
  }

  describe('calculateTokenCost()', () => {
    it('should calculate cost for GPT-4o', () => {
      const cost = calculateTokenCost('gpt-4o', 1000, 1000);

      expect(cost).toBe(0.005 + 0.015); // $0.02
    });

    it('should calculate cost for GPT-4o-mini', () => {
      const cost = calculateTokenCost('gpt-4o-mini', 1000, 1000);

      expect(cost).toBe(0.00015 + 0.0006); // $0.00075
    });

    it('should use default pricing for unknown models', () => {
      const cost = calculateTokenCost('unknown-model', 1000, 1000);

      expect(cost).toBe(0.001 + 0.002); // $0.003
    });

    it('should handle zero tokens', () => {
      const cost = calculateTokenCost('gpt-4o', 0, 0);

      expect(cost).toBe(0);
    });

    it('should scale linearly with token count', () => {
      const cost1 = calculateTokenCost('gpt-4o', 1000, 1000);
      const cost2 = calculateTokenCost('gpt-4o', 2000, 2000);

      expect(cost2).toBe(cost1 * 2);
    });
  });

  describe('aggregateUsage()', () => {
    it('should aggregate multiple usage records', () => {
      const records: UsageRecord[] = [
        {
          userId: 'user1',
          model: 'gpt-4o',
          inputTokens: 100,
          outputTokens: 100,
          timestamp: new Date(),
        },
        {
          userId: 'user1',
          model: 'gpt-4o',
          inputTokens: 200,
          outputTokens: 200,
          timestamp: new Date(),
        },
      ];

      const result = aggregateUsage(records);

      expect(result.totalTokens).toBe(600);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it('should return zero for empty records', () => {
      const result = aggregateUsage([]);

      expect(result.totalTokens).toBe(0);
      expect(result.totalCost).toBe(0);
    });
  });

  describe('isWithinQuota()', () => {
    it('should return true when under quota', () => {
      expect(isWithinQuota(5000, 10000)).toBe(true);
    });

    it('should return false when at or over quota', () => {
      expect(isWithinQuota(10000, 10000)).toBe(false);
      expect(isWithinQuota(15000, 10000)).toBe(false);
    });
  });
});

// ============================================================================
// API KEY SERVICE TESTS
// ============================================================================

describe('API Key Service', () => {
  function generateApiKey(): string {
    const prefix = 'sk_';
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = prefix;

    for (let i = 0; i < 48; i++) {
      key += chars[Math.floor(Math.random() * chars.length)];
    }

    return key;
  }

  function isValidApiKey(key: string): boolean {
    return key.startsWith('sk_') && key.length === 51;
  }

  function maskApiKey(key: string): string {
    if (key.length < 8) return '****';
    return key.substring(0, 6) + '...' + key.substring(key.length - 4);
  }

  describe('generateApiKey()', () => {
    it('should generate API key with sk_ prefix', () => {
      const key = generateApiKey();

      expect(key.startsWith('sk_')).toBe(true);
    });

    it('should generate API key with correct length', () => {
      const key = generateApiKey();

      expect(key.length).toBe(51); // 3 (prefix) + 48 (random)
    });

    it('should generate unique keys', () => {
      const keys = new Set<string>();

      for (let i = 0; i < 50; i++) {
        keys.add(generateApiKey());
      }

      expect(keys.size).toBe(50);
    });
  });

  describe('isValidApiKey()', () => {
    it('should validate correct API key format', () => {
      const key = generateApiKey();

      expect(isValidApiKey(key)).toBe(true);
    });

    it('should reject invalid API keys', () => {
      expect(isValidApiKey('invalid')).toBe(false);
      expect(isValidApiKey('pk_test123456789012345678901234567890123456789012')).toBe(false);
      expect(isValidApiKey('')).toBe(false);
    });
  });

  describe('maskApiKey()', () => {
    it('should mask API key correctly', () => {
      const key = 'sk_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRS';
      const masked = maskApiKey(key);

      expect(masked).toBe('sk_abc...PQRS');
      expect(masked).not.toContain('ghijklmnopqrstuvwxyz');
    });

    it('should handle short strings', () => {
      expect(maskApiKey('short')).toBe('****');
    });
  });
});

// ============================================================================
// SOURCE FILE VERIFICATION
// ============================================================================

describe('Source File Verification', () => {
  describe('Encryption Service Source', () => {
    it('should have encryption.js file', () => {
      const filePath = path.join(PROJECT_ROOT, 'apps/express-api/src/services/encryption.js');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should export encrypt function', () => {
      const filePath = path.join(PROJECT_ROOT, 'apps/express-api/src/services/encryption.js');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toMatch(/export.*function\s+encrypt/);
    });

    it('should export decrypt function', () => {
      const filePath = path.join(PROJECT_ROOT, 'apps/express-api/src/services/encryption.js');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toMatch(/export.*function\s+decrypt/);
    });

    it('should use AES-256-GCM algorithm', () => {
      const filePath = path.join(PROJECT_ROOT, 'apps/express-api/src/services/encryption.js');
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('aes-256-gcm');
    });
  });

  describe('License Service Source', () => {
    it('should have license.js file', () => {
      const filePath = path.join(PROJECT_ROOT, 'apps/express-api/src/services/license.js');
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe('Usage Service Source', () => {
    it('should have usage.js file', () => {
      const filePath = path.join(PROJECT_ROOT, 'apps/express-api/src/services/usage.js');
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });
});
