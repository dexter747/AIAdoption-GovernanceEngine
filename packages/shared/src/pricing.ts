/**
 * AI Nexus - Pricing Configuration
 * Centralized pricing structure for all applications
 */

export const PRICING_PLANS = {
  starter: {
    name: 'Starter',
    monthly: 19900, // $199 in cents
    yearly: 199000, // $1,990 in cents (save 17%)
    features: {
      aiProviders: 5,
      dbConnections: 3,
      teamMembers: 1,
      tokensPerMonth: 1_000_000,
      queriesPerMonth: 1000,
      support: 'email',
    },
    limits: {
      maxAIProviders: 5,
      maxDatabases: 3,
      maxUsers: 1,
      maxTokensPerMonth: 1_000_000,
      maxQueriesPerDay: 50,
    },
  },
  professional: {
    name: 'Professional',
    monthly: 49900, // $499 in cents
    yearly: 499000, // $4,990 in cents (save 17%)
    features: {
      aiProviders: 15, // All providers
      dbConnections: 10,
      teamMembers: 5,
      tokensPerMonth: 10_000_000,
      queriesPerMonth: 10000,
      support: 'priority',
    },
    limits: {
      maxAIProviders: 15,
      maxDatabases: 10,
      maxUsers: 5,
      maxTokensPerMonth: 10_000_000,
      maxQueriesPerDay: 500,
    },
  },
  enterprise: {
    name: 'Enterprise',
    monthly: 99900, // $999 in cents
    yearly: 999000, // $9,990 in cents (save 17%)
    features: {
      aiProviders: 'unlimited',
      dbConnections: 'unlimited',
      teamMembers: 25,
      tokensPerMonth: 100_000_000,
      queriesPerMonth: 'unlimited',
      support: 'dedicated',
    },
    limits: {
      maxAIProviders: 999,
      maxDatabases: 999,
      maxUsers: 25,
      maxTokensPerMonth: 100_000_000,
      maxQueriesPerDay: 9999,
    },
  },
  custom: {
    name: 'Custom',
    monthly: 0, // Contact sales
    yearly: 0,
    features: {
      aiProviders: 'unlimited',
      dbConnections: 'unlimited',
      teamMembers: 'unlimited',
      tokensPerMonth: 'custom',
      queriesPerMonth: 'unlimited',
      support: 'white-glove',
    },
    limits: {
      maxAIProviders: 9999,
      maxDatabases: 9999,
      maxUsers: 9999,
      maxTokensPerMonth: 999_999_999,
      maxQueriesPerDay: 99999,
    },
  },
} as const;

export const USAGE_BASED_PRICING = {
  additionalTokens: {
    name: 'Additional AI Tokens',
    price: 1000, // $10 per 1M tokens
    unit: '1M tokens',
    description: 'Extra tokens beyond your plan limit',
  },
  additionalConnections: {
    name: 'Extra Database Connections',
    price: 5000, // $50 per connection/month
    unit: 'per connection/month',
    description: 'Add more database connections',
  },
  additionalUsers: {
    name: 'Additional Team Members',
    price: 9900, // $99 per user/month
    unit: 'per user/month',
    description: 'Add more team members to your account',
  },
} as const;

export type PlanType = keyof typeof PRICING_PLANS;
export type BillingCycle = 'monthly' | 'yearly';

export interface PlanLimits {
  maxAIProviders: number;
  maxDatabases: number;
  maxUsers: number;
  maxTokensPerMonth: number;
  maxQueriesPerDay: number;
}

export interface UsageOverage {
  type: 'tokens' | 'connections' | 'users';
  amount: number;
  cost: number;
}

/**
 * Calculate total price including usage-based charges
 */
export function calculateTotalPrice(
  plan: PlanType,
  billingCycle: BillingCycle,
  overages: UsageOverage[] = []
): number {
  const basePlan = PRICING_PLANS[plan];
  const basePrice = basePlan[billingCycle];

  const overageTotal = overages.reduce((sum, overage) => {
    switch (overage.type) {
      case 'tokens':
        return sum + (overage.amount * USAGE_BASED_PRICING.additionalTokens.price / 1_000_000);
      case 'connections':
        return sum + (overage.amount * USAGE_BASED_PRICING.additionalConnections.price);
      case 'users':
        return sum + (overage.amount * USAGE_BASED_PRICING.additionalUsers.price);
      default:
        return sum;
    }
  }, 0);

  return basePrice + overageTotal;
}

/**
 * Calculate savings for yearly billing
 */
export function calculateYearlySavings(plan: PlanType): number {
  const monthly = PRICING_PLANS[plan].monthly * 12;
  const yearly = PRICING_PLANS[plan].yearly;
  return monthly - yearly;
}

/**
 * Format price for display
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Get plan limits for a given plan type
 */
export function getPlanLimits(plan: PlanType): PlanLimits {
  return PRICING_PLANS[plan].limits;
}

/**
 * Check if usage exceeds plan limits
 */
export function checkUsageOverage(
  plan: PlanType,
  usage: {
    tokens?: number;
    connections?: number;
    users?: number;
  }
): UsageOverage[] {
  const limits = getPlanLimits(plan);
  const overages: UsageOverage[] = [];

  if (usage.tokens && usage.tokens > limits.maxTokensPerMonth) {
    const excessTokens = usage.tokens - limits.maxTokensPerMonth;
    overages.push({
      type: 'tokens',
      amount: excessTokens,
      cost: (excessTokens * USAGE_BASED_PRICING.additionalTokens.price) / 1_000_000,
    });
  }

  if (usage.connections && usage.connections > limits.maxDatabases) {
    const excessConnections = usage.connections - limits.maxDatabases;
    overages.push({
      type: 'connections',
      amount: excessConnections,
      cost: excessConnections * USAGE_BASED_PRICING.additionalConnections.price,
    });
  }

  if (usage.users && usage.users > limits.maxUsers) {
    const excessUsers = usage.users - limits.maxUsers;
    overages.push({
      type: 'users',
      amount: excessUsers,
      cost: excessUsers * USAGE_BASED_PRICING.additionalUsers.price,
    });
  }

  return overages;
}
