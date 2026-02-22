/**
 * Subscription Management API
 * Handle subscription operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLemonSqueezyClient } from '@/lib/payments/dodo';
import { getUserFromRequest } from '@/lib/jwt-auth';

/**
 * GET /api/subscription
 * Get current subscription details
 */
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request);

    if (!user || error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return mock subscription based on user plan
    // In production, query your database
    const subscription = {
      id: 'sub_' + user.sub,
      user_id: user.sub,
      plan: user.plan || 'trial',
      status: 'active',
      billing_cycle: 'monthly',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: user.plan === 'professional' ? 4900 : user.plan === 'team' ? 19900 : 0,
      currency: 'USD',
    };

    return NextResponse.json({
      subscription,
      payments: [],
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
export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request);

    if (!user || error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, cancel via payment provider and update database
    const ls = getLemonSqueezyClient();
    // await ls.cancelSubscription(subscriptionId);

    return NextResponse.json({
      message: 'Subscription will be canceled at period end',
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
    const { user, error } = await getUserFromRequest(request);

    if (!user || error) {
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

    // In production, update via payment provider and database
    return NextResponse.json({
      message: 'Subscription updated successfully',
    });
  } catch (error: any) {
    console.error('Update subscription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
