# 🚀 Quick Reference - AI Model API Keys

## Top Priority (Start Here) ⭐

### 1. OpenAI - $5 Free Credit

```bash
https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-xxx
```

**Why**: Industry standard, most reliable, GPT-4

### 2. Groq - 100% FREE ⚡

```bash
https://console.groq.com/keys
GROQ_API_KEY=gsk-xxx
```

**Why**: Ultra-fast (500+ tokens/sec), completely free

### 3. Google AI - Generous Free Tier

```bash
https://makersuite.google.com/app/apikey
GOOGLE_AI_API_KEY=AIzaSy-xxx
```

**Why**: 60 req/min free, Gemini Pro

---

## Next Priority (Highly Recommended) 🎯

### 4. Anthropic Claude - $5 Free Credit

```bash
https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-api03-xxx
```

**Why**: Claude 3, excellent reasoning, 200K context

### 5. DeepSeek - Cheapest ($0.00014/1K)

```bash
https://platform.deepseek.com/api_keys
DEEPSEEK_API_KEY=sk-xxx
```

**Why**: Excellent for coding, 90% cheaper than GPT

### 6. OpenRouter - Access 100+ Models

```bash
https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-xxx
```

**Why**: Single API for multiple models, pay-per-use

---

## Optional (Nice to Have) 💎

| Provider    | Link                                       | Free?   |
| ----------- | ------------------------------------------ | ------- |
| Cohere      | https://dashboard.cohere.com/api-keys      | Limited |
| Mistral     | https://console.mistral.ai/api-keys/       | Limited |
| Perplexity  | https://www.perplexity.ai/settings/api     | Limited |
| Together AI | https://api.together.xyz/settings/api-keys | Limited |
| Replicate   | https://replicate.com/account/api-tokens   | Pay/use |
| HuggingFace | https://huggingface.co/settings/tokens     | Yes     |

---

## Enterprise Only (Skip for Now) 🏢

- **Azure OpenAI** - Requires Azure account + approval
- **AWS Bedrock** - Requires AWS account + setup

---

## Payment Providers 💳

### Dodo Payments (Primary)

```bash
https://dodopayments.com/
DODO_API_KEY=xxx
DODO_SECRET_KEY=xxx
```

### PayPal (Secondary)

```bash
https://developer.paypal.com/
PAYPAL_CLIENT_ID=xxx
PAYPAL_SECRET=xxx
```

---

## Quick Setup (5 Minutes) ⏱️

### Step 1: Get Essentials

```bash
# 1. OpenAI (2 min)
https://platform.openai.com/signup
→ API Keys → Create new key → Copy

# 2. Groq (1 min)
https://console.groq.com/
→ Sign up → Keys → Create → Copy

# 3. Google AI (2 min)
https://makersuite.google.com/
→ Sign in → Get API key → Copy
```

### Step 2: Add to .env

```bash
cd apps/express-api
nano .env

# Add these lines:
OPENAI_API_KEY=sk-proj-xxx
GROQ_API_KEY=gsk-xxx
GOOGLE_AI_API_KEY=AIzaSy-xxx
```

### Step 3: Start Server

```bash
npm install
npm run dev
```

### Step 4: Test

```bash
curl http://localhost:5500/api/ai/providers
# Should show: openai, groq, google
```

---

## Cost Comparison 💰

| Provider     | Input/1K | Output/1K | Free Tier  |
| ------------ | -------- | --------- | ---------- |
| Groq ⚡      | FREE     | FREE      | Unlimited  |
| DeepSeek     | $0.00014 | $0.00028  | $5 credit  |
| Google AI    | $0.00025 | $0.0005   | 60 req/min |
| OpenAI 3.5   | $0.0005  | $0.0015   | $5 credit  |
| Anthropic    | $0.003   | $0.015    | $5 credit  |
| OpenAI GPT-4 | $0.03    | $0.06     | $5 credit  |

**Pro Tip**: Start with Groq (free) + Google (generous free tier) for testing!

---

## Starter Budget Strategy 📊

### Free Tier Only ($0)

```bash
GROQ_API_KEY=xxx        # Unlimited free
GOOGLE_AI_API_KEY=xxx   # 60 req/min free
```

**Use case**: Development, testing, personal projects

### Budget ($10-20)

```bash
OPENAI_API_KEY=xxx      # $5 credit
GROQ_API_KEY=xxx        # Free
DEEPSEEK_API_KEY=xxx    # $5 credit
```

**Use case**: Small production apps, prototypes

### Production ($50-100/month)

```bash
OPENAI_API_KEY=xxx
ANTHROPIC_API_KEY=xxx
GROQ_API_KEY=xxx
OPENROUTER_API_KEY=xxx
```

**Use case**: Growing startups, moderate traffic

---

## Environment File Template

```bash
# ============================================
# AI PROVIDERS (Choose at least 1)
# ============================================

# OpenAI - GPT-4, GPT-3.5 ($5 free credit)
OPENAI_API_KEY=sk-proj-xxx

# Groq - Ultra-fast, 100% FREE
GROQ_API_KEY=gsk-xxx

# Google AI - Gemini Pro (generous free tier)
GOOGLE_AI_API_KEY=AIzaSy-xxx

# Anthropic - Claude 3 ($5 free credit)
ANTHROPIC_API_KEY=sk-ant-api03-xxx

# DeepSeek - Cheapest option ($5 free credit)
DEEPSEEK_API_KEY=sk-xxx

# OpenRouter - 100+ models via one API
OPENROUTER_API_KEY=sk-or-v1-xxx

# ============================================
# SUPABASE (Required)
# ============================================
SUPABASE_URL=https://lwounfzhkuuqvgkvwxvt.supabase.co
SUPABASE_SERVICE_KEY=xxx

# ============================================
# SERVER (Required)
# ============================================
PORT=5500
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
```

---

## Troubleshooting 🔧

### "Provider not enabled"

- Check API key in .env
- Restart server: `npm run dev`
- Test: `curl http://localhost:5500/api/ai/providers`

### "Authentication failed"

- Verify API key (no spaces/newlines)
- Check email verified with provider
- Try regenerating key

### "Rate limit exceeded"

- Free tiers have limits
- Try different provider
- Upgrade to paid tier

---

## Full Documentation 📚

- **Complete Guide**: `/docs/API-KEYS-SETUP-GUIDE.md`
- **Database Setup**: `/docs/DATABASE-SETUP-GUIDE.md`
- **Backend Summary**: `/docs/BACKEND-SETUP-SUMMARY.md`
- **Express README**: `/apps/express-api/README.md`

---

## Quick Links 🔗

| Resource           | URL                                                   |
| ------------------ | ----------------------------------------------------- |
| Supabase Dashboard | https://app.supabase.com/project/lwounfzhkuuqvgkvwxvt |
| OpenAI Platform    | https://platform.openai.com/                          |
| Groq Console       | https://console.groq.com/                             |
| Google AI Studio   | https://makersuite.google.com/                        |
| Anthropic Console  | https://console.anthropic.com/                        |
| DeepSeek Platform  | https://platform.deepseek.com/                        |
| OpenRouter         | https://openrouter.ai/                                |

---

## Remember 📝

1. **Start small**: OpenAI + Groq + Google = $5 total
2. **Test free tiers**: Most have generous free usage
3. **Monitor costs**: Set billing alerts
4. **Use Groq first**: It's fast and FREE
5. **OpenRouter**: Access many models with one API

---

**Print this page and keep it handy!** 📄

All links, keys, and commands in one place.
