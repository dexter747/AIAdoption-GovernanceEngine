/**
 * User API Keys Routes
 * CRUD operations for user's AI provider API keys (BYOK)
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateJwt, optionalJwt } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { encrypt, decrypt, getKeyPreview, hashKey } from '../services/encryption.js';
import { createSupabaseClient } from '../config/supabase.js';
import { createLogger } from '../utils/logger.js';

const router = Router();
const logger = createLogger('user-api-keys');

// Supported AI providers
const SUPPORTED_PROVIDERS = [
  'openai',
  'anthropic',
  'google',
  'groq',
  'cohere',
  'mistral',
  'perplexity',
  'deepseek',
  'together',
  'replicate',
  'huggingface',
  'openrouter',
  'azure_openai',
  'aws_bedrock',
  'ollama',
];

// Provider display info
const PROVIDER_INFO = {
  openai: { name: 'OpenAI', icon: '🤖', url: 'https://platform.openai.com/api-keys' },
  anthropic: { name: 'Anthropic', icon: '🧠', url: 'https://console.anthropic.com/settings/keys' },
  google: { name: 'Google AI', icon: '🔮', url: 'https://aistudio.google.com/app/apikey' },
  groq: { name: 'Groq', icon: '⚡', url: 'https://console.groq.com/keys' },
  cohere: { name: 'Cohere', icon: '🌀', url: 'https://dashboard.cohere.com/api-keys' },
  mistral: { name: 'Mistral', icon: '💨', url: 'https://console.mistral.ai/api-keys/' },
  perplexity: { name: 'Perplexity', icon: '🔍', url: 'https://www.perplexity.ai/settings/api' },
  deepseek: { name: 'DeepSeek', icon: '🐋', url: 'https://platform.deepseek.com/api_keys' },
  together: { name: 'Together AI', icon: '🤝', url: 'https://api.together.xyz/settings/api-keys' },
  replicate: { name: 'Replicate', icon: '🔄', url: 'https://replicate.com/account/api-tokens' },
  huggingface: { name: 'HuggingFace', icon: '🤗', url: 'https://huggingface.co/settings/tokens' },
  openrouter: { name: 'OpenRouter', icon: '🛤️', url: 'https://openrouter.ai/keys' },
  azure_openai: { name: 'Azure OpenAI', icon: '☁️', url: 'https://portal.azure.com/' },
  aws_bedrock: { name: 'AWS Bedrock', icon: '🪨', url: 'https://console.aws.amazon.com/' },
  ollama: { name: 'Ollama (Local)', icon: '🦙', url: 'https://ollama.ai/' },
};

// Validation schemas
const addKeySchema = z.object({
  provider: z.enum(SUPPORTED_PROVIDERS),
  key_name: z.string().min(1).max(100).default('Default Key'),
  api_key: z.string().min(10).max(500),
  config: z
    .object({
      endpoint: z.string().url().optional(),
      deployment: z.string().optional(),
      region: z.string().optional(),
      base_url: z.string().url().optional(),
    })
    .optional()
    .default({}),
});

const updateKeySchema = z.object({
  key_name: z.string().min(1).max(100).optional(),
  api_key: z.string().min(10).max(500).optional(),
  config: z
    .object({
      endpoint: z.string().url().optional(),
      deployment: z.string().optional(),
      region: z.string().optional(),
      base_url: z.string().url().optional(),
    })
    .optional(),
  is_active: z.boolean().optional(),
});

/**
 * GET /api/user/api-keys/providers
 * List all supported providers with info
 */
router.get('/providers', (req, res) => {
  const providers = SUPPORTED_PROVIDERS.map(id => ({
    id,
    ...PROVIDER_INFO[id],
  }));

  res.json({
    success: true,
    data: providers,
  });
});

/**
 * GET /api/user/api-keys
 * List all user's API keys (without actual key values)
 */
