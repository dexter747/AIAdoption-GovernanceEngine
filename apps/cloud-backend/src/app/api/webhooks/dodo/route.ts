/**
 * Lemon Squeezy Webhook Handler
 * Receives and processes payment events from Lemon Squeezy
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLemonSqueezyClient } from '@/lib/payments/dodo';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-signature');
    const payload = await request.text();

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const ls = getLemonSqueezyClient();

    // Verify webhook signature
    if (!ls.verifyWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);

    // Process webhook event
    await processWebhookEvent(event);

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Lemon Squeezy webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function processWebhookEvent(event: any) {
  const supabase = await createClient();
  const eventName: string = event.meta?.event_name ?? '';
  const data = event.data;
  const attrs = data?.attributes ?? {};
  const customData = event.meta?.custom_data ?? {};

  switch (eventName) {
    case 'order_created': {
      const userId = customData.user_id;

      // Update payment session
      await supabase
        .from('payment_sessions')
        .update({ status: 'completed' })
        .eq('session_id', data.id);

      console.log(`Order created for user ${userId}`);
      break;
    }

    case 'subscription_created': {
      const userId = customData.user_id;
      const planType = customData.plan_type;

      // Create license
      await supabase.from('licenses').insert({
        user_id: userId,
        subscription_id: data.id,
        plan_type: planType,
        status: 'active',
        current_period_start: new Date(attrs.created_at),
        current_period_end: new Date(attrs.renews_at),
      });

      console.log(`License created for subscription ${data.id}`);
      break;
    }

    case 'subscription_updated': {
      // Update license
      await supabase
        .from('licenses')
        .update({
          status: attrs.status,
          current_period_end: new Date(attrs.renews_at),
        })
        .eq('subscription_id', data.id);

      break;
    }

    case 'subscription_cancelled': {
      // Deactivate license
      await supabase.from('licenses').update({ status: 'canceled' }).eq('subscription_id', data.id);

      break;
    }

    case 'subscription_payment_success': {
      // Record payment
      await supabase.from('payments').insert({
        subscription_id: attrs.subscription_id,
        invoice_id: data.id,
        amount: attrs.total / 100,
        currency: attrs.currency,
        status: 'succeeded',
        paid_at: new Date(attrs.created_at),
      });

      break;
    }

    case 'subscription_payment_failed': {
      // Record failed payment
      await supabase.from('payments').insert({
        subscription_id: attrs.subscription_id,
        invoice_id: data.id,
        amount: attrs.total / 100,
        currency: attrs.currency,
        status: 'failed',
      });

      // TODO: Send notification to user
      break;
    }
  }
}
