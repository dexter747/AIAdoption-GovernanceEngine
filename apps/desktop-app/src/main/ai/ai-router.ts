import { AIQueryOptions, AIQueryResult, AIProvider } from '@shared/types';
import { AI_MODELS } from '@shared/types';
import { contextManager, ContextWindowConfig } from '../context/context-manager';
import { expressClient } from '../api/express-client';
import { randomUUID } from 'crypto';

export class AIRouter {
  private totalCost: number = 0;

  async query(prompt: string, options: AIQueryOptions): Promise<AIQueryResult> {
    const startTime = Date.now();
    
    // Select model based on options or auto-select
    const model = options.model || this.selectOptimalModel(prompt);
    const provider = options.provider || this.getProviderForModel(model);
    
    // Get context configuration for the model
    const contextConfig = this.getContextConfigForModel(model);
    
    // Compile contexts into system prompt
    let systemPrompt = options.systemPrompt || '';
    let contextTokens = 0;
    
    try {
      const compiled = contextManager.compile({
        config: contextConfig,
        connectionId: options.connectionId,
        projectId: options.projectId,
        additionalContextIds: options.contextIds,
        excludeIds: options.excludeContextIds,
      });
      
      // Prepend compiled context to system prompt
      if (compiled.systemPrompt) {
        systemPrompt = compiled.systemPrompt + (systemPrompt ? '\n\n---\n\n' + systemPrompt : '');
      }
      contextTokens = compiled.totalTokens;
    } catch (err) {
      console.error('Failed to compile contexts:', err);
    }
    
    // Get AI provider client
    const client = this.getProviderClient(provider);
    
    try {
      // Build messages array for the API
      const messages: Array<{ role: string; content: string }> = [];
      
      // Add compiled system prompt
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      
      // Add conversation history if provided
      // @ts-ignore - conversationHistory may exist on options
      if (options.conversationHistory && Array.isArray(options.conversationHistory)) {
        // @ts-ignore
        for (const msg of options.conversationHistory) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
      
      // Add the current prompt
      messages.push({ role: 'user', content: prompt });
      
      // Route through Express backend (real LLM API calls)
      let response: any;
      try {
        response = await expressClient.queryAI({
          userId: 'local-user',
          licenseId: 'local',
          provider,
          model,
          messages,
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 4000,
        });
      } catch (expressErr: any) {
        // Fallback to stub if Express is not available
        console.warn('Express backend unavailable, using stub:', expressErr.message);
        response = await client.complete(prompt, {
          model,
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 4000,
          systemPrompt,
        });
      }
      
      // Normalize response format
      const responseText = response.content || response.text || response.response || 
                           response.data?.content || response.data?.response || 
                           'No response received';
      const usage = response.usage || response.tokens || { input: 0, output: 0, total: 0 };
      
      // Calculate cost
      const cost = this.calculateCost(model, { 
        input: usage.input || usage.prompt_tokens || usage.tokensUsed || 0, 
        output: usage.output || usage.completion_tokens || 0 
      });
      this.totalCost += cost;
      
      const result: AIQueryResult = {
        id: randomUUID(),
        prompt,
        response: responseText,
        model,
        provider,
        tokens: usage,
        cost,
        duration: Date.now() - startTime,
        timestamp: new Date(),
        contextTokens,
      };
      
      return result;
    } catch (error: any) {
      throw new Error(`AI query failed: ${error.message}`);
    }
  }

  /**
   * Get context window configuration for a specific model
   */
  private getContextConfigForModel(model: string): ContextWindowConfig {
    const configs: Record<string, ContextWindowConfig> = {
      'gpt-4o': {
        maxTokens: 128000,
        reservedForResponse: 4096,
        reservedForConversation: 32000,
      },
      'gpt-4o-mini': {
        maxTokens: 128000,
        reservedForResponse: 4096,
        reservedForConversation: 32000,
      },
      'gpt-4-turbo': {
        maxTokens: 128000,
        reservedForResponse: 4096,
        reservedForConversation: 32000,
      },
      'gpt-3.5-turbo': {
        maxTokens: 16385,
        reservedForResponse: 2048,
        reservedForConversation: 8000,
      },
      'claude-3-5-sonnet': {
        maxTokens: 200000,
        reservedForResponse: 8192,
        reservedForConversation: 50000,
      },
      'claude-3-5-sonnet-20241022': {
        maxTokens: 200000,
        reservedForResponse: 8192,
        reservedForConversation: 50000,
      },
      'claude-3-opus': {
        maxTokens: 200000,
        reservedForResponse: 4096,
        reservedForConversation: 50000,
      },
      'claude-3-opus-20240229': {
        maxTokens: 200000,
        reservedForResponse: 4096,
        reservedForConversation: 50000,
      },
      'gemini-1.5-pro': {
        maxTokens: 1000000,
        reservedForResponse: 8192,
        reservedForConversation: 100000,
      },
      'gemini-1.5-flash': {
        maxTokens: 1000000,
        reservedForResponse: 8192,
        reservedForConversation: 100000,
      },
    };
    
    return configs[model] || {
      maxTokens: 32000,
      reservedForResponse: 2048,
      reservedForConversation: 8000,
    };
  }

  async getAvailableModels() {
    return Object.keys(AI_MODELS).map(id => ({
      id,
      ...AI_MODELS[id as keyof typeof AI_MODELS],
    }));
  }

  async getTotalCost() {
    return this.totalCost;
  }

  private selectOptimalModel(prompt: string): string {
    const tokenEstimate = prompt.length / 4; // Rough estimate
    
    if (tokenEstimate < 500) {
      return 'gpt-4o-mini'; // Fast and cheap for simple queries
    } else if (tokenEstimate < 10000) {
      return 'gpt-4o'; // Balanced
    } else {
      return 'claude-3-5-sonnet'; // Long context specialist
    }
  }

  private getProviderForModel(model: string): AIProvider {
    const modelConfig = AI_MODELS[model as keyof typeof AI_MODELS];
    if (modelConfig?.provider) return modelConfig.provider as AIProvider;
    
    // Fallback: infer from model name patterns
    if (model.startsWith('gpt') || model.startsWith('o1') || model.startsWith('o3') || model.startsWith('o4')) return 'openai' as AIProvider;
    if (model.startsWith('claude')) return 'anthropic' as AIProvider;
    if (model.startsWith('gemini')) return 'google' as AIProvider;
    if (model.startsWith('llama')) return 'groq' as AIProvider;
    if (model.startsWith('grok')) return 'xai' as AIProvider;
    if (model.startsWith('mistral') || model.startsWith('mixtral')) return 'mistral' as AIProvider;
    if (model.startsWith('deepseek')) return 'deepseek' as AIProvider;
    return 'groq' as AIProvider;
  }

  private getProviderClient(_provider: AIProvider) {
    // Fallback stub - only used when Express backend is unavailable
    return {
      complete: async (_prompt: string, _options: any) => {
        return {
          text: '⚠️ AI backend is not available. Please check your Express API server is running on port 5500 and your API keys are configured.',
          usage: { input: 0, output: 0, total: 0 },
        };
      },
    };
  }

  private calculateCost(model: string, usage: { input: number; output: number }): number {
    const modelConfig = AI_MODELS[model as keyof typeof AI_MODELS];
    if (!modelConfig) return 0;
    
    const inputCost = (usage.input / 1000) * modelConfig.inputCostPer1k;
    const outputCost = (usage.output / 1000) * modelConfig.outputCostPer1k;
    
    return inputCost + outputCost;
  }
}
