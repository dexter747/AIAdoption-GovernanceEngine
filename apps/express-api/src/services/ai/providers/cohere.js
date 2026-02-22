/**
 * Cohere Provider
 * Command R+ and Command R models
 */

import { CohereClient } from 'cohere-ai';
import { createLogger } from '../../../utils/logger.js';
import { ApiError } from '../../../middleware/errorHandler.js';

const logger = createLogger('cohere-provider');

export class CohereProvider {
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('Cohere API key not configured');
    }

    this.client = new CohereClient({
      token: config.apiKey,
    });
  }

  async chat({ model, messages, temperature, maxTokens }) {
    try {
      // Convert messages to Cohere format
      const { chatHistory, message, preamble } = this.convertMessages(messages);

      const response = await this.client.chat({
        model: model || 'command-r-plus',
        message,
        chatHistory,
        preamble: preamble || undefined,
        temperature,
        maxTokens,
      });

      return {
        id: response.generationId || `cohere-${Date.now()}`,
        message: {
          role: 'assistant',
          content: response.text,
        },
        finishReason: response.finishReason || 'stop',
        usage: {
          inputTokens: response.meta?.tokens?.inputTokens || 0,
          outputTokens: response.meta?.tokens?.outputTokens || 0,
          totalTokens:
            (response.meta?.tokens?.inputTokens || 0) + (response.meta?.tokens?.outputTokens || 0),
        },
      };
    } catch (err) {
      logger.error({ error: err.message, model }, 'Cohere chat failed');

      if (err.status === 429) {
        throw ApiError.tooManyRequests('Cohere rate limit exceeded');
      }
      if (err.status === 401) {
        throw ApiError.unauthorized('Invalid Cohere API key');
      }

      throw ApiError.internal(`Cohere error: ${err.message}`);
    }
  }

  async *chatStream({ model, messages, temperature, maxTokens }) {
    try {
      const { chatHistory, message, preamble } = this.convertMessages(messages);

      const stream = await this.client.chatStream({
        model: model || 'command-r-plus',
        message,
        chatHistory,
        preamble: preamble || undefined,
        temperature,
        maxTokens,
      });

      for await (const event of stream) {
        if (event.eventType === 'text-generation') {
          yield {
            content: event.text,
            finishReason: null,
          };
        }
        if (event.eventType === 'stream-end') {
          yield {
            content: '',
            finishReason: event.finishReason || 'stop',
          };
        }
      }
    } catch (err) {
      logger.error({ error: err.message, model }, 'Cohere stream failed');
      throw ApiError.internal(`Cohere stream error: ${err.message}`);
    }
  }

  convertMessages(messages) {
    let preamble = '';
    const chatHistory = [];
    let message = '';

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      if (msg.role === 'system') {
        preamble += msg.content + '\n';
      } else if (i === messages.length - 1 && msg.role === 'user') {
        // Last user message is the current message
        message = msg.content;
      } else {
        chatHistory.push({
          role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
          message: msg.content,
        });
      }
    }

    return { chatHistory, message, preamble: preamble.trim() };
  }
}
