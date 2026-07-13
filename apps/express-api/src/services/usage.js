/**
 * Usage Service
 * Track API usage and costs
 */

import { supabase } from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('usage-service');

// Cost per 1M tokens (in cents)
const TOKEN_COSTS = {
  openai: {
    'gpt-4o': { input: 250, output: 1000 },
    'gpt-4o-mini': { input: 15, output: 60 },
    'gpt-4-turbo': { input: 1000, output: 3000 },
    'gpt-3.5-turbo': { input: 50, output: 150 },
    o1: { input: 1500, output: 6000 },
    'o1-mini': { input: 300, output: 1200 },
    'o3-mini': { input: 110, output: 440 },
  },
  anthropic: {
    'claude-3-5-sonnet-20241022': { input: 300, output: 1500 },
    'claude-3-5-haiku-20241022': { input: 100, output: 500 },
    'claude-3-opus-20240229': { input: 1500, output: 7500 },
  },
  google: {
    'gemini-2.0-flash': { input: 7.5, output: 30 },
    'gemini-2.0-flash-thinking': { input: 7.5, output: 30 },
    'gemini-1.5-pro': { input: 125, output: 500 },
    'gemini-1.5-flash': { input: 7.5, output: 30 },
  },
  groq: {
    'llama-3.3-70b-versatile': { input: 59, output: 79 },
    'llama-3.1-8b-instant': { input: 5, output: 8 },
    'mixtral-8x7b-32768': { input: 24, output: 24 },
  },
  cohere: {
    'command-r-plus': { input: 250, output: 1000 },
    'command-r': { input: 50, output: 150 },
    command: { input: 100, output: 200 },
  },
  mistral: {
    'mistral-large-latest': { input: 200, output: 600 },
    'mistral-medium-latest': { input: 270, output: 810 },
    'mistral-small-latest': { input: 20, output: 60 },
    'codestral-latest': { input: 30, output: 90 },
  },
  perplexity: {
    sonar: { input: 100, output: 100 },
    'sonar-pro': { input: 300, output: 1500 },
    'sonar-reasoning': { input: 100, output: 500 },
  },
  deepseek: {
    'deepseek-chat': { input: 14, output: 28 },
    'deepseek-coder': { input: 14, output: 28 },
    'deepseek-reasoner': { input: 55, output: 219 },
  },
};

// In-memory usage cache (for when database is not available)
const usageCache = new Map();

