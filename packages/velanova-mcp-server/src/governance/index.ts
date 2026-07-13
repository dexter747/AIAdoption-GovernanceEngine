/**
 * Governance Layer
 * Handles licensing, audit logging, cost tracking, and rate limiting
 */

import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('governance');

interface LicenseValidationResult {
  valid: boolean;
  tier?: 'free' | 'pro' | 'enterprise';
  features?: string[];
  error?: string;
}

interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  parameters: Record<string, unknown>;
  startTime: Date;
  endTime?: Date;
  status: 'started' | 'completed' | 'failed';
  result?: unknown;
  cost?: number;
  error?: string;
}

interface UsageStats {
  period: string;
  totalCalls: number;
  totalTokens: number;
  totalCost: number;
  byModel: Record<string, { calls: number; tokens: number; cost: number }>;
  byUser: Record<string, { calls: number; tokens: number; cost: number }>;
}

// In-memory stores (in production, would use Supabase)
const auditLog: Map<string, AuditEntry> = new Map();
const usageTracking: Map<string, { calls: number; tokens: number; cost: number; lastReset: Date }> =
  new Map();
const rateLimits: Map<string, { count: number; resetAt: Date }> = new Map();

// Rate limit configuration
const RATE_LIMITS = {
  free: { requestsPerMinute: 10 },
  pro: { requestsPerMinute: 100 },
  enterprise: { requestsPerMinute: 1000 },
};

// Cost estimates for different operations
const OPERATION_COSTS: Record<string, number> = {
  query_ai: 0.01, // Base cost, actual depends on model
  query_database: 0.001, // Very cheap
  query_sap: 0.005, // SAP calls are expensive
  query_salesforce: 0.002,
  query_epic: 0.003, // HIPAA compliance overhead
  query_servicenow: 0.002,
  query_jira: 0.001,
};

export class GovernanceLayer {
  private userTiers: Map<string, 'free' | 'pro' | 'enterprise'> = new Map();

  constructor() {
    logger.info('Governance layer initialized');
  }

  // ============================================================
  // LICENSE VALIDATION
  // ============================================================
  async validateLicense(licenseKey?: string): Promise<LicenseValidationResult> {
    if (!licenseKey) {
      // No license = free tier
      return {
        valid: true,
        tier: 'free',
        features: ['query_ai', 'list_ai_models', 'get_usage_stats'],
      };
    }

    // In production, would validate against Supabase
    // For now, simple key pattern matching
    if (licenseKey.startsWith('pro_')) {
      return {
        valid: true,
        tier: 'pro',
        features: [
          'query_ai',
          'list_ai_models',
          'query_database',
          'query_sap',
          'query_salesforce',
          'get_usage_stats',
          'compare_models',
        ],
      };
    }

    if (licenseKey.startsWith('ent_')) {
      return {
        valid: true,
        tier: 'enterprise',
        features: ['*'], // All features
      };
    }

    // Invalid license
    return {
      valid: false,
      error: 'Invalid license key format',
    };
  }

  // ============================================================
  // RATE LIMITING
  // ============================================================
  async checkRateLimit(userId: string): Promise<boolean> {
    const now = new Date();
    const userTier = this.userTiers.get(userId) ?? 'free';
    const limit = RATE_LIMITS[userTier];

    let userLimit = rateLimits.get(userId);

    // Reset if minute has passed
    if (!userLimit || userLimit.resetAt < now) {
      userLimit = {
        count: 0,
        resetAt: new Date(now.getTime() + 60000), // 1 minute from now
      };
    }

    if (userLimit.count >= limit.requestsPerMinute) {
      logger.warn(
        { userId, count: userLimit.count, limit: limit.requestsPerMinute },
        'Rate limit exceeded'
      );
      return false;
    }

    userLimit.count++;
    rateLimits.set(userId, userLimit);
    return true;
  }

  // ============================================================
  // AUDIT LOGGING
  // ============================================================
  async startAudit(
    userId: string,
    action: string,
    parameters: Record<string, unknown>
  ): Promise<string> {
    const auditId = uuidv4();

    const entry: AuditEntry = {
      id: auditId,
      userId,
      action,
      parameters,
      startTime: new Date(),
      status: 'started',
    };

    auditLog.set(auditId, entry);
    logger.debug({ auditId, userId, action }, 'Audit started');

    return auditId;
  }

