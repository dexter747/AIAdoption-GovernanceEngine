/**
 * OpenAI Provider
 * Supports chat completions, tool calling (for MCP), and embeddings
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
    
    this.config = config;
  }

  /**
   * Chat completion with optional tool/function calling for MCP
   */
  async chat({ model, messages, temperature, maxTokens, tools }) {
    try {
      const requestParams = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      };
      
      // Add tools if provided (for MCP integration)
      if (tools && tools.length > 0) {
        requestParams.tools = tools.map(tool => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema || tool.parameters || { type: 'object', properties: {} },
          },
        }));
        requestParams.tool_choice = 'auto';
      }
      
      const response = await this.client.chat.completions.create(requestParams);
      const choice = response.choices[0];
      
      // Check if AI wants to call a tool
      if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
        return {
          id: response.id,
          message: {
            role: choice.message.role,
            content: choice.message.content,
            tool_calls: choice.message.tool_calls.map(tc => ({
              id: tc.id,
              type: tc.type,
              function: {
                name: tc.function.name,
                arguments: tc.function.arguments,
              },
            })),
          },
          finishReason: choice.finish_reason,
          usage: {
            inputTokens: response.usage?.prompt_tokens || 0,
            outputTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          },
          requiresToolExecution: true,
        };
      }
      
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

  async *chatStream({ model, messages, temperature, maxTokens, tools }) {
    try {
      const requestParams = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      };
      
      // Add tools if provided
      if (tools && tools.length > 0) {
        requestParams.tools = tools.map(tool => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema || tool.parameters || { type: 'object', properties: {} },
          },
        }));
        requestParams.tool_choice = 'auto';
      }
      
      const stream = await this.client.chat.completions.create(requestParams);

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        
        // Handle tool calls in streaming
        if (delta?.tool_calls) {
          yield {
            tool_calls: delta.tool_calls,
            finishReason: chunk.choices[0]?.finish_reason,
          };
        } else if (delta?.content) {
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
