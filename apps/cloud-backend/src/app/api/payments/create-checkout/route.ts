/**
 * Payment API Routes
 * Handles checkout, subscriptions, and webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDodoPaymentsClient } from '@/lib/payments/dodo';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/payments/create-checkout
 * Create a checkout session for subscription
 */
export async function POST(request: NextRequest) {
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

    const dodo = getDodoPaymentsClient();
    
    const session = await dodo.createCheckoutSession({
      userId: user.id,
      email: user.email!,
      planType,
      billingCycle,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=canceled`,
    });

    // Store checkout session in database
    await supabase.from('payment_sessions').insert({
      user_id: user.id,
      session_id: session.id,
      plan_type: planType,
      billing_cycle: billingCycle,
      status: 'pending',
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
