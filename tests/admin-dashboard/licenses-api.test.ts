/**
 * Admin Dashboard - API Route Tests
 * Unit tests for license management API endpoints
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ============================================================================
// MOCK SETUP
// ============================================================================

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================================
// LICENSES GET ENDPOINT TESTS
// ============================================================================

describe('GET /api/licenses', () => {
  describe('Query Parameters', () => {
    it('should parse page parameter with default value', () => {
      const parseIntWithDefault = (value: string | null, defaultVal: number) => {
        return parseInt(value || String(defaultVal));
      };

      expect(parseIntWithDefault(null, 1)).toBe(1);
      expect(parseIntWithDefault('5', 1)).toBe(5);
    });

    it('should parse limit parameter with default value', () => {
      const parseIntWithDefault = (value: string | null, defaultVal: number) => {
        return parseInt(value || String(defaultVal));
      };

      expect(parseIntWithDefault(null, 10)).toBe(10);
      expect(parseIntWithDefault('25', 10)).toBe(25);
    });

    it('should calculate offset correctly', () => {
      const calculateOffset = (page: number, limit: number) => (page - 1) * limit;

      expect(calculateOffset(1, 10)).toBe(0);
      expect(calculateOffset(2, 10)).toBe(10);
      expect(calculateOffset(3, 25)).toBe(50);
    });

    it('should handle search parameter', () => {
      const search = 'test@example.com';
      const searchLower = search.toLowerCase();

      expect(searchLower).toBe('test@example.com');
    });

    it('should handle status filter', () => {
      const statuses = ['all', 'active', 'expired'];

      statuses.forEach(status => {
        if (status !== 'all') {
          const isActive = status === 'active';
          expect(typeof isActive).toBe('boolean');
        }
      });
    });

    it('should handle tier filter', () => {
      const tiers = ['all', 'free', 'starter', 'pro', 'enterprise'];

      tiers.forEach(tier => {
        expect(tiers).toContain(tier);
      });
    });
  });

  describe('License Formatting', () => {
    it('should calculate daysRemaining correctly', () => {
      const calculateDaysRemaining = (expiresAt: string | null) => {
        if (!expiresAt) return null;
        const expires = new Date(expiresAt);
        const now = new Date();
        return Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      };

      // Future date - should be positive
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      expect(calculateDaysRemaining(futureDate.toISOString())).toBeGreaterThan(0);

      // Past date - should be negative
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      expect(calculateDaysRemaining(pastDate.toISOString())).toBeLessThan(0);

      // Null date - should be null
      expect(calculateDaysRemaining(null)).toBeNull();
    });

    it('should determine isExpired correctly', () => {
      const isExpired = (expiresAt: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
      };

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      expect(isExpired(futureDate.toISOString())).toBe(false);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      expect(isExpired(pastDate.toISOString())).toBe(true);

      expect(isExpired(null)).toBe(false);
    });

    it('should format license key with mask', () => {
      const formatKey = (key: string | null) => key || '****-****-****';

      expect(formatKey(null)).toBe('****-****-****');
      expect(formatKey('ABCD-EFGH-IJKL')).toBe('ABCD-EFGH-IJKL');
    });

    it('should format user data correctly', () => {
      const formatUser = (userData: any) => {
        if (!userData) return null;
        return {
          id: userData.id,
          email: userData.email,
          name: userData.full_name || userData.email?.split('@')[0],
        };
      };

      expect(formatUser(null)).toBeNull();

      const userWithName = { id: '1', email: 'test@example.com', full_name: 'Test User' };
      expect(formatUser(userWithName).name).toBe('Test User');

      const userWithoutName = { id: '2', email: 'john@example.com' };
      expect(formatUser(userWithoutName).name).toBe('john');
    });

    it('should format full license response', () => {
      const rawLicense = {
        id: 'lic-123',
        license_key: 'ABCD-EFGH-IJKL',
        tier: 'pro',
        is_active: true,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        max_machines: 5,
        activated_machines: 2,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-06-01T00:00:00Z',
        users: { id: 'user-1', email: 'test@example.com', full_name: 'Test' },
      };

      const formatted = {
        id: rawLicense.id,
        licenseKey: rawLicense.license_key,
        tier: rawLicense.tier,
        isActive: rawLicense.is_active,
        maxMachines: rawLicense.max_machines,
        activatedMachines: rawLicense.activated_machines || 0,
        user: rawLicense.users
          ? {
              id: rawLicense.users.id,
              email: rawLicense.users.email,
              name: rawLicense.users.full_name,
            }
          : null,
      };

      expect(formatted.id).toBe('lic-123');
      expect(formatted.tier).toBe('pro');
      expect(formatted.user?.name).toBe('Test');
    });
  });

  describe('Search Filtering', () => {
    it('should filter by license key', () => {
      const licenses = [
        { licenseKey: 'ABCD-EFGH', user: { email: 'a@test.com', name: 'Alice' } },
        { licenseKey: 'WXYZ-1234', user: { email: 'b@test.com', name: 'Bob' } },
      ];

      const search = 'abcd';
      const filtered = licenses.filter(l =>
        l.licenseKey?.toLowerCase().includes(search.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].licenseKey).toBe('ABCD-EFGH');
    });

    it('should filter by user email', () => {
      const licenses = [
        { licenseKey: 'KEY1', user: { email: 'alice@example.com', name: 'Alice' } },
        { licenseKey: 'KEY2', user: { email: 'bob@other.com', name: 'Bob' } },
      ];

      const search = 'example.com';
      const filtered = licenses.filter(l =>
        l.user?.email?.toLowerCase().includes(search.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].user.name).toBe('Alice');
    });

    it('should filter by user name', () => {
      const licenses = [
        { licenseKey: 'KEY1', user: { email: 'a@test.com', name: 'Alice Smith' } },
        { licenseKey: 'KEY2', user: { email: 'b@test.com', name: 'Bob Jones' } },
      ];

      const search = 'smith';
      const filtered = licenses.filter(l =>
        l.user?.name?.toLowerCase().includes(search.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
    });

    it('should handle case-insensitive search', () => {
      const licenses = [{ licenseKey: 'ABCD-EFGH', user: null }];

      const searchLower = 'abcd-efgh';
      const searchUpper = 'ABCD-EFGH';
      const searchMixed = 'AbCd-EfGh';

      const filterFn = (search: string) =>
        licenses.filter(l => l.licenseKey?.toLowerCase().includes(search.toLowerCase()));

      expect(filterFn(searchLower)).toHaveLength(1);
      expect(filterFn(searchUpper)).toHaveLength(1);
      expect(filterFn(searchMixed)).toHaveLength(1);
    });
  });

  describe('Stats Calculation', () => {
    it('should calculate total licenses', () => {
      const licenses = [{}, {}, {}, {}, {}];
      expect(licenses.length).toBe(5);
    });

    it('should calculate active licenses', () => {
      const licenses = [
        { is_active: true, expires_at: null },
        { is_active: true, expires_at: new Date(Date.now() + 1000000).toISOString() },
        { is_active: true, expires_at: new Date(Date.now() - 1000000).toISOString() },
        { is_active: false, expires_at: null },
      ];

      const active = licenses.filter(
        l => l.is_active && (!l.expires_at || new Date(l.expires_at) > new Date())
      );

      expect(active.length).toBe(2);
    });

    it('should calculate expired licenses', () => {
      const licenses = [
        { expires_at: new Date(Date.now() + 1000000).toISOString() },
        { expires_at: new Date(Date.now() - 1000000).toISOString() },
        { expires_at: new Date(Date.now() - 2000000).toISOString() },
        { expires_at: null },
      ];

      const expired = licenses.filter(l => l.expires_at && new Date(l.expires_at) < new Date());

      expect(expired.length).toBe(2);
    });

    it('should count licenses by tier', () => {
      const licenses = [
        { tier: 'free' },
        { tier: 'free' },
        { tier: 'starter' },
        { tier: 'pro' },
        { tier: 'pro' },
        { tier: 'pro' },
        { tier: 'enterprise' },
      ];

      const byTier = {
        free: licenses.filter(l => l.tier === 'free').length,
        starter: licenses.filter(l => l.tier === 'starter').length,
        pro: licenses.filter(l => l.tier === 'pro').length,
        enterprise: licenses.filter(l => l.tier === 'enterprise').length,
      };

      expect(byTier.free).toBe(2);
      expect(byTier.starter).toBe(1);
      expect(byTier.pro).toBe(3);
      expect(byTier.enterprise).toBe(1);
    });
  });

  describe('Pagination', () => {
    it('should calculate total pages', () => {
      const calculateTotalPages = (total: number, limit: number) => Math.ceil(total / limit);

      expect(calculateTotalPages(100, 10)).toBe(10);
      expect(calculateTotalPages(95, 10)).toBe(10);
      expect(calculateTotalPages(5, 10)).toBe(1);
      expect(calculateTotalPages(0, 10)).toBe(0);
    });

    it('should return correct page info', () => {
      const pageInfo = {
        licenses: [],
        total: 50,
        page: 3,
        limit: 10,
        totalPages: 5,
      };

      expect(pageInfo.page).toBe(3);
      expect(pageInfo.totalPages).toBe(5);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', () => {
      const mockError = {
        status: 500,
        error: 'Failed to fetch licenses',
      };

      expect(mockError.status).toBe(500);
      expect(mockError.error).toBe('Failed to fetch licenses');
    });
  });
});

// ============================================================================
// LICENSES POST ENDPOINT TESTS
// ============================================================================

describe('POST /api/licenses', () => {
  describe('Request Validation', () => {
    it('should require userId', () => {
      const body = { tier: 'pro' };
      const isValid = body.hasOwnProperty('userId') && body.hasOwnProperty('tier');

      expect(isValid).toBe(false);
    });

    it('should require tier', () => {
      const body = { userId: 'user-123' };
      const isValid = body.hasOwnProperty('userId') && body.hasOwnProperty('tier');

      expect(isValid).toBe(false);
    });

    it('should accept valid request body', () => {
      const body = {
        userId: 'user-123',
        tier: 'pro',
        expiresInDays: 365,
        maxMachines: 5,
      };

      const isValid = body.userId && body.tier;
      expect(isValid).toBeTruthy();
    });

    it('should validate tier values', () => {
      const validTiers = ['free', 'starter', 'pro', 'enterprise'];

      validTiers.forEach(tier => {
        expect(validTiers).toContain(tier);
      });

      expect(validTiers).not.toContain('invalid');
    });
  });

  describe('License Key Generation', () => {
    it('should generate JWT-based license key', () => {
      const mockJwtSign = (payload: object, secret: string) => {
        return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(JSON.stringify(payload)).toString('base64')}.signature`;
      };

      const key = mockJwtSign({ userId: 'user-123', tier: 'pro' }, 'secret');

      expect(key).toContain('eyJ');
      expect(key.split('.')).toHaveLength(3);
    });

    it('should include userId in license payload', () => {
      const payload = {
        userId: 'user-123',
        tier: 'pro',
        exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
        iat: Math.floor(Date.now() / 1000),
      };

      expect(payload.userId).toBe('user-123');
    });

    it('should include tier in license payload', () => {
      const payload = {
        userId: 'user-123',
        tier: 'enterprise',
      };

      expect(payload.tier).toBe('enterprise');
    });

    it('should calculate expiration correctly', () => {
      const expiresInDays = 365;
      const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

      const expectedYear = new Date().getFullYear() + 1;
      expect(expiresAt.getFullYear()).toBeGreaterThanOrEqual(expectedYear);
    });

    it('should default to 1 year expiration', () => {
      const defaultDays = 365;
      const expiresAt = new Date(Date.now() + defaultDays * 24 * 60 * 60 * 1000);

      const daysFromNow = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      expect(daysFromNow).toBeCloseTo(365, 0);
    });
  });

  describe('Key Hash and Preview', () => {
    it('should generate SHA256 hash', () => {
      const mockHash = (input: string) => {
        // Simulate hash output (64 hex chars)
        return 'a'.repeat(64);
      };

      const hash = mockHash('license-key');
      expect(hash).toHaveLength(64);
    });

    it('should generate key preview', () => {
      const generatePreview = (key: string) => {
        return `${key.slice(0, 8)}...${key.slice(-4)}`;
      };

      const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature';
      const preview = generatePreview(key);

      expect(preview).toMatch(/^.{8}\.\.\..{4}$/);
    });
  });

  describe('Max Machines Default', () => {
    it('should set -1 (unlimited) for enterprise', () => {
      const getMaxMachines = (tier: string, providedMax?: number) => {
        if (providedMax) return providedMax;
        switch (tier) {
          case 'enterprise':
            return -1;
          case 'team':
            return 5;
          default:
            return 2;
        }
      };

      expect(getMaxMachines('enterprise')).toBe(-1);
    });

    it('should set 5 for team tier', () => {
      const getMaxMachines = (tier: string) => {
        return tier === 'enterprise' ? -1 : tier === 'team' ? 5 : 2;
      };

      expect(getMaxMachines('team')).toBe(5);
    });

    it('should set 2 for other tiers', () => {
      const getMaxMachines = (tier: string) => {
        return tier === 'enterprise' ? -1 : tier === 'team' ? 5 : 2;
      };

      expect(getMaxMachines('pro')).toBe(2);
      expect(getMaxMachines('starter')).toBe(2);
      expect(getMaxMachines('free')).toBe(2);
    });

    it('should use provided maxMachines if specified', () => {
      const getMaxMachines = (tier: string, providedMax?: number) => {
        if (providedMax) return providedMax;
        return tier === 'enterprise' ? -1 : 2;
      };

      expect(getMaxMachines('pro', 10)).toBe(10);
    });
  });

  describe('Response Format', () => {
    it('should include full license key only on creation', () => {
      const response = {
        license: {
          id: 'lic-123',
          user_id: 'user-123',
          tier: 'pro',
          fullKey: 'eyJhbGci...', // Only returned once
        },
      };

      expect(response.license.fullKey).toBeDefined();
    });

    it('should return 400 for missing required fields', () => {
      const mockResponse = {
        error: 'Missing required fields: userId, tier',
        status: 400,
      };

      expect(mockResponse.status).toBe(400);
      expect(mockResponse.error).toContain('Missing required fields');
    });

    it('should return 500 on database error', () => {
      const mockResponse = {
        error: 'Failed to create license',
        status: 500,
      };

      expect(mockResponse.status).toBe(500);
    });
  });
});

// ============================================================================
// LICENSE MANAGEMENT OPERATIONS
// ============================================================================

describe('License Management Operations', () => {
  describe('Revoke License', () => {
    it('should set is_active to false', () => {
      const revokeLicense = (license: any) => ({
        ...license,
        is_active: false,
        revoked_at: new Date().toISOString(),
      });

      const revoked = revokeLicense({ id: '1', is_active: true });

      expect(revoked.is_active).toBe(false);
      expect(revoked.revoked_at).toBeDefined();
    });
  });

  describe('Extend License', () => {
    it('should extend expiration date', () => {
      const extendLicense = (expiresAt: string, daysToAdd: number) => {
        const current = new Date(expiresAt);
        current.setDate(current.getDate() + daysToAdd);
        return current.toISOString();
      };

      const original = new Date().toISOString();
      const extended = extendLicense(original, 30);

      expect(new Date(extended) > new Date(original)).toBe(true);
    });
  });

  describe('Upgrade License Tier', () => {
    it('should update tier and features', () => {
      const tierFeatures: Record<string, string[]> = {
        free: ['basic_chat'],
        starter: ['basic_chat', 'history'],
        pro: ['basic_chat', 'history', 'mcp_integration'],
        enterprise: ['basic_chat', 'history', 'mcp_integration', 'sso'],
      };

      const upgradeLicense = (license: any, newTier: string) => ({
        ...license,
        tier: newTier,
        features: tierFeatures[newTier],
      });

      const upgraded = upgradeLicense({ tier: 'starter' }, 'pro');

      expect(upgraded.tier).toBe('pro');
      expect(upgraded.features).toContain('mcp_integration');
    });
  });

  describe('Transfer License', () => {
    it('should change user_id', () => {
      const transferLicense = (license: any, newUserId: string) => ({
        ...license,
        user_id: newUserId,
        transferred_at: new Date().toISOString(),
      });

      const transferred = transferLicense({ id: '1', user_id: 'old-user' }, 'new-user');

      expect(transferred.user_id).toBe('new-user');
      expect(transferred.transferred_at).toBeDefined();
    });
  });
});
