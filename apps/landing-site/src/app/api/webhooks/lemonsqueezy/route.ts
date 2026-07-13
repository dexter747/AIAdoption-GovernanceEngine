import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

/**
 * Verify Lemon Squeezy webhook signature (HMAC SHA-256)
 */
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Handle order_created event (first payment or one-time purchase)
 */
async function handleOrderCreated(event: any) {
  const attributes = event.data?.attributes;
  const customData = event.meta?.custom_data || {};
  const { session_id, user_id, plan_type, billing_cycle } = customData;
  const customerEmail = attributes?.user_email;

  console.log('[Webhook] Order created:', event.data?.id);

  // Update payment session in database
  if (session_id) {
    const { error: sessionError } = await supabase
      .from('payment_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('session_id', session_id);

    if (sessionError) {
      console.error('Failed to update payment session:', sessionError);
    }
  }

  // Find or create user
  let userId = user_id;
  if (!userId && customerEmail) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', customerEmail)
      .single();

    if (existingUser) {
      userId = existingUser.id;
    }
  }

  if (!userId || !plan_type) return;

  // Create subscription record
  const now = new Date();
  const periodEnd = new Date(now);
  if (billing_cycle === 'yearly') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  const subscriptionData = {
    user_id: userId,
    subscription_id: `ls_${event.data?.id}`,
    plan_type,
    billing_cycle: billing_cycle || 'monthly',
    status: 'active',
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    amount: attributes?.total || 0,
    currency: attributes?.currency || 'USD',
    payment_provider: 'lemonsqueezy',
  };

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .insert(subscriptionData)
    .select()
    .single();

  if (subError) {
    console.error('Failed to create subscription:', subError);
    throw subError;
  }

  // Generate and deliver license
  await generateAndDeliverLicense(subscription.id, userId, plan_type, periodEnd);

  // Update user plan
  await supabase.from('users').update({ plan: plan_type }).eq('id', userId);

  // Send confirmation email
  await sendPaymentConfirmationEmail(customerEmail, subscription);

  return subscription;
}

/**
 * Handle subscription_payment_failed event
 */
async function handlePaymentFailed(event: any) {
  const attributes = event.data?.attributes;
  const subscriptionId = attributes?.subscription_id;

  console.log('[Webhook] Payment failed for subscription:', subscriptionId);

  if (subscriptionId) {
    await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', String(subscriptionId));
  }

  // Send failure notification
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('subscription_id', String(subscriptionId))
    .single();

  if (sub) {
    await sendPaymentFailedEmail(sub.user_id, 'Payment method declined');
  }
}

/**
 * Handle subscription_updated event (renewal, plan change, etc.)
 */
async function handleSubscriptionUpdated(event: any) {
  const attributes = event.data?.attributes;
  const lsSubId = event.data?.id;
  const status = attributes?.status; // active, paused, cancelled, expired
  const renewsAt = attributes?.renews_at;

  console.log('[Webhook] Subscription updated:', lsSubId, 'Status:', status);

  if (!lsSubId) return;

  await supabase
    .from('subscriptions')
    .update({
      status: status === 'active' ? 'active' : status,
      current_period_end: renewsAt || undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('subscription_id', String(lsSubId));

  // Extend license if renewed
  if (status === 'active' && renewsAt) {
    await extendLicense(String(lsSubId), renewsAt);
  }
}

/**
 * Handle subscription_cancelled event
 */
async function handleSubscriptionCancelled(event: any) {
  const lsSubId = event.data?.id;

  console.log('[Webhook] Subscription cancelled:', lsSubId);

  if (!lsSubId) return;

  await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('subscription_id', String(lsSubId));

  // Deactivate license
  await deactivateLicense(String(lsSubId));

  // Send cancellation email
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('subscription_id', String(lsSubId))
    .single();

  if (subscription) {
    await sendCancellationEmail(subscription.user_id);
  }
}

/**
 * Generate and deliver license key
 */
async function generateAndDeliverLicense(
  subscriptionId: string,
  userId: string,
  planType: string,
  expiresAt: Date
) {
  const licenseKey = crypto.randomBytes(16).toString('hex');
  const keyHash = crypto.createHash('sha256').update(licenseKey).digest('hex');

  const { error } = await supabase.from('licenses').insert({
    user_id: userId,
    license_key: licenseKey,
    key_hash: keyHash,
    tier: planType,
    is_active: true,
    max_machines: planType === 'team' ? 5 : planType === 'enterprise' ? -1 : 2,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error('Failed to store license:', error);
    throw error;
  }

  await sendLicenseEmail(userId, licenseKey, planType);
}

/**
 * Email sending functions (placeholder - implement with Resend/SendGrid)
 */
async function sendPaymentConfirmationEmail(email: string, subscription: any) {
  console.log('[Email] Payment confirmation sent to:', email);
  // TODO: Implement with Resend/SendGrid
}

async function sendPaymentFailedEmail(userId: string, errorMessage: string) {
  console.log('[Email] Payment failed notification sent to user:', userId);
  // TODO: Implement with Resend/SendGrid
}

async function sendLicenseEmail(userId: string, licenseKey: string, planType: string) {
  console.log('[Email] License delivered to user:', userId);
  // TODO: Implement with Resend/SendGrid
}

async function sendCancellationEmail(userId: string) {
  console.log('[Email] Cancellation confirmation sent to user:', userId);
  // TODO: Implement with Resend/SendGrid
}

async function extendLicense(subscriptionId: string, newExpiryDate: string) {
  await supabase
    .from('licenses')
    .update({ expires_at: newExpiryDate })
    .eq('subscription_id', subscriptionId);
}

async function deactivateLicense(subscriptionId: string) {
  await supabase
    .from('licenses')
    .update({ is_active: false })
    .eq('subscription_id', subscriptionId);
}

/**
 * Lemon Squeezy Webhook Handler
 * Events: order_created, subscription_updated, subscription_cancelled,
 *         subscription_payment_success, subscription_payment_failed
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature') || '';

    // Verify webhook signature
    if (LEMONSQUEEZY_WEBHOOK_SECRET && signature) {
      if (!verifyWebhookSignature(rawBody, signature, LEMONSQUEEZY_WEBHOOK_SECRET)) {
        console.error('[Webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventName = event.meta?.event_name;
    console.log('[Webhook] Received event:', eventName, { eventId: event.meta?.event_id });

    switch (eventName) {
      case 'order_created':
        await handleOrderCreated(event);
        break;

      case 'subscription_payment_failed':
        await handlePaymentFailed(event);
        break;

      case 'subscription_updated':
      case 'subscription_payment_success':
        await handleSubscriptionUpdated(event);
        break;

      case 'subscription_cancelled':
        await handleSubscriptionCancelled(event);
        break;

      default:
        console.log('[Webhook] Unhandled event type:', eventName);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
