# LLM Context Storage System

## Overview

The Local Context Storage System provides persistent storage for LLM contexts on the user's device. This allows users to:

1. **Store custom system prompts** - Define AI behavior and expertise
2. **Auto-generate database schemas** - Automatically extract and store schemas from connected databases
3. **Import knowledge files** - Load text documents, markdown, SQL files as context
4. **Create conversation memories** - Summarize and persist key information from conversations
5. **Manage project-specific contexts** - Group contexts by project for easy switching

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Renderer Process                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  ContextManager  │  │ ContextSelector  │  │   useContexts │  │
│  │    Component     │  │    Component     │  │     Hook      │  │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘  │
└───────────┼─────────────────────┼────────────────────┼──────────┘
            │                     │                    │
            └──────────────────IPC Bridge──────────────┘
                                  │
┌─────────────────────────────────┼───────────────────────────────┐
│                        Main Process                              │
│                                 │                                │
│  ┌──────────────────────────────▼─────────────────────────────┐ │
│  │                    IPC Handlers                             │ │
│  │  context:create, context:get, context:update, context:delete│ │
│  │  context:list, context:compile, context:import-file, etc.  │ │
│  └──────────────────────────────┬─────────────────────────────┘ │
│                                 │                                │
│  ┌──────────────────────────────▼─────────────────────────────┐ │
│  │                   ContextManager                            │ │
│  │  - CRUD operations for contexts                             │ │
│  │  - Context compilation for LLM queries                      │ │
│  │  - Token estimation                                         │ │
│  │  - Knowledge file import with chunking                      │ │
│  │  - Database schema generation                               │ │
│  └──────────────────────────────┬─────────────────────────────┘ │
│                                 │                                │
│  ┌──────────────────────────────▼─────────────────────────────┐ │
│  │                   electron-store                            │ │
│  │  Encrypted local storage (llm-contexts.json)                │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Context Types

| Type              | Description                             | Priority    | Auto-include   |
| ----------------- | --------------------------------------- | ----------- | -------------- |
| `system_prompt`   | Custom instructions for AI behavior     | High (100)  | Optional       |
| `database_schema` | Auto-generated from connected databases | High (80)   | Per-connection |
| `knowledge_base`  | Imported documents and files            | Medium (30) | Optional       |
| `memory_summary`  | Compressed conversation memory          | Medium (40) | Optional       |
| `project`         | Project-specific context                | Medium (50) | Per-project    |
| `template`        | Reusable prompt templates               | Varies      | Optional       |

## Usage

### In React Components

```tsx
import { useContexts, useCompiledContext } from '../hooks/useContexts';

function MyComponent() {
  const { contexts, loading, createContext, deleteContext, toggleActive, importKnowledgeFile } =
    useContexts();

  // Create a new system prompt
  const handleCreate = async () => {
    await createContext({
      name: 'SQL Expert',
      type: 'system_prompt',
      content: 'You are an expert SQL developer...',
      tags: ['sql', 'database'],
      priority: 100,
      autoInclude: true,
    });
  };

  // Import a knowledge file
  const handleImport = async () => {
    const result = await importKnowledgeFile({
      name: 'API Documentation',
      tags: ['docs', 'api'],
    });
    if (!result.canceled) {
      console.log(`Imported ${result.contexts.length} contexts`);
    }
  };

  return (
    <div>
      {contexts.map(ctx => (
        <div key={ctx.id}>
          {ctx.name} - {ctx.tokenCount} tokens
          <button onClick={() => toggleActive(ctx.id)}>
            {ctx.isActive ? 'Disable' : 'Enable'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Using the Context Selector

```tsx
import ContextSelector from '../components/ContextSelector';

function ChatInterface() {
  const [selectedContextIds, setSelectedContextIds] = useState<string[]>([]);

  return (
    <div>
      <ContextSelector
        selectedIds={selectedContextIds}
        onSelectionChange={setSelectedContextIds}
        connectionId={currentConnectionId}
        compact
      />
      {/* Chat interface */}
    </div>
  );
}
```

### Compiling Contexts for AI Queries

The context system automatically compiles relevant contexts when making AI queries:

1. Auto-included contexts (highest priority)
2. Connection-specific schemas (when database connected)
3. Project-specific contexts (when project selected)
4. Manually selected contexts

The compilation respects token budgets for each model:

| Model             | Context Window | Reserved for Response | Reserved for Conversation |
| ----------------- | -------------- | --------------------- | ------------------------- |
| GPT-4o            | 128K           | 4K                    | 32K                       |
| Claude 3.5 Sonnet | 200K           | 8K                    | 50K                       |
| Gemini 1.5 Pro    | 1M             | 8K                    | 100K                      |

## API Reference

### Main Process (ContextManager)

```typescript
// Create context
contextManager.create({
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
}): LLMContext;

// Compile contexts for LLM
contextManager.compile({
  config: ContextWindowConfig;
  connectionId?: string;
  projectId?: string;
  additionalContextIds?: string[];
  excludeIds?: string[];
}): CompiledContext;

// Generate database schema context
contextManager.createDatabaseSchemaContext({
  connectionId: string;
  connectionName: string;
  tables: TableSchema[];
}): LLMContext;

// Import knowledge file
contextManager.importKnowledgeFile(
  filePath: string,
  options?: { name?: string; tags?: string[]; chunkSize?: number }
): LLMContext[];
```

### IPC Handlers

All context operations are exposed via IPC:

- `context:create` - Create a new context
- `context:get` - Get context by ID
- `context:update` - Update existing context
- `context:delete` - Delete a context
- `context:list` - List contexts with filtering
- `context:compile` - Compile contexts for LLM
- `context:create-schema` - Generate database schema context
- `context:import-file` - Import knowledge file (with file picker)
- `context:import-file-path` - Import from specific path
- `context:create-memory` - Create conversation memory
- `context:stats` - Get storage statistics
- `context:export` - Export all contexts to JSON
- `context:import-json` - Import contexts from JSON
- `context:toggle-active` - Toggle active state
- `context:toggle-auto-include` - Toggle auto-include

### Preload API

Access via `window.electron.context`:

```typescript
window.electron.context.create(data);
window.electron.context.list({ type: 'system_prompt', isActive: true });
window.electron.context.compile({ config, connectionId });
window.electron.context.importFile({ tags: ['docs'] });
window.electron.context.getStats();
// ... and more
```

## Storage Location

Contexts are stored in the Electron user data directory:

- **macOS**: `~/Library/Application Support/velanova/llm-contexts.json`
- **Windows**: `%APPDATA%/velanova/llm-contexts.json`
- **Linux**: `~/.config/velanova/llm-contexts.json`

Knowledge base files are stored in:

- `<userData>/knowledge-base/`

## Default Templates

The system initializes with default templates if none exist:

1. **SQL Expert** - Expert SQL query generation
2. **Data Analyst** - Data analysis and insights
3. **Concise Responses** - Shorter, more direct responses

## Token Estimation

Tokens are estimated using a hybrid approach:

```
tokens ≈ (words × 1.3 + characters / 4) / 2
```

This provides a reasonable approximation for GPT-style tokenizers.

## Best Practices

1. **Keep contexts focused** - One topic per context for better control
2. **Use tags** - Organize contexts with meaningful tags
3. **Set priorities** - Higher priority contexts are included first
4. **Use auto-include sparingly** - Only for always-needed context
5. **Monitor token usage** - Check stats to avoid exceeding limits
6. **Export regularly** - Back up your contexts periodically
