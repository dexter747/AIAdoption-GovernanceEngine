/**
 * LLM Context Types - Exported for use in renderer
 * 
 * These types mirror the types defined in the main process context manager.
 */

export type ContextType = 
  | 'system_prompt'
  | 'database_schema'
  | 'knowledge_base'
  | 'memory_summary'
  | 'project'
  | 'template';

export interface LLMContext {
  id: string;
  name: string;
  type: ContextType;
  content: string;
  description?: string;
  tags: string[];
  tokenCount: number;
  charCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  usageCount: number;
  isActive: boolean;
  priority: number;
  maxTokens?: number;
  autoInclude: boolean;
  connectionId?: string;
  projectId?: string;
  sourceFile?: string;
}

export interface ContextSearchOptions {
  type?: ContextType;
  tags?: string[];
  isActive?: boolean;
  autoInclude?: boolean;
  connectionId?: string;
  projectId?: string;
  query?: string;
}

export interface ContextWindowConfig {
  maxTokens: number;
  reservedForResponse: number;
  reservedForConversation: number;
}

export interface CompiledContext {
  contexts: LLMContext[];
  totalTokens: number;
  systemPrompt: string;
  truncated: boolean;
}

export interface ContextStats {
  totalContexts: number;
  byType: Record<ContextType, number>;
  totalTokens: number;
  totalChars: number;
  mostUsed: LLMContext[];
}

/**
 * Default context window configurations for different models
 */
export const DEFAULT_CONTEXT_CONFIGS: Record<string, ContextWindowConfig> = {
  'gpt-4o': {
    maxTokens: 128000,
    reservedForResponse: 4096,
    reservedForConversation: 32000,
  },
  'gpt-4o-mini': {
    maxTokens: 128000,
    reservedForResponse: 4096,
    reservedForConversation: 32000,
  },
  'gpt-4-turbo': {
    maxTokens: 128000,
    reservedForResponse: 4096,
    reservedForConversation: 32000,
  },
  'gpt-3.5-turbo': {
    maxTokens: 16385,
    reservedForResponse: 2048,
    reservedForConversation: 8000,
  },
  'claude-3-5-sonnet-20241022': {
    maxTokens: 200000,
    reservedForResponse: 8192,
    reservedForConversation: 50000,
  },
  'claude-3-opus-20240229': {
    maxTokens: 200000,
    reservedForResponse: 4096,
    reservedForConversation: 50000,
  },
  'gemini-1.5-pro': {
    maxTokens: 1000000,
    reservedForResponse: 8192,
    reservedForConversation: 100000,
  },
  'gemini-1.5-flash': {
    maxTokens: 1000000,
    reservedForResponse: 8192,
    reservedForConversation: 100000,
  },
  default: {
    maxTokens: 32000,
    reservedForResponse: 2048,
    reservedForConversation: 8000,
  },
};

/**
 * Get context window configuration for a specific model
 */
export function getContextConfigForModel(modelId: string): ContextWindowConfig {
  return DEFAULT_CONTEXT_CONFIGS[modelId] || DEFAULT_CONTEXT_CONFIGS.default;
}

/**
 * Estimate token count for text (rough approximation)
 * Uses a hybrid word + character count approach
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  const words = text.split(/\s+/).length;
  const chars = text.length;
  return Math.ceil((words * 1.3 + chars / 4) / 2);
}
