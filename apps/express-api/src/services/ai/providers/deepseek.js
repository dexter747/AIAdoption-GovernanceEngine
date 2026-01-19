/**
 * DeepSeek Provider
 * DeepSeek Coder and Chat models
 */

import OpenAI from 'openai';
import { createLogger } from '../../../utils/logger.js';
import { ApiError } from '../../../middleware/errorHandler.js';

const logger = createLogger('deepseek-provider');

// DeepSeek uses OpenAI-compatible API
export class DeepSeekProvider {
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('DeepSeek API key not configured');
    }
    
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: 'https://api.deepseek.com',
    });
  }

  async chat({ model, messages, temperature, maxTokens }) {
    try {
      const response = await this.client.chat.completions.create({
        model: model || 'deepseek-chat',
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
      logger.error({ error: err.message, model }, 'DeepSeek chat failed');
      
      if (err.status === 429) {
        throw ApiError.tooManyRequests('DeepSeek rate limit exceeded');
      }
      if (err.status === 401) {
        throw ApiError.unauthorized('Invalid DeepSeek API key');
      }
      
      throw ApiError.internal(`DeepSeek error: ${err.message}`);
    }
  }

  async *chatStream({ model, messages, temperature, maxTokens }) {
    try {
      const stream = await this.client.chat.completions.create({
        model: model || 'deepseek-chat',
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
      logger.error({ error: err.message, model }, 'DeepSeek stream failed');
      throw ApiError.internal(`DeepSeek stream error: ${err.message}`);
    }
  }
}
