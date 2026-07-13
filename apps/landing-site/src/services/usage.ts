import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UsageData {
  userId: string;
  tokens: number;
  connections: number;
  users: number;
  queries: number;
}

export interface UsageOverage {
  type: 'tokens' | 'connections' | 'users';
  amount: number;
  cost: number;
}

const USAGE_PRICING = {
  additionalTokens: 1000, // $10 per 1M tokens (in cents)
  additionalConnections: 5000, // $50 per connection/month
  additionalUsers: 9900, // $99 per user/month
};

/**
 * Track usage for a user
 */
export async function trackUsage(
  userId: string,
  type: 'query' | 'tokens' | 'connection',
  amount: number,
  metadata?: any
) {
  const { error } = await supabase.from('usage_logs').insert({
    user_id: userId,
    usage_type: type,
    amount: amount,
    metadata: metadata,
    timestamp: new Date().toISOString(),
  });

  if (error) {
    console.error('Failed to track usage:', error);
  }
}

/**
 * Get current month usage for a user
 */
export async function getCurrentMonthUsage(userId: string): Promise<UsageData> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Get token usage
  const { data: tokenData } = await supabase
    .from('usage_logs')
    .select('amount')
    .eq('user_id', userId)
    .eq('usage_type', 'tokens')
    .gte('timestamp', startOfMonth.toISOString());

  const tokens = tokenData?.reduce((sum, log) => sum + log.amount, 0) || 0;

  // Get active connections
  const { data: connectionData } = await supabase
    .from('user_connections')
    .select('id')
    .eq('user_id', userId)
    .eq('enabled', true);

  const connections = connectionData?.length || 0;

  // Get team member count
  const { data: userData } = await supabase
    .from('team_members')
    .select('id')
    .eq('team_owner_id', userId)
    .eq('status', 'active');

  const users = (userData?.length || 0) + 1; // +1 for owner

  // Get query count
  const { data: queryData } = await supabase
    .from('usage_logs')
    .select('amount')
    .eq('user_id', userId)
    .eq('usage_type', 'query')
    .gte('timestamp', startOfMonth.toISOString());

  const queries = queryData?.length || 0;

  return { userId, tokens, connections, users, queries };
}

/**
 * Check if usage exceeds plan limits and calculate overages
 */
export async function checkUsageOverages(
  userId: string,
  planType: string
): Promise<UsageOverage[]> {
  const usage = await getCurrentMonthUsage(userId);
  const overages: UsageOverage[] = [];

  // Get plan limits
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (!subscription) return overages;

  const limits = getPlanLimits(subscription.plan_type);

  // Check token overage
  if (usage.tokens > limits.maxTokensPerMonth) {
    const excessTokens = usage.tokens - limits.maxTokensPerMonth;
    overages.push({
      type: 'tokens',
      amount: excessTokens,
      cost: Math.ceil((excessTokens / 1_000_000) * USAGE_PRICING.additionalTokens),
    });
  }

  // Check connection overage
  if (usage.connections > limits.maxDatabases) {
    const excessConnections = usage.connections - limits.maxDatabases;
    overages.push({
      type: 'connections',
      amount: excessConnections,
      cost: excessConnections * USAGE_PRICING.additionalConnections,
    });
  }

  // Check user overage
  if (usage.users > limits.maxUsers) {
    const excessUsers = usage.users - limits.maxUsers;
    overages.push({
      type: 'users',
      amount: excessUsers,
      cost: excessUsers * USAGE_PRICING.additionalUsers,
    });
  }

  return overages;
}

/**
 * Send usage alert when user reaches threshold
 */
export async function sendUsageAlert(userId: string, usagePercent: number) {
  const { data: user } = await supabase.from('users').select('email').eq('id', userId).single();

  if (!user) return;

  console.log(`[Usage Alert] User ${userId} at ${usagePercent}% of limit`);
  // TODO: Send email alert
}

/**
 * Calculate overage charges for billing
 */
export async function calculateOverageCharges(userId: string): Promise<number> {
  const overages = await checkUsageOverages(userId, '');
  return overages.reduce((total, overage) => total + overage.cost, 0);
}

/**
 * Get plan limits by plan type
 */
function getPlanLimits(planType: string) {
  const limits: Record<string, any> = {
    starter: {
      maxAIProviders: 5,
      maxDatabases: 3,
      maxUsers: 1,
      maxTokensPerMonth: 1_000_000,
      maxQueriesPerDay: 50,
    },
    professional: {
      maxAIProviders: 15,
      maxDatabases: 10,
      maxUsers: 5,
      maxTokensPerMonth: 10_000_000,
      maxQueriesPerDay: 500,
    },
    enterprise: {
      maxAIProviders: 999,
      maxDatabases: 999,
      maxUsers: 25,
      maxTokensPerMonth: 100_000_000,
      maxQueriesPerDay: 9999,
    },
    custom: {
      maxAIProviders: 9999,
      maxDatabases: 9999,
      maxUsers: 9999,
      maxTokensPerMonth: 999_999_999,
      maxQueriesPerDay: 99999,
    },
  };

  return limits[planType] || limits.starter;
}

/**
 * Monitor usage and send alerts
 */
export async function monitorUsageAlerts(userId: string) {
  const usage = await getCurrentMonthUsage(userId);
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (!subscription) return;

  const limits = getPlanLimits(subscription.plan_type);
  const tokenUsagePercent = (usage.tokens / limits.maxTokensPerMonth) * 100;

  // Send alerts at 80% and 100%
  if (tokenUsagePercent >= 100) {
    await sendUsageAlert(userId, 100);
  } else if (tokenUsagePercent >= 80) {
    await sendUsageAlert(userId, 80);
  }
}