export const UsageService = {
  /**
   * Track usage for a request
   */
  async track({ userId, provider, model, inputTokens, outputTokens, duration }) {
    const cost = this.calculateCost(provider, model, inputTokens, outputTokens);

    const usageRecord = {
      user_id: userId,
      provider,
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_cents: cost,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    };

    if (!supabase) {
      // Cache in memory for development
      const key = `${userId}-${new Date().toISOString().slice(0, 10)}`;
      const existing = usageCache.get(key) || [];
      existing.push(usageRecord);
      usageCache.set(key, existing);
      return;
    }

    try {
      await supabase.from('usage_records').insert(usageRecord);
    } catch (err) {
      logger.error({ error: err.message }, 'Failed to track usage');
    }
  },

  /**
   * Get usage for a user
   */
  async getUsage(userId, { startDate, endDate, provider, granularity = 'day' } = {}) {
    if (!supabase) {
      // Return cached data
      const records = [];
      for (const [key, values] of usageCache.entries()) {
        if (key.startsWith(userId)) {
          records.push(...values);
        }
      }
      return this.aggregateUsage(records, granularity);
    }

    try {
      let query = supabase
        .from('usage_records')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (startDate) {
        query = query.gte('timestamp', startDate);
      }
      if (endDate) {
        query = query.lte('timestamp', endDate);
      }
      if (provider) {
        query = query.eq('provider', provider);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return this.aggregateUsage(data, granularity);
    } catch (err) {
      logger.error({ error: err.message }, 'Failed to get usage');
      return { periods: [], totals: { tokens: 0, cost: 0, requests: 0 } };
    }
  },

  /**
   * Get usage summary
   */
  async getSummary(userId) {
    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const [todayUsage, monthUsage] = await Promise.all([
      this.getUsage(userId, { startDate: today }),
      this.getUsage(userId, { startDate: thirtyDaysAgo }),
    ]);

    return {
      today: todayUsage.totals,
      last30Days: monthUsage.totals,
      byProvider: monthUsage.byProvider || {},
    };
  },

  /**
   * Get usage limits for a user
   */
  async getLimits(userId) {
    // TODO: Get actual limits from license
    const defaultLimits = {
      daily: {
        tokens: 100000,
        cost: 500, // cents
      },
      monthly: {
        tokens: 2000000,
        cost: 5000, // cents
      },
    };

    const summary = await this.getSummary(userId);

    return {
      limits: defaultLimits,
      used: {
        daily: {
          tokens: summary.today.tokens,
          cost: summary.today.cost,
        },
        monthly: {
          tokens: summary.last30Days.tokens,
          cost: summary.last30Days.cost,
        },
      },
      remaining: {
        daily: {
          tokens: Math.max(0, defaultLimits.daily.tokens - summary.today.tokens),
          cost: Math.max(0, defaultLimits.daily.cost - summary.today.cost),
        },
        monthly: {
          tokens: Math.max(0, defaultLimits.monthly.tokens - summary.last30Days.tokens),
          cost: Math.max(0, defaultLimits.monthly.cost - summary.last30Days.cost),
        },
      },
    };
  },

  /**
   * Get cost breakdown
   */
  async getCostBreakdown(userId, query) {
    const usage = await this.getUsage(userId, query);

    return {
      total: usage.totals.cost,
      byProvider: usage.byProvider || {},
      byModel: usage.byModel || {},
    };
  },

  /**
   * Calculate cost for a request
   */
  calculateCost(provider, model, inputTokens, outputTokens) {
    const providerCosts = TOKEN_COSTS[provider];
    if (!providerCosts) return 0;

    const modelCosts = providerCosts[model];
    if (!modelCosts) return 0;

    // Cost per 1M tokens
    const inputCost = (inputTokens / 1000000) * modelCosts.input;
    const outputCost = (outputTokens / 1000000) * modelCosts.output;

    return Math.round((inputCost + outputCost) * 100) / 100; // Round to 2 decimal places
  },

  /**
   * Aggregate usage data
   */
  aggregateUsage(records, granularity) {
    const totals = {
      tokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      cost: 0,
      requests: records.length,
    };

    const byProvider = {};
    const byModel = {};
    const periods = {};

    for (const record of records) {
      // Totals
      totals.inputTokens += record.input_tokens || 0;
      totals.outputTokens += record.output_tokens || 0;
      totals.tokens += (record.input_tokens || 0) + (record.output_tokens || 0);
      totals.cost += record.cost_cents || 0;

      // By provider
      if (!byProvider[record.provider]) {
        byProvider[record.provider] = { tokens: 0, cost: 0, requests: 0 };
      }
      byProvider[record.provider].tokens +=
        (record.input_tokens || 0) + (record.output_tokens || 0);
      byProvider[record.provider].cost += record.cost_cents || 0;
      byProvider[record.provider].requests += 1;

      // By model
      if (!byModel[record.model]) {
        byModel[record.model] = { tokens: 0, cost: 0, requests: 0 };
      }
      byModel[record.model].tokens += (record.input_tokens || 0) + (record.output_tokens || 0);
      byModel[record.model].cost += record.cost_cents || 0;
      byModel[record.model].requests += 1;

      // By period
      const periodKey = this.getPeriodKey(record.timestamp, granularity);
      if (!periods[periodKey]) {
        periods[periodKey] = { tokens: 0, cost: 0, requests: 0 };
      }
      periods[periodKey].tokens += (record.input_tokens || 0) + (record.output_tokens || 0);
      periods[periodKey].cost += record.cost_cents || 0;
      periods[periodKey].requests += 1;
    }

    return {
      totals,
      byProvider,
      byModel,
      periods: Object.entries(periods).map(([period, data]) => ({
        period,
        ...data,
      })),
    };
  },

  /**
   * Get period key for aggregation
   */
  getPeriodKey(timestamp, granularity) {
    const date = new Date(timestamp);

    switch (granularity) {
      case 'hour':
        return `${date.toISOString().slice(0, 13)}:00`;
      case 'day':
        return date.toISOString().slice(0, 10);
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().slice(0, 10);
      case 'month':
        return date.toISOString().slice(0, 7);
      default:
        return date.toISOString().slice(0, 10);
    }
  },
};
