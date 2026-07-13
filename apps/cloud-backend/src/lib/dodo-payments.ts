import axios from 'axios';

const LS_API_URL = 'https://api.lemonsqueezy.com/v1';

export class LemonSqueezyPaymentsClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(method: string, endpoint: string, data?: any) {
    try {
      const response = await axios({
        method,
        url: `${LS_API_URL}${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
        },
        data,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Lemon Squeezy API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async createCustomer(data: { email: string; name: string; metadata?: Record<string, any> }) {
    return await this.request('POST', '/customers', {
      data: {
        type: 'customers',
        attributes: { email: data.email, name: data.name },
        relationships: {
          store: { data: { type: 'stores', id: process.env.LEMONSQUEEZY_STORE_ID } },
        },
      },
    });
  }

  async createCheckout(data: {
    store_id: string;
    variant_id: string;
    custom_data?: Record<string, any>;
  }) {
    return await this.request('POST', '/checkouts', {
      data: {
        type: 'checkouts',
        attributes: {
          custom_price: null,
          product_options: {},
          checkout_data: { custom: data.custom_data || {} },
        },
        relationships: {
          store: { data: { type: 'stores', id: data.store_id } },
          variant: { data: { type: 'variants', id: data.variant_id } },
        },
      },
    });
  }

  async getSubscription(subscriptionId: string) {
    return await this.request('GET', `/subscriptions/${subscriptionId}`);
  }

  async cancelSubscription(subscriptionId: string) {
    return await this.request('DELETE', `/subscriptions/${subscriptionId}`);
  }

  async createPaymentIntent(data: {
    amount: number;
    currency: string;
    customer_id?: string;
    metadata?: Record<string, any>;
  }) {
    // Lemon Squeezy uses checkouts instead of payment intents
    return await this.createCheckout({
      store_id: process.env.LEMONSQUEEZY_STORE_ID || '',
      variant_id: '',
      custom_data: data.metadata,
    });
  }
}

export const lemonSqueezyPayments = new LemonSqueezyPaymentsClient(
  process.env.LEMONSQUEEZY_API_KEY || ''
);
