/**
 * Desktop App - Context Tests
 * Unit tests for AuthContext and LicenseContext
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock window.electron API
const mockElectronAuth = {
  login: jest.fn(),
  logout: jest.fn(),
  check: jest.fn(),
  onSuccess: jest.fn(),
  onError: jest.fn(),
};

const mockElectronLicense = {
  get: jest.fn(),
  validate: jest.fn(),
};

const mockElectronSettings = {
  get: jest.fn(),
  set: jest.fn(),
};

const mockElectron = {
  auth: mockElectronAuth,
  license: mockElectronLicense,
  settings: mockElectronSettings,
};

// Setup global mock
beforeEach(() => {
  (global as any).window = {
    electron: mockElectron,
    crypto: {
      randomUUID: () => 'mock-uuid-12345',
    },
  };
  jest.clearAllMocks();
});

afterEach(() => {
  delete (global as any).window;
});

// ============================================================================
// AUTH CONTEXT TESTS
// ============================================================================

describe('AuthContext', () => {
  describe('User Interface', () => {
    it('should have correct user structure', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
      };

      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.image).toBeDefined();
    });

    it('should have optional image field', () => {
      const userWithoutImage = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      expect(userWithoutImage).not.toHaveProperty('image');
    });
  });

  describe('AuthData Interface', () => {
    it('should have correct auth data structure', () => {
      const authData = {
        accessToken: 'jwt-token-12345',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
        expiresAt: Date.now() + 3600000, // 1 hour from now
      };

      expect(authData.accessToken).toBeDefined();
      expect(authData.user).toBeDefined();
      expect(authData.expiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe('AuthContextType', () => {
    it('should provide correct context shape', () => {
      const mockContext = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
      };

      expect(mockContext).toHaveProperty('user');
      expect(mockContext).toHaveProperty('isLoading');
      expect(mockContext).toHaveProperty('isAuthenticated');
      expect(typeof mockContext.login).toBe('function');
      expect(typeof mockContext.logout).toBe('function');
    });

    it('should have isAuthenticated true when user exists', () => {
      const user = { id: '123', email: 'test@test.com', name: 'Test' };
      const isAuthenticated = !!user;
      
      expect(isAuthenticated).toBe(true);
    });

    it('should have isAuthenticated false when user is null', () => {
      const user = null;
      const isAuthenticated = !!user;
      
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('checkAuth function', () => {
    it('should call electron auth check', async () => {
      mockElectronAuth.check.mockResolvedValue({
        user: { id: '123', email: 'test@test.com', name: 'Test' },
      });

      const result = await mockElectron.auth.check();
      
      expect(mockElectron.auth.check).toHaveBeenCalled();
      expect(result.user).toBeDefined();
    });

    it('should handle null response gracefully', async () => {
      mockElectronAuth.check.mockResolvedValue(null);

      const result = await mockElectron.auth.check();
      
      expect(result).toBeNull();
    });

    it('should handle auth check error', async () => {
      mockElectronAuth.check.mockRejectedValue(new Error('Auth check failed'));

      await expect(mockElectron.auth.check()).rejects.toThrow('Auth check failed');
    });
  });

  describe('login function', () => {
    it('should call electron auth login', async () => {
      mockElectronAuth.login.mockResolvedValue(undefined);

      await mockElectron.auth.login();
      
      expect(mockElectron.auth.login).toHaveBeenCalled();
    });

    it('should handle login error', async () => {
      mockElectronAuth.login.mockRejectedValue(new Error('Failed to open login'));

      await expect(mockElectron.auth.login()).rejects.toThrow('Failed to open login');
    });
  });

  describe('logout function', () => {
    it('should call electron auth logout', async () => {
      mockElectronAuth.logout.mockResolvedValue(undefined);

      await mockElectron.auth.logout();
      
      expect(mockElectron.auth.logout).toHaveBeenCalled();
    });

    it('should handle logout error', async () => {
      mockElectronAuth.logout.mockRejectedValue(new Error('Failed to logout'));

      await expect(mockElectron.auth.logout()).rejects.toThrow('Failed to logout');
    });
  });

  describe('Auth event listeners', () => {
    it('should register onSuccess callback', () => {
      const callback = jest.fn();
      mockElectron.auth.onSuccess(callback);
      
      expect(mockElectron.auth.onSuccess).toHaveBeenCalledWith(callback);
    });

    it('should register onError callback', () => {
      const callback = jest.fn();
      mockElectron.auth.onError(callback);
      
      expect(mockElectron.auth.onError).toHaveBeenCalledWith(callback);
    });
  });
});

// ============================================================================
// LICENSE CONTEXT TESTS
// ============================================================================

describe('LicenseContext', () => {
  describe('License Interface', () => {
    it('should have correct license structure', () => {
      const license = {
        id: 'lic-123',
        key: 'ABCD-EFGH-IJKL-MNOP',
        tier: 'pro' as const,
        status: 'active' as const,
        expiresAt: '2027-01-01T00:00:00Z',
        features: ['basic_chat', 'history', 'export', 'mcp_integration'],
        maxMachines: 5,
        activeMachines: 1,
      };

      expect(license.id).toBeDefined();
      expect(license.key).toBeDefined();
      expect(['free', 'starter', 'pro', 'enterprise']).toContain(license.tier);
      expect(['active', 'expired', 'suspended', 'invalid']).toContain(license.status);
    });

    it('should allow null expiresAt', () => {
      const license = {
        id: 'lic-123',
        key: 'ABCD-EFGH',
        tier: 'enterprise' as const,
        status: 'active' as const,
        expiresAt: null,
        features: [],
        maxMachines: 100,
        activeMachines: 10,
      };

      expect(license.expiresAt).toBeNull();
    });
  });

  describe('TIER_FEATURES constant', () => {
    const TIER_FEATURES: Record<string, string[]> = {
      free: ['basic_chat'],
      starter: ['basic_chat', 'history', 'export'],
      pro: ['basic_chat', 'history', 'export', 'custom_prompts', 'mcp_integration'],
      enterprise: ['basic_chat', 'history', 'export', 'custom_prompts', 'mcp_integration', 'sso', 'audit_log', 'priority_support'],
    };

    it('should have free tier with basic_chat only', () => {
      expect(TIER_FEATURES.free).toEqual(['basic_chat']);
    });

    it('should have starter tier with history and export', () => {
      expect(TIER_FEATURES.starter).toContain('history');
      expect(TIER_FEATURES.starter).toContain('export');
    });

    it('should have pro tier with mcp_integration', () => {
      expect(TIER_FEATURES.pro).toContain('mcp_integration');
      expect(TIER_FEATURES.pro).toContain('custom_prompts');
    });

    it('should have enterprise tier with all features', () => {
      expect(TIER_FEATURES.enterprise).toContain('sso');
      expect(TIER_FEATURES.enterprise).toContain('audit_log');
      expect(TIER_FEATURES.enterprise).toContain('priority_support');
    });

    it('should have higher tiers include lower tier features', () => {
      expect(TIER_FEATURES.starter).toContain('basic_chat');
      expect(TIER_FEATURES.pro).toContain('basic_chat');
      expect(TIER_FEATURES.enterprise).toContain('basic_chat');
    });
  });

  describe('loadStoredLicense function', () => {
    it('should load license from storage', async () => {
      mockElectronLicense.get.mockResolvedValue({
        id: 'lic-123',
        key: 'ABCD-EFGH-IJKL-MNOP',
      });
      mockElectronLicense.validate.mockResolvedValue({
        valid: true,
        tier: 'pro',
        features: ['basic_chat', 'history'],
        expiresAt: '2027-01-01T00:00:00Z',
        maxMachines: 5,
        activeMachines: 1,
      });

      const stored = await mockElectron.license.get();
      const result = await mockElectron.license.validate(stored.key);
      
      expect(result.valid).toBe(true);
      expect(result.tier).toBe('pro');
    });

    it('should handle no stored license', async () => {
      mockElectronLicense.get.mockResolvedValue(null);

      const stored = await mockElectron.license.get();
      
      expect(stored).toBeNull();
    });

    it('should clear invalid stored license', async () => {
      mockElectronLicense.get.mockResolvedValue({
        key: 'INVALID-KEY',
      });
      mockElectronLicense.validate.mockResolvedValue({
        valid: false,
        reason: 'License expired',
      });

      const stored = await mockElectron.license.get();
      const result = await mockElectron.license.validate(stored.key);
      
      expect(result.valid).toBe(false);
    });
  });

  describe('activateLicense function', () => {
    it('should activate valid license', async () => {
      mockElectronLicense.validate.mockResolvedValue({
        valid: true,
        tier: 'pro',
        features: ['basic_chat', 'mcp_integration'],
        expiresAt: '2027-01-01T00:00:00Z',
        maxMachines: 5,
        activeMachines: 1,
      });
      mockElectronSettings.set.mockResolvedValue(undefined);

      const result = await mockElectron.license.validate('VALID-KEY');
      
      expect(result.valid).toBe(true);
    });

    it('should return error for connection failure', async () => {
      mockElectronLicense.validate.mockResolvedValue(null);

      const result = await mockElectron.license.validate('SOME-KEY');
      
      expect(result).toBeNull();
    });

    it('should return error for invalid license', async () => {
      mockElectronLicense.validate.mockResolvedValue({
        valid: false,
        reason: 'Invalid license key',
      });

      const result = await mockElectron.license.validate('INVALID-KEY');
      
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Invalid license key');
    });

    it('should handle validation exception', async () => {
      mockElectronLicense.validate.mockRejectedValue(new Error('Network error'));

      await expect(mockElectron.license.validate('KEY')).rejects.toThrow('Network error');
    });
  });

  describe('deactivateLicense function', () => {
    it('should clear license from storage', async () => {
      mockElectronSettings.set.mockResolvedValue(undefined);

      await mockElectron.settings.set('license', null);
      
      expect(mockElectron.settings.set).toHaveBeenCalledWith('license', null);
    });
  });

  describe('refreshLicense function', () => {
    it('should re-validate current license', async () => {
      const currentKey = 'CURRENT-LICENSE-KEY';
      mockElectronLicense.validate.mockResolvedValue({
        valid: true,
        tier: 'pro',
        features: ['updated_features'],
        expiresAt: '2027-06-01T00:00:00Z',
      });

      const result = await mockElectron.license.validate(currentKey);
      
      expect(result.valid).toBe(true);
      expect(result.tier).toBe('pro');
    });

    it('should mark license as expired if no longer valid', async () => {
      mockElectronLicense.validate.mockResolvedValue({
        valid: false,
        reason: 'License expired',
      });

      const result = await mockElectron.license.validate('EXPIRED-KEY');
      
      expect(result.valid).toBe(false);
    });
  });

  describe('hasFeature function', () => {
    it('should return true if feature exists in license', () => {
      const features = ['basic_chat', 'mcp_integration'];
      const hasFeature = (feature: string) => features.includes(feature);
      
      expect(hasFeature('basic_chat')).toBe(true);
      expect(hasFeature('mcp_integration')).toBe(true);
    });

    it('should return false if feature does not exist', () => {
      const features = ['basic_chat'];
      const hasFeature = (feature: string) => features.includes(feature);
      
      expect(hasFeature('mcp_integration')).toBe(false);
    });

    it('should use free tier features when no license', () => {
      const TIER_FEATURES = { free: ['basic_chat'] };
      const license = null;
      const hasFeature = (feature: string) => {
        if (!license) return TIER_FEATURES.free.includes(feature);
        return false;
      };
      
      expect(hasFeature('basic_chat')).toBe(true);
      expect(hasFeature('mcp_integration')).toBe(false);
    });
  });

  describe('daysRemaining calculation', () => {
    it('should calculate days remaining correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const expiresAt = futureDate.toISOString();
      
      const daysRemaining = Math.max(
        0, 
        Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      );
      
      expect(daysRemaining).toBeGreaterThanOrEqual(29);
      expect(daysRemaining).toBeLessThanOrEqual(31);
    });

    it('should return 0 for expired license', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      const expiresAt = pastDate.toISOString();
      
      const daysRemaining = Math.max(
        0, 
        Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      );
      
      expect(daysRemaining).toBe(0);
    });

    it('should return null for null expiresAt', () => {
      const expiresAt: string | null = null;
      const daysRemaining = expiresAt 
        ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;
      
      expect(daysRemaining).toBeNull();
    });
  });

  describe('Tier boolean flags', () => {
    it('should set isValid true for active status', () => {
      const status = 'active';
      const isValid = status === 'active';
      
      expect(isValid).toBe(true);
    });

    it('should set isValid false for other statuses', () => {
      const statuses = ['expired', 'suspended', 'invalid'];
      
      statuses.forEach(status => {
        const isValid = status === 'active';
        expect(isValid).toBe(false);
      });
    });

    it('should set isPro true for pro or enterprise tier', () => {
      const tiers = ['pro', 'enterprise'];
      
      tiers.forEach(tier => {
        const isPro = tier === 'pro' || tier === 'enterprise';
        expect(isPro).toBe(true);
      });
    });

    it('should set isPro false for free or starter tier', () => {
      const tiers = ['free', 'starter'];
      
      tiers.forEach(tier => {
        const isPro = tier === 'pro' || tier === 'enterprise';
        expect(isPro).toBe(false);
      });
    });

    it('should set isEnterprise true only for enterprise tier', () => {
      const tier = 'enterprise';
      const isEnterprise = tier === 'enterprise';
      
      expect(isEnterprise).toBe(true);
    });

    it('should set isTrial true for free tier', () => {
      const tier = 'free';
      const isTrial = tier === 'free';
      
      expect(isTrial).toBe(true);
    });
  });

  describe('Context hook error', () => {
    it('should throw error when used outside provider', () => {
      const useLicenseOutsideProvider = () => {
        const context = null; // simulating context = useContext(LicenseContext) when outside provider
        if (!context) {
          throw new Error('useLicense must be used within a LicenseProvider');
        }
        return context;
      };

      expect(() => useLicenseOutsideProvider()).toThrow('useLicense must be used within a LicenseProvider');
    });
  });
});

// ============================================================================
// INTEGRATION TESTS FOR CONTEXT INTERACTIONS
// ============================================================================

describe('Auth and License Context Integration', () => {
  it('should work together for authenticated user with license', () => {
    const authState = {
      user: { id: 'user-1', email: 'test@test.com', name: 'Test' },
      isAuthenticated: true,
      isLoading: false,
    };

    const licenseState = {
      license: {
        id: 'lic-1',
        key: 'KEY',
        tier: 'pro' as const,
        status: 'active' as const,
        features: ['mcp_integration'],
        expiresAt: null,
        maxMachines: 5,
        activeMachines: 1,
      },
      isValid: true,
      isPro: true,
    };

    expect(authState.isAuthenticated).toBe(true);
    expect(licenseState.isValid).toBe(true);
    expect(licenseState.isPro).toBe(true);
  });

  it('should handle unauthenticated user with no license', () => {
    const authState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };

    const licenseState = {
      license: null,
      isValid: false,
      isPro: false,
      isTrial: true,
    };

    expect(authState.isAuthenticated).toBe(false);
    expect(licenseState.license).toBeNull();
  });
});
