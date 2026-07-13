/**
 * Lemon Squeezy Payments Integration
 * Primary payment provider for Velanova
 * API docs: https://docs.lemonsqueezy.com/api
 */
import crypto from 'crypto';

export interface LemonSqueezyConfig {
  apiKey: string;
  webhookSecret: string;
  storeId: string;
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

export interface LemonSqueezyCheckoutSession {
  id: string;
  url: string;
  customerId: string;
  status: 'pending' | 'completed' | 'expired';
}

export interface LemonSqueezySubscription {
  id: string;
  customerId: string;
  variantId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'on_trial' | 'paused';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export class LemonSqueezyClient {
  private apiKey: string;
  private baseUrl: string;
  private webhookSecret: string;
  private storeId: string;

  constructor(config: LemonSqueezyConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.lemonsqueezy.com/v1';
    this.webhookSecret = config.webhookSecret;
    this.storeId = config.storeId;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    };
  }

  /**
   * Create a checkout session for new subscription
   */
  async createCheckoutSession(
    params: CreateCheckoutSessionParams
  ): Promise<LemonSqueezyCheckoutSession> {
    // Variant IDs should be configured per plan/billing cycle in env
    const variantMap: Record<string, Record<string, string>> = {
      trial: {
        monthly: process.env.LS_VARIANT_TRIAL || '',
        yearly: process.env.LS_VARIANT_TRIAL || '',
      },
      professional: {
        monthly: process.env.LS_VARIANT_PRO_MONTHLY || '',
        yearly: process.env.LS_VARIANT_PRO_YEARLY || '',
      },
      team: {
        monthly: process.env.LS_VARIANT_TEAM_MONTHLY || '',
        yearly: process.env.LS_VARIANT_TEAM_YEARLY || '',
      },
      enterprise: { monthly: '', yearly: '' }, // Custom pricing
    };

    const variantId = variantMap[params.planType]?.[params.billingCycle];

    const response = await fetch(`${this.baseUrl}/checkouts`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: params.email,
              custom: {
                user_id: params.userId,
                plan_type: params.planType,
                billing_cycle: params.billingCycle,
              },
            },
            product_options: {
              redirect_url: params.successUrl,
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: this.storeId } },
            variant: { data: { type: 'variants', id: variantId } },
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Lemon Squeezy error: ${JSON.stringify(error.errors || error)}`);
    }

    const json = await response.json();
    const checkout = json.data;
    return {
      id: checkout.id,
      url: checkout.attributes.url,
      customerId: '',
      status: 'pending',
    };
  }

  /**
   * Retrieve subscription details
   */
  async getSubscription(subscriptionId: string): Promise<LemonSqueezySubscription> {
    const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve subscription');
    }

    const json = await response.json();
    const sub = json.data.attributes;
    return {
      id: json.data.id,
      customerId: String(sub.customer_id),
      variantId: String(sub.variant_id),
      status: sub.status,
      currentPeriodStart: new Date(sub.renews_at),
      currentPeriodEnd: new Date(sub.ends_at || sub.renews_at),
      cancelAtPeriodEnd: sub.cancelled,
    };
  }

  /**
   * Cancel subscription at period end
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Update subscription variant (upgrade/downgrade)
   */
  async updateSubscription(
    subscriptionId: string,
    newVariantId: string
  ): Promise<LemonSqueezySubscription> {
    const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({
        data: {
          type: 'subscriptions',
          id: subscriptionId,
          attributes: {
            variant_id: Number(newVariantId),
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update subscription');
    }

    return this.getSubscription(subscriptionId);
  }

  /**
   * Verify webhook signature (HMAC SHA-256 hex digest)
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }

  /**
   * Handle Lemon Squeezy webhook events
   */
  async handleWebhook(payload: any): Promise<void> {
    const eventName: string = payload.meta?.event_name ?? '';

    switch (eventName) {
      case 'order_created':
        await this.handleOrderCreated(payload.data);
        break;

      case 'subscription_created':
        await this.handleSubscriptionCreated(payload.data);
        break;

      case 'subscription_updated':
        await this.handleSubscriptionUpdated(payload.data);
        break;

      case 'subscription_cancelled':
        await this.handleSubscriptionCancelled(payload.data);
        break;

      case 'subscription_payment_success':
        await this.handlePaymentSucceeded(payload.data);
        break;

      case 'subscription_payment_failed':
        await this.handlePaymentFailed(payload.data);
        break;

      default:
        console.log(`Unhandled Lemon Squeezy webhook event: ${eventName}`);
    }
  }

  private async handleOrderCreated(data: any) {
    console.log('Order created:', data.id);
    // Update database with order details
  }

  private async handleSubscriptionCreated(data: any) {
    console.log('Subscription created:', data.id);
    // Create license in database
  }

  private async handleSubscriptionUpdated(data: any) {
    console.log('Subscription updated:', data.id);
    // Update license in database
  }

  private async handleSubscriptionCancelled(data: any) {
    console.log('Subscription cancelled:', data.id);
    // Deactivate license in database
  }

  private async handlePaymentSucceeded(data: any) {
    console.log('Payment succeeded:', data.id);
    // Record payment in database
  }

  private async handlePaymentFailed(data: any) {
    console.log('Payment failed:', data.id);
    // Send notification to user
  }
}

// Singleton instance
let lsClient: LemonSqueezyClient | null = null;

export function getLemonSqueezyClient(): LemonSqueezyClient {
  if (!lsClient) {
    lsClient = new LemonSqueezyClient({
      apiKey: process.env.LEMONSQUEEZY_API_KEY || '',
      webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '',
      storeId: process.env.LEMONSQUEEZY_STORE_ID || '',
      baseUrl: 'https://api.lemonsqueezy.com/v1',
    });
  }
  return lsClient;
}
