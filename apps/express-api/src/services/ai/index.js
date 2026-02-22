/**
 * AI Service - Provider abstraction layer
 * Routes requests to appropriate AI providers
 * Supports BYOK (Bring Your Own Key) - users can provide their own API keys
 */

import { config, getEnabledProviders } from '../../config/index.js';
import { OpenAIProvider } from './providers/openai.js';
import { AnthropicProvider } from './providers/anthropic.js';
import { GoogleProvider } from './providers/google.js';
import { GroqProvider } from './providers/groq.js';
import { CohereProvider } from './providers/cohere.js';
import { MistralProvider } from './providers/mistral.js';
import { PerplexityProvider } from './providers/perplexity.js';
import { DeepSeekProvider } from './providers/deepseek.js';
import { OpenRouterProvider } from './providers/openrouter.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { createLogger } from '../../utils/logger.js';
import { getUserProviderKey } from '../../routes/user-api-keys.js';

const logger = createLogger('ai-service');

// Model to provider mapping
const MODEL_PROVIDER_MAP = {
  // OpenAI
  'gpt-4o': 'openai',
  'gpt-4o-mini': 'openai',
  'gpt-4-turbo': 'openai',
  'gpt-4': 'openai',
  'gpt-3.5-turbo': 'openai',
  o1: 'openai',
  'o1-mini': 'openai',
  'o1-preview': 'openai',
  'o3-mini': 'openai',

  // Anthropic
  'claude-3-5-sonnet-20241022': 'anthropic',
  'claude-3-5-haiku-20241022': 'anthropic',
  'claude-3-opus-20240229': 'anthropic',
  'claude-3-sonnet-20240229': 'anthropic',
  'claude-3-haiku-20240307': 'anthropic',

  // Google
  'gemini-2.0-flash': 'google',
  'gemini-2.0-flash-thinking': 'google',
  'gemini-1.5-pro': 'google',
  'gemini-1.5-flash': 'google',

  // Groq
  'llama-3.3-70b-versatile': 'groq',
  'llama-3.1-8b-instant': 'groq',
  'mixtral-8x7b-32768': 'groq',
  'gemma2-9b-it': 'groq',

  // Cohere
  'command-r-plus': 'cohere',
  'command-r': 'cohere',
  command: 'cohere',

  // Mistral
  'mistral-large-latest': 'mistral',
  'mistral-medium-latest': 'mistral',
  'mistral-small-latest': 'mistral',
  'codestral-latest': 'mistral',

  // Perplexity
  sonar: 'perplexity',
  'sonar-pro': 'perplexity',
  'sonar-reasoning': 'perplexity',

  // DeepSeek
  'deepseek-chat': 'deepseek',
  'deepseek-coder': 'deepseek',
  'deepseek-reasoner': 'deepseek',
};

// Default models per provider
const DEFAULT_MODELS = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-sonnet-20241022',
  google: 'gemini-2.0-flash',
  groq: 'llama-3.3-70b-versatile',
  cohere: 'command-r-plus',
  mistral: 'mistral-large-latest',
  perplexity: 'sonar',
  deepseek: 'deepseek-chat',
  openrouter: 'openai/gpt-4o',
};

// Provider instances (lazy loaded) - for platform keys
let platformProviders = {};

// User-specific provider instances cache (keyed by `${userId}-${providerName}`)
let userProviders = {};

/**
 * Create provider config, preferring user's BYOK key if available
 */
async function getProviderConfig(providerName, userId = null) {
  // Try to get user's own API key first (BYOK)
  if (userId) {
    try {
      const userKey = await getUserProviderKey(userId, providerName);
      if (userKey) {
        logger.info({ provider: providerName, userId, byok: true }, 'Using user BYOK key');
        return {
          apiKey: userKey.apiKey,
          orgId: userKey.metadata?.orgId,
          isUserKey: true,
        };
      }
    } catch (err) {
      logger.warn(
        { provider: providerName, userId, error: err.message },
        'Failed to fetch user key, falling back to platform key'
      );
    }
  }

  // Fall back to platform keys from .env
  logger.debug({ provider: providerName, byok: false }, 'Using platform API key');
  return {
    ...config.ai[providerName],
    isUserKey: false,
  };
}

