/**
 * Google AI (Gemini) Provider
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createLogger } from '../../../utils/logger.js';
import { ApiError } from '../../../middleware/errorHandler.js';

const logger = createLogger('google-provider');

export class GoogleProvider {
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('Google AI API key not configured');
    }

    this.client = new GoogleGenerativeAI(config.apiKey);
  }

  async chat({ model, messages, temperature, maxTokens }) {
    try {
      const generativeModel = this.client.getGenerativeModel({
        model,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      // Convert messages to Gemini format
      const { history, lastMessage, systemInstruction } = this.convertMessages(messages);

      const chat = generativeModel.startChat({
        history,
        systemInstruction: systemInstruction || undefined,
      });

      const result = await chat.sendMessage(lastMessage);
      const response = result.response;

      return {
        id: `gemini-${Date.now()}`,
        message: {
          role: 'assistant',
          content: response.text(),
        },
        finishReason: response.candidates?.[0]?.finishReason || 'stop',
        usage: {
          inputTokens: response.usageMetadata?.promptTokenCount || 0,
          outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (err) {
      logger.error({ error: err.message, model }, 'Google chat failed');

      if (err.message?.includes('429')) {
        throw ApiError.tooManyRequests('Google AI rate limit exceeded');
      }
      if (err.message?.includes('401') || err.message?.includes('API key')) {
        throw ApiError.unauthorized('Invalid Google AI API key');
      }

      throw ApiError.internal(`Google AI error: ${err.message}`);
    }
  }

  async *chatStream({ model, messages, temperature, maxTokens }) {
    try {
      const generativeModel = this.client.getGenerativeModel({
        model,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      const { history, lastMessage, systemInstruction } = this.convertMessages(messages);

      const chat = generativeModel.startChat({
        history,
        systemInstruction: systemInstruction || undefined,
      });

      const result = await chat.sendMessageStream(lastMessage);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield {
            content: text,
            finishReason: null,
          };
        }
      }

      yield {
        content: '',
        finishReason: 'stop',
      };
    } catch (err) {
      logger.error({ error: err.message, model }, 'Google stream failed');
      throw ApiError.internal(`Google AI stream error: ${err.message}`);
    }
  }

  convertMessages(messages) {
    let systemInstruction = '';
    const history = [];
    let lastMessage = '';

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      if (msg.role === 'system') {
        systemInstruction += msg.content + '\n';
      } else if (i === messages.length - 1 && msg.role === 'user') {
        // Last user message goes to sendMessage
        lastMessage = msg.content;
      } else {
        history.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    return { history, lastMessage, systemInstruction: systemInstruction.trim() };
  }
}
