/**
 * AI Routes
 * Handles chat completions, embeddings, and AI model routing
 */

import { Router } from 'express';
import { z } from 'zod';
import { optionalJwt, validateLicense } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { AIService } from '../services/ai/index.js';
import { UsageService } from '../services/usage.js';
import { createLogger } from '../utils/logger.js';

const router = Router();
const logger = createLogger('ai-routes');

// Validation schemas
const chatRequestSchema = z.object({
  model: z.string().optional().default('auto'),
  provider: z
    .enum(['openai', 'anthropic', 'google', 'groq', 'cohere', 'mistral', 'auto'])
    .optional()
    .default('auto'),
  messages: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string(),
      })
    )
    .min(1),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(1).max(128000).optional().default(4096),
  stream: z.boolean().optional().default(false),
});

const embeddingsRequestSchema = z.object({
  input: z.union([z.string(), z.array(z.string())]),
  model: z.string().optional().default('text-embedding-3-small'),
});

/**
 * POST /api/ai/chat
 * Chat completion endpoint with BYOK support
 */
router.post('/chat', optionalJwt, async (req, res, next) => {
  try {
    // Validate request
    const validated = chatRequestSchema.parse(req.body);

    // Get user ID for BYOK (Bring Your Own Key)
    const userId = req.user?.id || null;

    logger.info(
      {
        provider: validated.provider,
        model: validated.model,
        messageCount: validated.messages.length,
        userId: userId || 'anonymous',
        byok: !!userId,
      },
      'Chat request received'
    );

    // Handle streaming
    if (validated.stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = await AIService.chatStream({
        ...validated,
        userId, // Pass user ID for BYOK
      });

      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    // Non-streaming response
    const startTime = Date.now();
    const response = await AIService.chat({
      ...validated,
      userId, // Pass user ID for BYOK
    });
    const duration = Date.now() - startTime;

    // Track usage
    if (userId) {
      await UsageService.track({
        userId,
        provider: response.provider,
        model: response.model,
        inputTokens: response.usage?.inputTokens || 0,
        outputTokens: response.usage?.outputTokens || 0,
        duration,
      });
    }

    res.json({
      success: true,
      data: {
        id: response.id,
        provider: response.provider,
        model: response.model,
        message: response.message,
        usage: response.usage,
        duration,
        usingUserKey: response.usingUserKey || false,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(err);
    }
    logger.error({ error: err.message }, 'Chat request failed');
    next(err);
  }
});

/**
 * POST /api/ai/embeddings
 * Generate embeddings
 */
router.post('/embeddings', optionalJwt, async (req, res, next) => {
  try {
    const validated = embeddingsRequestSchema.parse(req.body);

    const response = await AIService.embeddings(validated);

    res.json({
      success: true,
      data: response,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(err);
    }
    next(err);
  }
});

/**
 * GET /api/ai/models
 * List available models and providers
 */
router.get('/models', (req, res) => {
  const models = AIService.getAvailableModels();

  res.json({
    success: true,
    data: models,
  });
});

/**
 * GET /api/ai/providers
 * List configured providers and their status
 */
router.get('/providers', (req, res) => {
  const providers = AIService.getProviderStatus();

  res.json({
    success: true,
    data: providers,
  });
});

export default router;
