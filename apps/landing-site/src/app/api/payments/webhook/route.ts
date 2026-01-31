import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET;
const LICENSE_JWT_SECRET = process.env.LICENSE_JWT_SECRET || 'dev-secret-key';

function generateLicenseKey(userId: string, tier: string, expiresInDays = 365): string {
  const jwt = require('jsonwebtoken');
  const exp = Math.floor(Date.now() / 1000) + (expiresInDays * 24 * 60 * 60);
  
  return jwt.sign(
    {
      userId,
      tier,
      exp,
      iat: Math.floor(Date.now() / 1000),
    },
    LICENSE_JWT_SECRET
  );
}

function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!DODO_WEBHOOK_SECRET) return true; // Skip in development
  
  const expectedSignature = crypto
    .createHmac('sha256', DODO_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-dodo-signature') || '';

    // Verify webhook signature
    if (DODO_WEBHOOK_SECRET && !verifyWebhookSignature(payload, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);
    const eventType = event.type;
    const eventData = event.data;

    console.log(`Webhook received: ${eventType}`, { eventId: event.id });

    switch (eventType) {
      case 'checkout.session.completed': {
        const { session_id, customer_id, customer_email, metadata } = eventData;
        const { plan_type, billing_cycle } = metadata || {};

        // Update payment session status
        await supabase
          .from('payment_sessions')
          .update({ 
            status: 'completed',
            customer_id,
            completed_at: new Date().toISOString(),
          })
          .eq('session_id', session_id);

        // Create or get user
        let userId = metadata?.user_id;
        
        if (!userId && customer_email) {
          // Check if user exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', customer_email)
            .single();

          if (existingUser) {
            userId = existingUser.id;
          } else {
            // Create user (they'll need to set password later)
            const { data: newUser } = await supabase
              .from('users')
              .insert({
                email: customer_email,
                plan: plan_type,
              })
              .select()
              .single();
            userId = newUser?.id;
          }
        }

        if (userId) {
          // Calculate billing period
          const now = new Date();
          const periodEnd = new Date(now);
          if (billing_cycle === 'yearly') {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
          }

          // Create subscription
          const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          
          await supabase
            .from('subscriptions')
            .insert({
              user_id: userId,
              subscription_id: subscriptionId,
              customer_id,
              plan_type,
              billing_cycle,
              status: 'active',
              current_period_start: now.toISOString(),
              current_period_end: periodEnd.toISOString(),
            });

          // Generate and store license
          const licenseKey = generateLicenseKey(userId, plan_type, billing_cycle === 'yearly' ? 365 : 30);
          const keyHash = crypto.createHash('sha256').update(licenseKey).digest('hex');

          await supabase
            .from('licenses')
            .insert({
              user_id: userId,
              license_key: licenseKey.slice(0, 10) + '...' + licenseKey.slice(-4), // preview only
              key_hash: keyHash,
              tier: plan_type,
              is_active: true,
              max_machines: plan_type === 'team' ? 5 : plan_type === 'enterprise' ? -1 : 2,
              expires_at: periodEnd.toISOString(),
            });

          // Update user plan
          await supabase
            .from('users')
            .update({ plan: plan_type })
            .eq('id', userId);

          console.log(`Subscription created for user ${userId}: ${plan_type}/${billing_cycle}`);
        }

        break;
      }

      case 'subscription.updated': {
        const { subscription_id, status, current_period_end } = eventData;

        await supabase
          .from('subscriptions')
          .update({
            status,
            current_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('subscription_id', subscription_id);

        break;
      }

      case 'subscription.canceled': {
        const { subscription_id } = eventData;

        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('subscription_id', subscription_id);

        // Optionally deactivate license at period end
        break;
      }

      case 'invoice.payment_failed': {
        const { subscription_id, invoice_id } = eventData;

        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('subscription_id', subscription_id);

        // Record failed payment
        await supabase
          .from('payments')
          .insert({
            subscription_id,
            invoice_id,
            status: 'failed',
            created_at: new Date().toISOString(),
          });

        break;
      }

      case 'invoice.paid': {
        const { subscription_id, invoice_id, amount_paid, currency } = eventData;

        // Get subscription to find user
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('id, user_id')
          .eq('subscription_id', subscription_id)
          .single();

        if (subscription) {
          // Record payment
          await supabase
            .from('payments')
            .insert({
              subscription_id: subscription.id,
              user_id: subscription.user_id,
              invoice_id,
              amount: amount_paid / 100, // Convert from cents
              currency,
              status: 'succeeded',
              paid_at: new Date().toISOString(),
            });

          // Update subscription status if it was past_due
          await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscription_id);
        }

        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
