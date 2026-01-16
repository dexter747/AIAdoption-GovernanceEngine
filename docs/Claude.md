# AI Nexus - Architecture Clarifications

## 1. Online/Cloud Legacy Software Support - YES!

### The system supports BOTH offline and online legacy software:

#### **Offline/On-Premises (Direct Database Connection)**
1. **PostgreSQL** - Direct connection via `pg` driver
2. **MySQL** - Direct connection via `mysql2` driver
3. **Oracle** - Direct connection via `oracledb` driver
4. **SQL Server** - Direct connection via `tedious` driver
5. **SAP HANA** - Direct connection via `@sap/hana-client` driver
6. **MongoDB** - Direct connection via `mongodb` driver

**Connection Method:**
```typescript
// Desktop app connects directly to customer's database
const connection = await connector.connect({
  host: 'localhost',      // or remote IP
  port: 5432,
  database: 'production',
  username: 'readonly_user',
  password: encrypted_password
});
```

#### **Online/Cloud SaaS (REST API Integration)**
7. **Salesforce** - Cloud CRM via REST API + OAuth 2.0
8. **ServiceNow** - Cloud ITSM via REST API + Basic Auth
9. **Jira** - Cloud Project Management via REST API v3 + API Token
10. **Zendesk** - Cloud Customer Support via REST API + API Token

**Connection Method:**
```typescript
// Desktop app connects to SaaS APIs over internet
const client = await SalesforceConnector.authenticate({
  clientId: 'app_client_id',
  clientSecret: encrypted_secret,
  accessToken: encrypted_token,  // from OAuth flow
  instanceUrl: 'https://company.salesforce.com'
});

// Query Salesforce records
const accounts = await client.query({
  object: 'Account',
  fields: ['Name', 'Industry', 'AnnualRevenue'],
  where: 'Industry = "Technology"'
});
```

**Key Point:** The desktop app can connect to:
- **Local databases** (PostgreSQL, MySQL, Oracle, etc.) running on customer's infrastructure
- **Cloud SaaS platforms** (Salesforce, Jira, Zendesk, etc.) via their REST APIs

---

## 2. Payment Gateways - Updated

### Current Configuration:
The SRS.md currently shows **Stripe + PayPal + Razorpay**.

### Your Request:
- **Dodo Payments** (need clarification - is this a real payment gateway?)
- **PayPal** ✓
- **Razorpay** (India) ✓

### Recommended Configuration:
1. **PayPal** (Primary - Global)
   - 200+ countries supported
   - Credit/Debit cards via PayPal
   - PayPal account payments
   - Trusted brand globally

2. **Razorpay** (India-specific)
   - UPI payments (Google Pay, PhonePe, Paytm)
   - Net banking (HDFC, ICICI, SBI, Axis, etc.)
   - Credit/Debit cards (Visa, Mastercard, RuPay)
   - Wallets (Paytm, Mobikwik, Freecharge)
   - EMI options (3, 6, 9, 12 months)
   - QR code payments

**Question:** Should we remove Stripe and keep only PayPal + Razorpay? Or add "Dodo Payments" (please confirm if this is a real provider)?

---

## 3. Email Service - Updated to Nodemailer

### Current: Resend (SaaS email API)
### Your Request: **Nodemailer** (SMTP-based)

### Updated Configuration:

```javascript
// backend/src/email/nodemailer.service.js
const nodemailer = require('nodemailer');

// Create transporter with SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,     // smtp.gmail.com, smtp.sendgrid.net, etc.
  port: process.env.SMTP_PORT,     // 587 (TLS) or 465 (SSL)
  secure: false,                   // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,   // your email or API username
    pass: process.env.SMTP_PASS    // password or API key
  }
});

// Send email function
async function sendEmail({ to, subject, html, text }) {
  const info = await transporter.sendMail({
    from: '"AI Nexus" <noreply@ainexus.com>',
    to,
    subject,
    text,  // plain text version
    html   // HTML version
  });
  
  console.log('Email sent:', info.messageId);
  return info;
}
```

### Supported SMTP Providers:
1. **Gmail** (free, 500 emails/day)
2. **SendGrid** (paid, 40,000 emails/month free)
3. **AWS SES** (paid, $0.10 per 1,000 emails)
4. **Mailgun** (paid, 5,000 emails/month free)
5. **Postmark** (paid, 100 emails/month free)
6. **Custom SMTP server** (self-hosted)

---

## 4. AI Models - Expanded to 10+ Providers

