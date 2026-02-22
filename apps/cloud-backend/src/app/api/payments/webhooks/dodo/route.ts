import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma'; // TODO: Re-enable when implementing database updates
import crypto from 'crypto';

/**
 * Lemon Squeezy Webhook Handler
 * Receives and processes payment events from Lemon Squeezy
 */
export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-signature');
    const body = await request.text();

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventName: string = event.meta?.event_name ?? '';

    switch (eventName) {
      case 'subscription_payment_success':
        await handlePaymentSucceeded(event.data);
        break;
      case 'subscription_created':
        await handleSubscriptionCreated(event.data);
        break;
      case 'subscription_updated':
        await handleSubscriptionUpdated(event.data);
        break;
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(event.data);
        break;
      case 'order_created':
        await handleOrderCreated(event.data);
        break;
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Lemon Squeezy webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentSucceeded(data: any) {
  // Implementation will be added
  console.log('Payment succeeded:', data);
}

async function handleSubscriptionCreated(data: any) {
  // Implementation will be added
  console.log('Subscription created:', data);
}

async function handleSubscriptionUpdated(data: any) {
  // Implementation will be added
  console.log('Subscription updated:', data);
}

async function handleSubscriptionCancelled(data: any) {
  // Implementation will be added
  console.log('Subscription cancelled:', data);
}

async function handleOrderCreated(data: any) {
  // Implementation will be added
  console.log('Order created:', data);
}
