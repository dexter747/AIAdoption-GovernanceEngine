import { AIQueryOptions, AIQueryResult, AIProvider } from '@shared/types';
import { AI_MODELS } from '@shared/types';

export class AIRouter {
  private totalCost: number = 0;

  async query(prompt: string, options: AIQueryOptions): Promise<AIQueryResult> {
    const startTime = Date.now();
    
    // Select model based on options or auto-select
    const model = options.model || this.selectOptimalModel(prompt);
    const provider = options.provider || this.getProviderForModel(model);
    
    // Get AI provider client
    const client = this.getProviderClient(provider);
    
    try {
      // Send query to AI provider
      const response = await client.complete(prompt, {
        model,
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 4000,
      });
      
      // Calculate cost
      const cost = this.calculateCost(model, response.usage);
      this.totalCost += cost;
      
      const result: AIQueryResult = {
        id: crypto.randomUUID(),
        prompt,
        response: response.text,
        model,
        provider,
        tokens: response.usage,
        cost,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
      
      return result;
    } catch (error: any) {
      throw new Error(`AI query failed: ${error.message}`);
    }
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
    return modelConfig?.provider as AIProvider || 'openai';
  }

  private getProviderClient(_provider: AIProvider) {
    // Stub - will be implemented with actual AI provider clients
    return {
      complete: async (_prompt: string, _options: any) => {
        return {
          text: 'AI response placeholder',
          usage: {
            input: 100,
            output: 200,
            total: 300,
          },
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
