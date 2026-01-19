# AI Nexus Backend Architecture
**Simplified, Production-Ready Design**

*Last Updated: January 19, 2026*

---

## Quick Answers to Your Questions

### 1. What Actually Costs Money?

| Component | Cost Type | Notes |
|-----------|-----------|-------|
| **LLM API Calls** | ✅ Per-token | OpenAI, Anthropic, Google, Groq, etc. |
| **Database (Supabase)** | Free tier / $25/mo Pro | Already using, works fine |
| **Enterprise APIs** | License-based | SAP, Salesforce = org licenses, not per-call |
| **Docker/VM Hosting** | Infrastructure | Only if you self-host |
| **MCP Servers** | FREE | They're just bridges, no per-call cost |

**Bottom Line**: Only LLM API calls cost per-use. Everything else is fixed infrastructure.

### 2. Is the Architecture Too Complex?

**The Docker Compose with 20 containers = OVERKILL for MVP**

Let me simplify:

```
DEVELOPMENT (What you need NOW):
├── Express API (port 5500)         ← Already have
├── Supabase (cloud)                ← Already have  
├── AI Nexus MCP Server (local)     ← New, runs as Node process
└── Desktop App (Electron)          ← Already have

PRODUCTION (Later, when scaling):
├── Everything above, PLUS:
├── Docker for MCP Server           ← Containerize for deployment
├── Redis (optional caching)        ← Only if needed
└── VM/Cloud hosting                ← Vercel, Railway, Fly.io, etc.
```

### 3. Do You Need a VM?

**NOT YET.** Here's the decision tree:

```
Are you in development/MVP?
  YES → Run everything locally, no Docker needed
  
Do you have >100 users?
  NO  → Vercel + Supabase is enough
  YES → Consider VM with Docker
  
Do you need SAP/Epic/AS400?
  NO  → Skip enterprise MCP servers entirely
  YES → Add those specific containers only
```

---

## Recommended Architecture (Simplified)

### Phase 1: MVP (Current)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         YOUR MACHINE (Local Dev)                     │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Express API     │  │  Desktop App     │  │  AI Nexus MCP    │  │
│  │  (port 5500)     │  │  (Electron)      │  │  (STDIO mode)    │  │
│  │                  │  │                  │  │                  │  │
│  │  - AI routing    │  │  - React UI      │  │  - Tool server   │  │
│  │  - License check │  │  - Chat interface│  │  - Aggregator    │  │
│  │  - User mgmt     │  │  - Settings      │  │  - Governance    │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                     │             │
└───────────┼─────────────────────┼─────────────────────┼─────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                             │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │   Supabase   │  │  AI APIs     │  │  Enterprise (Optional)   │  │
│  │              │  │              │  │                          │  │
│  │  - Auth      │  │  - OpenAI    │  │  - Salesforce API        │  │
│  │  - Database  │  │  - Anthropic │  │  - ServiceNow API        │  │
│  │  - Storage   │  │  - Google    │  │  - Jira API              │  │
│  │              │  │  - Groq      │  │                          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                                                                      │
│                    (No SAP/Epic/AS400 until needed)                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Phase 2: Production (When Scaling)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CLOUD HOSTING (Vercel + Railway)                  │
│                                                                      │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐│
│  │     Vercel (Frontend)         │  │    Railway/Fly.io (Backend) ││
│  │                               │  │                              ││
│  │  - Landing Site (Next.js)     │  │  - Express API               ││
│  │  - Admin Dashboard (Next.js)  │  │  - AI Nexus MCP (SSE mode)   ││
│  │  - Cloud Backend (Next.js)    │  │  - Redis (optional cache)    ││
│  │                               │  │                              ││
│  └──────────────────────────────┘  └──────────────────────────────┘│
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Supabase (Managed)                           │ │
│  │    PostgreSQL + Auth + Storage + Realtime                       │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

Desktop App: Distributed via download (connects to cloud backend)
```

---

## What You DON'T Need (Yet)

| Component | Why Skip For Now |
|-----------|-----------------|
| **Docker Compose with 20 containers** | Overkill - just run Node locally |
| **Kubernetes** | Enterprise scale only |
| **Self-hosted PostgreSQL** | Supabase handles this |
| **Self-hosted MongoDB** | Not needed unless you have specific NoSQL needs |
| **Self-hosted Redis** | Only for caching at scale |
| **SAP MCP Server** | Only if you have SAP customers |
| **Epic FHIR MCP Server** | Only for healthcare clients |
| **AS/400 MCP Server** | Only for legacy system clients |

---

## Simplified File Structure

```
apps/
├── desktop-app/              # Electron + React (YOUR MAIN PRODUCT)
│   └── src/
│       ├── main/
│       │   ├── ai/           # AI routing (calls Express API)
│       │   ├── mcp/          # MCP client (connects to AI Nexus MCP)
│       │   └── license/      # License validation
│       └── renderer/         # React UI
│
├── express-api/              # Backend API
│   └── src/
│       ├── server.js         # Main server
│       └── providers/
│           └── ai-router.js  # Multi-model AI routing
│
├── admin-dashboard/          # Admin UI (Next.js)
├── landing-site/             # Marketing site (Next.js)  
└── cloud-backend/            # License server (Next.js)

