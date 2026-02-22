import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_PRICES = {
  professional: { monthly: 4900, yearly: 46800 },   // $49/month, $468/year
  team:         { monthly: 19900, yearly: 190800 },  // $199/month, $1,908/year
  enterprise:   { monthly: 0, yearly: 0 },           // custom — contact sales
};

// Lemon Squeezy variant IDs — set these in env once you create products in Lemon Squeezy dashboard
const LEMONSQUEEZY_VARIANT_IDS: Record<string, Record<string, string>> = {
  professional: {
    monthly: process.env.LS_VARIANT_PRO_MONTHLY || '',
    yearly:  process.env.LS_VARIANT_PRO_YEARLY || '',
  },
  team: {
    monthly: process.env.LS_VARIANT_TEAM_MONTHLY || '',
    yearly:  process.env.LS_VARIANT_TEAM_YEARLY || '',
  },
};

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;

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

    // Enterprise / custom plans require sales contact
    if (planType === 'enterprise') {
      return NextResponse.json(
        { error: 'Enterprise plans require tailored pricing. Please contact sales at /contact.' },
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
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // If Lemon Squeezy is configured, create a real checkout
    if (LEMONSQUEEZY_API_KEY && LEMONSQUEEZY_STORE_ID) {
      const variantId = LEMONSQUEEZY_VARIANT_IDS[planType]?.[billingCycle];
      
      if (variantId) {
        try {
          const lsResponse = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
              'Content-Type': 'application/vnd.api+json',
              'Accept': 'application/vnd.api+json',
            },
            body: JSON.stringify({
              data: {
                type: 'checkouts',
                attributes: {
                  checkout_data: {
                    email: email || undefined,
                    custom: {
                      session_id: sessionId,
                      user_id: userId || '',
                      plan_type: planType,
                      billing_cycle: billingCycle,
                    },
                  },
                  product_options: {
                    redirect_url: `${appUrl}/subscribe/success?session_id=${sessionId}`,
                  },
                },
                relationships: {
                  store: { data: { type: 'stores', id: LEMONSQUEEZY_STORE_ID } },
                  variant: { data: { type: 'variants', id: variantId } },
                },
              },
            }),
          });

          if (lsResponse.ok) {
            const lsData = await lsResponse.json();
            const checkoutUrl = lsData.data?.attributes?.url;
            if (checkoutUrl) {
              return NextResponse.json({ sessionId, url: checkoutUrl });
            }
          } else {
            const errText = await lsResponse.text();
            console.error('Lemon Squeezy API error:', lsResponse.status, errText);
          }
        } catch (lsError) {
          console.error('Lemon Squeezy checkout error:', lsError);
        }
      }
    }

    // Development mode: return mock checkout URL
    const mockCheckoutUrl = `/subscribe/checkout?session_id=${sessionId}&plan=${planType}&cycle=${billingCycle}&amount=${price}`;

    return NextResponse.json({
      sessionId,
      url: mockCheckoutUrl,
      mock: true,
      message: 'Development mode: Using mock checkout. Set LEMONSQUEEZY_API_KEY for real payments.',
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
