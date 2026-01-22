/**
 * Configuration Module
 * Centralizes all environment configuration
 */

import { createClient } from '@supabase/supabase-js';

// Validate required environment variables
const requiredEnvVars = [];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  // Don't exit - let the app run with reduced functionality
}

export const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5500', 10),
  version: process.env.API_VERSION || '1.0.0',

  // CORS
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5199',
    ],
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per minute
  },

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // License
  license: {
    jwtSecret: process.env.LICENSE_JWT_SECRET || 'license-secret-change-in-production',
  },

  // AI Providers
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      orgId: process.env.OPENAI_ORG_ID || '',
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    },
    google: {
      apiKey: process.env.GOOGLE_AI_API_KEY || '',
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY || '',
    },
    cohere: {
      apiKey: process.env.COHERE_API_KEY || '',
    },
    mistral: {
      apiKey: process.env.MISTRAL_API_KEY || '',
    },
    perplexity: {
      apiKey: process.env.PERPLEXITY_API_KEY || '',
    },
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY || '',
    },
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Encryption (for API keys storage)
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'dev-encryption-key-change-in-production-32chars',
  },
};

// Create Supabase client
let supabaseClient = null;

if (config.supabase.url && config.supabase.serviceKey) {
  supabaseClient = createClient(
    config.supabase.url,
    config.supabase.serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export const supabase = supabaseClient;

// Get enabled AI providers
export function getEnabledProviders() {
  const providers = [];
  
  if (config.ai.openai.apiKey) providers.push('openai');
  if (config.ai.anthropic.apiKey) providers.push('anthropic');
  if (config.ai.google.apiKey) providers.push('google');
  if (config.ai.groq.apiKey) providers.push('groq');
  if (config.ai.cohere.apiKey) providers.push('cohere');
  if (config.ai.mistral.apiKey) providers.push('mistral');
  if (config.ai.perplexity.apiKey) providers.push('perplexity');
  if (config.ai.deepseek.apiKey) providers.push('deepseek');
  if (config.ai.openrouter.apiKey) providers.push('openrouter');
  
  return providers;
}
