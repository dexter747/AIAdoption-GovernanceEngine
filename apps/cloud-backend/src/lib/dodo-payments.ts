import axios from 'axios';

const DODO_API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.dodopayments.com'
    : 'https://sandbox-api.dodopayments.com';

export class DodoPaymentsClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(method: string, endpoint: string, data?: any) {
    try {
      const response = await axios({
        method,
        url: `${DODO_API_URL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        data,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Dodo Payments API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async createCustomer(data: {
    email: string;
    name: string;
    metadata?: Record<string, any>;
  }) {
    return await this.request('POST', '/customers', data);
  }

  async createSubscription(data: {
    customer_id: string;
    product_id: string;
    payment_method_id: string;
    billing_period: 'monthly' | 'yearly';
    metadata?: Record<string, any>;
  }) {
    return await this.request('POST', '/subscriptions', data);
  }

  async getSubscription(subscriptionId: string) {
    return await this.request('GET', `/subscriptions/${subscriptionId}`);
  }

  async cancelSubscription(subscriptionId: string) {
    return await this.request('POST', `/subscriptions/${subscriptionId}/cancel`);
  }

  async createPaymentIntent(data: {
    amount: number;
    currency: string;
    customer_id?: string;
    metadata?: Record<string, any>;
  }) {
    return await this.request('POST', '/payment-intents', data);
  }
}

export const dodoPayments = new DodoPaymentsClient(process.env.DODO_API_KEY || '');
