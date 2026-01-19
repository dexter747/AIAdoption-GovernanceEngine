/**
 * Anthropic Provider
 */

import Anthropic from '@anthropic-ai/sdk';
import { createLogger } from '../../../utils/logger.js';
import { ApiError } from '../../../middleware/errorHandler.js';

const logger = createLogger('anthropic-provider');

export class AnthropicProvider {
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('Anthropic API key not configured');
    }
    
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  async chat({ model, messages, temperature, maxTokens }) {
    try {
      // Extract system message if present
      let systemMessage = '';
      const chatMessages = [];
      
      for (const msg of messages) {
        if (msg.role === 'system') {
          systemMessage += msg.content + '\n';
        } else {
          chatMessages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }

      const response = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemMessage.trim() || undefined,
        messages: chatMessages,
      });

      return {
        id: response.id,
        message: {
          role: 'assistant',
          content: response.content[0]?.text || '',
        },
        finishReason: response.stop_reason,
        usage: {
          inputTokens: response.usage?.input_tokens || 0,
          outputTokens: response.usage?.output_tokens || 0,
          totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
        },
      };
    } catch (err) {
      logger.error({ error: err.message, model }, 'Anthropic chat failed');
      
      if (err.status === 429) {
        throw ApiError.tooManyRequests('Anthropic rate limit exceeded');
      }
      if (err.status === 401) {
        throw ApiError.unauthorized('Invalid Anthropic API key');
      }
      
      throw ApiError.internal(`Anthropic error: ${err.message}`);
    }
  }

  async *chatStream({ model, messages, temperature, maxTokens }) {
    try {
      // Extract system message
      let systemMessage = '';
      const chatMessages = [];
      
      for (const msg of messages) {
        if (msg.role === 'system') {
          systemMessage += msg.content + '\n';
        } else {
          chatMessages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }

      const stream = await this.client.messages.stream({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemMessage.trim() || undefined,
        messages: chatMessages,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta?.text) {
          yield {
            content: event.delta.text,
            finishReason: null,
          };
        }
        if (event.type === 'message_stop') {
          yield {
            content: '',
            finishReason: 'stop',
          };
        }
      }
    } catch (err) {
      logger.error({ error: err.message, model }, 'Anthropic stream failed');
      throw ApiError.internal(`Anthropic stream error: ${err.message}`);
    }
  }
}
