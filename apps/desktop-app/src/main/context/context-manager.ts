/**
 * LLM Context Manager - Local storage for AI model contexts
 * 
 * Stores various types of context locally:
 * - System prompts / Custom instructions
 * - Database schemas (auto-generated)
 * - Knowledge documents
 * - Conversation memory summaries
 * - Project-specific contexts
 */

import Store from 'electron-store';
import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

// =============================================================================
// TYPES
// =============================================================================

export type ContextType = 
  | 'system_prompt'      // Custom instructions for AI behavior
  | 'database_schema'    // Auto-generated from connected databases
  | 'knowledge_base'     // User-uploaded documents/knowledge
  | 'memory_summary'     // Compressed conversation memory
  | 'project'           // Project-specific context
  | 'template';         // Reusable prompt templates

export interface ContextMetadata {
  id: string;
  name: string;
  type: ContextType;
  description?: string;
  tags: string[];
  tokenCount: number;
  charCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  usageCount: number;
  isActive: boolean;
  priority: number;        // Higher = included first in context window
  maxTokens?: number;      // Optional limit for this context
  autoInclude: boolean;    // Automatically include in all chats
  connectionId?: string;   // For database schemas
  projectId?: string;      // For project contexts
  sourceFile?: string;     // For knowledge base (file path)
}

export interface LLMContext extends ContextMetadata {
  content: string;
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

// =============================================================================
// TOKEN ESTIMATION
// =============================================================================

/**
 * Estimate token count for text (rough approximation)
 * GPT-style: ~4 chars per token on average
 */
function estimateTokens(text: string): number {
  if (!text) return 0;
  // More accurate estimation: split by words and punctuation
  const words = text.split(/\s+/).length;
  const chars = text.length;
  // Hybrid approach: average of word-based and char-based estimates
  return Math.ceil((words * 1.3 + chars / 4) / 2);
}

// =============================================================================
// CONTEXT MANAGER CLASS
// =============================================================================

export class ContextManager {
  private store: Store<{ contexts: LLMContext[] }>;
  private contexts: Map<string, LLMContext> = new Map();
  private knowledgeBasePath: string;

  constructor() {
    this.store = new Store<{ contexts: LLMContext[] }>({
      name: 'llm-contexts',
      defaults: {
        contexts: [] as LLMContext[],
      },
    });

    // Path for storing larger knowledge base files
    this.knowledgeBasePath = path.join(app.getPath('userData'), 'knowledge-base');
    this.ensureKnowledgeBaseDir();

    this.loadContexts();
  }

  private ensureKnowledgeBaseDir() {
    if (!fs.existsSync(this.knowledgeBasePath)) {
      fs.mkdirSync(this.knowledgeBasePath, { recursive: true });
    }
  }

  private loadContexts() {
    const saved = this.store.get('contexts', []);
    saved.forEach((ctx: any) => {
      ctx.createdAt = new Date(ctx.createdAt);
      ctx.updatedAt = new Date(ctx.updatedAt);
      if (ctx.lastUsedAt) ctx.lastUsedAt = new Date(ctx.lastUsedAt);
      this.contexts.set(ctx.id, ctx);
    });
  }

  private saveContexts() {
    const contexts = Array.from(this.contexts.values());
    this.store.set('contexts', contexts);
  }

  // ---------------------------------------------------------------------------
  // CRUD OPERATIONS
  // ---------------------------------------------------------------------------

  /**
   * Create a new context
   */
  create(data: {
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
  }): LLMContext {
    const id = randomUUID();
    const now = new Date();
    const tokenCount = estimateTokens(data.content);

    const context: LLMContext = {
      id,
      name: data.name,
      type: data.type,
      content: data.content,
      description: data.description || '',
      tags: data.tags || [],
      tokenCount,
      charCount: data.content.length,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      isActive: true,
      priority: data.priority ?? 50,
      autoInclude: data.autoInclude ?? false,
      connectionId: data.connectionId,
      projectId: data.projectId,
      maxTokens: data.maxTokens,
    };

    this.contexts.set(id, context);
    this.saveContexts();

    return context;
  }

