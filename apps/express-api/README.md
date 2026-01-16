# Express API Server - AI Nexus

Backend API for AI Nexus: License management, AI query routing, payment processing, and usage tracking.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys (see docs/API-KEYS-SETUP-GUIDE.md)

# Start development server
npm run dev

# Production
npm start
```

Server runs on: http://localhost:5500

---

## 📋 Features

### ✅ License Management
- License validation and device activation
- Support for free, professional, enterprise plans
- Device limit enforcement
- Automatic expiration handling

### ✅ AI Provider Routing
- **15 AI providers** integrated (OpenAI, Anthropic, Google, Groq, etc.)
- Automatic provider selection
- Token counting and cost tracking
- Usage logging for analytics

### ✅ Payment Processing
- Dodo Payments, PayPal, Razorpay webhooks
- Subscription management
- Payment history tracking

### ✅ User API Keys (BYOK)
- Encrypted storage of user's own API keys
- Multi-provider support
- Secure key management

---

## 🔌 API Endpoints

### Health & Status
```
GET  /health              → Server health check
GET  /api/status          → API status and version
```

### License Management
```
POST /api/licenses/validate  → Validate license + activate device
```

### AI Providers
```
GET  /api/ai/providers    → List available AI providers
POST /api/ai/query        → Route AI query to provider
```

### User API Keys
```
GET  /api/users/:userId/api-keys      → Get user's API keys
POST /api/users/:userId/api-keys      → Add new API key
```

### Usage Tracking
```
POST /api/usage/log       → Log AI usage
GET  /api/usage/:userId   → Get user's usage history
```

### Subscriptions
```
GET  /api/subscriptions/:userId  → Get active subscription
```

### Webhooks
```
POST /api/webhooks/dodo    → Dodo Payments webhook
```

---

## 🤖 Supported AI Providers

| Provider | Status | Models |
|----------|--------|--------|
| OpenAI | ✅ | GPT-4, GPT-3.5-turbo |
| Anthropic | ✅ | Claude 3 (Opus, Sonnet, Haiku) |
| Google AI | ✅ | Gemini Pro, Gemini Pro Vision |
| Groq | ✅ | Llama 2 70B, Mixtral 8x7B (FREE) |
| Cohere | 🔜 | Command, Command Light |
| Mistral | 🔜 | Mistral Large, Medium |
| Perplexity | 🔜 | PPLX 70B Online |
| DeepSeek | 🔜 | DeepSeek Chat, Coder |
| Together AI | 🔜 | Multiple open models |
| Replicate | 🔜 | Open models |
| HuggingFace | 🔜 | Inference API |
| OpenRouter | 🔜 | 100+ models |
| Azure OpenAI | 🔜 | GPT-4 Enterprise |
| AWS Bedrock | 🔜 | Claude, Llama, etc. |

---

## 🔐 Environment Variables

### Required
```bash
# Server
PORT=5500
NODE_ENV=development

# Supabase
SUPABASE_URL=https://lwounfzhkuuqvgkvwxvt.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# Security
LICENSE_JWT_SECRET=your-secret
CORS_ORIGINS=http://localhost:3000

# AI Providers (at least 1 required)
OPENAI_API_KEY=sk-proj-xxx
```

### Recommended
```bash
# More AI Providers
ANTHROPIC_API_KEY=sk-ant-api03-xxx
GOOGLE_AI_API_KEY=AIzaSy-xxx
GROQ_API_KEY=gsk-xxx

# Payments
DODO_API_KEY=xxx

# Email
SENDGRID_API_KEY=SG.xxx

