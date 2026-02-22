/**
 * Express API Client - Connects desktop app to Express backend
 */

interface ExpressClientConfig {
  baseURL: string;
  licenseKey?: string;
  userId?: string;
  authToken?: string;
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
  private _licenseKey: string | null = null;
  private _userId: string | null = null;
  private authToken: string | null = null;

  constructor(config: ExpressClientConfig) {
    this.baseURL = config.baseURL || 'http://localhost:5500';
    this._licenseKey = config.licenseKey || null;
    this._userId = config.userId || null;
    this.authToken = config.authToken || null;
  }

  getBaseUrl(): string {
    return this.baseURL;
  }

  setAuth(userId: string, licenseKey: string, authToken?: string) {
    this._userId = userId;
    this._licenseKey = licenseKey;
    if (authToken) this.authToken = authToken;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  // Health check
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${this.baseURL}/health`);
    if (!response.ok) {
      throw new Error('Express API is not reachable');
    }
    return (await response.json()) as { status: string; timestamp: string };
  }

  // Auto-license: check user's subscription and get license without manual key
  async getAutoLicense(): Promise<{
    valid: boolean;
    tier: string;
    features: string[];
    expiresAt?: string | null;
    autoAssigned?: boolean;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/api/licenses/auto`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        return { valid: true, tier: 'free', features: ['basic_chat'] };
      }
      return await response.json();
    } catch {
      return { valid: true, tier: 'free', features: ['basic_chat'] };
    }
  }

  // Get available AI providers
  async getAvailableProviders(): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/api/ai/providers`);
    if (!response.ok) {
      throw new Error('Failed to fetch providers');
    }
    const data = (await response.json()) as { providers: any[] };
    return data.providers;
  }

  // Send AI query
  async queryAI(request: AIQueryRequest): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/ai/query`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = (await response.json()) as { error?: string };
      throw new Error(error.error || 'AI query failed');
    }

    return await response.json();
  }

  // Validate license
  async validateLicense(licenseKey: string, deviceId: string, deviceInfo?: any): Promise<any> {
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

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(data.error || 'License validation failed');
    }

    return data;
  }

  // ========================================
  // User API Keys (BYOK)
  // ========================================

  // Get supported providers list
  async getProvidersList(): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/api/user/api-keys/providers`);
    if (!response.ok) {
      throw new Error('Failed to fetch providers list');
    }
    const data = (await response.json()) as { data: any[] };
    return data.data;
  }

  // Get user's API keys
  async getUserApiKeys(): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/api/user/api-keys`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch API keys');
    }
    const data = (await response.json()) as { data: any[] };
    return data.data;
  }

  // Get user's key for specific provider
  async getUserApiKeyByProvider(provider: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/user/api-keys/${provider}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch provider key');
    }
    const data = (await response.json()) as { data: any };
    return data.data;
  }

  // Add user API key
  async addUserApiKey(
    provider: string,
    apiKey: string,
    keyName?: string,
    config?: any
  ): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/user/api-keys`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        provider,
        api_key: apiKey,
        key_name: keyName || 'Default Key',
        config: config || {},
      }),
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message || 'Failed to add API key');
    }

    return await response.json();
  }

  // Update user API key
  async updateUserApiKey(
    keyId: string,
    updates: { key_name?: string; api_key?: string; config?: any; is_active?: boolean }
  ): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/user/api-keys/${keyId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message || 'Failed to update API key');
    }

    return await response.json();
  }

  // Delete user API key
  async deleteUserApiKey(keyId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/user/api-keys/${keyId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message || 'Failed to delete API key');
    }
  }

  // Test user API key
  async testUserApiKey(keyId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/user/api-keys/${keyId}/test`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message || 'Failed to test API key');
    }

    return await response.json();
  }

  // ========================================
  // User Database Connections
  // ========================================

  // Get supported connection types
  async getConnectionTypes(): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/api/user/connections/types`);
    if (!response.ok) {
      throw new Error('Failed to fetch connection types');
    }
    const data = (await response.json()) as { data: any[] };
    return data.data;
  }

  // Get user's database connections
  async getUserConnections(): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/api/user/connections`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('getUserConnections failed:', response.status, errorBody);
      throw new Error(`Failed to fetch connections: ${response.status} - ${errorBody}`);
    }
    const data = (await response.json()) as { data: any[] };
    return data.data;
  }

  // Get specific connection details
  async getUserConnection(connectionId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/user/connections/${connectionId}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch connection');
    }
    const data = (await response.json()) as { data: any };
    return data.data;
  }

  // Add database connection
  async addUserConnection(
    name: string,
    connectionType: string,
    config: any,
    mcpServerType?: string
  ): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/user/connections`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        name,
        connection_type: connectionType,
        config,
        mcp_server_type: mcpServerType || 'npm',
      }),
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message || 'Failed to add connection');
    }

    return await response.json();
  }

  // Update database connection
  async updateUserConnection(
    connectionId: string,
    updates: { name?: string; config?: any; is_active?: boolean; mcp_server_type?: string }
  ): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/user/connections/${connectionId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message || 'Failed to update connection');
    }

    return await response.json();
  }

  // Delete database connection
  async deleteUserConnection(connectionId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/user/connections/${connectionId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message || 'Failed to delete connection');
    }
  }

  // Test database connection
  async testUserConnection(connectionId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/user/connections/${connectionId}/test`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    const data = await response.json();
    return data;
  }

  // Start MCP server for connection
  async startMCPServer(connectionId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/user/connections/${connectionId}/start-mcp`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message || 'Failed to start MCP server');
    }

    return await response.json();
  }

  // ========================================
  // Usage & Subscriptions
  // ========================================

  // Get usage statistics
  async getUsage(
    userId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<any> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.limit) params.append('limit', options.limit.toString());

    const response = await fetch(`${this.baseURL}/api/usage/${userId}?${params.toString()}`, {
      headers: this.getHeaders(),
    });

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
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
  }

  // Get subscription
  async getSubscription(userId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/subscriptions/${userId}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch subscription');
    }
    return await response.json();
  }

  // Cancel subscription
  async cancelSubscription(userId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/subscriptions/${userId}/cancel`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message || 'Failed to cancel subscription');
    }
    return await response.json();
  }

  // Reactivate subscription
  async reactivateSubscription(userId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/subscriptions/${userId}/reactivate`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message || 'Failed to reactivate subscription');
    }
    return await response.json();
  }

  // Update configuration
  updateConfig(config: Partial<ExpressClientConfig>) {
    if (config.baseURL) this.baseURL = config.baseURL;
    if (config.licenseKey) this._licenseKey = config.licenseKey;
    if (config.userId) this._userId = config.userId;
    if (config.authToken) this.authToken = config.authToken;
  }
}

// Singleton instance
export const expressClient = new ExpressClient({
  baseURL: process.env.EXPRESS_API_URL || 'http://localhost:5500',
});
