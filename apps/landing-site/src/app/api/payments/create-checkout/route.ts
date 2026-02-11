import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_PRICES = {
  starter: { monthly: 19900, yearly: 199000 }, // $199/month, $1,990/year
  professional: { monthly: 49900, yearly: 499000 }, // $499/month, $4,990/year
  enterprise: { monthly: 99900, yearly: 999000 }, // $999/month, $9,990/year
  custom: { monthly: 0, yearly: 0 }, // contact sales
};

const DODO_API_URL = process.env.DODO_API_URL || 'https://api.dodopayments.com';
const DODO_API_KEY = process.env.DODO_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planType, billingCycle, userId, email } = body;

    if (!planType || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields: planType, billingCycle' },
        { status: 400 }
      );
    }

    // Validate plan type
    if (!PLAN_PRICES[planType as keyof typeof PLAN_PRICES]) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Custom plan requires sales contact
    if (planType === 'custom') {
      return NextResponse.json(
        { error: 'Custom plans require tailored pricing. Please contact sales.' },
        { status: 400 }
      );
    }

    const price = PLAN_PRICES[planType as keyof typeof PLAN_PRICES][billingCycle as 'monthly' | 'yearly'];

    // Create payment session in database
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const { data: session, error: dbError } = await supabase
      .from('payment_sessions')
      .insert({
        session_id: sessionId,
        user_id: userId || null,
        plan_type: planType,
        billing_cycle: billingCycle,
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue even if session tracking fails
    }

    // If Dodo Payments is configured, create a real checkout session
    if (DODO_API_KEY) {
      try {
        const dodoResponse = await fetch(`${DODO_API_URL}/v1/checkout/sessions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DODO_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: price,
            currency: 'usd',
            customer_email: email,
            metadata: {
              plan_type: planType,
              billing_cycle: billingCycle,
              session_id: sessionId,
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscribe/success?session_id=${sessionId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
          }),
        });

        if (dodoResponse.ok) {
          const dodoData = await dodoResponse.json();
          return NextResponse.json({
            sessionId,
            url: dodoData.url,
          });
        }
      } catch (dodoError) {
        console.error('Dodo Payments error:', dodoError);
        // Fall through to mock checkout
      }
    }

    // Development mode: return mock checkout URL
    const mockCheckoutUrl = `/subscribe/checkout?session_id=${sessionId}&plan=${planType}&cycle=${billingCycle}&amount=${price}`;

    return NextResponse.json({
      sessionId,
      url: mockCheckoutUrl,
      mock: true,
      message: 'Development mode: Using mock checkout',
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
