# AI Nexus - Production Backend

*Last Updated: January 19, 2026*

---

## ✅ BACKEND COMPLETE

All backend components are implemented and ready for deployment.

---

## Architecture

**MCP is for EXTERNAL tools (Claude Desktop, Cursor). Desktop App calls Express API directly.**

**Hosting Strategy:**
- Vercel → Frontend ($20/mo)
- Railway → Express API ($5-50/mo)
- Supabase → Database ($25/mo)
- Total: ~$50-100/month

---

## PHASE 1: Express API ✅ COMPLETE

### 1.1 Structure ✅
- [x] New folder structure (config, middleware, routes, services)
- [x] Entry point with graceful shutdown (src/index.js)
- [x] Express app configuration (src/app.js)
- [x] Centralized config (src/config/index.js)

### 1.2 Security ✅
- [x] helmet - Security headers
- [x] express-rate-limit - Rate limiting
- [x] zod validation - Request validation
- [x] CORS whitelist - Configurable origins
- [x] JWT authentication
- [x] API key validation
- [x] License validation

### 1.3 AI Providers ✅ (9 Providers)
- [x] OpenAI (GPT-4o, o1, o3-mini)
- [x] Anthropic (Claude 3.5 Sonnet, Opus, Haiku)
- [x] Google AI (Gemini 2.0 Flash, 1.5 Pro)
- [x] Groq (Llama 3.3, Mixtral)
- [x] Cohere (Command R+, Command R)
- [x] Mistral (Large, Medium, Codestral)
- [x] Perplexity (Sonar, Sonar Pro)
- [x] DeepSeek (Chat, Coder, Reasoner)
- [x] OpenRouter (100+ models)
- [x] Auto-provider selection
- [x] Cost calculation per model
- [x] Streaming support (SSE)

### 1.4 License System ✅
- [x] JWT-based license keys
- [x] Validation endpoint
- [x] Activation/deactivation
- [x] Tier-based features (free, starter, pro, enterprise)
- [x] Machine limit enforcement

### 1.5 Usage Tracking ✅
- [x] Token counting
- [x] Cost calculation per provider/model
- [x] In-memory cache for development
- [x] Database storage ready
- [x] Daily/monthly aggregation

### 1.6 Middleware ✅
- [x] Request logger with timing
- [x] Error handler with Zod support
- [x] Auth middleware (API key, JWT, License)
- [x] Pino logger with redaction

---

## PHASE 2: Database Schema ✅ COMPLETE

Schema files ready to run in Supabase:
- `database/schema.sql` - Original tables
- `database/schema-v2.sql` - Additional tables

Tables:
- [x] profiles - User profiles
- [x] licenses - License keys
- [x] license_activations / device_activations - Machine activations
- [x] usage_records - Token usage
- [x] api_keys - API key management
- [x] chat_sessions - Chat history sync
- [x] chat_messages - Chat messages
- [x] audit_log - Admin audit trail

**To activate:** Run SQL in Supabase SQL Editor

---

## PHASE 3: Deployment ✅ COMPLETE

### Railway Config ✅
- [x] railway.json - Railway deployment config
- [x] Dockerfile.api - Docker deployment option
- [x] Health checks configured

### CI/CD ✅
- [x] .github/workflows/api.yml - Express API CI/CD
- [x] .github/workflows/desktop.yml - Desktop app builds

**To deploy:**
1. Push to GitHub
2. Connect Railway to repo
3. Set environment variables
4. Auto-deploy on push

---

## Files Structure

```
apps/express-api/
├── src/
│   ├── index.js              # Entry point
│   ├── app.js                # Express config
│   ├── config/
│   │   └── index.js          # Configuration
│   ├── utils/
│   │   └── logger.js         # Pino logger
│   ├── middleware/
│   │   ├── auth.js           # Authentication
│   │   ├── errorHandler.js   # Error handling
│   │   └── requestLogger.js  # Request logging
│   ├── routes/
│   │   ├── health.js         # Health checks
│   │   ├── ai.js             # AI endpoints
│   │   ├── licenses.js       # License endpoints
│   │   └── usage.js          # Usage endpoints
│   └── services/
│       ├── license.js        # License service
│       ├── usage.js          # Usage service
│       └── ai/
│           ├── index.js      # Provider router
│           └── providers/
│               ├── openai.js
│               ├── anthropic.js
│               ├── google.js
│               ├── groq.js
│               ├── cohere.js
│               ├── mistral.js
│               ├── perplexity.js
│               ├── deepseek.js
│               └── openrouter.js
├── railway.json              # Railway config
└── package.json

.github/workflows/
├── api.yml                   # API CI/CD
└── desktop.yml               # Desktop builds

database/
├── schema.sql                # Original schema
└── schema-v2.sql             # Additional tables

Dockerfile.api                # Docker build
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/ready` | Readiness check |
| GET | `/metrics` | Server metrics |
| GET | `/api/status` | Service status |
| GET | `/api/ai/providers` | List providers |
| GET | `/api/ai/models` | List models |
| POST | `/api/ai/chat` | Chat completion |
| POST | `/api/ai/embeddings` | Embeddings |
| POST | `/api/licenses/validate` | Validate license |
| POST | `/api/licenses/activate` | Activate license |
| POST | `/api/licenses/deactivate` | Deactivate |
| GET | `/api/licenses/features/:tier` | Tier features |
| GET | `/api/usage` | Usage stats |
| GET | `/api/usage/summary` | Usage summary |
| GET | `/api/usage/limits` | Usage limits |
| GET | `/api/usage/cost` | Cost breakdown |

---

## Next Steps (Optional)

### Desktop App Integration
- [ ] Connect Desktop App to Express API
- [ ] License validation on startup
- [ ] Provider selection UI
- [ ] Streaming chat display

### MCP (Future)
- [ ] AI Nexus MCP Server for Claude Desktop
- [ ] Docker Compose for MCP farm

---

## Quick Start

```bash
# 1. Start Express API
cd apps/express-api
pnpm dev

# 2. Test health
curl http://localhost:5500/

# 3. Test providers
curl http://localhost:5500/api/ai/providers

# 4. Run database schema (in Supabase SQL Editor)
# Copy contents of database/schema.sql
# Copy contents of database/schema-v2.sql

# 5. Deploy to Railway
# Push to GitHub and connect Railway
```

---

## Environment Variables

Required in `.env`:
```env
# Server
PORT=5500
NODE_ENV=production

# Supabase
SUPABASE_URL=your_url
SUPABASE_SERVICE_KEY=your_key

# At least one AI provider
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...
# or any other provider
```
