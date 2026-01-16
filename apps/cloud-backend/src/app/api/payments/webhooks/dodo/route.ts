import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-dodo-signature');
    const body = await request.text();

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.DODO_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    switch (event.type) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(event.data);
        break;
      case 'subscription.created':
        await handleSubscriptionCreated(event.data);
        break;
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.data);
        break;
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
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
