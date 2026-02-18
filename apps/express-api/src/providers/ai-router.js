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
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-5.2', 'gpt-5.2-pro', 'o1', 'o1-mini', 'o3', 'o3-mini', 'o4-mini', 'gpt-3.5-turbo'],
    enabled: Boolean(process.env.OPENAI_API_KEY),
  },
  anthropic: {
    name: 'Anthropic',
    models: ['claude-3-7-sonnet-20250219', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    enabled: Boolean(process.env.ANTHROPIC_API_KEY),
  },
  google: {
    name: 'Google AI',
    models: ['gemini-2.0-flash-exp', 'gemini-2.0-flash-thinking-exp-01-21', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    enabled: Boolean(process.env.GOOGLE_AI_API_KEY),
  },
  groq: {
    name: 'Groq',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'llama-3.2-90b-vision-preview', 'llama-4-maverick-17b-128e-instruct', 'llama-4-scout-17b-16e-instruct', 'mixtral-8x7b-32768', 'qwen/qwen3-32b', 'moonshotai/kimi-k2-instruct-0905', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'groq/compound', 'groq/compound-mini'],
    enabled: Boolean(process.env.GROQ_API_KEY),
  },
  xai: {
    name: 'xAI',
    models: ['grok-2-1212', 'grok-2-vision-1212', 'grok-beta'],
    enabled: Boolean(process.env.XAI_API_KEY),
  },
  mistral: {
    name: 'Mistral AI',
    models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
    enabled: Boolean(process.env.MISTRAL_API_KEY),
  },
  deepseek: {
    name: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    enabled: Boolean(process.env.DEEPSEEK_API_KEY),
  },
  cohere: {
    name: 'Cohere',
    models: ['command', 'command-light'],
    enabled: Boolean(process.env.COHERE_API_KEY),
  },
  perplexity: {
    name: 'Perplexity',
    models: ['pplx-70b-online', 'pplx-7b-chat'],
    enabled: Boolean(process.env.PERPLEXITY_API_KEY),
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

// xAI (Grok) - Uses OpenAI-compatible API
if (providers.xai.enabled) {
  clients.xai = new OpenAI({ 
    apiKey: process.env.XAI_API_KEY,
    baseURL: 'https://api.x.ai/v1',
  });
}

// Mistral - Uses OpenAI-compatible API
if (providers.mistral.enabled) {
  clients.mistral = new OpenAI({ 
    apiKey: process.env.MISTRAL_API_KEY,
    baseURL: 'https://api.mistral.ai/v1',
  });
}

// DeepSeek - Uses OpenAI-compatible API
if (providers.deepseek.enabled) {
  clients.deepseek = new OpenAI({ 
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
  });
}

// Cohere - Uses OpenAI-compatible API
if (providers.cohere.enabled) {
  clients.cohere = new OpenAI({ 
    apiKey: process.env.COHERE_API_KEY,
    baseURL: 'https://api.cohere.com/v2',
  });
}

// Perplexity - Uses OpenAI-compatible API
if (providers.perplexity.enabled) {
  clients.perplexity = new OpenAI({ 
    apiKey: process.env.PERPLEXITY_API_KEY,
    baseURL: 'https://api.perplexity.ai',
  });
}

// Supabase client for usage tracking (optional - lazy init)
let _supabaseAiRouter = null;
function getSupabase() {
  if (!_supabaseAiRouter && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    _supabaseAiRouter = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }
  return _supabaseAiRouter;
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

      case 'xai':
        response = await callOpenAICompatible({ provider: 'xai', model, messages, temperature, maxTokens, userApiKey, baseURL: 'https://api.x.ai/v1' });
        tokensUsed = response.usage?.total_tokens || 0;
        cost = calculateOpenAICost(model, tokensUsed);
        break;

      case 'mistral':
        response = await callOpenAICompatible({ provider: 'mistral', model, messages, temperature, maxTokens, userApiKey, baseURL: 'https://api.mistral.ai/v1' });
        tokensUsed = response.usage?.total_tokens || 0;
        cost = calculateOpenAICost(model, tokensUsed);
        break;

      case 'deepseek':
        response = await callOpenAICompatible({ provider: 'deepseek', model, messages, temperature, maxTokens, userApiKey, baseURL: 'https://api.deepseek.com' });
        tokensUsed = response.usage?.total_tokens || 0;
        cost = calculateOpenAICost(model, tokensUsed);
        break;

      case 'cohere':
        response = await callOpenAICompatible({ provider: 'cohere', model, messages, temperature, maxTokens, userApiKey, baseURL: 'https://api.cohere.com/v2' });
        tokensUsed = response.usage?.total_tokens || 0;
        cost = calculateOpenAICost(model, tokensUsed);
        break;

      case 'perplexity':
        response = await callOpenAICompatible({ provider: 'perplexity', model, messages, temperature, maxTokens, userApiKey, baseURL: 'https://api.perplexity.ai' });
        tokensUsed = response.usage?.total_tokens || 0;
        cost = calculateOpenAICost(model, tokensUsed);
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

  // Extract system instruction for Gemini
  const systemMessage = messages.find(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');

  const modelConfig = { model: model || 'gemini-1.5-flash' };
  if (systemMessage?.content) {
    modelConfig.systemInstruction = systemMessage.content;
  }

  const geminiModel = genAI.getGenerativeModel(modelConfig);

  // Convert messages to Google format (skip system messages)
  const history = conversationMessages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const chat = geminiModel.startChat({
    history,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  const lastMessage = conversationMessages[conversationMessages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
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

/**
 * Generic OpenAI-compatible API caller
 * Works for xAI (Grok), Mistral, DeepSeek, and other OpenAI-compatible providers
 */
async function callOpenAICompatible({ provider, model, messages, temperature, maxTokens, userApiKey, baseURL }) {
  const envKeyMap = {
    'xai': 'XAI_API_KEY',
    'mistral': 'MISTRAL_API_KEY',
    'deepseek': 'DEEPSEEK_API_KEY',
    'cohere': 'COHERE_API_KEY',
    'perplexity': 'PERPLEXITY_API_KEY',
  };
  
  const client = userApiKey
    ? new OpenAI({ apiKey: userApiKey, baseURL })
    : clients[provider] || new OpenAI({ apiKey: process.env[envKeyMap[provider]], baseURL });

  const completion = await client.chat.completions.create({
    model,
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
  const supabase = getSupabase();
  if (!supabase) return null;
  
  try {
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
  } catch (err) {
    console.warn('getUserApiKey error (non-critical):', err.message);
    return null;
  }
}

async function logUsage({ userId, licenseId, provider, model, tokensUsed, cost, metadata }) {
  const supabase = getSupabase();
  if (!supabase) {
    // No database configured, skip usage logging
    return;
  }
  
  try {
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
  } catch (err) {
    console.warn('logUsage error (non-critical):', err.message);
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
