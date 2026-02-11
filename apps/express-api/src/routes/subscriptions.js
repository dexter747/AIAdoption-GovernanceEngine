import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * GET /api/subscriptions/:userId - Get user's subscription
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('current_period_end', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw error;
    }

    res.json({ subscription: subscription || null });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/subscriptions/:userId/upgrade - Upgrade subscription
 */
router.post('/:userId/upgrade', async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPlanType } = req.body;

    if (!newPlanType) {
      return res.status(400).json({ error: 'New plan type required' });
    }

    // Get current subscription
    const { data: currentSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!currentSub) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Calculate prorated amount (simplified - should use proper proration logic)
    const newAmount = getPlanAmount(newPlanType, currentSub.billing_cycle);

    // Update subscription
    const { data: updatedSub, error } = await supabase
      .from('subscriptions')
      .update({
        plan_type: newPlanType,
        amount: newAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentSub.id)
      .select()
      .single();

    if (error) throw error;

    // Update license
    await supabase
      .from('licenses')
      .update({ plan_type: newPlanType })
      .eq('subscription_id', currentSub.id);

    res.json({ subscription: updatedSub, message: 'Subscription upgraded successfully' });
  } catch (error: any) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/subscriptions/:userId/downgrade - Downgrade subscription
 */
router.post('/:userId/downgrade', async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPlanType } = req.body;

    if (!newPlanType) {
      return res.status(400).json({ error: 'New plan type required' });
    }

    // Get current subscription
    const { data: currentSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!currentSub) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const newAmount = getPlanAmount(newPlanType, currentSub.billing_cycle);

    // Schedule downgrade at period end
    const { data: updatedSub, error } = await supabase
      .from('subscriptions')
      .update({
        // Don't change plan_type immediately for downgrades
        metadata: {
          scheduled_downgrade: {
            plan_type: newPlanType,
            amount: newAmount,
            scheduled_at: new Date().toISOString(),
          },
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentSub.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      subscription: updatedSub,
      message: `Downgrade scheduled. Will take effect on ${currentSub.current_period_end}`,
    });
  } catch (error: any) {
    console.error('Error downgrading subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/subscriptions/:userId/cancel - Cancel subscription
 */
router.post('/:userId/cancel', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, immediate } = req.body;

    // Get current subscription
    const { data: currentSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!currentSub) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    if (immediate) {
      // Cancel immediately
      const { data: cancelledSub, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancellation_date: new Date().toISOString(),
          cancellation_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSub.id)
        .select()
        .single();

      if (error) throw error;

      // Deactivate licenses immediately
      await supabase
        .from('licenses')
        .update({ status: 'cancelled' })
        .eq('subscription_id', currentSub.id);

      res.json({ subscription: cancelledSub, message: 'Subscription cancelled immediately' });
    } else {
      // Cancel at period end
      const { data: updatedSub, error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          cancellation_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSub.id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        subscription: updatedSub,
        message: `Subscription will be cancelled on ${currentSub.current_period_end}`,
      });
    }
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/subscriptions/:userId/reactivate - Reactivate cancelled subscription
 */
router.post('/:userId/reactivate', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find cancelled subscription
    const { data: cancelledSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['cancelled'])
      .eq('cancel_at_period_end', true)
      .order('current_period_end', { ascending: false })
      .limit(1)
      .single();

    if (!cancelledSub) {
      return res.status(404).json({ error: 'No cancellable subscription found' });
    }

    // Check if still within period
    if (new Date(cancelledSub.current_period_end) < new Date()) {
      return res.status(400).json({ error: 'Subscription period has ended' });
    }

    // Reactivate
    const { data: reactivatedSub, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        cancel_at_period_end: false,
        cancellation_date: null,
        cancellation_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cancelledSub.id)
      .select()
      .single();

    if (error) throw error;

    // Reactivate licenses
    await supabase
      .from('licenses')
      .update({ status: 'active' })
      .eq('subscription_id', cancelledSub.id);

    res.json({ subscription: reactivatedSub, message: 'Subscription reactivated successfully' });
  } catch (error: any) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/subscriptions/:userId/usage - Get usage for current period
 */
router.get('/:userId/usage', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get current subscription to determine period
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('current_period_start, plan_type')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    const periodStart = subscription?.current_period_start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get usage logs
    const { data: usageLogs, error } = await supabase
      .from('usage_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', periodStart);

    if (error) throw error;

    // Calculate totals
    const totalQueries = usageLogs?.filter(log => log.usage_type === 'query').length || 0;
    const totalTokens = usageLogs
      ?.filter(log => log.usage_type === 'tokens')
      .reduce((sum, log) => sum + log.amount, 0) || 0;
    const totalCost = usageLogs?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0;

    // Get plan limits
    const limits = getPlanLimits(subscription?.plan_type || 'starter');

    res.json({
      usage: {
        queries: totalQueries,
        tokens: totalTokens,
        cost: totalCost,
      },
      limits,
      periodStart,
    });
  } catch (error: any) {
    console.error('Error fetching usage:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper functions
 */
function getPlanAmount(planType: string, billingCycle: string): number {
  const prices: Record<string, any> = {
    starter: { monthly: 19900, yearly: 199000 },
    professional: { monthly: 49900, yearly: 499000 },
    enterprise: { monthly: 99900, yearly: 999000 },
    custom: { monthly: 0, yearly: 0 },
  };
  return prices[planType]?.[billingCycle] || 0;
}

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

export default router;
