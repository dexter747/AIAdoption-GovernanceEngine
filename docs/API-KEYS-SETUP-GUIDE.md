# AI Model API Keys Setup Guide

This guide explains all the AI model providers integrated into the Velanova backend and how to get API keys for each.

## 📋 Overview

The system supports **15 AI providers** with different strengths:

| Provider         | Best For                    | Free Tier   | Cost   |
| ---------------- | --------------------------- | ----------- | ------ |
| **OpenAI**       | General purpose, GPT-4      | Limited     | $$$    |
| **Anthropic**    | Claude models, long context | Limited     | $$     |
| **Google AI**    | Gemini Pro, multimodal      | Yes         | $      |
| **Groq**         | Ultra-fast inference        | Yes (Beta)  | Free   |
| **DeepSeek**     | Cost-effective, coding      | Yes         | $      |
| **Cohere**       | Enterprise, embeddings      | Limited     | $$     |
| **Mistral**      | Open source models          | Limited     | $$     |
| **Perplexity**   | Search-enhanced AI          | Limited     | $$     |
| **Together AI**  | Open source hosting         | Limited     | $      |
| **Replicate**    | Open models, image gen      | Pay per use | $      |
| **HuggingFace**  | Open model access           | Yes         | Free/$ |
| **OpenRouter**   | Multi-model aggregator      | Yes         | $      |
| **Azure OpenAI** | Enterprise, compliance      | No          | $$$    |
| **AWS Bedrock**  | Enterprise, AWS native      | No          | $$$    |

---

## 🔑 Required API Keys (Priority Order)

### 1. **OpenAI** (HIGHEST PRIORITY)

- **Why**: Industry standard, GPT-4, most versatile
- **Sign up**: https://platform.openai.com/signup
- **Get API key**: https://platform.openai.com/api-keys
- **Cost**: $0.03/1K tokens (GPT-4), $0.0005/1K tokens (GPT-3.5)
- **Free tier**: $5 credit for new accounts

**Environment variables:**

```bash
OPENAI_API_KEY=sk-proj-xxx
OPENAI_ORG_ID=org-xxx  # Optional
```

---

### 2. **Anthropic** (HIGH PRIORITY)

- **Why**: Claude 3 models, excellent reasoning, long context (200K tokens)
- **Sign up**: https://console.anthropic.com/
- **Get API key**: https://console.anthropic.com/settings/keys
- **Cost**: $0.003-$0.015/1K input tokens, $0.015-$0.075/1K output tokens
- **Free tier**: $5 credit for new accounts

**Environment variables:**

```bash
ANTHROPIC_API_KEY=sk-REDACTED
```

---

### 3. **Google AI (Gemini)** (HIGH PRIORITY)

- **Why**: Gemini Pro, multimodal (text + images), competitive pricing
- **Sign up**: https://makersuite.google.com/
- **Get API key**: https://makersuite.google.com/app/apikey
- **Cost**: $0.00025/1K input tokens, $0.0005/1K output tokens
- **Free tier**: 60 queries per minute, generous free limits

**Environment variables:**

```bash
GOOGLE_AI_API_KEY=AIzaSy-xxx
GOOGLE_AI_PROJECT_ID=your-project-id  # Optional
```

---

### 4. **Groq** (MEDIUM PRIORITY - FREE!)

- **Why**: Ultra-fast inference (500+ tokens/sec), FREE during beta
- **Sign up**: https://console.groq.com/
- **Get API key**: https://console.groq.com/keys
- **Cost**: FREE (beta), Llama 2 70B, Mixtral 8x7B
- **Free tier**: Unlimited during beta

**Environment variables:**

```bash
GROQ_API_KEY=gsk-xxx
```

---

### 5. **OpenRouter** (MEDIUM PRIORITY)

- **Why**: Access 100+ models via single API, pay-per-use
- **Sign up**: https://openrouter.ai/
- **Get API key**: https://openrouter.ai/keys
- **Cost**: Variable per model ($0.0002-$0.03/1K tokens)
- **Free tier**: Some models are free

