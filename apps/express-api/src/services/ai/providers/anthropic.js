/**
 * Anthropic Provider
 * Supports chat completions and tool calling for MCP
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

    this.config = config;
  }

  /**
   * Chat completion with optional tool calling for MCP
   */
  async chat({ model, messages, temperature, maxTokens, tools }) {
    try {
      // Extract system message if present
      let systemMessage = '';
      const chatMessages = [];

      for (const msg of messages) {
        if (msg.role === 'system') {
          systemMessage += msg.content + '\n';
        } else if (msg.role === 'tool') {
          // Handle tool result messages for Anthropic format
          chatMessages.push({
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: msg.tool_call_id,
                content: msg.content,
              },
            ],
          });
        } else {
          chatMessages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }

      const requestParams = {
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemMessage.trim() || undefined,
        messages: chatMessages,
      };

      // Add tools if provided (for MCP integration)
      if (tools && tools.length > 0) {
        requestParams.tools = tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema || tool.parameters || { type: 'object', properties: {} },
        }));
      }

      const response = await this.client.messages.create(requestParams);

      // Check if AI wants to use a tool
      const toolUseBlocks = response.content.filter(block => block.type === 'tool_use');
      if (toolUseBlocks.length > 0) {
        return {
          id: response.id,
          message: {
            role: 'assistant',
            content: response.content.find(block => block.type === 'text')?.text || '',
            tool_calls: toolUseBlocks.map(block => ({
              id: block.id,
              type: 'function',
              function: {
                name: block.name,
                arguments: JSON.stringify(block.input),
              },
            })),
          },
          finishReason: response.stop_reason,
          usage: {
            inputTokens: response.usage?.input_tokens || 0,
            outputTokens: response.usage?.output_tokens || 0,
            totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
          },
          requiresToolExecution: true,
        };
      }

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

  async *chatStream({ model, messages, temperature, maxTokens, tools }) {
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

      const requestParams = {
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemMessage.trim() || undefined,
        messages: chatMessages,
      };

      // Add tools if provided
      if (tools && tools.length > 0) {
        requestParams.tools = tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema || tool.parameters || { type: 'object', properties: {} },
        }));
      }

      const stream = await this.client.messages.stream(requestParams);

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta?.text) {
          yield {
            content: event.delta.text,
            finishReason: null,
          };
        }
        if (event.type === 'content_block_delta' && event.delta?.type === 'input_json_delta') {
          // Handle tool call streaming
          yield {
            tool_input_delta: event.delta.partial_json,
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
