/**
 * Payment API Routes
 * Handles checkout, subscriptions, and webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLemonSqueezyClient } from '@/lib/payments/dodo';
import { getUserFromRequest } from '@/lib/jwt-auth';

/**
 * POST /api/payments/create-checkout
 * Create a checkout session for subscription
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request);

    if (!user || error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planType, billingCycle } = body;

    if (!planType || !billingCycle) {
      return NextResponse.json({ error: 'planType and billingCycle required' }, { status: 400 });
    }

    const ls = getLemonSqueezyClient();

    const session = await ls.createCheckoutSession({
      userId: user.sub,
      email: user.email,
      planType,
      billingCycle,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=canceled`,
    });

    // Note: Database storage would need separate implementation without Supabase
    // For now, just return the session

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
