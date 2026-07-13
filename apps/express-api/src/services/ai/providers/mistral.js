/**
 * Mistral AI Provider
 * Mistral Large, Medium, and Small models
 */

import Mistral from '@mistralai/mistralai';
import { createLogger } from '../../../utils/logger.js';
import { ApiError } from '../../../middleware/errorHandler.js';

const logger = createLogger('mistral-provider');

export class MistralProvider {
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('Mistral API key not configured');
    }

    this.client = new Mistral({
      apiKey: config.apiKey,
    });
  }

  async chat({ model, messages, temperature, maxTokens }) {
    try {
      const response = await this.client.chat.complete({
        model: model || 'mistral-large-latest',
        messages,
        temperature,
        maxTokens,
      });

      const choice = response.choices[0];

      return {
        id: response.id,
        message: {
          role: choice.message.role,
          content: choice.message.content,
        },
        finishReason: choice.finishReason || 'stop',
        usage: {
          inputTokens: response.usage?.promptTokens || 0,
          outputTokens: response.usage?.completionTokens || 0,
          totalTokens: response.usage?.totalTokens || 0,
        },
      };
    } catch (err) {
      logger.error({ error: err.message, model }, 'Mistral chat failed');

      if (err.status === 429) {
        throw ApiError.tooManyRequests('Mistral rate limit exceeded');
      }
      if (err.status === 401) {
        throw ApiError.unauthorized('Invalid Mistral API key');
      }

      throw ApiError.internal(`Mistral error: ${err.message}`);
    }
  }

  async *chatStream({ model, messages, temperature, maxTokens }) {
    try {
      const stream = await this.client.chat.stream({
        model: model || 'mistral-large-latest',
        messages,
        temperature,
        maxTokens,
      });

      for await (const event of stream) {
        const delta = event.data?.choices?.[0]?.delta;
        if (delta?.content) {
          yield {
            content: delta.content,
            finishReason: event.data?.choices?.[0]?.finishReason,
          };
        }
      }
    } catch (err) {
      logger.error({ error: err.message, model }, 'Mistral stream failed');
      throw ApiError.internal(`Mistral stream error: ${err.message}`);
    }
  }
}
