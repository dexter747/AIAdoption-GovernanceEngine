/**
 * React hook for managing LLM contexts
 */

import { useState, useCallback, useEffect } from 'react';

// Re-export types for convenience
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
 * Hook for managing LLM contexts stored locally
 */
export function useContexts(initialOptions?: ContextSearchOptions) {
  const [contexts, setContexts] = useState<LLMContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ContextStats | null>(null);

  // Load contexts
  const loadContexts = useCallback(async (options?: ContextSearchOptions) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!window.electron?.context?.list) {
        throw new Error('Context API not available. Please restart the application.');
      }
      
      const result = await window.electron.context.list(options);
      // Convert dates from string to Date objects
      const parsed = result.map((ctx: any) => ({
        ...ctx,
        createdAt: new Date(ctx.createdAt),
        updatedAt: new Date(ctx.updatedAt),
        lastUsedAt: ctx.lastUsedAt ? new Date(ctx.lastUsedAt) : undefined,
      }));
      setContexts(parsed);
    } catch (err: any) {
      setError(err.message || 'Failed to load contexts');
      console.error('Failed to load contexts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadContexts(initialOptions);
  }, [loadContexts, initialOptions]);

  // Create a new context
  const createContext = useCallback(async (data: {
    name: string;
    type: ContextType;
    content: string;
    description?: string;
    tags?: string[];
    priority?: number;
    autoInclude?: boolean;
    connectionId?: string;
    projectId?: string;
    maxTokens?: number;
  }): Promise<LLMContext> => {
    const result = await window.electron.context.create(data);
    await loadContexts(initialOptions);
    return result;
  }, [loadContexts, initialOptions]);

  // Update a context
  const updateContext = useCallback(async (id: string, updates: Partial<LLMContext>): Promise<LLMContext> => {
    const result = await window.electron.context.update(id, updates);
    await loadContexts(initialOptions);
    return result;
  }, [loadContexts, initialOptions]);

  // Delete a context
  const deleteContext = useCallback(async (id: string): Promise<void> => {
    await window.electron.context.delete(id);
    await loadContexts(initialOptions);
  }, [loadContexts, initialOptions]);

  // Toggle active state
  const toggleActive = useCallback(async (id: string): Promise<LLMContext> => {
    const result = await window.electron.context.toggleActive(id);
    await loadContexts(initialOptions);
    return result;
  }, [loadContexts, initialOptions]);

  // Toggle auto-include
  const toggleAutoInclude = useCallback(async (id: string): Promise<LLMContext> => {
    const result = await window.electron.context.toggleAutoInclude(id);
    await loadContexts(initialOptions);
    return result;
  }, [loadContexts, initialOptions]);

  // Import knowledge file
  const importKnowledgeFile = useCallback(async (options?: { 
    name?: string; 
    tags?: string[]; 
    chunkSize?: number;
  }): Promise<{ canceled: boolean; contexts: LLMContext[] }> => {
    const result = await window.electron.context.importFile(options);
    if (!result.canceled) {
      await loadContexts(initialOptions);
    }
    return result;
  }, [loadContexts, initialOptions]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      if (!window.electron?.context?.getStats) {
        console.warn('Context API not available yet');
        return null;
      }
      const result = await window.electron.context.getStats();
      setStats(result);
      return result;
    } catch (err: any) {
      console.error('Failed to load context stats:', err);
      return null;
    }
  }, []);

  // Export all contexts
  const exportAllContexts = useCallback(async () => {
    return await window.electron.context.exportAll();
  }, []);

  // Import contexts from JSON
  const importContextsFromJson = useCallback(async (options?: { overwrite?: boolean }) => {
    const result = await window.electron.context.importJson(options);
    if (!result.canceled) {
      await loadContexts(initialOptions);
    }
    return result;
  }, [loadContexts, initialOptions]);

  return {
    contexts,
    loading,
    error,
    stats,
    
    // Actions
    loadContexts,
    createContext,
    updateContext,
    deleteContext,
    toggleActive,
    toggleAutoInclude,
    importKnowledgeFile,
    loadStats,
    exportAllContexts,
    importContextsFromJson,
    
    // Refresh
    refresh: () => loadContexts(initialOptions),
  };
}

/**
 * Hook for compiling contexts into a context window for LLM
 */
export function useCompiledContext() {
  const [compiled, setCompiled] = useState<CompiledContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compile = useCallback(async (options: {
    config: ContextWindowConfig;
    connectionId?: string;
    projectId?: string;
    additionalContextIds?: string[];
    excludeIds?: string[];
  }): Promise<CompiledContext> => {
    try {
      setLoading(true);
      setError(null);
      const result = await window.electron.context.compile(options);
      setCompiled(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to compile contexts');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    compiled,
    loading,
    error,
    compile,
  };
}

/**
 * Hook for getting a single context by ID
 */
export function useContext(id: string | null) {
  const [context, setContext] = useState<LLMContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setContext(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const result = await window.electron.context.get(id);
      if (result) {
        setContext({
          ...result,
          createdAt: new Date(result.createdAt),
          updatedAt: new Date(result.updatedAt),
          lastUsedAt: result.lastUsedAt ? new Date(result.lastUsedAt) : undefined,
        } as LLMContext);
      } else {
        setContext(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load context');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    context,
    loading,
    error,
    refresh: load,
  };
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
  default: {
    maxTokens: 32000,
    reservedForResponse: 2048,
    reservedForConversation: 8000,
  },
};

/**
 * Get context config for a model
 */
export function getContextConfigForModel(modelId: string): ContextWindowConfig {
  return DEFAULT_CONTEXT_CONFIGS[modelId] || DEFAULT_CONTEXT_CONFIGS.default;
}
