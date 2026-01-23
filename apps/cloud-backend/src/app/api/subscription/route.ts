/**
 * Subscription Management API
 * Handle subscription operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDodoPaymentsClient } from '@/lib/payments/dodo';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/subscription
 * Get current subscription details
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !subscription) {
      return NextResponse.json({ subscription: null });
    }

    // Get payment history
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      subscription,
      payments: payments || [],
    });
  } catch (error: any) {
    console.error('Get subscription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/subscription
 * Cancel subscription at period end
 */
export async function DELETE(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 404 });
    }

    // Cancel via payment provider
    const dodo = getDodoPaymentsClient();
    await dodo.cancelSubscription(subscription.subscription_id);

    // Update database
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    return NextResponse.json({
      message: 'Subscription will be canceled at period end',
      subscription,
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/subscription
 * Update subscription (upgrade/downgrade)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planType, billingCycle } = body;

    if (!planType || !billingCycle) {
      return NextResponse.json(
        { error: 'planType and billingCycle required' },
        { status: 400 }
      );
    }

    // Get active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 404 });
    }

    // Update via payment provider
    // const dodo = getDodoPaymentsClient();
    // await dodo.updateSubscription(subscription.subscription_id, newPlanId);

    // Update database
    await supabase
      .from('subscriptions')
      .update({
        plan_type: planType,
        billing_cycle: billingCycle,
      })
      .eq('id', subscription.id);

    return NextResponse.json({
      message: 'Subscription updated successfully',
      subscription,
    });
  } catch (error: any) {
    console.error('Update subscription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