  /**
   * Get context by ID
   */
  get(id: string): LLMContext | undefined {
    return this.contexts.get(id);
  }

  /**
   * Update an existing context
   */
  update(id: string, updates: Partial<Omit<LLMContext, 'id' | 'createdAt'>>): LLMContext | undefined {
    const context = this.contexts.get(id);
    if (!context) return undefined;

    // Recalculate tokens if content changed
    if (updates.content !== undefined) {
      updates.tokenCount = estimateTokens(updates.content);
      updates.charCount = updates.content.length;
    }

    const updated: LLMContext = {
      ...context,
      ...updates,
      updatedAt: new Date(),
    };

    this.contexts.set(id, updated);
    this.saveContexts();

    return updated;
  }

  /**
   * Delete a context
   */
  delete(id: string): boolean {
    const context = this.contexts.get(id);
    if (!context) return false;

    // Clean up associated files for knowledge base
    if (context.type === 'knowledge_base' && context.sourceFile) {
      const filePath = path.join(this.knowledgeBasePath, context.sourceFile);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    this.contexts.delete(id);
    this.saveContexts();
    return true;
  }

  /**
   * List all contexts with optional filtering
   */
  list(options?: ContextSearchOptions): LLMContext[] {
    let results = Array.from(this.contexts.values());

    if (options) {
      if (options.type) {
        results = results.filter(c => c.type === options.type);
      }
      if (options.tags && options.tags.length > 0) {
        results = results.filter(c => 
          options.tags!.some(tag => c.tags.includes(tag))
        );
      }
      if (options.isActive !== undefined) {
        results = results.filter(c => c.isActive === options.isActive);
      }
      if (options.autoInclude !== undefined) {
        results = results.filter(c => c.autoInclude === options.autoInclude);
      }
      if (options.connectionId) {
        results = results.filter(c => c.connectionId === options.connectionId);
      }
      if (options.projectId) {
        results = results.filter(c => c.projectId === options.projectId);
      }
      if (options.query) {
        const q = options.query.toLowerCase();
        results = results.filter(c => 
          c.name.toLowerCase().includes(q) ||
          c.content.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
        );
      }
    }

    // Sort by priority (higher first), then by updatedAt
    return results.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }

  // ---------------------------------------------------------------------------
  // CONTEXT COMPILATION
  // ---------------------------------------------------------------------------

  /**
   * Compile contexts into a single context window for LLM
   */
  compile(options: {
    config: ContextWindowConfig;
    connectionId?: string;
    projectId?: string;
    additionalContextIds?: string[];
    excludeIds?: string[];
  }): CompiledContext {
    const { config, connectionId, projectId, additionalContextIds = [], excludeIds = [] } = options;
    
    // Calculate available tokens
    const availableTokens = config.maxTokens - config.reservedForResponse - config.reservedForConversation;
    
    // Get all relevant contexts
    let contexts: LLMContext[] = [];
    
    // 1. Auto-include contexts (highest priority)
    const autoInclude = this.list({ isActive: true, autoInclude: true });
    contexts.push(...autoInclude);
    
    // 2. Connection-specific contexts (database schemas)
    if (connectionId) {
      const connectionContexts = this.list({ isActive: true, connectionId });
      contexts.push(...connectionContexts.filter(c => !contexts.find(x => x.id === c.id)));
    }
    
    // 3. Project-specific contexts
    if (projectId) {
      const projectContexts = this.list({ isActive: true, projectId });
      contexts.push(...projectContexts.filter(c => !contexts.find(x => x.id === c.id)));
    }
    
    // 4. Additional requested contexts
    additionalContextIds.forEach(id => {
      const ctx = this.get(id);
      if (ctx && ctx.isActive && !contexts.find(x => x.id === id)) {
        contexts.push(ctx);
      }
    });
    
    // Remove excluded contexts
    contexts = contexts.filter(c => !excludeIds.includes(c.id));
    
    // Sort by priority
    contexts.sort((a, b) => b.priority - a.priority);
    
    // Fit contexts into token budget
    const includedContexts: LLMContext[] = [];
    let totalTokens = 0;
    let truncated = false;
    
    for (const ctx of contexts) {
      const ctxTokens = ctx.maxTokens ? Math.min(ctx.tokenCount, ctx.maxTokens) : ctx.tokenCount;
      
      if (totalTokens + ctxTokens <= availableTokens) {
        includedContexts.push(ctx);
        totalTokens += ctxTokens;
        
        // Update usage stats
        this.recordUsage(ctx.id);
      } else {
        // Smart truncation: try to include a truncated version of the context
        const remainingTokens = availableTokens - totalTokens;
        
        if (remainingTokens > 200) {
          // Include a truncated version (estimate chars from tokens)
          const maxChars = remainingTokens * 3; // conservative estimate
          const truncatedContent = ctx.content.slice(0, maxChars) + 
            '\n\n[... context truncated to fit token window ...]';
          
          const truncatedCtx: LLMContext = {
            ...ctx,
            content: truncatedContent,
            tokenCount: estimateTokens(truncatedContent),
          };
          
          includedContexts.push(truncatedCtx);
          totalTokens += truncatedCtx.tokenCount;
          this.recordUsage(ctx.id);
        }
        
        truncated = true;
        break; // Stop adding more contexts
      }
    }
    
    // Build system prompt from included contexts
    const systemPromptParts: string[] = [];
    
    // Group by type for better organization
    const systemPrompts = includedContexts.filter(c => c.type === 'system_prompt');
    const schemas = includedContexts.filter(c => c.type === 'database_schema');
    const knowledge = includedContexts.filter(c => c.type === 'knowledge_base');
    const memory = includedContexts.filter(c => c.type === 'memory_summary');
    const templates = includedContexts.filter(c => c.type === 'template');
    const projects = includedContexts.filter(c => c.type === 'project');
    
    // Build organized system prompt
    if (systemPrompts.length > 0) {
      systemPromptParts.push('## Instructions\n' + systemPrompts.map(c => c.content).join('\n\n'));
    }
    
    if (schemas.length > 0) {
      systemPromptParts.push('## Database Schema\n' + schemas.map(c => 
        `### ${c.name}\n${c.content}`
      ).join('\n\n'));
    }
    
    if (knowledge.length > 0) {
      systemPromptParts.push('## Knowledge Base\n' + knowledge.map(c => 
        `### ${c.name}\n${c.content}`
      ).join('\n\n'));
    }
    
    if (memory.length > 0) {
      systemPromptParts.push('## Previous Context\n' + memory.map(c => c.content).join('\n\n'));
    }
    
    if (projects.length > 0) {
      systemPromptParts.push('## Project Context\n' + projects.map(c => 
        `### ${c.name}\n${c.content}`
      ).join('\n\n'));
    }
    
    return {
      contexts: includedContexts,
      totalTokens,
      systemPrompt: systemPromptParts.join('\n\n---\n\n'),
      truncated,
    };
  }

  /**
   * Record usage of a context
   */
  private recordUsage(id: string) {
    const context = this.contexts.get(id);
    if (context) {
      context.usageCount++;
      context.lastUsedAt = new Date();
      this.contexts.set(id, context);
      // Debounce save to avoid too many writes
      this.debouncedSave();
    }
  }

  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private debouncedSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.saveContexts(), 5000);
  }