  async completeAudit(auditId: string, result: unknown, cost: number): Promise<void> {
    const entry = auditLog.get(auditId);
    if (!entry) {
      logger.warn({ auditId }, 'Audit entry not found');
      return;
    }

    entry.endTime = new Date();
    entry.status = 'completed';
    entry.result = result;
    entry.cost = cost;

    auditLog.set(auditId, entry);
    logger.debug(
      { auditId, cost, durationMs: entry.endTime.getTime() - entry.startTime.getTime() },
      'Audit completed'
    );
  }

  async failAudit(auditId: string, error: string): Promise<void> {
    const entry = auditLog.get(auditId);
    if (!entry) {
      logger.warn({ auditId }, 'Audit entry not found');
      return;
    }

    entry.endTime = new Date();
    entry.status = 'failed';
    entry.error = error;

    auditLog.set(auditId, entry);
    logger.debug({ auditId, error }, 'Audit failed');
  }

  async getAuditLog(filters: Record<string, unknown>): Promise<AuditEntry[]> {
    let entries = Array.from(auditLog.values());

    if (filters.user_id) {
      entries = entries.filter(e => e.userId === filters.user_id);
    }

    if (filters.action) {
      entries = entries.filter(e => e.action === filters.action);
    }

    if (filters.start_date) {
      const startDate = new Date(filters.start_date as string);
      entries = entries.filter(e => e.startTime >= startDate);
    }

    if (filters.end_date) {
      const endDate = new Date(filters.end_date as string);
      entries = entries.filter(e => e.startTime <= endDate);
    }

    // Return most recent first, limited to 100
    return entries.sort((a, b) => b.startTime.getTime() - a.startTime.getTime()).slice(0, 100);
  }

  // ============================================================
  // COST TRACKING
  // ============================================================
  async trackCost(userId: string, action: string, result: unknown): Promise<number> {
    // Calculate cost based on action and result
    let cost = OPERATION_COSTS[action] ?? 0.001;

    // If result contains usage info (like from AI queries), use actual cost
    if (result && typeof result === 'object' && 'usage' in result) {
      const usage = (result as { usage?: { totalCost?: number } }).usage;
      if (usage?.totalCost) {
        cost = usage.totalCost;
      }
    }

    // Track usage
    const userUsage = usageTracking.get(userId) ?? {
      calls: 0,
      tokens: 0,
      cost: 0,
      lastReset: new Date(),
    };

    userUsage.calls++;
    userUsage.cost += cost;

    // Extract tokens if available
    if (result && typeof result === 'object' && 'usage' in result) {
      const usage = (result as { usage?: { inputTokens?: number; outputTokens?: number } }).usage;
      userUsage.tokens += (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0);
    }

    usageTracking.set(userId, userUsage);

    return cost;
  }

  async estimateCost(
    operation: string,
    parameters?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const baseCost = OPERATION_COSTS[operation] ?? 0.001;

    // For AI queries, estimate based on model
    if (operation === 'query_ai' && parameters?.model) {
      // In production, would look up model pricing
      return {
        operation,
        estimatedCost: baseCost,
        model: parameters.model,
        note: 'Actual cost depends on input/output token count',
      };
    }

    return {
      operation,
      estimatedCost: baseCost,
      parameters,
    };
  }

  // ============================================================
  // USAGE STATISTICS
  // ============================================================
  async getUsageStats(userId: string, period: string): Promise<UsageStats> {
    const userUsage = usageTracking.get(userId);

    if (!userUsage) {
      return {
        period,
        totalCalls: 0,
        totalTokens: 0,
        totalCost: 0,
        byModel: {},
        byUser: {},
      };
    }

    // In production, would aggregate from Supabase by period
    return {
      period,
      totalCalls: userUsage.calls,
      totalTokens: userUsage.tokens,
      totalCost: userUsage.cost,
      byModel: {}, // Would be populated from actual data
      byUser: {
        [userId]: {
          calls: userUsage.calls,
          tokens: userUsage.tokens,
          cost: userUsage.cost,
        },
      },
    };
  }

  // ============================================================
  // HEALTH CHECK
  // ============================================================
  async healthCheck(): Promise<Record<string, unknown>> {
    return {
      status: 'healthy',
      auditLogSize: auditLog.size,
      trackedUsers: usageTracking.size,
      rateLimitedUsers: rateLimits.size,
    };
  }
}
