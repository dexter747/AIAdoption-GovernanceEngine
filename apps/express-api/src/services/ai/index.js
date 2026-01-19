/**
 * AI Service - Provider abstraction layer
 * Routes requests to appropriate AI providers
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

const logger = createLogger('ai-service');

// Model to provider mapping
const MODEL_PROVIDER_MAP = {
  // OpenAI
  'gpt-4o': 'openai',
  'gpt-4o-mini': 'openai',
  'gpt-4-turbo': 'openai',
  'gpt-4': 'openai',
  'gpt-3.5-turbo': 'openai',
  'o1': 'openai',
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
  'command': 'cohere',
  
  // Mistral
  'mistral-large-latest': 'mistral',
  'mistral-medium-latest': 'mistral',
  'mistral-small-latest': 'mistral',
  'codestral-latest': 'mistral',
  
  // Perplexity
  'sonar': 'perplexity',
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

// Provider instances (lazy loaded)
let providers = {};

function getProvider(name) {
  if (!providers[name]) {
    switch (name) {
      case 'openai':
        providers[name] = new OpenAIProvider(config.ai.openai);
        break;
      case 'anthropic':
        providers[name] = new AnthropicProvider(config.ai.anthropic);
        break;
      case 'google':
        providers[name] = new GoogleProvider(config.ai.google);
        break;
      case 'groq':
        providers[name] = new GroqProvider(config.ai.groq);
        break;
      case 'cohere':
        providers[name] = new CohereProvider(config.ai.cohere);
        break;
      case 'mistral':
        providers[name] = new MistralProvider(config.ai.mistral);
        break;
      case 'perplexity':
        providers[name] = new PerplexityProvider(config.ai.perplexity);
        break;
      case 'deepseek':
        providers[name] = new DeepSeekProvider(config.ai.deepseek);
        break;
      case 'openrouter':
        providers[name] = new OpenRouterProvider(config.ai.openrouter);
        break;
      default:
        throw ApiError.badRequest(`Unknown provider: ${name}`);
    }
  }
  return providers[name];
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
      model: model !== 'auto' ? model : DEFAULT_MODELS[requestedProvider] 
    };
  }

  // Auto-select: prefer in order: groq (fastest), anthropic, openai, google
  const preferenceOrder = ['groq', 'anthropic', 'openai', 'google'];
  for (const providerName of preferenceOrder) {
    if (enabledProviders.includes(providerName)) {
      return { 
        provider: providerName, 
        model: DEFAULT_MODELS[providerName] 
      };
    }
  }

  // Fallback to first enabled
  const firstProvider = enabledProviders[0];
  return { 
    provider: firstProvider, 
    model: DEFAULT_MODELS[firstProvider] 
  };
}

export const AIService = {
  /**
   * Chat completion
   */
  async chat(options) {
    const { provider: providerName, model } = selectProvider(options.provider, options.model);
    const provider = getProvider(providerName);
    
    logger.info({ provider: providerName, model }, 'Routing chat request');
    
    try {
      const response = await provider.chat({
        model,
        messages: options.messages,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      });
      
      return {
        ...response,
        provider: providerName,
        model,
      };
    } catch (err) {
      logger.error({ provider: providerName, error: err.message }, 'Chat request failed');
      throw err;
    }
  },

  /**
   * Streaming chat completion
   */
  async *chatStream(options) {
    const { provider: providerName, model } = selectProvider(options.provider, options.model);
    const provider = getProvider(providerName);
    
    logger.info({ provider: providerName, model, stream: true }, 'Routing chat stream request');
    
    const stream = await provider.chatStream({
      model,
      messages: options.messages,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
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