function getProvider(name) {
  if (!platformProviders[name]) {
    switch (name) {
      case 'openai':
        platformProviders[name] = new OpenAIProvider(config.ai.openai);
        break;
      case 'anthropic':
        platformProviders[name] = new AnthropicProvider(config.ai.anthropic);
        break;
      case 'google':
        platformProviders[name] = new GoogleProvider(config.ai.google);
        break;
      case 'groq':
        platformProviders[name] = new GroqProvider(config.ai.groq);
        break;
      case 'cohere':
        platformProviders[name] = new CohereProvider(config.ai.cohere);
        break;
      case 'mistral':
        platformProviders[name] = new MistralProvider(config.ai.mistral);
        break;
      case 'perplexity':
        platformProviders[name] = new PerplexityProvider(config.ai.perplexity);
        break;
      case 'deepseek':
        platformProviders[name] = new DeepSeekProvider(config.ai.deepseek);
        break;
      case 'openrouter':
        platformProviders[name] = new OpenRouterProvider(config.ai.openrouter);
        break;
      default:
        throw ApiError.badRequest(`Unknown provider: ${name}`);
    }
  }
  return platformProviders[name];
}

/**
 * Get or create a provider instance for a specific user (BYOK support)
 */
async function getProviderForUser(providerName, userId = null) {
  // If no user ID, use platform provider
  if (!userId) {
    return getProvider(providerName);
  }

  const cacheKey = `${userId}-${providerName}`;

  // Check if we already have a cached provider for this user+provider combo
  if (userProviders[cacheKey]) {
    return userProviders[cacheKey];
  }

  // Get config (prefers user's BYOK key)
  const providerConfig = await getProviderConfig(providerName, userId);

  // If no user key found, use platform provider
  if (!providerConfig.isUserKey) {
    return getProvider(providerName);
  }

  // Create new provider instance with user's key
  let provider;
  switch (providerName) {
    case 'openai':
      provider = new OpenAIProvider(providerConfig);
      break;
    case 'anthropic':
      provider = new AnthropicProvider(providerConfig);
      break;
    case 'google':
      provider = new GoogleProvider(providerConfig);
      break;
    case 'groq':
      provider = new GroqProvider(providerConfig);
      break;
    case 'cohere':
      provider = new CohereProvider(providerConfig);
      break;
    case 'mistral':
      provider = new MistralProvider(providerConfig);
      break;
    case 'perplexity':
      provider = new PerplexityProvider(providerConfig);
      break;
    case 'deepseek':
      provider = new DeepSeekProvider(providerConfig);
      break;
    case 'openrouter':
      provider = new OpenRouterProvider(providerConfig);
      break;
    default:
      throw ApiError.badRequest(`Unknown provider: ${providerName}`);
  }

  // Cache for future use (TTL: cleared on server restart or can add expiry)
  userProviders[cacheKey] = provider;

  return provider;
}

/**
 * Clear cached user provider (call when user updates their API key)
 */
export function clearUserProviderCache(userId, providerName = null) {
  if (providerName) {
    delete userProviders[`${userId}-${providerName}`];
  } else {
    // Clear all cached providers for this user
    Object.keys(userProviders)
      .filter(key => key.startsWith(`${userId}-`))
      .forEach(key => delete userProviders[key]);
  }
  logger.info({ userId, providerName }, 'Cleared user provider cache');
}

