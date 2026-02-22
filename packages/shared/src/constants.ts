// License Plans Configuration
export const LICENSE_PLANS = {
  trial: {
    name: 'Trial',
    maxDevices: 1,
    maxQueriesPerMonth: 100,
    durationDays: 14,
    price: 0,
  },
  professional: {
    name: 'Professional',
    maxDevices: 3,
    maxQueriesPerMonth: -1, // unlimited
    price: 49,
  },
  team: {
    name: 'Team',
    maxDevices: 10,
    maxQueriesPerMonth: -1,
    price: 199,
  },
  enterprise: {
    name: 'Enterprise',
    maxDevices: -1, // unlimited
    maxQueriesPerMonth: -1,
    price: 0, // custom pricing
  },
} as const;

// AI Model Configurations
export const AI_MODELS = {
  'gpt-4o': {
    provider: 'openai',
    displayName: 'GPT-4o',
    contextWindow: 128000,
    inputCostPer1k: 0.0025,
    outputCostPer1k: 0.01,
  },
  'gpt-4o-mini': {
    provider: 'openai',
    displayName: 'GPT-4o Mini',
    contextWindow: 128000,
    inputCostPer1k: 0.00015,
    outputCostPer1k: 0.0006,
  },
  'claude-3-5-sonnet': {
    provider: 'anthropic',
    displayName: 'Claude 3.5 Sonnet',
    contextWindow: 200000,
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
  },
  'gemini-1.5-pro': {
    provider: 'google',
    displayName: 'Gemini 1.5 Pro',
    contextWindow: 2000000,
    inputCostPer1k: 0.00125,
    outputCostPer1k: 0.005,
  },
} as const;

// Database Port Defaults
export const DEFAULT_PORTS = {
  postgresql: 5432,
  mysql: 3306,
  oracle: 1521,
  sqlserver: 1433,
  'sap-hana': 30015,
  mongodb: 27017,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  license: {
    validate: '/api/licenses/validate',
    refresh: '/api/licenses/refresh',
  },
  payments: {
    createSubscription: '/api/payments/create-subscription',
    webhooks: {
      lemonsqueezy: '/api/webhooks/lemonsqueezy',
      paypal: '/api/payments/webhooks/paypal',
      razorpay: '/api/payments/webhooks/razorpay',
    },
  },
  usage: {
    log: '/api/usage/log',
    stats: '/api/usage/stats',
  },
} as const;

// Error Codes
export const ERROR_CODES = {
  // Auth errors
  INVALID_LICENSE: 'INVALID_LICENSE',
  LICENSE_EXPIRED: 'LICENSE_EXPIRED',
  MAX_DEVICES_REACHED: 'MAX_DEVICES_REACHED',
  
  // Connection errors
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  DATABASE_NOT_FOUND: 'DATABASE_NOT_FOUND',
  
  // AI errors
  AI_PROVIDER_ERROR: 'AI_PROVIDER_ERROR',
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  MODEL_NOT_AVAILABLE: 'MODEL_NOT_AVAILABLE',
  
  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  SUBSCRIPTION_CANCELLED: 'SUBSCRIPTION_CANCELLED',
} as const;