### Current Configuration:
- OpenAI (GPT-4o, GPT-4o-mini)
- Anthropic (Claude Opus, Sonnet, Haiku)
- Google AI (Gemini Pro, Flash)
- Azure OpenAI (GPT-4, GPT-3.5)

### Your Request: "Many AI models, not just these 3"

### Updated Configuration - 10 AI Providers:

| # | Provider | Models | Use Case | Cost Level |
|---|----------|--------|----------|------------|
| 1 | **OpenAI** | GPT-4o, GPT-4o-mini, GPT-3.5-turbo | General-purpose, complex analysis | $$$ |
| 2 | **Anthropic** | Claude 3.5 Opus, Sonnet, Haiku | Long-context (200K tokens), document processing | $$$ |
| 3 | **Google AI** | Gemini 1.5 Pro, Gemini Flash | Multimodal (text + images), fast inference | $$ |
| 4 | **Azure OpenAI** | GPT-4, GPT-3.5 (via Azure) | Enterprise customers with Azure infra | $$$ |
| 5 | **Cohere** | Command R+, Command R, Command Light | Enterprise AI, RAG capabilities | $$ |
| 6 | **Mistral AI** | Mistral Large, Medium, Small | European data residency, cost-effective | $$ |
| 7 | **Meta Llama** | Llama 3.1 (8B, 70B, 405B), Llama 3.2 | Open-source, customizable, via Groq/Together AI | $ |
| 8 | **Groq** | Llama 3, Mixtral (ultra-fast) | Real-time queries, <100ms latency | $ |
| 9 | **Perplexity** | pplx-7b-online, pplx-70b-online | Search-augmented queries, up-to-date info | $$ |
| 10 | **Ollama (Local)** | Llama 3.1, Mistral, Phi-3, Gemma | **Offline AI**, data privacy, zero API costs | FREE |

### Key Features:

#### **Automatic Model Selection:**
```typescript
// AI Router automatically selects best model
function selectModel(queryLength, dataSize, userBudget) {
  if (queryLength < 200 && dataSize < 1000) {
    return 'gpt-4o-mini';  // Fast & cheap
  } else if (queryLength > 10000) {
    return 'claude-opus';  // Long-context specialist
  } else if (userBudget === 'low') {
    return 'llama-3.1-70b';  // Cost-effective via Groq
  } else {
    return 'gpt-4o';  // Balanced performance
  }
}
```

#### **Offline AI Support (Ollama):**
```typescript
// Desktop app can use local AI models (no internet required)
const ollama = new OllamaConnector();

await ollama.pullModel('llama3.1:8b');  // Download once, use forever

const response = await ollama.query({
  model: 'llama3.1:8b',
  prompt: 'Analyze this sales data...',
  data: salesData
});

// Benefits:
// - Zero API costs
// - Complete data privacy (never leaves device)
// - Works offline
// - Fast inference on modern laptops
```

---

## Summary of Key Changes:

### ✅ Confirmed:
1. **Online Legacy Software:** YES - Salesforce, ServiceNow, Jira, Zendesk (via REST APIs)
2. **Offline Legacy Software:** YES - PostgreSQL, MySQL, Oracle, SQL Server, SAP HANA, MongoDB (direct DB connections)
3. **Payment Gateways:** PayPal (global) + Razorpay (India) - **Need clarification on "Dodo Payments"**
4. **Email Service:** Nodemailer (SMTP-based) instead of Resend
5. **AI Models:** Expanded from 4 to 10 providers, including **Ollama for offline AI**

### ❓ Need Clarification:
- **"Dodo Payments"** - Is this a real payment gateway? Should we add it alongside PayPal and Razorpay? Or should we remove Stripe and keep only PayPal + Razorpay?

### 🎯 Benefits of These Changes:
1. **More Payment Options:** Focus on widely-used gateways (PayPal is trusted globally)
2. **Email Flexibility:** Nodemailer supports any SMTP provider (Gmail, SendGrid, AWS SES, custom server)
3. **AI Diversity:** 10 providers covering different use cases (speed, cost, privacy, offline)
4. **Offline AI:** Ollama enables completely offline AI queries with zero costs

---

## Next Steps:

1. **Confirm Payment Gateways:** Should we keep Stripe or replace with "Dodo Payments"?
2. **Update SRS.md:** Replace Stripe/Resend references with PayPal/Razorpay/Nodemailer
3. **Update Architecture.md:** Add code examples for all 10 AI providers
4. **Implement Ollama Support:** Add local AI model integration for offline use

Let me know your decision on the payment gateways, and I'll update all documentation accordingly!
