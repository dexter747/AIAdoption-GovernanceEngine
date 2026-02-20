# System Architecture - Desktop App + Express Backend

## Complete System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DESKTOP APP (Electron)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                    RENDERER PROCESS (React)                    │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │                                                                 │ │
│  │  ChatPage.tsx                                                  │ │
│  │  ├─ ModelSelector (select AI provider & model)                │ │
│  │  ├─ ChatHistorySidebar (conversations list)                   │ │
│  │  ├─ Message List (user + AI messages)                         │ │
│  │  ├─ Input Textarea (with auto-resize)                         │ │
│  │  └─ Connection Selector (database dropdown)                   │ │
│  │                                                                 │ │
│  │  ConnectionsPageEnhanced.tsx                                   │ │
│  │  ├─ Connection List (with status)                             │ │
│  │  ├─ Enable/Disable Toggle                                     │ │
│  │  ├─ Add Connection Modal                                      │ │
│  │  └─ Delete Confirmation                                       │ │
│  │                                                                 │ │
│  └────────────────────┬──────────────────────────────────────────┘ │
│                       │                                              │
│                       │ window.electron.* (IPC)                     │
│                       │                                              │
│  ┌────────────────────▼──────────────────────────────────────────┐ │
│  │                    PRELOAD SCRIPT                              │ │
│  │  (contextBridge - secure IPC exposure)                        │ │
│  └────────────────────┬──────────────────────────────────────────┘ │
│                       │                                              │
│  ┌────────────────────▼──────────────────────────────────────────┐ │
│  │                    MAIN PROCESS (Node.js)                      │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │                                                                 │ │
│  │  IPC Handlers (75+ handlers)                                   │ │
│  │  ├─ mcp:* (10 handlers)                                       │ │
│  │  ├─ chat:* (14 handlers)                                      │ │
│  │  ├─ express:* (11 handlers)                                   │ │
│  │  └─ connection:*, auth:*, license:*, settings:*, system:*     │ │
│  │                                                                 │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  Express API Client                                       │ │ │
│  │  │  ├─ checkHealth()                                         │ │ │
│  │  │  ├─ getProviders() ──────────────────┐                   │ │ │
│  │  │  ├─ queryAI() ────────────────────────┼───────────────┐  │ │ │
│  │  │  ├─ validateLicense()                 │               │  │ │ │
│  │  │  └─ logUsage()                        │               │  │ │ │
│  │  └──────────────────────────────────────┼───────────────┼──┘ │ │
│  │                                          │               │    │ │
│  │  ┌──────────────────────────────────────┼───────────────┼──┐ │ │
│  │  │  MCP Connection Manager              │               │  │ │ │
│  │  │  ├─ Docker-based servers             │               │  │ │ │
│  │  │  ├─ npm-based servers                │               │  │ │ │
│  │  │  └─ electron-store (persistence)     │               │  │ │ │
│  │  └──────────────────────────────────────┘               │  │ │ │
│  │                                                          │  │ │ │
│  │  ┌──────────────────────────────────────────────────────┼──┘ │ │
│  │  │  Chat History Manager                                │    │ │
│  │  │  ├─ CRUD conversations                               │    │ │
│  │  │  ├─ Search conversations                             │    │ │
│  │  │  └─ electron-store (local JSON)                      │    │ │
│  │  └──────────────────────────────────────────────────────┘    │ │
│  │                                                                 │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                │ HTTP (fetch)
                                │
        ┌───────────────────────▼───────────────────────┐
        │         EXPRESS BACKEND (Node.js)            │
        ├──────────────────────────────────────────────┤
        │                                               │
        │  AI Router → 15 AI Providers                 │
        │  ├─ OpenAI (GPT-3.5, GPT-4)                 │
        │  ├─ Anthropic (Claude 3.x)                  │
        │  ├─ Google (Gemini)                         │
        │  ├─ Groq (Llama - FREE!)                    │
        │  ├─ Mistral, Cohere, Perplexity             │
        │  └─ 9 more providers...                     │
        │                                               │
        │  License Manager + Usage Tracker             │
        │                                               │
        └───────────────────┬───────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  SUPABASE (PostgreSQL)│
                │  ├─ users             │
                │  ├─ licenses          │
                │  └─ usage_logs        │
                └───────────────────────┘
```

## Key Components

### 1. ChatPage (600 lines)
- Full-screen chat interface
- Model selector at bottom
- Chat history sidebar (toggle-able)
- Real-time token/cost tracking

### 2. ModelSelector (200 lines)
- Loads 15 AI providers from Express API
- 50+ models to choose from
- Shows pricing and context window

### 3. ChatHistorySidebar (400 lines)
- Lists all conversations
- Search functionality
- Pin/archive/delete actions
- Usage statistics

### 4. Express API Client (160 lines)
- Connects desktop app to Express backend
- All 11 endpoints implemented

### 5. MCP Manager (420 lines)
- Manages database connections
- Docker + npm support
- 10+ database types

### 6. Chat History Manager (380 lines)
- Local conversation storage
- Search and analytics
- electron-store persistence

## Data Flow: Send Message

```
User types message
    ↓
ChatPage.tsx captures input
    ↓
window.electron.chat.createConversation() [if new]
    ↓
window.electron.express.queryAI()
    ↓
IPC → Express API Client → Express Backend
    ↓
AI Provider (OpenAI/Groq/etc.) returns response
    ↓
Response + usage stats returned to ChatPage
    ↓
Message saved to local chat history
    ↓
Usage logged to Supabase
```

## Storage

### Local (electron-store)
```
~/.config/velanova/
├── chat-history.json       # All conversations
└── mcp-connections.json    # Database connections
```

### Cloud (Supabase)
```sql
users, licenses, usage_logs, api_keys, subscriptions
```

## Technologies

- **Electron**: Desktop framework
- **React**: UI components
- **TypeScript**: Type safety
- **Express**: Backend API
- **Supabase**: PostgreSQL database
- **Docker**: MCP containers
- **15 AI SDKs**: OpenAI, Anthropic, Google, Groq, etc.

## Security

1. Renderer sandboxed (no Node.js access)
2. contextBridge for secure IPC
3. Main process validates all requests
4. API keys encrypted in backend
5. Supabase row-level security

## Performance

- Local-first (instant UI updates)
- Async IPC (non-blocking)
- Handles 1000+ conversations
- Sub-second search

---

**See also**:
- [IMPLEMENTATION-COMPLETE.md](./IMPLEMENTATION-COMPLETE.md) - What was built
- [CHAT-INTERFACE-GUIDE.md](./CHAT-INTERFACE-GUIDE.md) - Testing guide
- [DESKTOP-APP-IMPLEMENTATION.md](./DESKTOP-APP-IMPLEMENTATION.md) - Technical details
