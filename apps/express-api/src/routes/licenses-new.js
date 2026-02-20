import express from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = express.Router();

let _supabase = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }
  return _supabase;
}

const JWT_SECRET = process.env.JWT_SECRET || 'velanova-jwt-secret-change-in-production';

/**
 * POST /api/licenses/validate - Validate license key
 */
router.post('/validate', async (req, res) => {
  try {
    const { licenseKey, deviceId, appVersion, platform } = req.body;

    if (!licenseKey) {
      return res.status(400).json({ valid: false, error: 'License key required' });
    }

    // Look up license in database
    const { data: license, error } = await getSupabase()
      .from('licenses')
      .select(`
        *,
        users(id, email, name),
        subscriptions(plan_type, status, current_period_end)
      `)
      .eq('license_key', licenseKey)
      .single();

    if (error || !license) {
      return res.json({ valid: false, error: 'Invalid license key' });
    }

    // Check license status
    if (license.status !== 'active') {
      return res.json({ 
        valid: false, 
        error: `License is ${license.status}` 
      });
    }

    // Check expiration
    const expiresAt = new Date(license.expires_at);
    if (expiresAt < new Date()) {
      return res.json({ valid: false, error: 'License expired' });
    }

    // Check subscription status
    if (license.subscriptions?.status !== 'active') {
      return res.json({ 
        valid: false, 
        error: 'Subscription inactive' 
      });
    }

    // Record device activation
    if (deviceId) {
      await getSupabase().from('license_activations').upsert({
        license_id: license.id,
        device_id: deviceId,
        app_version: appVersion,
        platform: platform,
        last_checked_at: new Date().toISOString(),
      });
    }

    // Get plan limits
    const limits = getPlanLimits(license.plan_type);

    // Return valid license
    res.json({
      valid: true,
      license: {
        key: licenseKey,
        userId: license.user_id,
        planType: license.plan_type,
        status: license.status,
        issuedAt: license.issued_at,
        expiresAt: license.expires_at,
        features: limits,
        validated: true,
      },
    });
  } catch (error) {
    console.error('License validation error:', error);
    res.status(500).json({ valid: false, error: 'Validation failed' });
  }
});

/**
 * POST /api/licenses/deactivate - Deactivate license on device
 */
router.post('/deactivate', async (req, res) => {
  try {
    const { licenseKey, deviceId } = req.body;

    if (!licenseKey || !deviceId) {
      return res.status(400).json({ error: 'License key and device ID required' });
    }

    // Find license
    const { data: license } = await getSupabase()
      .from('licenses')
      .select('id')
      .eq('license_key', licenseKey)
      .single();

    if (!license) {
      return res.status(404).json({ error: 'License not found' });
    }

    // Remove device activation
    const { error } = await getSupabase()
      .from('license_activations')
      .delete()
      .eq('license_id', license.id)
      .eq('device_id', deviceId);

    if (error) throw error;

    res.json({ success: true, message: 'License deactivated on this device' });
  } catch (error) {
    console.error('License deactivation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/licenses/:licenseKey/devices - Get activated devices
 */
router.get('/:licenseKey/devices', async (req, res) => {
  try {
    const { licenseKey } = req.params;

    // Find license
    const { data: license } = await getSupabase()
      .from('licenses')
      .select('id')
      .eq('license_key', licenseKey)
      .single();

    if (!license) {
      return res.status(404).json({ error: 'License not found' });
    }

    // Get activations
    const { data: activations, error } = await getSupabase()
      .from('license_activations')
      .select('*')
      .eq('license_id', license.id)
      .order('last_checked_at', { ascending: false });

    if (error) throw error;

    res.json({ devices: activations || [] });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper function to get plan limits
 */
function getPlanLimits(planType) {
  const limits = {
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
