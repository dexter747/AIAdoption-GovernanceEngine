/**
 * OpenAI Provider
 */

import OpenAI from 'openai';
import { createLogger } from '../../../utils/logger.js';
import { ApiError } from '../../../middleware/errorHandler.js';

const logger = createLogger('openai-provider');

export class OpenAIProvider {
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.orgId || undefined,
    });
  }

  async chat({ model, messages, temperature, maxTokens }) {
    try {
      const response = await this.client.chat.completions.create({
        model,
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
      logger.error({ error: err.message, model }, 'OpenAI chat failed');
      
      if (err.status === 429) {
        throw ApiError.tooManyRequests('OpenAI rate limit exceeded');
      }
      if (err.status === 401) {
        throw ApiError.unauthorized('Invalid OpenAI API key');
      }
      
      throw ApiError.internal(`OpenAI error: ${err.message}`);
    }
  }

  async *chatStream({ model, messages, temperature, maxTokens }) {
    try {
      const stream = await this.client.chat.completions.create({
        model,
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
      logger.error({ error: err.message, model }, 'OpenAI stream failed');
      throw ApiError.internal(`OpenAI stream error: ${err.message}`);
    }
  }

  async embeddings({ input, model }) {
    try {
      const response = await this.client.embeddings.create({
        model: model || 'text-embedding-3-small',
        input: Array.isArray(input) ? input : [input],
      });

      return {
        embeddings: response.data.map(d => d.embedding),
        model: response.model,
        usage: {
          totalTokens: response.usage?.total_tokens || 0,
        },
      };
    } catch (err) {
      logger.error({ error: err.message, model }, 'OpenAI embeddings failed');
      throw ApiError.internal(`OpenAI embeddings error: ${err.message}`);
    }
  }
}
