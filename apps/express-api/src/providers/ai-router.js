import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// AI PROVIDER CONFIGURATIONS
// =============================================================================

const providers = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    enabled: Boolean(process.env.OPENAI_API_KEY),
  },
  anthropic: {
    name: 'Anthropic',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    enabled: Boolean(process.env.ANTHROPIC_API_KEY),
  },
  google: {
    name: 'Google AI',
    models: ['gemini-pro', 'gemini-pro-vision'],
    enabled: Boolean(process.env.GOOGLE_AI_API_KEY),
  },
  groq: {
    name: 'Groq',
    models: ['llama2-70b-4096', 'mixtral-8x7b-32768'],
    enabled: Boolean(process.env.GROQ_API_KEY),
  },
  cohere: {
    name: 'Cohere',
    models: ['command', 'command-light'],
    enabled: Boolean(process.env.COHERE_API_KEY),
  },
  mistral: {
    name: 'Mistral AI',
    models: ['mistral-large', 'mistral-medium'],
    enabled: Boolean(process.env.MISTRAL_API_KEY),
  },
  perplexity: {
    name: 'Perplexity',
    models: ['pplx-70b-online', 'pplx-7b-chat'],
    enabled: Boolean(process.env.PERPLEXITY_API_KEY),
  },
  deepseek: {
    name: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-coder'],
    enabled: Boolean(process.env.DEEPSEEK_API_KEY),
  },
};

// Initialize clients
const clients = {};

