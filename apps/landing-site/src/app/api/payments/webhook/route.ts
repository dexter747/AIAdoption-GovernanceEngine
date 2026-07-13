import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
const LICENSE_JWT_SECRET = process.env.LICENSE_JWT_SECRET || 'dev-secret-key';

function generateLicenseKey(userId: string, tier: string, expiresInDays = 365): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;

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
  if (!LEMONSQUEEZY_WEBHOOK_SECRET) return true; // Skip in development

  const expectedSignature = crypto
    .createHmac('sha256', LEMONSQUEEZY_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-signature') || '';

    // Verify Lemon Squeezy webhook signature
    if (LEMONSQUEEZY_WEBHOOK_SECRET && !verifyWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const eventType = event.meta?.event_name;
    const eventData = event.data?.attributes;
    const customData = event.meta?.custom_data || {};

    console.log(`Webhook received: ${eventType}`, { eventId: event.meta?.event_id });

    switch (eventType) {
      case 'order_created': {
        // Lemon Squeezy: one-time or first subscription payment completed
        const customerEmail = eventData.user_email;
        const { session_id, plan_type, billing_cycle, user_id } = customData;

        // Update payment session status
        if (session_id) {
          await supabase
            .from('payment_sessions')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('session_id', session_id);
        }

        // Create or get user
        let userId = user_id;

        if (!userId && customerEmail) {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', customerEmail)
            .single();

          if (existingUser) {
            userId = existingUser.id;
          } else {
            const { data: newUser } = await supabase
              .from('users')
              .insert({ email: customerEmail, plan: plan_type || 'professional' })
              .select()
              .single();
            userId = newUser?.id;
          }
        }

        if (userId && plan_type) {
          const now = new Date();
          const periodEnd = new Date(now);
          if (billing_cycle === 'yearly') {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
          }

          const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).slice(2)}`;

          await supabase.from('subscriptions').insert({
            user_id: userId,
            subscription_id: subscriptionId,
            plan_type,
            billing_cycle,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            payment_provider: 'lemonsqueezy',
          });

          const licenseKey = generateLicenseKey(
            userId,
            plan_type,
            billing_cycle === 'yearly' ? 365 : 30
          );
          const keyHash = crypto.createHash('sha256').update(licenseKey).digest('hex');

          await supabase.from('licenses').insert({
            user_id: userId,
            license_key: licenseKey.slice(0, 10) + '...' + licenseKey.slice(-4),
            key_hash: keyHash,
            tier: plan_type,
            is_active: true,
            max_machines: plan_type === 'team' ? 5 : plan_type === 'enterprise' ? -1 : 2,
            expires_at: periodEnd.toISOString(),
          });

          await supabase.from('users').update({ plan: plan_type }).eq('id', userId);

          console.log(`Subscription created for user ${userId}: ${plan_type}/${billing_cycle}`);
        }

        break;
      }

      case 'subscription_updated': {
        const lsSubId = event.data?.id;
        const status = eventData.status; // active, paused, cancelled, expired
        const renewsAt = eventData.renews_at;

        if (lsSubId) {
          await supabase
            .from('subscriptions')
            .update({
              status: status === 'active' ? 'active' : status,
              current_period_end: renewsAt,
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', lsSubId);
        }

        break;
      }

      case 'subscription_cancelled': {
        const lsSubId = event.data?.id;

        if (lsSubId) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              canceled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', lsSubId);
        }

        break;
      }

      case 'subscription_payment_success': {
        const lsSubId = eventData.subscription_id;
        const amount = eventData.total;
        const currency = eventData.currency;

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('id, user_id')
          .eq('subscription_id', String(lsSubId))
          .single();

        if (subscription) {
          await supabase.from('payments').insert({
            subscription_id: subscription.id,
            user_id: subscription.user_id,
            amount: amount / 100,
            currency,
            status: 'succeeded',
            payment_provider: 'lemonsqueezy',
            paid_at: new Date().toISOString(),
          });

          await supabase
            .from('subscriptions')
            .update({ status: 'active', updated_at: new Date().toISOString() })
            .eq('subscription_id', String(lsSubId));
        }

        break;
      }

      case 'subscription_payment_failed': {
        const lsSubId = eventData.subscription_id;

        await supabase
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('subscription_id', String(lsSubId));

        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
