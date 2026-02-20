/**
 * OpenRouter Provider
 * Access to 100+ models through one API
 */

import OpenAI from 'openai';
import { createLogger } from '../../../utils/logger.js';
import { ApiError } from '../../../middleware/errorHandler.js';

const logger = createLogger('openrouter-provider');

// OpenRouter uses OpenAI-compatible API
export class OpenRouterProvider {
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }
    
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://velanova.com',
        'X-Title': 'Velanova',
      },
    });
  }

  async chat({ model, messages, temperature, maxTokens }) {
    try {
      const response = await this.client.chat.completions.create({
        model: model || 'openai/gpt-4o',
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
      };
    } catch (err) {
      logger.error({ error: err.message, model }, 'OpenRouter chat failed');
      
      if (err.status === 429) {
        throw ApiError.tooManyRequests('OpenRouter rate limit exceeded');
      }
      if (err.status === 401) {
        throw ApiError.unauthorized('Invalid OpenRouter API key');
      }
      
      throw ApiError.internal(`OpenRouter error: ${err.message}`);
    }
  }

  async *chatStream({ model, messages, temperature, maxTokens }) {
    try {
      const stream = await this.client.chat.completions.create({
        model: model || 'openai/gpt-4o',
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
      logger.error({ error: err.message, model }, 'OpenRouter stream failed');
      throw ApiError.internal(`OpenRouter stream error: ${err.message}`);
    }
  }
}