**Environment variables:**

```bash
OPENROUTER_API_KEY=sk-or-v1-xxx
```

---

### 6. **DeepSeek** (MEDIUM PRIORITY - COST-EFFECTIVE)

- **Why**: Excellent for coding, very cheap ($0.00014/1K tokens)
- **Sign up**: https://platform.deepseek.com/
- **Get API key**: https://platform.deepseek.com/api_keys
- **Cost**: $0.00014/1K input, $0.00028/1K output
- **Free tier**: $5 credit for new accounts

**Environment variables:**

```bash
DEEPSEEK_API_KEY=sk-xxx
```

---

## 🏢 Enterprise Providers (Optional)

### 7. **Azure OpenAI** (For Enterprise)

- **Why**: GPT-4 with enterprise SLAs, compliance, private deployment
- **Sign up**: Requires Azure account
- **Get started**: https://portal.azure.com/ → "Create Resource" → "Azure OpenAI"
- **Cost**: Same as OpenAI but with enterprise pricing

**Environment variables:**

```bash
AZURE_OPENAI_API_KEY=xxx
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
```

---

### 8. **AWS Bedrock** (For Enterprise)

- **Why**: Claude, Llama, and other models in AWS ecosystem
- **Sign up**: Requires AWS account
- **Get started**: https://console.aws.amazon.com/bedrock/
- **Cost**: Variable per model

**Environment variables:**

```bash
AWS_ACCESS_KEY_ID=AKIAxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
AWS_BEDROCK_MODEL_ID=anthropic.claude-v2
```

---

## 🔧 Additional Providers (Lower Priority)

### 9. **Cohere**

- **Sign up**: https://dashboard.cohere.com/
- **API key**: https://dashboard.cohere.com/api-keys

```bash
COHERE_API_KEY=xxx
```

### 10. **Mistral AI**

- **Sign up**: https://console.mistral.ai/
- **API key**: https://console.mistral.ai/api-keys/

```bash
MISTRAL_API_KEY=xxx
```

### 11. **Perplexity**

- **Sign up**: https://www.perplexity.ai/settings/api
- **API key**: https://www.perplexity.ai/settings/api

```bash
PERPLEXITY_API_KEY=pplx-xxx
```

### 12. **Together AI**

- **Sign up**: https://api.together.xyz/
- **API key**: https://api.together.xyz/settings/api-keys

```bash
TOGETHER_API_KEY=xxx
```

### 13. **Replicate**

- **Sign up**: https://replicate.com/
- **API key**: https://replicate.com/account/api-tokens

```bash
REPLICATE_API_KEY=r8_xxx
```

### 14. **HuggingFace**

- **Sign up**: https://huggingface.co/join
- **API key**: https://huggingface.co/settings/tokens

```bash
HUGGINGFACE_API_KEY=hf_xxx
```

---

## 🎯 Recommended Starter Setup

For **development/testing**, get these 3 providers:

1. **OpenAI** - Standard, reliable ($5 free credit)
2. **Groq** - Ultra-fast, completely FREE
3. **Google AI** - Generous free tier

This covers:

- ✅ General purpose AI (OpenAI)
- ✅ Fast inference (Groq)
- ✅ Multimodal support (Google)
- ✅ Cost-effective (Groq free, Google cheap)

---

## 💰 Payment Providers

### 1. **Dodo Payments** (PRIMARY)

- **Sign up**: https://dodopayments.com/
- **Get API key**: Dashboard → API Keys

```bash
DODO_API_KEY=xxx
DODO_SECRET_KEY=xxx
DODO_WEBHOOK_SECRET=whsec_xxx
```

### 2. **PayPal** (SECONDARY)

- **Sign up**: https://developer.paypal.com/
- **Get credentials**: Apps → Create App

