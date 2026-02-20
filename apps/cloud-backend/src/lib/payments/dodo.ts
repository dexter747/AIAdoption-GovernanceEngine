/**
 * Dodo Payments Integration
 * Primary payment provider for Velanova
 */

export interface DodoPaymentConfig {
  apiKey: string;
  webhookSecret: string;
  baseUrl: string;
}

export interface CreateCheckoutSessionParams {
  userId: string;
  email: string;
  planType: 'trial' | 'professional' | 'team' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
}

export interface DodoCheckoutSession {
  id: string;
  url: string;
  customerId: string;
  status: 'pending' | 'completed' | 'expired';
}

export interface DodoSubscription {
  id: string;
  customerId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export class DodoPaymentsClient {
  private apiKey: string;
  private baseUrl: string;
  private webhookSecret: string;

  constructor(config: DodoPaymentConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.dodo.dev';
    this.webhookSecret = config.webhookSecret;
  }

  /**
   * Create a checkout session for new subscription
   */
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<DodoCheckoutSession> {
    const planPrices = {
      trial: 0,
      professional: params.billingCycle === 'monthly' ? 49 : 490, // $49/mo or $490/yr
      team: params.billingCycle === 'monthly' ? 199 : 1990,
      enterprise: 0, // Custom pricing
    };

    const response = await fetch(`${this.baseUrl}/v1/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_email: params.email,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Velanova ${params.planType.charAt(0).toUpperCase() + params.planType.slice(1)} Plan`,
                description: `${params.billingCycle} subscription`,
              },
              unit_amount: planPrices[params.planType] * 100, // cents
              recurring: {
                interval: params.billingCycle === 'monthly' ? 'month' : 'year',
              },
            },
            quantity: 1,
          },
        ],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: {
          userId: params.userId,
          planType: params.planType,
          billingCycle: params.billingCycle,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Dodo Payments error: ${error.message}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      url: data.url,
      customerId: data.customer,
      status: 'pending',
    };
  }

  /**
   * Retrieve subscription details
   */
  async getSubscription(subscriptionId: string): Promise<DodoSubscription> {
    const response = await fetch(`${this.baseUrl}/v1/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve subscription');
    }

    const data = await response.json();
    return {
      id: data.id,
      customerId: data.customer,
      planId: data.items.data[0].price.id,
      status: data.status,
      currentPeriodStart: new Date(data.current_period_start * 1000),
      currentPeriodEnd: new Date(data.current_period_end * 1000),
      cancelAtPeriodEnd: data.cancel_at_period_end,
    };
  }

  /**
   * Cancel subscription at period end
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/v1/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Update subscription plan
   */
  async updateSubscription(subscriptionId: string, newPlanId: string): Promise<DodoSubscription> {
    const response = await fetch(`${this.baseUrl}/v1/subscriptions/${subscriptionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ price: newPlanId }],
        proration_behavior: 'create_prorations',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update subscription');
    }

    const data = await response.json();
    return this.getSubscription(data.id);
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(payload: any): Promise<void> {
    const eventType = payload.type;

    switch (eventType) {
      case 'checkout.session.completed':
        // Handle successful checkout
        await this.handleCheckoutCompleted(payload.data.object);
        break;
      
      case 'customer.subscription.created':
        // Handle new subscription
        await this.handleSubscriptionCreated(payload.data.object);
        break;
      
      case 'customer.subscription.updated':
        // Handle subscription update
        await this.handleSubscriptionUpdated(payload.data.object);
        break;
      
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        await this.handleSubscriptionDeleted(payload.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        // Handle successful payment
        await this.handlePaymentSucceeded(payload.data.object);
        break;
      
      case 'invoice.payment_failed':
        // Handle failed payment
        await this.handlePaymentFailed(payload.data.object);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }
  }

  private async handleCheckoutCompleted(session: any) {
    console.log('Checkout completed:', session.id);
    // Update database with subscription details
  }

  private async handleSubscriptionCreated(subscription: any) {
    console.log('Subscription created:', subscription.id);
    // Create license in database
  }

  private async handleSubscriptionUpdated(subscription: any) {
    console.log('Subscription updated:', subscription.id);
    // Update license in database
  }

  private async handleSubscriptionDeleted(subscription: any) {
    console.log('Subscription deleted:', subscription.id);
    // Deactivate license in database
  }

  private async handlePaymentSucceeded(invoice: any) {
    console.log('Payment succeeded:', invoice.id);
    // Record payment in database
  }

  private async handlePaymentFailed(invoice: any) {
    console.log('Payment failed:', invoice.id);
    // Send notification to user
  }
}

// Singleton instance
let dodoClient: DodoPaymentsClient | null = null;

export function getDodoPaymentsClient(): DodoPaymentsClient {
  if (!dodoClient) {
    dodoClient = new DodoPaymentsClient({
      apiKey: process.env.DODO_API_KEY || '',
      webhookSecret: process.env.DODO_WEBHOOK_SECRET || '',
      baseUrl: process.env.DODO_BASE_URL || 'https://api.dodo.dev',
    });
  }
  return dodoClient;
}
