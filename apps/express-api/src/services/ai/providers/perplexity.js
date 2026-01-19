/**
 * Perplexity AI Provider
 * Sonar models with real-time web search
 */

import OpenAI from 'openai';
import { createLogger } from '../../../utils/logger.js';
import { ApiError } from '../../../middleware/errorHandler.js';

const logger = createLogger('perplexity-provider');

// Perplexity uses OpenAI-compatible API
export class PerplexityProvider {
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('Perplexity API key not configured');
    }
    
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: 'https://api.perplexity.ai',
    });
  }

  async chat({ model, messages, temperature, maxTokens }) {
    try {
      const response = await this.client.chat.completions.create({
        model: model || 'sonar',
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      const choice = response.choices[0];
      
      return {
        id: response.id,
        message: {
          role: choice.message.role,
          content: choice.message.content,
        },
        finishReason: choice.finish_reason,
        usage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        // Perplexity returns citations
        citations: response.citations || [],
      };
    } catch (err) {
      logger.error({ error: err.message, model }, 'Perplexity chat failed');
      
      if (err.status === 429) {
        throw ApiError.tooManyRequests('Perplexity rate limit exceeded');
      }
      if (err.status === 401) {
        throw ApiError.unauthorized('Invalid Perplexity API key');
      }
      
      throw ApiError.internal(`Perplexity error: ${err.message}`);
    }
  }

  async *chatStream({ model, messages, temperature, maxTokens }) {
    try {
      const stream = await this.client.chat.completions.create({
        model: model || 'sonar',
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          yield {
            content: delta.content,
            finishReason: chunk.choices[0]?.finish_reason,
          };
        }
      }
    } catch (err) {
      logger.error({ error: err.message, model }, 'Perplexity stream failed');
      throw ApiError.internal(`Perplexity stream error: ${err.message}`);
    }
  }
}