  // ---------------------------------------------------------------------------
  // DATABASE SCHEMA GENERATION
  // ---------------------------------------------------------------------------

  /**
   * Generate and store database schema context from connection
   */
  createDatabaseSchemaContext(data: {
    connectionId: string;
    connectionName: string;
    tables: Array<{
      name: string;
      schema?: string;
      columns: Array<{
        name: string;
        type: string;
        nullable: boolean;
        primaryKey?: boolean;
        foreignKey?: { table: string; column: string };
      }>;
    }>;
  }): LLMContext {
    // Build schema description
    let schemaContent = `Database: ${data.connectionName}\n\n`;
    
    for (const table of data.tables) {
      const tableName = table.schema ? `${table.schema}.${table.name}` : table.name;
      schemaContent += `Table: ${tableName}\n`;
      schemaContent += `Columns:\n`;
      
      for (const col of table.columns) {
        let colDesc = `  - ${col.name}: ${col.type}`;
        if (col.primaryKey) colDesc += ' (PRIMARY KEY)';
        if (!col.nullable) colDesc += ' NOT NULL';
        if (col.foreignKey) colDesc += ` -> ${col.foreignKey.table}.${col.foreignKey.column}`;
        schemaContent += colDesc + '\n';
      }
      schemaContent += '\n';
    }

    // Check if schema already exists for this connection
    const existing = this.list({ 
      type: 'database_schema', 
      connectionId: data.connectionId 
    });

    if (existing.length > 0) {
      // Update existing
      return this.update(existing[0].id, {
        content: schemaContent,
        name: `Schema: ${data.connectionName}`,
      })!;
    }

    // Create new
    return this.create({
      name: `Schema: ${data.connectionName}`,
      type: 'database_schema',
      content: schemaContent,
      description: `Auto-generated schema for ${data.connectionName}`,
      connectionId: data.connectionId,
      priority: 80, // High priority for schemas
      autoInclude: false, // Only include when connected to this DB
      tags: ['database', 'schema', 'auto-generated'],
    });
  }