packages/
├── shared/                   # Shared types/utils
└── ai-nexus-mcp-server/      # MCP Server (NEW - but simple)
    └── src/
        ├── server.ts         # Main MCP server
        ├── tools/            # AI routing tools
        ├── aggregator/       # System aggregators
        └── governance/       # License, audit, cost tracking
```

---

## Running the Backend (Simplified)

### Development Mode

```bash
# Terminal 1: Express API
cd apps/express-api
pnpm dev

# Terminal 2: AI Nexus MCP Server (optional, for MCP clients)
cd packages/ai-nexus-mcp-server
pnpm dev

# Terminal 3: Desktop App
cd apps/desktop-app
pnpm dev
```

Or use the existing monorepo command:

```bash
# From root - starts everything
pnpm dev
```

### Testing AI Routing

The Express API already handles AI routing at:
- `POST http://localhost:5500/api/chat` - Chat with AI
- `POST http://localhost:5500/api/generate` - Generate content

The AI Nexus MCP Server is **optional** - only needed if you want external tools (Claude Desktop, Cursor) to access AI Nexus.

---

## Database Architecture

### Current (Supabase - Keep This!)

```sql
-- Already in Supabase
users
├── id (uuid)
├── email
├── license_key
├── tier (free/pro/enterprise)
└── created_at

licenses
├── id (uuid)
├── key
├── user_id
├── status (active/expired/revoked)
├── valid_until
└── features (jsonb)

usage_logs
├── id (uuid)
├── user_id
├── model
├── tokens_in
├── tokens_out
├── cost
└── created_at
```

### Do You Need MongoDB?

**NO.** Supabase PostgreSQL handles:
- ✅ User data
- ✅ License management  
- ✅ Usage tracking
- ✅ Audit logs
- ✅ Chat history (with JSONB for messages)

Only add MongoDB if you have:
- Massive document storage needs
- Complex nested data structures
- Need for horizontal sharding

### Do You Need Redis?

**NOT YET.** Add Redis only when you need:
- Session caching (Supabase handles auth)
- Rate limiting at scale (governance layer handles this in-memory for now)
- Response caching for expensive operations

---

## Cost Breakdown (Realistic)

### Development Phase (Now)
| Service | Cost |
|---------|------|
| Supabase | $0 (free tier) |
| OpenAI API | $5-20/month (testing) |
| Anthropic API | $5-20/month (testing) |
| Hosting | $0 (local) |
| **Total** | **~$20-40/month** |

### Production (100 users)
| Service | Cost |
|---------|------|
| Supabase Pro | $25/month |
| Vercel Pro | $20/month |
| Railway (Express API) | $5-20/month |
| AI APIs (passed to users) | $0 (users pay) |
| **Total** | **~$50-65/month** |

### Production (1000+ users)
| Service | Cost |
|---------|------|
| Supabase Pro | $25-100/month |
| Vercel Pro | $20-50/month |
| Railway/Fly.io | $20-100/month |
| Redis (Upstash) | $10-30/month |
| **Total** | **~$100-300/month** |

---

## Next Steps (Backend Focus)

### Priority 1: Verify Express API Works
```bash
cd apps/express-api
pnpm dev

# Test endpoints:
curl http://localhost:5500/health
curl -X POST http://localhost:5500/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "model": "gpt-4o-mini"}'
```

### Priority 2: Test AI Routing
Ensure all providers work:
- [ ] OpenAI (GPT-4o, GPT-4o-mini)
- [ ] Anthropic (Claude 3.5 Sonnet)
- [ ] Google (Gemini)
- [ ] Groq (Llama, Mixtral)

### Priority 3: Test License Validation
- [ ] License creation works
- [ ] License validation works
- [ ] Usage tracking works

### Priority 4: Desktop App Integration
- [ ] Desktop app connects to Express API
- [ ] Chat works end-to-end
- [ ] License validation in desktop app

---

## Summary

1. **pnpm** ✅ - Fixed, using pnpm everywhere
2. **Costs** - Only LLM APIs cost per-use, everything else is fixed/free
3. **Architecture** - Simplified, no VM needed yet, no Docker needed for dev
4. **Database** - Keep Supabase, skip MongoDB/Redis for now
5. **Focus** - Get Express API + Desktop App working first, then scale

**You don't need a VM until you have real users at scale.** Start simple, add complexity only when needed.