if (providers.openai.enabled) {
  clients.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

if (providers.anthropic.enabled) {
  clients.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

if (providers.google.enabled) {
  clients.google = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
}

if (providers.groq.enabled) {
  clients.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// Supabase client for usage tracking (optional)
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

// =============================================================================
// MAIN ROUTING FUNCTION
// =============================================================================

export async function routeAIRequest({
  userId,
  licenseId,
  provider,
  model,
  messages,
  temperature = 0.7,
  maxTokens = 1000,
  stream = false,
}) {
  try {
    // Validate provider and model
    if (!providers[provider]?.enabled) {
      throw new Error(`Provider ${provider} is not enabled or configured`);
    }

    // Get user's API key if using BYOK (Bring Your Own Key)
    const userApiKey = await getUserApiKey(userId, provider);

    // Route to appropriate provider
    let response;
    let tokensUsed = 0;
    let cost = 0;

    switch (provider) {
      case 'openai':
        response = await callOpenAI({ model, messages, temperature, maxTokens, stream, userApiKey });
        tokensUsed = response.usage?.total_tokens || 0;
        cost = calculateOpenAICost(model, tokensUsed);
        break;

      case 'anthropic':
        response = await callAnthropic({ model, messages, temperature, maxTokens, userApiKey });
        tokensUsed = response.usage?.input_tokens + response.usage?.output_tokens || 0;
        cost = calculateAnthropicCost(model, response.usage);
        break;

      case 'google':
        response = await callGoogle({ model, messages, temperature, maxTokens, userApiKey });
        tokensUsed = response.usageMetadata?.totalTokenCount || 0;
        cost = calculateGoogleCost(model, tokensUsed);
        break;

      case 'groq':
        response = await callGroq({ model, messages, temperature, maxTokens, userApiKey });
        tokensUsed = response.usage?.total_tokens || 0;
        cost = 0; // Groq is free during beta
        break;

      default:
        throw new Error(`Provider ${provider} not yet implemented`);
    }

    // Log usage
    await logUsage({
      userId,
      licenseId,
      provider,
      model,
      tokensUsed,
      cost,
      metadata: { messages: messages.length },
    });

    return {
      success: true,
      response: response.content || response.text,
      usage: {
        tokensUsed,
        cost,
      },
      provider,
      model,
    };

  } catch (error) {
    console.error('AI routing error:', error);
    
    // Log error
    await logUsage({
      userId,
      licenseId,
      provider,
      model,
      tokensUsed: 0,
      cost: 0,
      metadata: { error: error.message },
    });

    throw error;
  }
}

// =============================================================================
// PROVIDER-SPECIFIC IMPLEMENTATIONS
// =============================================================================

async function callOpenAI({ model, messages, temperature, maxTokens, stream, userApiKey }) {
  const client = userApiKey 
    ? new OpenAI({ apiKey: userApiKey })
    : clients.openai;

  const completion = await client.chat.completions.create({
    model: model || 'gpt-3.5-turbo',
    messages,
    temperature,
    max_tokens: maxTokens,
    stream,
  });

  if (stream) {
    return completion; // Return stream directly
  }

  return {
    content: completion.choices[0].message.content,
    usage: completion.usage,
  };
}

async function callAnthropic({ model, messages, temperature, maxTokens, userApiKey }) {
  const client = userApiKey
    ? new Anthropic({ apiKey: userApiKey })
    : clients.anthropic;

  // Convert messages format to Anthropic format
  const systemMessage = messages.find(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');

  const message = await client.messages.create({
    model: model || 'claude-3-sonnet-20240229',
    max_tokens: maxTokens,
    temperature,
    system: systemMessage?.content,
    messages: conversationMessages,
  });

  return {
    content: message.content[0].text,
    usage: message.usage,
  };
}

async function callGoogle({ model, messages, temperature, maxTokens, userApiKey }) {
  const genAI = userApiKey
    ? new GoogleGenerativeAI(userApiKey)
    : clients.google;

  const geminiModel = genAI.getGenerativeModel({ model: model || 'gemini-pro' });

  // Convert messages to Google format
  const chat = geminiModel.startChat({
    history: messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  const result = await chat.sendMessage(messages[messages.length - 1].content);
  const response = result.response;

  return {
    content: response.text(),
    usageMetadata: response.usageMetadata,
  };
}

async function callGroq({ model, messages, temperature, maxTokens, userApiKey }) {
  const client = userApiKey
    ? new Groq({ apiKey: userApiKey })
    : clients.groq;

  const completion = await client.chat.completions.create({
    model: model || 'llama2-70b-4096',
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  return {
    content: completion.choices[0].message.content,
    usage: completion.usage,
  };
}

// =============================================================================
// COST CALCULATION
// =============================================================================

function calculateOpenAICost(model, totalTokens) {
  const pricing = {
    'gpt-4': { input: 0.03, output: 0.06 }, // per 1K tokens
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  };

  const price = pricing[model] || pricing['gpt-3.5-turbo'];
  // Simplified: assume 50/50 split between input/output
  return ((price.input + price.output) / 2) * (totalTokens / 1000);
}

function calculateAnthropicCost(model, usage) {
  const pricing = {
    'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
    'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
    'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
  };

  const price = pricing[model] || pricing['claude-3-sonnet-20240229'];
  const inputCost = (usage.input_tokens / 1000) * price.input;
  const outputCost = (usage.output_tokens / 1000) * price.output;
  return inputCost + outputCost;
}

function calculateGoogleCost(model, totalTokens) {
  // Gemini pricing (as of 2024)
  const pricing = {
    'gemini-pro': { input: 0.00025, output: 0.0005 },
    'gemini-pro-vision': { input: 0.00025, output: 0.0005 },
  };

  const price = pricing[model] || pricing['gemini-pro'];
  return ((price.input + price.output) / 2) * (totalTokens / 1000);
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

async function getUserApiKey(userId, provider) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('encrypted_key')
    .eq('user_id', userId)
    .eq('provider', provider)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  // TODO: Decrypt the key
  return Buffer.from(data.encrypted_key, 'base64').toString('utf-8');
}

async function logUsage({ userId, licenseId, provider, model, tokensUsed, cost, metadata }) {
  const { error } = await supabase
    .from('usage_logs')
    .insert({
      user_id: userId,
      license_id: licenseId,
      event_type: 'ai_query',
      provider,
      model,
      tokens_used: tokensUsed,
      cost: cost.toFixed(6),
      metadata,
    });

  if (error) {
    console.error('Error logging usage:', error);
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getAvailableProviders() {
  return Object.entries(providers)
    .filter(([_, config]) => config.enabled)
    .map(([key, config]) => ({
      id: key,
      name: config.name,
      models: config.models,
    }));
}

export function isProviderAvailable(provider) {
  return providers[provider]?.enabled || false;
}

export function isModelAvailable(provider, model) {
  return providers[provider]?.models.includes(model) || false;
}