  // ---------------------------------------------------------------------------
  // KNOWLEDGE BASE MANAGEMENT
  // ---------------------------------------------------------------------------

  /**
   * Import a text file as knowledge base context
   */
  importKnowledgeFile(filePath: string, options?: {
    name?: string;
    tags?: string[];
    chunkSize?: number; // Split large files into chunks
  }): LLMContext[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    const name = options?.name || fileName;
    
    // For large files, split into chunks
    const chunkSize = options?.chunkSize || 8000; // ~2000 tokens
    const createdContexts: LLMContext[] = [];
    
    if (content.length > chunkSize) {
      const chunks = this.splitIntoChunks(content, chunkSize);
      chunks.forEach((chunk, index) => {
        const ctx = this.create({
          name: `${name} (Part ${index + 1}/${chunks.length})`,
          type: 'knowledge_base',
          content: chunk,
          description: `Imported from ${fileName}`,
          tags: options?.tags || ['imported'],
          priority: 30,
        });
        createdContexts.push(ctx);
      });
    } else {
      const ctx = this.create({
        name,
        type: 'knowledge_base',
        content,
        description: `Imported from ${fileName}`,
        tags: options?.tags || ['imported'],
        priority: 30,
      });
      createdContexts.push(ctx);
    }
    
    return createdContexts;
  }