```bash
PAYPAL_CLIENT_ID=xxx
PAYPAL_SECRET=xxx
PAYPAL_MODE=sandbox  # or 'live'
PAYPAL_WEBHOOK_ID=xxx
```

### 3. **Razorpay** (INDIA)

- **Sign up**: https://razorpay.com/
- **Get API keys**: Settings → API Keys

```bash
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
```

---

## 📧 Email Service

### SendGrid (PRIMARY)

- **Sign up**: https://signup.sendgrid.com/
- **Get API key**: Settings → API Keys

```bash
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Resend (ALTERNATIVE)

- **Sign up**: https://resend.com/
- **Get API key**: API Keys

```bash
RESEND_API_KEY=re_xxx
```

---

## 📊 Monitoring (Optional but Recommended)

### 1. **Sentry** (Error Tracking)

- **Sign up**: https://sentry.io/
- **Get DSN**: Project Settings → Client Keys

```bash
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### 2. **Datadog** (APM & Monitoring)

- **Sign up**: https://www.datadoghq.com/
- **Get keys**: Organization Settings → API Keys

```bash
DATADOG_API_KEY=xxx
DATADOG_APP_KEY=xxx
```

### 3. **PostHog** (Product Analytics)

- **Sign up**: https://posthog.com/
- **Get key**: Project Settings → API Key

```bash
POSTHOG_API_KEY=phc_xxx
POSTHOG_HOST=https://app.posthog.com
```

---

## 🚀 Quick Start Checklist

### Minimum Required (5 minutes):

- [ ] **Supabase**: Already configured (lwounfzhkuuqvgkvwxvt.supabase.co)
- [ ] **OpenAI**: Get API key → Add to .env
- [ ] **Groq**: Get API key (free) → Add to .env

### Recommended (15 minutes):

- [ ] **Google AI**: Get API key → Add to .env
- [ ] **DeepSeek**: Get API key → Add to .env
- [ ] **SendGrid**: Set up email service

### Production Ready (1-2 hours):

- [ ] **Anthropic**: Get API key for Claude
- [ ] **Dodo Payments**: Set up payment processing
- [ ] **Sentry**: Set up error monitoring
- [ ] **OpenRouter**: Get access to 100+ models

---

## 📝 Environment File Setup

1. Copy the `.env.example` file:

```bash
cd apps/express-api
cp .env.example .env
```

2. Fill in the API keys you obtained above

3. Test the connection:

```bash
npm install
npm run dev
```

4. Visit http://localhost:5500/health to verify

---

## 🔒 Security Best Practices

1. **Never commit .env file** - Already in .gitignore
2. **Use different keys for dev/prod** - Separate API keys
3. **Rotate keys regularly** - Change every 90 days
4. **Monitor usage** - Set up billing alerts
5. **Use service roles** - Supabase service key for backend only
6. **Encrypt user API keys** - Store user BYOK keys encrypted

---

## 🆘 Troubleshooting

### "Provider not enabled" error

- Check if API key is set in .env file
- Restart the server after adding new keys
- Check GET /api/ai/providers to see enabled providers

### "Authentication failed" error

- Verify API key is correct (copy-paste carefully)
- Check for extra spaces or newlines
- Some providers require email verification first

### "Rate limit exceeded"

- Free tiers have strict rate limits
- Consider upgrading to paid tier
- Use multiple providers for load balancing

---

## 📚 Additional Resources

- **API Documentation**: See `/docs/API.md` (to be created)
- **Database Schema**: See `/database/schema.sql`
- **Admin Dashboard**: http://localhost:3000
- **Express API**: http://localhost:5500

---

## 💡 Pro Tips

1. **Start with Groq** - It's free and FAST (500+ tokens/sec)
2. **Use OpenRouter** - Access many models via single API
3. **Set up monitoring early** - Sentry helps catch issues
4. **Enable BYOK** - Let users add their own API keys
5. **Monitor costs** - Add usage tracking from day 1

---

**Need help?** Open an issue or contact the development team.
