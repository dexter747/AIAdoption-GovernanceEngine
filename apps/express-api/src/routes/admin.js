import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

let _supabase = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  }
  return _supabase;
}

// Middleware to verify admin auth
const requireAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Verify admin token (implement your auth logic)
  // For now, simple check
  if (token !== process.env.ADMIN_SECRET_TOKEN) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
};

/**
 * GET /api/admin/users - Get all users
 */
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { data: users, error } = await getSupabase()
      .from('users')
      .select(
        `
        *,
        subscriptions(plan_type, status),
        usage_logs(amount)
      `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate usage for each user
    const usersWithUsage = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name || user.email,
      planType: user.subscriptions?.[0]?.plan_type || 'none',
      status: user.subscriptions?.[0]?.status || 'inactive',
      createdAt: user.created_at,
      lastActiveAt: user.last_active_at,
      totalUsage: {
        tokens:
          user.usage_logs?.reduce(
            (sum, log) => sum + (log.usage_type === 'tokens' ? log.amount : 0),
            0
          ) || 0,
        queries: user.usage_logs?.filter(log => log.usage_type === 'query').length || 0,
        cost: 0, // Calculate based on usage
      },
    }));

    res.json({ users: usersWithUsage });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users/:id - Get user details
 */
router.get('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await getSupabase()
      .from('users')
      .select(
        `
        *,
        subscriptions(*),
        licenses(*),
        usage_logs(*),
        user_connections(*),
        user_provider_keys(*)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/users/:id/suspend - Suspend user
 */
router.post('/users/:id/suspend', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Update user status
    const { error: userError } = await getSupabase()
      .from('users')
      .update({ status: 'suspended' })
      .eq('id', id);

    if (userError) throw userError;

    // Deactivate licenses
    const { error: licenseError } = await getSupabase()
      .from('licenses')
      .update({ status: 'suspended' })
      .eq('user_id', id);

    if (licenseError) throw licenseError;

    res.json({ success: true, message: 'User suspended' });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/users/:id - Delete user
 */
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete user (cascades to related records)
    const { error } = await getSupabase().from('users').delete().eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/licenses - Get all licenses
 */
router.get('/licenses', requireAdmin, async (req, res) => {
  try {
    const { data: licenses, error } = await getSupabase()
      .from('licenses')
      .select(
        `
        *,
        users(email, name),
        subscriptions(plan_type, status)
      `
      )
      .order('issued_at', { ascending: false });

    if (error) throw error;

    res.json({ licenses });
  } catch (error) {
    console.error('Error fetching licenses:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/licenses/create - Create manual license
 */
router.post('/licenses/create', requireAdmin, async (req, res) => {
  try {
    const { userId, planType, durationDays } = req.body;

    const licenseKey = require('crypto').randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    const { data: license, error } = await getSupabase()
      .from('licenses')
      .insert({
        user_id: userId,
        license_key: licenseKey,
        plan_type: planType,
        status: 'active',
        issued_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ license });
  } catch (error) {
    console.error('Error creating license:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/dashboard - Get dashboard analytics
 */
router.get('/analytics/dashboard', requireAdmin, async (req, res) => {
  try {
    // Total users
    const { count: totalUsers } = await getSupabase()
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Active subscriptions
    const { count: activeSubscriptions } = await getSupabase()
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Total revenue (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: payments } = await getSupabase()
      .from('payment_sessions')
      .select('amount')
      .eq('status', 'completed')
      .gte('completed_at', startOfMonth.toISOString());

    const monthlyRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // Usage stats
    const { data: usageData } = await getSupabase()
      .from('usage_logs')
      .select('usage_type, amount')
      .gte('timestamp', startOfMonth.toISOString());

    const totalQueries = usageData?.filter(u => u.usage_type === 'query').length || 0;
    const totalTokens =
      usageData?.filter(u => u.usage_type === 'tokens').reduce((sum, u) => sum + u.amount, 0) || 0;

    res.json({
      totalUsers,
      activeSubscriptions,
      monthlyRevenue: monthlyRevenue / 100, // Convert from cents
      totalQueries,
      totalTokens,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