function selectProvider(requestedProvider, model) {
  const enabledProviders = getEnabledProviders();

  if (enabledProviders.length === 0) {
    throw ApiError.serviceUnavailable('No AI providers configured');
  }

  // If model specified, use its provider
  if (model && model !== 'auto' && MODEL_PROVIDER_MAP[model]) {
    const providerName = MODEL_PROVIDER_MAP[model];
    if (!enabledProviders.includes(providerName)) {
      throw ApiError.badRequest(`Provider ${providerName} for model ${model} is not enabled`);
    }
    return { provider: providerName, model };
  }

  // If provider specified
  if (requestedProvider && requestedProvider !== 'auto') {
    if (!enabledProviders.includes(requestedProvider)) {
      throw ApiError.badRequest(`Provider ${requestedProvider} is not enabled`);
    }
    return {
      provider: requestedProvider,
      model: model !== 'auto' ? model : DEFAULT_MODELS[requestedProvider],
    };
  }

  // Auto-select: prefer in order: groq (fastest), anthropic, openai, google
  const preferenceOrder = ['groq', 'anthropic', 'openai', 'google'];
  for (const providerName of preferenceOrder) {
    if (enabledProviders.includes(providerName)) {
      return {
        provider: providerName,
        model: DEFAULT_MODELS[providerName],
      };
    }
  }

  // Fallback to first enabled
  const firstProvider = enabledProviders[0];
  return {
    provider: firstProvider,
    model: DEFAULT_MODELS[firstProvider],
  };
}

export const AIService = {
  /**
   * Chat completion with BYOK support
   * @param {Object} options - Chat options
   * @param {string} options.userId - User ID for BYOK (optional)
   * @param {Array} options.messages - Chat messages
   * @param {string} options.model - Model to use
   * @param {string} options.provider - Provider to use
   * @param {Array} options.tools - MCP tools available (optional)
   * @param {number} options.temperature - Temperature (optional)
   * @param {number} options.maxTokens - Max tokens (optional)
   */
  async chat(options) {
    const { provider: providerName, model } = selectProvider(options.provider, options.model);
    const provider = await getProviderForUser(providerName, options.userId);

    logger.info(
      {
        provider: providerName,
        model,
        userId: options.userId || 'platform',
        hasTools: !!(options.tools && options.tools.length > 0),
      },
      'Routing chat request'
    );

    try {
      const response = await provider.chat({
        model,
        messages: options.messages,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        tools: options.tools, // Pass MCP tools if provided
      });

      return {
        ...response,
        provider: providerName,
        model,
        usingUserKey: provider.config?.isUserKey || false,
      };
    } catch (err) {
      logger.error({ provider: providerName, error: err.message }, 'Chat request failed');
      throw err;
    }
  },

  /**
   * Streaming chat completion with BYOK support
   */
  async *chatStream(options) {
    const { provider: providerName, model } = selectProvider(options.provider, options.model);
    const provider = await getProviderForUser(providerName, options.userId);

    logger.info(
      {
        provider: providerName,
        model,
        stream: true,
        userId: options.userId || 'platform',
      },
      'Routing chat stream request'
    );

    const stream = await provider.chatStream({
      model,
      messages: options.messages,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      tools: options.tools,
    });

    for await (const chunk of stream) {
      yield chunk;
    }
  },

  /**
   * Generate embeddings
   */
  async embeddings(options) {
    // Embeddings are primarily OpenAI for now
    const enabledProviders = getEnabledProviders();

    if (!enabledProviders.includes('openai')) {
      throw ApiError.serviceUnavailable('Embeddings require OpenAI provider');
    }

    const provider = getProvider('openai');
    return provider.embeddings(options);
  },

  /**
   * Get available models
   */
  getAvailableModels() {
    const enabledProviders = getEnabledProviders();
    const models = [];

    for (const [model, provider] of Object.entries(MODEL_PROVIDER_MAP)) {
      if (enabledProviders.includes(provider)) {
        models.push({
          id: model,
          provider,
          available: true,
        });
      }
    }

    return models;
  },

  /**
   * Get provider status
   */
  getProviderStatus() {
    const enabledProviders = getEnabledProviders();

    return {
      openai: { enabled: enabledProviders.includes('openai') },
      anthropic: { enabled: enabledProviders.includes('anthropic') },
      google: { enabled: enabledProviders.includes('google') },
      groq: { enabled: enabledProviders.includes('groq') },
      cohere: { enabled: enabledProviders.includes('cohere') },
      mistral: { enabled: enabledProviders.includes('mistral') },
    };
  },
};