# Monitoring
SENTRY_DSN=https://xxx
```

**See**: [.env.example](.env.example) for complete list with all 15 AI providers

---

## 📁 Project Structure

```
apps/express-api/
├── src/
│   ├── server.js              # Main Express server (400+ lines)
│   └── providers/
│       └── ai-router.js       # AI provider routing (15 providers)
├── .env.example               # Complete environment template
├── package.json               # Dependencies
└── README.md
```

---

## 🧪 Testing

### Test Health Check
```bash
curl http://localhost:5500/health
```

### Test License Validation
```bash
curl -X POST http://localhost:5500/api/licenses/validate \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "YOUR_LICENSE_KEY",
    "deviceId": "test-device-123",
    "deviceInfo": {
      "name": "MacBook Pro",
      "os": "macOS 14.0"
    }
  }'
```

### Test AI Query
```bash
curl -X POST http://localhost:5500/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "licenseId": "license-uuid",
    "provider": "openai",
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

### Check Available Providers
```bash
curl http://localhost:5500/api/ai/providers
```

---

## 📚 Documentation

- 📖 **API Keys Setup**: [/docs/API-KEYS-SETUP-GUIDE.md](../../docs/API-KEYS-SETUP-GUIDE.md)
- 💾 **Database Setup**: [/docs/DATABASE-SETUP-GUIDE.md](../../docs/DATABASE-SETUP-GUIDE.md)
- 🗄️ **Schema**: [/database/schema.sql](../../database/schema.sql)
- 📋 **SRS**: [/docs/SRS.md](../../docs/SRS.md)

---

## 🚀 Deployment

### Railway / Render / Heroku
1. Push code to GitHub
2. Connect repository to platform
3. Set environment variables from .env.example
4. Deploy

### Environment Variables on Platform
Copy all from `.env.example` and fill in actual values.

---

## 🐛 Troubleshooting

### Server won't start
- Check if port 5500 is available: `lsof -i :5500`
- Verify .env file exists: `ls -la .env`
- Install dependencies: `npm install`

### "Supabase connection failed"
- Verify SUPABASE_URL and SUPABASE_SERVICE_KEY in .env
- Test connection: `curl https://lwounfzhkuuqvgkvwxvt.supabase.co`

### "Provider not enabled"
- Check if API key is set in .env file
- Restart server after adding new keys: `npm run dev`
- Call `GET /api/ai/providers` to see enabled providers

### License validation failing
- Ensure database schema is deployed (see DATABASE-SETUP-GUIDE.md)
- Check if license exists in database
- Verify license status is 'active'

---

## 🤝 Architecture

```
Desktop App ──→ Express API (5500) ──→ Supabase
                     │
                     ├──→ AI Providers (15 providers)
                     ├──→ Payment Providers
                     └──→ Email Service

Admin Dashboard ──→ Supabase (direct)
                └──→ Express API (optional)
```

**Why Separate Express Server?**
- **Performance**: Optimized for AI query routing
- **Flexibility**: Easy to add new providers
- **Scalability**: Independent deployment
- **WebSockets**: Real-time features (future)

---

## 🔒 Security

- ✅ Row-Level Security (RLS) on all tables
- ✅ Encrypted user API keys
- ✅ JWT for license validation
- ✅ CORS configured
- ✅ Rate limiting (Redis - optional)
- ✅ Webhook signature verification

---

## 📊 Monitoring

### Logs
```bash
npm run dev  # Development logs
```

### Health Check
```bash
curl http://localhost:5500/health
# → {"status":"ok","timestamp":"2024-..."}
```

### Database Queries
- Supabase Dashboard → Database → Logs
- View all queries, slow queries, errors

---

## 🎯 Next Steps

1. ✅ **Deploy Database** - See DATABASE-SETUP-GUIDE.md (5 min)
2. ✅ **Get API Keys** - See API-KEYS-SETUP-GUIDE.md (15-30 min)
3. ✅ **Install Dependencies** - `npm install` (2 min)
4. ✅ **Start Server** - `npm run dev` (1 min)
5. ✅ **Test Endpoints** - Use curl or Postman (5 min)

---

**Built with**: Express.js, Supabase, OpenAI, Anthropic, Google AI, and more! 🚀
