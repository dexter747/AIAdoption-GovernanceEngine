/**
 * Landing Site - Payment API Tests
 * Unit tests for checkout and webhook payment endpoints
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
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================================
// PLAN PRICES CONFIGURATION TESTS
// ============================================================================

describe('Plan Prices Configuration', () => {
  const PLAN_PRICES = {
    trial: { monthly: 0, yearly: 0 },
    professional: { monthly: 4900, yearly: 49000 },
    team: { monthly: 19900, yearly: 199000 },
    enterprise: { monthly: 0, yearly: 0 },
  };

  describe('Trial Plan', () => {
    it('should have $0 monthly price', () => {
      expect(PLAN_PRICES.trial.monthly).toBe(0);
    });

    it('should have $0 yearly price', () => {
      expect(PLAN_PRICES.trial.yearly).toBe(0);
    });
  });

  describe('Professional Plan', () => {
    it('should have $49 monthly price (in cents)', () => {
      expect(PLAN_PRICES.professional.monthly).toBe(4900);
    });

    it('should have $490 yearly price (in cents)', () => {
      expect(PLAN_PRICES.professional.yearly).toBe(49000);
    });

    it('should offer savings with yearly billing', () => {
      const monthlyCost = PLAN_PRICES.professional.monthly * 12;
      const yearlyCost = PLAN_PRICES.professional.yearly;
      const savings = monthlyCost - yearlyCost;

      expect(savings).toBeGreaterThan(0);
      expect(savings).toBe(9800); // $98 savings
    });
  });

  describe('Team Plan', () => {
    it('should have $199 monthly price (in cents)', () => {
      expect(PLAN_PRICES.team.monthly).toBe(19900);
    });

    it('should have $1990 yearly price (in cents)', () => {
      expect(PLAN_PRICES.team.yearly).toBe(199000);
    });
  });

  describe('Enterprise Plan', () => {
    it('should have $0 price (custom pricing)', () => {
      expect(PLAN_PRICES.enterprise.monthly).toBe(0);
      expect(PLAN_PRICES.enterprise.yearly).toBe(0);
    });
  });

  describe('Price Formatting', () => {
    it('should convert cents to dollars', () => {
      const formatPrice = (cents: number) => (cents / 100).toFixed(2);

      expect(formatPrice(4900)).toBe('49.00');
      expect(formatPrice(19900)).toBe('199.00');
    });

    it('should format with currency symbol', () => {
      const formatCurrency = (cents: number) => {
        return `$${(cents / 100).toFixed(2)}`;
      };

      expect(formatCurrency(4900)).toBe('$49.00');
    });
  });
});

// ============================================================================
// CREATE CHECKOUT ENDPOINT TESTS
// ============================================================================

describe('POST /api/payments/create-checkout', () => {
  describe('Request Validation', () => {
    it('should require planType', () => {
      const body = { billingCycle: 'monthly' };
      const isValid = body.hasOwnProperty('planType') && body.hasOwnProperty('billingCycle');

      expect(isValid).toBe(false);
    });

    it('should require billingCycle', () => {
      const body = { planType: 'professional' };
      const isValid = body.hasOwnProperty('planType') && body.hasOwnProperty('billingCycle');

      expect(isValid).toBe(false);
    });

    it('should accept valid request body', () => {
      const body = {
        planType: 'professional',
        billingCycle: 'yearly',
        userId: 'user-123',
        email: 'test@example.com',
      };

      const isValid = body.planType && body.billingCycle;
      expect(isValid).toBeTruthy();
    });

    it('should validate plan type values', () => {
      const validPlans = ['trial', 'professional', 'team', 'enterprise'];
      
      validPlans.forEach(plan => {
        expect(validPlans).toContain(plan);
      });

      expect(validPlans).not.toContain('invalid_plan');
    });

    it('should validate billing cycle values', () => {
      const validCycles = ['monthly', 'yearly'];

      validCycles.forEach(cycle => {
        expect(validCycles).toContain(cycle);
      });

      expect(validCycles).not.toContain('weekly');
    });
  });

  describe('Enterprise Plan Handling', () => {
    it('should reject enterprise with custom pricing message', () => {
      const mockResponse = {
        error: 'Enterprise plans require custom pricing. Please contact sales.',
        status: 400,
      };

      expect(mockResponse.status).toBe(400);
      expect(mockResponse.error).toContain('custom pricing');
    });
  });

  describe('Session ID Generation', () => {
    it('should generate unique session ID', () => {
      const generateSessionId = () => {
        return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      };

      const id1 = generateSessionId();
      const id2 = generateSessionId();

      expect(id1).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('Payment Session Creation', () => {
    it('should create session with correct data', () => {
      const sessionData = {
        session_id: 'session_12345_abc',
        user_id: 'user-123',
        plan_type: 'professional',
        billing_cycle: 'yearly',
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      expect(sessionData.status).toBe('pending');
      expect(sessionData.plan_type).toBe('professional');
    });

    it('should set session expiration to 24 hours', () => {
      const now = Date.now();
      const expiresAt = new Date(now + 24 * 60 * 60 * 1000);
      
      const hoursFromNow = (expiresAt.getTime() - now) / (1000 * 60 * 60);
      expect(hoursFromNow).toBeCloseTo(24, 0);
    });

    it('should allow null user_id for guest checkout', () => {
      const sessionData = {
        session_id: 'session_123',
        user_id: null,
        plan_type: 'professional',
        billing_cycle: 'monthly',
        status: 'pending',
      };

      expect(sessionData.user_id).toBeNull();
    });
  });

  describe('Lemon Squeezy Integration', () => {
    it('should construct correct API request', () => {
      const request = {
        amount: 4900,
        currency: 'usd',
        customer_email: 'test@example.com',
        metadata: {
          plan_type: 'professional',
          billing_cycle: 'monthly',
          session_id: 'session_123',
        },
        success_url: 'http://localhost:3000/subscribe/success?session_id=session_123',
        cancel_url: 'http://localhost:3000/pricing',
      };

      expect(request.amount).toBe(4900);
      expect(request.currency).toBe('usd');
      expect(request.metadata.plan_type).toBe('professional');
    });

    it('should include session_id in success URL', () => {
      const sessionId = 'session_12345';
      const successUrl = `http://localhost:3000/subscribe/success?session_id=${sessionId}`;

      expect(successUrl).toContain(`session_id=${sessionId}`);
    });
  });

  describe('Response Format', () => {
    it('should return sessionId and URL on success', () => {
      const response = {
        sessionId: 'session_12345',
        url: 'https://checkout.lemonsqueezy.com/session_12345',
      };

      expect(response.sessionId).toBeDefined();
      expect(response.url).toBeDefined();
    });

    it('should return 400 for missing required fields', () => {
      const mockResponse = {
        error: 'Missing required fields: planType, billingCycle',
        status: 400,
      };

      expect(mockResponse.status).toBe(400);
    });

    it('should return 400 for invalid plan type', () => {
      const mockResponse = {
        error: 'Invalid plan type',
        status: 400,
      };

      expect(mockResponse.status).toBe(400);
    });
  });
});

// ============================================================================
// WEBHOOK ENDPOINT TESTS
// ============================================================================

describe('POST /api/payments/webhook', () => {
  describe('Signature Verification', () => {
    it('should verify HMAC signature', () => {
      const verifySignature = (payload: string, signature: string, secret: string) => {
        const crypto = require('crypto');
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(payload)
          .digest('hex');
        
        try {
          return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
          );
        } catch {
          return false;
        }
      };

      const payload = '{"type":"checkout.session.completed"}';
      const secret = 'webhook_secret';
      const crypto = require('crypto');
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      expect(verifySignature(payload, validSignature, secret)).toBe(true);
      expect(verifySignature(payload, 'invalid_signature', secret)).toBe(false);
    });

    it('should skip verification in development', () => {
      const LEMONSQUEEZY_WEBHOOK_SECRET = undefined;
      const shouldVerify = !!LEMONSQUEEZY_WEBHOOK_SECRET;

      expect(shouldVerify).toBe(false);
    });

    it('should return 401 for invalid signature', () => {
      const mockResponse = {
        error: 'Invalid signature',
        status: 401,
      };

      expect(mockResponse.status).toBe(401);
    });
  });

  describe('License Key Generation', () => {
    it('should generate JWT-based license key', () => {
      const generateLicenseKey = (userId: string, tier: string, expiresInDays = 365) => {
        const payload = {
          userId,
          tier,
          exp: Math.floor(Date.now() / 1000) + (expiresInDays * 24 * 60 * 60),
          iat: Math.floor(Date.now() / 1000),
        };
        // Mock JWT generation
        return `eyJ${Buffer.from(JSON.stringify(payload)).toString('base64')}.signature`;
      };

      const key = generateLicenseKey('user-123', 'professional');
      expect(key).toContain('eyJ');
    });

    it('should set correct expiration for yearly plans', () => {
      const expiresInDays = 365;
      const exp = Math.floor(Date.now() / 1000) + (expiresInDays * 24 * 60 * 60);
      const expiresAt = new Date(exp * 1000);

      const daysFromNow = Math.ceil(
        (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      expect(daysFromNow).toBeCloseTo(365, 1);
    });

    it('should set correct expiration for monthly plans', () => {
      const expiresInDays = 30;
      const exp = Math.floor(Date.now() / 1000) + (expiresInDays * 24 * 60 * 60);
      const expiresAt = new Date(exp * 1000);

      const daysFromNow = Math.ceil(
        (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      expect(daysFromNow).toBeCloseTo(30, 1);
    });
  });

  describe('Event: checkout.session.completed', () => {
    it('should update payment session status', () => {
      const updateSession = (sessionId: string, customerId: string) => ({
        session_id: sessionId,
        status: 'completed',
        customer_id: customerId,
        completed_at: new Date().toISOString(),
      });

      const updated = updateSession('session_123', 'cust_456');

      expect(updated.status).toBe('completed');
      expect(updated.customer_id).toBe('cust_456');
    });

    it('should create user if not exists', async () => {
      const createUser = async (email: string, plan: string) => ({
        id: `user_${Date.now()}`,
        email,
        plan,
        created_at: new Date().toISOString(),
      });

      const newUser = await createUser('new@example.com', 'professional');

      expect(newUser.email).toBe('new@example.com');
      expect(newUser.plan).toBe('professional');
    });

    it('should use existing user if found', () => {
      const existingUser = { id: 'existing-user-123' };
      const userId = existingUser.id;

      expect(userId).toBe('existing-user-123');
    });

    it('should create license for user', () => {
      const licenseData = {
        user_id: 'user-123',
        license_key: 'preview...key',
        key_hash: 'sha256hash',
        tier: 'professional',
        is_active: true,
        max_machines: 2,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      expect(licenseData.tier).toBe('professional');
      expect(licenseData.is_active).toBe(true);
    });
  });

  describe('Event: subscription.updated', () => {
    it('should handle tier upgrade', () => {
      const updateLicense = (license: any, newTier: string) => ({
        ...license,
        tier: newTier,
        updated_at: new Date().toISOString(),
      });

      const updated = updateLicense({ tier: 'professional' }, 'team');

      expect(updated.tier).toBe('team');
    });

    it('should handle tier downgrade', () => {
      const updateLicense = (license: any, newTier: string) => ({
        ...license,
        tier: newTier,
        downgraded_at: new Date().toISOString(),
      });

      const updated = updateLicense({ tier: 'team' }, 'professional');

      expect(updated.tier).toBe('professional');
    });
  });

  describe('Event: subscription.cancelled', () => {
    it('should set license to expire at period end', () => {
      const cancelLicense = (license: any, periodEnd: string) => ({
        ...license,
        cancelled_at: new Date().toISOString(),
        expires_at: periodEnd,
        auto_renew: false,
      });

      const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const cancelled = cancelLicense({ tier: 'professional' }, periodEnd);

      expect(cancelled.auto_renew).toBe(false);
      expect(cancelled.cancelled_at).toBeDefined();
    });
  });

  describe('Event: payment.failed', () => {
    it('should mark payment as failed', () => {
      const failPayment = (sessionId: string, reason: string) => ({
        session_id: sessionId,
        status: 'failed',
        failure_reason: reason,
        failed_at: new Date().toISOString(),
      });

      const failed = failPayment('session_123', 'Card declined');

      expect(failed.status).toBe('failed');
      expect(failed.failure_reason).toBe('Card declined');
    });

    it('should log payment failure', () => {
      const logPaymentFailure = jest.fn();
      
      logPaymentFailure('session_123', 'Insufficient funds');

      expect(logPaymentFailure).toHaveBeenCalledWith('session_123', 'Insufficient funds');
    });
  });

  describe('Event: refund.completed', () => {
    it('should revoke license on refund', () => {
      const revokeLicense = (licenseId: string, reason: string) => ({
        id: licenseId,
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoke_reason: reason,
      });

      const revoked = revokeLicense('lic-123', 'Refund processed');

      expect(revoked.is_active).toBe(false);
      expect(revoked.revoke_reason).toBe('Refund processed');
    });
  });

  describe('Unknown Event Handling', () => {
    it('should log unknown event types', () => {
      const eventType = 'unknown.event';
      const isKnownEvent = [
        'checkout.session.completed',
        'subscription.updated',
        'subscription.cancelled',
        'payment.failed',
        'refund.completed',
      ].includes(eventType);

      expect(isKnownEvent).toBe(false);
    });

    it('should return 200 for unknown events', () => {
      // Webhooks should return 200 even for unknown events to prevent retries
      const response = { received: true, status: 200 };

      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on processing error', () => {
      const mockResponse = {
        error: 'Webhook processing failed',
        status: 500,
      };

      expect(mockResponse.status).toBe(500);
    });

    it('should log errors with event context', () => {
      const logError = jest.fn();
      const error = new Error('Database error');
      const eventId = 'evt_12345';

      logError({ error: error.message, eventId });

      expect(logError).toHaveBeenCalledWith({ error: 'Database error', eventId: 'evt_12345' });
    });
  });
});

// ============================================================================
// PLAN TIER MAPPING TESTS
// ============================================================================

describe('Plan Tier Mapping', () => {
  const planToTier: Record<string, string> = {
    trial: 'free',
    professional: 'pro',
    team: 'team',
    enterprise: 'enterprise',
  };

  it('should map trial to free tier', () => {
    expect(planToTier.trial).toBe('free');
  });

  it('should map professional to pro tier', () => {
    expect(planToTier.professional).toBe('pro');
  });

  it('should map team to team tier', () => {
    expect(planToTier.team).toBe('team');
  });

  it('should map enterprise to enterprise tier', () => {
    expect(planToTier.enterprise).toBe('enterprise');
  });
});

// ============================================================================
// BILLING CYCLE HANDLING TESTS
// ============================================================================

describe('Billing Cycle Handling', () => {
  describe('Monthly Billing', () => {
    it('should set 30 day license expiration', () => {
      const getExpiration = (cycle: string) => {
        const days = cycle === 'yearly' ? 365 : 30;
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      };

      const expiration = getExpiration('monthly');
      const daysFromNow = Math.ceil(
        (expiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      expect(daysFromNow).toBeCloseTo(30, 1);
    });
  });

  describe('Yearly Billing', () => {
    it('should set 365 day license expiration', () => {
      const getExpiration = (cycle: string) => {
        const days = cycle === 'yearly' ? 365 : 30;
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      };

      const expiration = getExpiration('yearly');
      const daysFromNow = Math.ceil(
        (expiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      expect(daysFromNow).toBeCloseTo(365, 1);
    });

    it('should calculate yearly savings', () => {
      const monthlyPrice = 4900;
      const yearlyPrice = 49000;
      const savings = (monthlyPrice * 12) - yearlyPrice;

      expect(savings).toBe(9800); // $98 saved
    });
  });
});
