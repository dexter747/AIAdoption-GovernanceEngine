import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;

// =============================================================================
// SUPABASE CLIENT SETUP
// =============================================================================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key for backend operations
);

// =============================================================================
// MIDDLEWARE
// =============================================================================
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// =============================================================================
// HEALTH & STATUS ENDPOINTS
// =============================================================================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/status', (req, res) => {
  res.json({
    service: 'AI Nexus API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// =============================================================================
// LICENSE VALIDATION
// =============================================================================

app.post('/api/licenses/validate', async (req, res) => {
  try {
    const { licenseKey, deviceId, deviceInfo } = req.body;

    if (!licenseKey || !deviceId) {
      return res.status(400).json({
        valid: false,
        error: 'Missing required fields: licenseKey and deviceId',
      });
    }

    // 1. Verify license exists and is active
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .single();

    if (licenseError || !license) {
      return res.status(404).json({
        valid: false,
        error: 'License not found',
      });
    }

    // 2. Check license status
    if (license.status !== 'active') {
      return res.status(403).json({
        valid: false,
        error: `License is ${license.status}`,
        license: {
          status: license.status,
          plan: license.plan,
        },
      });
    }

    // 3. Check expiration
    if (new Date(license.expires_at) < new Date()) {
      // Update license status to expired
      await supabase
        .from('licenses')
        .update({ status: 'expired' })
        .eq('id', license.id);

      return res.status(403).json({
        valid: false,
        error: 'License has expired',
        expiresAt: license.expires_at,
      });
    }

    // 4. Check device activation
    const { data: existingDevice } = await supabase
      .from('device_activations')
      .select('*')
      .eq('license_id', license.id)
      .eq('device_id', deviceId)
      .single();

    if (existingDevice) {
      // Update last_seen_at
      await supabase
        .from('device_activations')
        .update({ 
          last_seen_at: new Date().toISOString(),
          device_name: deviceInfo?.name || existingDevice.device_name,
          device_os: deviceInfo?.os || existingDevice.device_os,
        })
        .eq('id', existingDevice.id);
    } else {
      // Check device limit
      const { count: activeDevices } = await supabase
        .from('device_activations')
        .select('*', { count: 'exact', head: true })
        .eq('license_id', license.id);

      if (activeDevices >= license.device_limit) {
        return res.status(403).json({
          valid: false,
          error: `Device limit reached (${license.device_limit} devices)`,
          devicesActivated: activeDevices,
          deviceLimit: license.device_limit,
        });
      }

      // Activate new device
      const { error: activationError } = await supabase
        .from('device_activations')
        .insert({
          license_id: license.id,
          device_id: deviceId,
          device_name: deviceInfo?.name,
          device_os: deviceInfo?.os,
          ip_address: req.ip,
        });

      if (activationError) {
        console.error('Device activation error:', activationError);
        return res.status(500).json({
          valid: false,
          error: 'Failed to activate device',
        });
      }

      // Update devices_activated count
      await supabase
        .from('licenses')
        .update({ 
          devices_activated: activeDevices + 1,
          last_validated_at: new Date().toISOString(),
        })
        .eq('id', license.id);
    }

    // 5. Return success with license details
    res.json({
      valid: true,
      license: {
        id: license.id,
        plan: license.plan,
        status: license.status,
        expiresAt: license.expires_at,
        devicesActivated: license.devices_activated,
        deviceLimit: license.device_limit,
        features: getPlanFeatures(license.plan),
      },
    });

  } catch (error) {
    console.error('License validation error:', error);
    res.status(500).json({
      valid: false,
      error: 'Internal server error during license validation',
    });
  }
});

// =============================================================================
// USER API KEYS MANAGEMENT
// =============================================================================

app.get('/api/users/:userId/api-keys', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('id, provider, key_name, is_active, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ apiKeys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

app.post('/api/users/:userId/api-keys', async (req, res) => {
  try {
    const { userId } = req.params;
    const { provider, apiKey, keyName } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({ error: 'Provider and apiKey are required' });
    }

    // TODO: Encrypt the API key before storing
    const encryptedKey = Buffer.from(apiKey).toString('base64'); // Simple encoding for now

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        provider,
        encrypted_key: encryptedKey,
        key_name: keyName,
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      message: 'API key added successfully',
      keyId: data.id,
    });
  } catch (error) {
    console.error('Error adding API key:', error);
    res.status(500).json({ error: 'Failed to add API key' });
  }
});

// =============================================================================
// USAGE TRACKING
// =============================================================================

app.post('/api/usage/log', async (req, res) => {
  try {
    const { 
      userId, 
      licenseId, 
      eventType, 
      provider, 
      model, 
      tokensUsed, 
      cost,
      metadata 
    } = req.body;

    const { error } = await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        license_id: licenseId,
        event_type: eventType,
        provider,
        model,
        tokens_used: tokensUsed,
        cost,
        metadata,
      });

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error logging usage:', error);
    res.status(500).json({ error: 'Failed to log usage' });
  }
});