router.get('/', validateJwt, async (req, res, next) => {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('user_provider_keys')
      .select(
        'id, provider, key_name, key_preview, config, is_active, is_valid, last_used_at, total_requests, total_tokens, total_cost_cents, created_at'
      )
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error({ error }, 'Failed to fetch user API keys');
      throw new ApiError(500, 'Failed to fetch API keys');
    }

    // Add provider info to each key
    const keysWithInfo = data.map(key => ({
      ...key,
      provider_info: PROVIDER_INFO[key.provider],
    }));

    res.json({
      success: true,
      data: keysWithInfo,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/user/api-keys/:provider
 * Get user's key for a specific provider
 */
router.get('/:provider', validateJwt, async (req, res, next) => {
  try {
    const { provider } = req.params;

    if (!SUPPORTED_PROVIDERS.includes(provider)) {
      throw new ApiError(400, `Unsupported provider: ${provider}`);
    }

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('user_provider_keys')
      .select('id, provider, key_name, key_preview, config, is_active, is_valid, last_used_at')
      .eq('user_id', req.user.id)
      .eq('provider', provider)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows
      logger.error({ error }, 'Failed to fetch provider key');
      throw new ApiError(500, 'Failed to fetch provider key');
    }

    res.json({
      success: true,
      data: data || null,
      provider_info: PROVIDER_INFO[provider],
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/user/api-keys
 * Add a new API key
 */
router.post('/', validateJwt, async (req, res, next) => {
  try {
    const validated = addKeySchema.parse(req.body);

    // Encrypt the API key
    const encryptedKey = encrypt(validated.api_key);
    const keyPreview = getKeyPreview(validated.api_key);

    const supabase = createSupabaseClient();

    // Check if key already exists for this provider
    const { data: existing } = await supabase
      .from('user_provider_keys')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('provider', validated.provider)
      .eq('key_name', validated.key_name)
      .single();

    if (existing) {
      throw new ApiError(
        409,
        `Key "${validated.key_name}" already exists for ${PROVIDER_INFO[validated.provider].name}`
      );
    }

    // Insert new key
    const { data, error } = await supabase
      .from('user_provider_keys')
      .insert({
        user_id: req.user.id,
        provider: validated.provider,
        key_name: validated.key_name,
        encrypted_key: encryptedKey,
        key_preview: keyPreview,
        config: validated.config,
        is_active: true,
        is_valid: true, // Will be validated on first use
        last_validated_at: new Date().toISOString(),
      })
      .select('id, provider, key_name, key_preview, config, is_active, created_at')
      .single();

    if (error) {
      logger.error({ error }, 'Failed to add API key');
      throw new ApiError(500, 'Failed to add API key');
    }

    logger.info({ userId: req.user.id, provider: validated.provider }, 'API key added');

    res.status(201).json({
      success: true,
      message: `${PROVIDER_INFO[validated.provider].name} API key added successfully`,
      data: {
        ...data,
        provider_info: PROVIDER_INFO[validated.provider],
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(err);
    }
    next(err);
  }
});

/**
 * PUT /api/user/api-keys/:id
 * Update an API key
 */
router.put('/:id', validateJwt, async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = updateKeySchema.parse(req.body);

    const supabase = createSupabaseClient();

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('user_provider_keys')
      .select('id, provider')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existing) {
      throw new ApiError(404, 'API key not found');
    }

    // Build update object
    const updates = {};

    if (validated.key_name) {
      updates.key_name = validated.key_name;
    }

    if (validated.api_key) {
      updates.encrypted_key = encrypt(validated.api_key);
      updates.key_preview = getKeyPreview(validated.api_key);
      updates.is_valid = true; // Reset validation status
      updates.validation_error = null;
    }

    if (validated.config) {
      updates.config = validated.config;
    }

    if (typeof validated.is_active === 'boolean') {
      updates.is_active = validated.is_active;
    }

    // Update
    const { data, error } = await supabase
      .from('user_provider_keys')
      .update(updates)
      .eq('id', id)
      .select('id, provider, key_name, key_preview, config, is_active, is_valid')
      .single();

    if (error) {
      logger.error({ error }, 'Failed to update API key');
      throw new ApiError(500, 'Failed to update API key');
    }

    logger.info({ userId: req.user.id, keyId: id }, 'API key updated');

    res.json({
      success: true,
      message: 'API key updated successfully',
      data: {
        ...data,
        provider_info: PROVIDER_INFO[data.provider],
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(err);
    }
    next(err);
  }
});

/**
 * DELETE /api/user/api-keys/:id
 * Delete an API key
 */
router.delete('/:id', validateJwt, async (req, res, next) => {
  try {
    const { id } = req.params;

    const supabase = createSupabaseClient();

    // Verify ownership and get provider for logging
    const { data: existing, error: fetchError } = await supabase
      .from('user_provider_keys')
      .select('id, provider, key_name')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existing) {
      throw new ApiError(404, 'API key not found');
    }

    // Delete
    const { error } = await supabase.from('user_provider_keys').delete().eq('id', id);

    if (error) {
      logger.error({ error }, 'Failed to delete API key');
      throw new ApiError(500, 'Failed to delete API key');
    }

    logger.info({ userId: req.user.id, keyId: id, provider: existing.provider }, 'API key deleted');

    res.json({
      success: true,
      message: `${PROVIDER_INFO[existing.provider].name} API key deleted`,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/user/api-keys/:id/test
 * Test an API key by making a minimal API call
 */
router.post('/:id/test', validateJwt, async (req, res, next) => {
  try {
    const { id } = req.params;

    const supabase = createSupabaseClient();

    // Fetch the key
    const { data: keyData, error: fetchError } = await supabase
      .from('user_provider_keys')
      .select('id, provider, encrypted_key, config')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !keyData) {
      throw new ApiError(404, 'API key not found');
    }

    // Decrypt the key
    const apiKey = decrypt(keyData.encrypted_key);

    // Test the key based on provider
    let testResult;
    try {
      testResult = await testProviderKey(keyData.provider, apiKey, keyData.config);
    } catch (testError) {
      // Update key as invalid
      await supabase
        .from('user_provider_keys')
        .update({
          is_valid: false,
          validation_error: testError.message,
          last_validated_at: new Date().toISOString(),
        })
        .eq('id', id);

      throw new ApiError(400, `API key validation failed: ${testError.message}`);
    }

    // Update key as valid
    await supabase
      .from('user_provider_keys')
      .update({
        is_valid: true,
        validation_error: null,
        last_validated_at: new Date().toISOString(),
      })
      .eq('id', id);

    logger.info(
      { userId: req.user.id, keyId: id, provider: keyData.provider },
      'API key validated successfully'
    );

    res.json({
      success: true,
      message: `${PROVIDER_INFO[keyData.provider].name} API key is valid`,
      data: testResult,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Test provider API key
 */
async function testProviderKey(provider, apiKey, config = {}) {
  switch (provider) {
    case 'openai': {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Invalid API key');
      }
      return { models: (await response.json()).data?.length || 0 };
    }

    case 'anthropic': {
      // Anthropic doesn't have a simple models endpoint, so we just verify the key format
      if (!apiKey.startsWith('sk-ant-')) {
        throw new Error('Invalid Anthropic API key format (should start with sk-ant-)');
      }
      return { format: 'valid' };
    }

    case 'google': {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Invalid API key');
      }
      return { models: (await response.json()).models?.length || 0 };
    }

    case 'groq': {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Invalid API key');
      }
      return { models: (await response.json()).data?.length || 0 };
    }

    case 'mistral': {
      const response = await fetch('https://api.mistral.ai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid API key');
      }
      return { models: (await response.json()).data?.length || 0 };
    }

    case 'cohere': {
      const response = await fetch('https://api.cohere.ai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!response.ok) {
        throw new Error('Invalid API key');
      }
      return { models: (await response.json()).models?.length || 0 };
    }

    case 'ollama': {
      const baseUrl = config.base_url || 'http://localhost:11434';
      const response = await fetch(`${baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error('Ollama not reachable at ' + baseUrl);
      }
      return { models: (await response.json()).models?.length || 0 };
    }

    default:
      // For other providers, just verify key is not empty
      if (!apiKey || apiKey.length < 10) {
        throw new Error('API key too short');
      }
      return { format: 'valid' };
  }
}

/**
 * Internal: Get decrypted API key for a provider (used by AI service)
 */
export async function getUserProviderKey(userId, provider) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('user_provider_keys')
    .select('id, encrypted_key, config')
    .eq('user_id', userId)
    .eq('provider', provider)
    .eq('is_active', true)
    .eq('is_valid', true)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    apiKey: decrypt(data.encrypted_key),
    config: data.config,
  };
}

export default router;
