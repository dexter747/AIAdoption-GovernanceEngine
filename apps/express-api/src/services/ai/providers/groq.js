/**
 * Groq Provider
 * Fast inference for open source models
 */

import Groq from 'groq-sdk';
import { createLogger } from '../../../utils/logger.js';
import { ApiError } from '../../../middleware/errorHandler.js';

const logger = createLogger('groq-provider');

export class GroqProvider {
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('Groq API key not configured');
    }

    this.client = new Groq({
      apiKey: config.apiKey,
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
      logger.error({ error: err.message, model }, 'Groq chat failed');

      if (err.status === 429) {
        throw ApiError.tooManyRequests('Groq rate limit exceeded');
      }
      if (err.status === 401) {
        throw ApiError.unauthorized('Invalid Groq API key');
      }

      throw ApiError.internal(`Groq error: ${err.message}`);
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
      logger.error({ error: err.message, model }, 'Groq stream failed');
      throw ApiError.internal(`Groq stream error: ${err.message}`);
    }
  }
}
