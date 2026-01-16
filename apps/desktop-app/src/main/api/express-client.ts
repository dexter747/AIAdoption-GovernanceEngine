/**
 * Express API Client - Connects desktop app to Express backend
 */

interface ExpressClientConfig {
  baseURL: string;
  licenseKey?: string;
  userId?: string;
}

interface AIQueryRequest {
  userId: string;
  licenseId: string;
  provider: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
}

export class ExpressClient {
  private baseURL: string;
  private licenseKey: string | null = null;
  private userId: string | null = null;

  constructor(config: ExpressClientConfig) {
    this.baseURL = config.baseURL || 'http://localhost:5500';
    this.licenseKey = config.licenseKey || null;
    this.userId = config.userId || null;
  }

  setAuth(userId: string, licenseKey: string) {
    this.userId = userId;
    this.licenseKey = licenseKey;
  }

  // Health check
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${this.baseURL}/health`);
    if (!response.ok) {
      throw new Error('Express API is not reachable');
    }
    return await response.json();
  }

  // Get available AI providers
  async getAvailableProviders(): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/api/ai/providers`);
    if (!response.ok) {
      throw new Error('Failed to fetch providers');
    }
    const data = await response.json();
    return data.providers;
  }

  // Send AI query
  async queryAI(request: AIQueryRequest): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/ai/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI query failed');
    }

    return await response.json();
  }

  // Validate license
  async validateLicense(
    licenseKey: string,
    deviceId: string,
    deviceInfo?: any
  ): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/licenses/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        licenseKey,
        deviceId,
        deviceInfo,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'License validation failed');
    }

    return data;
  }

  // Get user API keys
  async getUserApiKeys(userId: string): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/api/users/${userId}/api-keys`);
    if (!response.ok) {
      throw new Error('Failed to fetch API keys');
    }
    const data = await response.json();
    return data.apiKeys;
  }

  // Add user API key
  async addUserApiKey(
    userId: string,
    provider: string,
    apiKey: string,
    keyName?: string
  ): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/users/${userId}/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        apiKey,
        keyName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add API key');
    }

    return await response.json();
  }

  // Get usage statistics
  async getUsage(userId: string, options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.limit) params.append('limit', options.limit.toString());

    const response = await fetch(
      `${this.baseURL}/api/usage/${userId}?${params.toString()}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch usage');
    }

    return await response.json();
  }

  // Log usage
  async logUsage(data: {
    userId: string;
    licenseId: string;
    eventType: string;
    provider?: string;
    model?: string;
    tokensUsed?: number;
    cost?: number;
    metadata?: any;
  }): Promise<void> {
    await fetch(`${this.baseURL}/api/usage/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  // Get subscription
  async getSubscription(userId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/subscriptions/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch subscription');
    }
    return await response.json();
  }

  // Update configuration
  updateConfig(config: Partial<ExpressClientConfig>) {
    if (config.baseURL) this.baseURL = config.baseURL;
    if (config.licenseKey) this.licenseKey = config.licenseKey;
    if (config.userId) this.userId = config.userId;
  }
}

// Singleton instance
export const expressClient = new ExpressClient({
  baseURL: process.env.EXPRESS_API_URL || 'http://localhost:5500',
});
