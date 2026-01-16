// Connection Types
export interface ConnectionConfig {
  id?: string;
  name: string;
  type: LegacySystemType;
  host: string;
  port: number;
  database?: string;
  username: string;
  password: string;
  ssl?: boolean;
  options?: Record<string, any>;
}

export type LegacySystemType =
  | 'postgresql'
  | 'mysql'
  | 'oracle'
  | 'sqlserver'
  | 'sap-hana'
  | 'mongodb'
  | 'salesforce'
  | 'servicenow'
  | 'jira'
  | 'zendesk';

export interface ConnectionStatus {
  id: string;
  connected: boolean;
  lastChecked: Date;
  error?: string;
}

// AI Types
export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'azure'
  | 'cohere'
  | 'mistral'
  | 'groq'
  | 'perplexity'
  | 'ollama';

export interface AIModel {
  id: string;
  provider: AIProvider;
  name: string;
  displayName: string;
  contextWindow: number;
  inputCostPer1k: number;
  outputCostPer1k: number;
  supportsStreaming: boolean;
}

export interface AIQueryOptions {
  model?: string;
  provider?: AIProvider;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  connectionId?: string;
}

export interface AIQueryResult {
  id: string;
  prompt: string;
  response: string;
  model: string;
  provider: AIProvider;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  duration: number;
  timestamp: Date;
}

// License Types
export type LicensePlan = 'trial' | 'professional' | 'team' | 'enterprise';

export interface License {
  id: string;
  licenseKey: string;
  planType: LicensePlan;
  status: 'active' | 'expired' | 'suspended' | 'cancelled';
  maxDevices: number;
  issuedAt: Date;
  expiresAt?: Date;
  lastValidatedAt?: Date;
  user: {
    email: string;
    name?: string;
  };
}

export interface LicenseValidationResult {
  valid: boolean;
  license?: License;
  error?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export type PaymentProvider = 'dodo' | 'paypal' | 'razorpay';

export interface Subscription {
  id: string;
  userId: string;
  licenseId: string;
  paymentProvider: PaymentProvider;
  providerSubscriptionId?: string;
  planType: LicensePlan;
  billingPeriod: 'monthly' | 'yearly';
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId?: string;
  paymentProvider: PaymentProvider;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  paymentMethod?: string;
  failureReason?: string;
  paidAt?: Date;
  createdAt: Date;
}

// Settings Types
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoUpdate: boolean;
  analyticsEnabled: boolean;
  piiMaskingEnabled: boolean;
  defaultAIProvider: AIProvider;
  defaultModel: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Database Query Types
export interface QueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  duration: number;
}

// Usage Tracking Types
export interface UsageLog {
  userId: string;
  licenseId: string;
  eventType: 'ai_query' | 'connection' | 'export';
  metadata: {
    provider?: AIProvider;
    model?: string;
    tokens?: number;
    cost?: number;
  };
  timestamp: Date;
}
