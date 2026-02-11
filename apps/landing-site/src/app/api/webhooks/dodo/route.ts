import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET;

/**
 * Verify Dodo Payments webhook signature
 */
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Handle payment.succeeded event
 */
async function handlePaymentSucceeded(event: any) {
  const { session_id, amount, currency, customer_email, metadata } = event.data;

  console.log('[Webhook] Payment succeeded:', session_id);

  // Update payment session in database
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

  // Create subscription record
  const subscriptionData = {
    user_id: metadata.user_id,
    plan_type: metadata.plan_type,
    billing_cycle: metadata.billing_cycle,
    status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(
      Date.now() + (metadata.billing_cycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
    ).toISOString(),
    amount: amount,
    currency: currency,
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
  await generateAndDeliverLicense(subscription.id, metadata.user_id, metadata.plan_type);

  // Send confirmation email
  await sendPaymentConfirmationEmail(customer_email, subscription);

  return subscription;
}

/**
 * Handle payment.failed event
 */
async function handlePaymentFailed(event: any) {
  const { session_id, error_message } = event.data;

  console.log('[Webhook] Payment failed:', session_id, error_message);

  // Update payment session
  await supabase
    .from('payment_sessions')
    .update({
      status: 'failed',
      error_message: error_message,
    })
    .eq('session_id', session_id);

  // Send failure notification email
  const { data: session } = await supabase
    .from('payment_sessions')
    .select('user_id')
    .eq('session_id', session_id)
    .single();

  if (session) {
    await sendPaymentFailedEmail(session.user_id, error_message);
  }
}

/**
 * Handle subscription.renewed event
 */
async function handleSubscriptionRenewed(event: any) {
  const { subscription_id, next_billing_date } = event.data;

  console.log('[Webhook] Subscription renewed:', subscription_id);

  // Update subscription period
  await supabase
    .from('subscriptions')
    .update({
      current_period_start: new Date().toISOString(),
      current_period_end: next_billing_date,
      status: 'active',
    })
    .eq('id', subscription_id);

  // Extend license validity
  await extendLicense(subscription_id, next_billing_date);
}

/**
 * Handle subscription.cancelled event
 */
async function handleSubscriptionCancelled(event: any) {
  const { subscription_id, cancellation_reason } = event.data;

  console.log('[Webhook] Subscription cancelled:', subscription_id);

  // Mark subscription as cancelled
  await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancellation_date: new Date().toISOString(),
      cancellation_reason: cancellation_reason,
    })
    .eq('id', subscription_id);

  // Deactivate license
  await deactivateLicense(subscription_id);

  // Send cancellation confirmation email
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('id', subscription_id)
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
  planType: string
) {
  const licenseKey = crypto.randomBytes(16).toString('hex');

  // Store license in database
  const { error } = await supabase.from('licenses').insert({
    subscription_id: subscriptionId,
    user_id: userId,
    license_key: licenseKey,
    plan_type: planType,
    status: 'active',
    issued_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  });

  if (error) {
    console.error('Failed to store license:', error);
    throw error;
  }

  // Send license via email
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
    .update({ status: 'deactivated' })
    .eq('subscription_id', subscriptionId);
}

/**
 * Main webhook handler
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-dodo-signature');
    const rawBody = await request.text();

    if (!signature || !DODO_WEBHOOK_SECRET) {
      console.error('[Webhook] Missing signature or secret');
      return NextResponse.json({ error: 'Invalid webhook' }, { status: 401 });
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature, DODO_WEBHOOK_SECRET)) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log('[Webhook] Received event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(event);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event);
        break;

      case 'subscription.renewed':
        await handleSubscriptionRenewed(event);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event);
        break;

      default:
        console.log('[Webhook] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
