/**
 * Dodo Payments Webhook Handler
 * Receives and processes payment events
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDodoPaymentsClient } from '@/lib/payments/dodo';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('dodo-signature');
    const payload = await request.text();

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const dodo = getDodoPaymentsClient();
    
    // Verify webhook signature
    if (!dodo.verifyWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);
    
    // Process webhook event
    await processWebhookEvent(event);

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function processWebhookEvent(event: any) {
  const supabase = await createClient();
  const eventType = event.type;

  switch (eventType) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Get user from metadata
      const userId = session.metadata.userId;
      const planType = session.metadata.planType;
      
      // Update payment session
      await supabase
        .from('payment_sessions')
        .update({ status: 'completed' })
        .eq('session_id', session.id);
      
      break;

    case 'customer.subscription.created':
      const subscription = event.data.object;
      
      // Create license
      await supabase.from('licenses').insert({
        user_id: subscription.metadata.userId,
        subscription_id: subscription.id,
        plan_type: subscription.metadata.planType,
        status: 'active',
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
      });
      
      console.log(`License created for subscription ${subscription.id}`);
      break;

    case 'customer.subscription.updated':
      const updatedSub = event.data.object;
      
      // Update license
      await supabase
        .from('licenses')
        .update({
          status: updatedSub.status,
          current_period_end: new Date(updatedSub.current_period_end * 1000),
        })
        .eq('subscription_id', updatedSub.id);
      
      break;

    case 'customer.subscription.deleted':
      const deletedSub = event.data.object;
      
      // Deactivate license
      await supabase
        .from('licenses')
        .update({ status: 'canceled' })
        .eq('subscription_id', deletedSub.id);
      
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      
      // Record payment
      await supabase.from('payments').insert({
        subscription_id: invoice.subscription,
        invoice_id: invoice.id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        status: 'succeeded',
        paid_at: new Date(invoice.status_transitions.paid_at * 1000),
      });
      
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      
      // Record failed payment
      await supabase.from('payments').insert({
        subscription_id: failedInvoice.subscription,
        invoice_id: failedInvoice.id,
        amount: failedInvoice.amount_due / 100,
        currency: failedInvoice.currency,
        status: 'failed',
      });
      
      // TODO: Send notification to user
      break;
  }
}