  private splitIntoChunks(text: string, maxChars: number): string[] {
    const chunks: string[] = [];
    const paragraphs = text.split(/\n\n+/);
    let currentChunk = '';
    
    for (const para of paragraphs) {
      if (currentChunk.length + para.length + 2 > maxChars) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = para;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + para;
      }
    }
    
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }

  // ---------------------------------------------------------------------------
  // MEMORY MANAGEMENT
  // ---------------------------------------------------------------------------

  /**
   * Create a memory summary from a conversation
   */
  createMemorySummary(data: {
    conversationId: string;
    summary: string;
    keyFacts: string[];
  }): LLMContext {
    const content = `Conversation Summary:\n${data.summary}\n\nKey Facts:\n${data.keyFacts.map(f => `- ${f}`).join('\n')}`;
    
    return this.create({
      name: `Memory: ${new Date().toLocaleDateString()}`,
      type: 'memory_summary',
      content,
      description: `Summary from conversation ${data.conversationId}`,
      priority: 40,
      tags: ['memory', 'auto-generated'],
    });
  }

  // ---------------------------------------------------------------------------
  // TEMPLATES
  // ---------------------------------------------------------------------------

  /**
   * Get default prompt templates
   */
  getDefaultTemplates(): Array<Omit<LLMContext, 'id' | 'createdAt' | 'updatedAt' | 'lastUsedAt' | 'usageCount' | 'charCount' | 'tokenCount'>> {
    return [
      {
        name: 'SQL Expert',
        type: 'system_prompt',
        content: `You are an expert SQL developer. When given a natural language query:
1. Analyze the user's intent carefully
2. Generate efficient, well-formatted SQL
3. Explain any complex parts of the query
4. Suggest optimizations if applicable
5. Always consider NULL handling and edge cases`,
        description: 'Expert SQL query generation',
        tags: ['sql', 'database'],
        isActive: true,
        priority: 100,
        autoInclude: false,
      },
      {
        name: 'Data Analyst',
        type: 'system_prompt',
        content: `You are a data analyst assistant. Help users:
1. Explore and understand their data
2. Identify patterns and trends
3. Suggest relevant visualizations
4. Provide statistical insights
5. Recommend data cleaning steps when needed`,
        description: 'Data analysis and insights',
        tags: ['analysis', 'data'],
        isActive: true,
        priority: 100,
        autoInclude: false,
      },
      {
        name: 'Concise Responses',
        type: 'system_prompt',
        content: `Be concise and direct. Provide brief, actionable answers without unnecessary elaboration. Use bullet points when listing multiple items.`,
        description: 'Shorter, more direct responses',
        tags: ['style', 'concise'],
        isActive: true,
        priority: 90,
        autoInclude: false,
      },
    ];
  }

  /**
   * Initialize default templates if none exist
   */
  initializeDefaults() {
    const existing = this.list({ type: 'system_prompt' });
    if (existing.length === 0) {
      const defaults = this.getDefaultTemplates();
      defaults.forEach(template => {
        this.create({
          name: template.name,
          type: template.type,
          content: template.content,
          description: template.description,
          tags: template.tags,
          priority: template.priority,
          autoInclude: template.autoInclude,
        });
      });
    }
  }

  // ---------------------------------------------------------------------------
  // STATISTICS
  // ---------------------------------------------------------------------------

  /**
   * Get storage statistics
   */
  getStats(): {
    totalContexts: number;
    byType: Record<ContextType, number>;
    totalTokens: number;
    totalChars: number;
    mostUsed: LLMContext[];
  } {
    const contexts = Array.from(this.contexts.values());
    
    const byType: Record<ContextType, number> = {
      system_prompt: 0,
      database_schema: 0,
      knowledge_base: 0,
      memory_summary: 0,
      project: 0,
      template: 0,
    };
    
    let totalTokens = 0;
    let totalChars = 0;
    
    contexts.forEach(ctx => {
      byType[ctx.type]++;
      totalTokens += ctx.tokenCount;
      totalChars += ctx.charCount;
    });
    
    const mostUsed = [...contexts]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);
    
    return {
      totalContexts: contexts.length,
      byType,
      totalTokens,
      totalChars,
      mostUsed,
    };
  }

  // ---------------------------------------------------------------------------
  // EXPORT/IMPORT
  // ---------------------------------------------------------------------------

  /**
   * Export all contexts to JSON
   */
  exportAll(): string {
    const contexts = Array.from(this.contexts.values());
    return JSON.stringify(contexts, null, 2);
  }

  /**
   * Import contexts from JSON
   */
  importFromJson(json: string, options?: { overwrite?: boolean }): number {
    const imported: LLMContext[] = JSON.parse(json);
    let count = 0;
    
    imported.forEach(ctx => {
      if (options?.overwrite || !this.contexts.has(ctx.id)) {
        ctx.createdAt = new Date(ctx.createdAt);
        ctx.updatedAt = new Date(ctx.updatedAt);
        if (ctx.lastUsedAt) ctx.lastUsedAt = new Date(ctx.lastUsedAt);
        this.contexts.set(ctx.id, ctx);
        count++;
      }
    });
    
    this.saveContexts();
    return count;
  }
}

// Singleton instance
export const contextManager = new ContextManager();
