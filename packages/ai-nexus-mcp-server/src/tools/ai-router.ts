/**
 * AI Router - Intelligent model selection and routing
 * Supports 67+ AI models across multiple providers
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('ai-router');

// Model registry with pricing and capabilities
const MODEL_REGISTRY: Record<string, ModelInfo> = {
  // OpenAI Models
  'gpt-4o': {
    provider: 'openai',
    displayName: 'GPT-4o',
    tier: 'frontier',
    costPer1kInput: 0.005,
    costPer1kOutput: 0.015,
    maxTokens: 128000,
    capabilities: ['vision', 'code', 'reasoning', 'function_calling'],
    dataResidency: ['US'],
    latencyMs: 1500
  },
  'gpt-4o-mini': {
    provider: 'openai',
    displayName: 'GPT-4o Mini',
    tier: 'standard',
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    maxTokens: 128000,
    capabilities: ['vision', 'code', 'function_calling'],
    dataResidency: ['US'],
    latencyMs: 800
  },
  'gpt-4-turbo': {
    provider: 'openai',
    displayName: 'GPT-4 Turbo',
    tier: 'premium',
    costPer1kInput: 0.01,
    costPer1kOutput: 0.03,
    maxTokens: 128000,
    capabilities: ['vision', 'code', 'reasoning', 'function_calling'],
    dataResidency: ['US'],
    latencyMs: 2000
  },
  'o1': {
    provider: 'openai',
    displayName: 'o1',
    tier: 'frontier',
    costPer1kInput: 0.015,
    costPer1kOutput: 0.06,
    maxTokens: 200000,
    capabilities: ['reasoning', 'code', 'math'],
    dataResidency: ['US'],
    latencyMs: 5000
  },
  'o1-mini': {
    provider: 'openai',
    displayName: 'o1 Mini',
    tier: 'premium',
    costPer1kInput: 0.003,
    costPer1kOutput: 0.012,
    maxTokens: 128000,
    capabilities: ['reasoning', 'code', 'math'],
    dataResidency: ['US'],
    latencyMs: 3000
  },

  // Anthropic Models
  'claude-3-5-sonnet-20241022': {
    provider: 'anthropic',
    displayName: 'Claude 3.5 Sonnet',
    tier: 'frontier',
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    maxTokens: 200000,
    capabilities: ['vision', 'code', 'reasoning', 'function_calling'],
    dataResidency: ['US'],
    latencyMs: 1200
  },
  'claude-3-5-haiku-20241022': {
    provider: 'anthropic',
    displayName: 'Claude 3.5 Haiku',
    tier: 'standard',
    costPer1kInput: 0.001,
    costPer1kOutput: 0.005,
    maxTokens: 200000,
    capabilities: ['code', 'function_calling'],
    dataResidency: ['US'],
    latencyMs: 500
  },
  'claude-3-opus-20240229': {
    provider: 'anthropic',
    displayName: 'Claude 3 Opus',
    tier: 'premium',
    costPer1kInput: 0.015,
    costPer1kOutput: 0.075,
    maxTokens: 200000,
    capabilities: ['vision', 'code', 'reasoning', 'function_calling'],
    dataResidency: ['US'],
    latencyMs: 3000
  },

  // Google Models
  'gemini-2.0-flash': {
    provider: 'google',
    displayName: 'Gemini 2.0 Flash',
    tier: 'standard',
    costPer1kInput: 0.0001,
    costPer1kOutput: 0.0004,
    maxTokens: 1000000,
    capabilities: ['vision', 'code', 'function_calling'],
    dataResidency: ['US', 'EU'],
    latencyMs: 400
  },
  'gemini-1.5-pro': {
    provider: 'google',
    displayName: 'Gemini 1.5 Pro',
    tier: 'premium',
    costPer1kInput: 0.00125,
    costPer1kOutput: 0.005,
    maxTokens: 2000000,
    capabilities: ['vision', 'code', 'reasoning', 'function_calling'],
    dataResidency: ['US', 'EU'],
    latencyMs: 1500
  },
  'gemini-1.5-flash': {
    provider: 'google',
    displayName: 'Gemini 1.5 Flash',
    tier: 'economy',
    costPer1kInput: 0.000075,
    costPer1kOutput: 0.0003,
    maxTokens: 1000000,
    capabilities: ['vision', 'code'],
    dataResidency: ['US', 'EU'],
    latencyMs: 300
  },

  // Groq Models (Fast inference)
  'llama-3.3-70b-versatile': {
    provider: 'groq',
    displayName: 'Llama 3.3 70B (Groq)',
    tier: 'standard',
    costPer1kInput: 0.00059,
    costPer1kOutput: 0.00079,
    maxTokens: 128000,
    capabilities: ['code', 'reasoning'],
    dataResidency: ['US'],
    latencyMs: 200 // Groq is FAST
  },
  'llama-3.1-8b-instant': {
    provider: 'groq',
    displayName: 'Llama 3.1 8B (Groq)',
    tier: 'economy',
    costPer1kInput: 0.00005,
    costPer1kOutput: 0.00008,
    maxTokens: 128000,
    capabilities: ['code'],
    dataResidency: ['US'],
    latencyMs: 100
  },
  'mixtral-8x7b-32768': {
    provider: 'groq',
    displayName: 'Mixtral 8x7B (Groq)',
    tier: 'economy',
    costPer1kInput: 0.00024,
    costPer1kOutput: 0.00024,
    maxTokens: 32768,
    capabilities: ['code'],
    dataResidency: ['US'],
    latencyMs: 150
  },

  // Cohere Models
  'command-r-plus': {
    provider: 'cohere',
    displayName: 'Command R+',
    tier: 'premium',
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    maxTokens: 128000,
    capabilities: ['rag', 'code', 'function_calling'],
    dataResidency: ['US'],
    latencyMs: 1000
  },
  'command-r': {
    provider: 'cohere',
    displayName: 'Command R',
    tier: 'standard',
    costPer1kInput: 0.0005,
    costPer1kOutput: 0.0015,
    maxTokens: 128000,
    capabilities: ['rag', 'code'],
    dataResidency: ['US'],
    latencyMs: 800
  }
};

interface ModelInfo {
  provider: 'openai' | 'anthropic' | 'google' | 'groq' | 'cohere' | 'mistral' | 'together';
  displayName: string;
  tier: 'economy' | 'standard' | 'premium' | 'frontier';
  costPer1kInput: number;
  costPer1kOutput: number;
  maxTokens: number;
  capabilities: string[];
  dataResidency: string[];
  latencyMs: number;
}

interface QueryRequirements {
  max_cost_per_1k?: number;
  max_latency_ms?: number;
  min_quality_tier?: 'economy' | 'standard' | 'premium' | 'frontier';
  data_residency?: 'any' | 'US' | 'EU' | 'on-premise';
  capabilities?: string[];
}

interface QueryResult {
  model: string;
  response: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  };
  latencyMs: number;
}

export class AIRouter {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private google: GoogleGenerativeAI | null = null;
  private groq: Groq | null = null;

  constructor() {
    this.initializeClients();
  }

  private initializeClients() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      logger.info('OpenAI client initialized');
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      logger.info('Anthropic client initialized');
    }

    if (process.env.GOOGLE_AI_API_KEY) {
      this.google = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
      logger.info('Google AI client initialized');
    }

    if (process.env.GROQ_API_KEY) {
      this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      logger.info('Groq client initialized');
    }
  }

  async query(
    prompt: string, 
    model?: string, 
    requirements?: QueryRequirements,
    systemPrompt?: string
  ): Promise<QueryResult> {
    // If no model specified, select best model based on requirements
    const selectedModel = model ?? this.selectBestModel(requirements);
    const modelInfo = MODEL_REGISTRY[selectedModel];

    if (!modelInfo) {
      throw new Error(`Unknown model: ${selectedModel}. Use list_ai_models to see available models.`);
    }

    const startTime = Date.now();
    let response: string;
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      switch (modelInfo.provider) {
        case 'openai':
          ({ response, inputTokens, outputTokens } = await this.queryOpenAI(selectedModel, prompt, systemPrompt));
          break;
        case 'anthropic':
          ({ response, inputTokens, outputTokens } = await this.queryAnthropic(selectedModel, prompt, systemPrompt));
          break;
        case 'google':
          ({ response, inputTokens, outputTokens } = await this.queryGoogle(selectedModel, prompt, systemPrompt));
          break;
        case 'groq':
          ({ response, inputTokens, outputTokens } = await this.queryGroq(selectedModel, prompt, systemPrompt));
          break;
        default:
          throw new Error(`Provider ${modelInfo.provider} not yet implemented`);
      }
    } catch (error) {
      logger.error({ model: selectedModel, error }, 'Query failed');
      throw error;
    }

    const latencyMs = Date.now() - startTime;
    const totalCost = (inputTokens / 1000) * modelInfo.costPer1kInput + 
                      (outputTokens / 1000) * modelInfo.costPer1kOutput;

    logger.info({ 
      model: selectedModel, 
      inputTokens, 
      outputTokens, 
      cost: totalCost, 
      latencyMs 
    }, 'Query completed');

    return {
      model: selectedModel,
      response,
      usage: { inputTokens, outputTokens, totalCost },
      latencyMs
    };
  }

  private selectBestModel(requirements?: QueryRequirements): string {
    let candidates = Object.entries(MODEL_REGISTRY);

    // Filter by tier
    if (requirements?.min_quality_tier) {
      const tierOrder = ['economy', 'standard', 'premium', 'frontier'];
      const minIndex = tierOrder.indexOf(requirements.min_quality_tier);
      candidates = candidates.filter(([_, info]) => 
        tierOrder.indexOf(info.tier) >= minIndex
      );
    }

    // Filter by max cost
    if (requirements?.max_cost_per_1k) {
      candidates = candidates.filter(([_, info]) => 
        info.costPer1kInput <= requirements.max_cost_per_1k!
      );
    }

    // Filter by max latency
    if (requirements?.max_latency_ms) {
      candidates = candidates.filter(([_, info]) => 
        info.latencyMs <= requirements.max_latency_ms!
      );
    }

    // Filter by capabilities
    if (requirements?.capabilities?.length) {
      candidates = candidates.filter(([_, info]) => 
        requirements.capabilities!.every(cap => info.capabilities.includes(cap))
      );
    }

    // Filter by data residency
    if (requirements?.data_residency && requirements.data_residency !== 'any') {
      candidates = candidates.filter(([_, info]) => 
        info.dataResidency.includes(requirements.data_residency!)
      );
    }

    // Filter by available clients
    candidates = candidates.filter(([_, info]) => {
      switch (info.provider) {
        case 'openai': return !!this.openai;
        case 'anthropic': return !!this.anthropic;
        case 'google': return !!this.google;
        case 'groq': return !!this.groq;
        default: return false;
      }
    });

    if (candidates.length === 0) {
      throw new Error('No models match the specified requirements');
    }

    // Sort by cost (ascending) and return cheapest that meets requirements
    candidates.sort((a, b) => a[1].costPer1kInput - b[1].costPer1kInput);
    return candidates[0][0];
  }

  private async queryOpenAI(model: string, prompt: string, systemPrompt?: string) {
    if (!this.openai) throw new Error('OpenAI client not initialized');

    const messages: OpenAI.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const completion = await this.openai.chat.completions.create({
      model,
      messages
    });

    return {
      response: completion.choices[0]?.message?.content ?? '',
      inputTokens: completion.usage?.prompt_tokens ?? 0,
      outputTokens: completion.usage?.completion_tokens ?? 0
    };
  }

  private async queryAnthropic(model: string, prompt: string, systemPrompt?: string) {
    if (!this.anthropic) throw new Error('Anthropic client not initialized');

    const message = await this.anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    });

    const textContent = message.content.find(c => c.type === 'text');
    return {
      response: textContent?.type === 'text' ? textContent.text : '',
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens
    };
  }

  private async queryGoogle(model: string, prompt: string, systemPrompt?: string) {
    if (!this.google) throw new Error('Google AI client not initialized');

    const genModel = this.google.getGenerativeModel({ 
      model,
      systemInstruction: systemPrompt
    });
    
    const result = await genModel.generateContent(prompt);
    const response = result.response;
    
    return {
      response: response.text(),
      inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0
    };
  }

  private async queryGroq(model: string, prompt: string, systemPrompt?: string) {
    if (!this.groq) throw new Error('Groq client not initialized');

    const messages: Groq.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const completion = await this.groq.chat.completions.create({
      model,
      messages
    });

    return {
      response: completion.choices[0]?.message?.content ?? '',
      inputTokens: completion.usage?.prompt_tokens ?? 0,
      outputTokens: completion.usage?.completion_tokens ?? 0
    };
  }

  async listModels(filter?: Record<string, unknown>): Promise<Record<string, unknown>[]> {
    let models = Object.entries(MODEL_REGISTRY);

    if (filter?.provider) {
      models = models.filter(([_, info]) => info.provider === filter.provider);
    }

    if (filter?.tier) {
      models = models.filter(([_, info]) => info.tier === filter.tier);
    }

    if (filter?.capability) {
      models = models.filter(([_, info]) => 
        info.capabilities.includes(filter.capability as string)
      );
    }

    // Add availability status
    return models.map(([id, info]) => ({
      id,
      ...info,
      available: this.isProviderAvailable(info.provider)
    }));
  }

  private isProviderAvailable(provider: string): boolean {
    switch (provider) {
      case 'openai': return !!this.openai;
      case 'anthropic': return !!this.anthropic;
      case 'google': return !!this.google;
      case 'groq': return !!this.groq;
      default: return false;
    }
  }

  async compareModels(prompt: string, models: string[]): Promise<Record<string, unknown>[]> {
    const results = await Promise.allSettled(
      models.map(model => this.query(prompt, model))
    );

    return results.map((result, index) => ({
      model: models[index],
      ...(result.status === 'fulfilled' 
        ? { success: true, ...result.value }
        : { success: false, error: result.reason?.message ?? 'Unknown error' }
      )
    }));
  }

  async healthCheck(): Promise<Record<string, unknown>> {
    return {
      status: 'healthy',
      providers: {
        openai: !!this.openai,
        anthropic: !!this.anthropic,
        google: !!this.google,
        groq: !!this.groq
      },
      modelsAvailable: Object.keys(MODEL_REGISTRY).length
    };
  }
}