app.get('/api/usage/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    let query = supabase
      .from('usage_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: usage, error } = await query;

    if (error) throw error;

    // Calculate totals
    const totals = usage.reduce((acc, log) => {
      acc.totalTokens += log.tokens_used || 0;
      acc.totalCost += parseFloat(log.cost || 0);
      return acc;
    }, { totalTokens: 0, totalCost: 0 });

    res.json({ usage, totals });
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

// =============================================================================
// SUBSCRIPTION MANAGEMENT
// =============================================================================

app.get('/api/subscriptions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({ subscription: subscription || null });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// =============================================================================
// AI QUERY ENDPOINTS
// =============================================================================

import { routeAIRequest, getAvailableProviders, isProviderAvailable } from './providers/ai-router.js';

app.get('/api/ai/providers', (req, res) => {
  const providers = getAvailableProviders();
  res.json({ providers });
});

app.post('/api/ai/query', async (req, res) => {
  try {
    const { 
      userId, 
      licenseId, 
      provider, 
      model, 
      messages, 
      temperature, 
      maxTokens,
      stream 
    } = req.body;

    // Validate required fields
    if (!userId || !licenseId || !provider || !model || !messages) {
      return res.status(400).json({
        error: 'Missing required fields: userId, licenseId, provider, model, messages',
      });
    }

    // Validate license
    const { data: license } = await supabase
      .from('licenses')
      .select('status, plan, expires_at')
      .eq('id', licenseId)
      .eq('user_id', userId)
      .single();

    if (!license || license.status !== 'active') {
      return res.status(403).json({
        error: 'Invalid or inactive license',
      });
    }

    // Check if provider is available
    if (!isProviderAvailable(provider)) {
      return res.status(400).json({
        error: `Provider ${provider} is not available or configured`,
      });
    }

    // Route the AI request
    const result = await routeAIRequest({
      userId,
      licenseId,
      provider,
      model,
      messages,
      temperature,
      maxTokens,
      stream,
    });

    res.json(result);

  } catch (error) {
    console.error('AI query error:', error);
    res.status(500).json({
      error: 'Failed to process AI query',
      message: error.message,
    });
  }
});

// =============================================================================
// PAYMENTS WEBHOOK (Dodo Payments)
// =============================================================================

app.post('/api/webhooks/dodo', async (req, res) => {
  try {
    const signature = req.headers['dodo-signature'];
    // TODO: Verify webhook signature

    const event = req.body;

    console.log('Received Dodo webhook:', event.type);

    switch (event.type) {
      case 'payment.succeeded':
        await handlePaymentSuccess(event.data);
        break;
      case 'payment.failed':
        await handlePaymentFailure(event.data);
        break;
      case 'subscription.created':
        await handleSubscriptionCreated(event.data);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.data);
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getPlanFeatures(plan) {
  const features = {
    free: ['basic-queries', 'single-database', '10-queries-per-day'],
    professional: ['unlimited-queries', 'all-databases', 'priority-support', '5-devices'],
    enterprise: ['unlimited-everything', 'custom-integrations', 'dedicated-support', 'unlimited-devices', 'sso'],
  };
  return features[plan] || features.free;
}

async function handlePaymentSuccess(paymentData) {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: paymentData.userId,
      subscription_id: paymentData.subscriptionId,
      payment_provider: 'dodo',
      provider_payment_id: paymentData.id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: 'completed',
      payment_method: paymentData.paymentMethod,
      metadata: paymentData.metadata,
    });

  if (error) {
    console.error('Error recording payment:', error);
  }
}

async function handlePaymentFailure(paymentData) {
  console.log('Payment failed:', paymentData);
  // TODO: Send notification to user
}

async function handleSubscriptionCreated(subscriptionData) {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: subscriptionData.userId,
      plan: subscriptionData.plan,
      status: 'active',
      payment_provider: 'dodo',
      subscription_id: subscriptionData.id,
      amount: subscriptionData.amount,
      currency: subscriptionData.currency,
      billing_cycle: subscriptionData.interval,
      current_period_start: subscriptionData.currentPeriodStart,
      current_period_end: subscriptionData.currentPeriodEnd,
    });

  if (error) {
    console.error('Error creating subscription:', error);
  }
}

async function handleSubscriptionCancelled(subscriptionData) {
  const { error } = await supabase
    .from('subscriptions')
    .update({ 
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('subscription_id', subscriptionData.id);

  if (error) {
    console.error('Error cancelling subscription:', error);
  }
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, () => {
  console.log(`\n🚀 AI Nexus API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Supabase URL: ${process.env.SUPABASE_URL}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health\n`);
});

export default app;
