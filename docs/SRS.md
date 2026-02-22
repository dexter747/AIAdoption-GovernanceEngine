# Velanova Platform - Software Requirements Specification (SRS)

**Version:** 2.0  
**Date:** January 16, 2026  
**Deployment Model:** Desktop Application + Cloud Backend

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and non-functional requirements for Velanova, an enterprise AI adoption and governance platform delivered as a **cross-platform desktop application** that connects local legacy systems with modern AI services while maintaining data privacy and security.

### 1.2 Scope

Velanova provides:

- **Desktop application** (Windows, macOS, Linux) for local legacy system integration
- Multi-provider AI model routing and optimization
- Real-time cost tracking and ROI attribution
- Local data processing with PII protection (data never leaves customer's network)
- Cloud backend for authentication, licensing, and usage tracking
- Enterprise-grade security and compliance

### 1.3 Deployment Architecture

- **Client Application:** Electron-based desktop app installed on customer's machines/servers (Windows, macOS, Linux)
- **Local Processing:** All legacy data processing happens on customer's infrastructure
- **Cloud Backend:** Next.js full-stack application with PostgreSQL and MongoDB (authentication, billing, admin portal)
- **Data Security:** Legacy data never transmitted to our servers; only anonymized usage metrics
- **Top 10 Legacy Systems:** PostgreSQL, MySQL, Oracle, SQL Server, SAP HANA, MongoDB, Salesforce, ServiceNow, Jira, Zendesk

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    Customer's Infrastructure                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Velanova Desktop Application                  │  │
│  │                    (Electron-based)                        │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  UI Layer (React)                                    │  │  │
│  │  │  - Connection Manager                                │  │  │
│  │  │  - AI Query Interface                                │  │  │
│  │  │  - Cost Dashboard                                    │  │  │
│  │  │  - Settings & License Management                     │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  Business Logic Layer (Node.js/Electron Main)        │  │  │
│  │  │  - Legacy Connectors (PostgreSQL, Oracle, SAP, etc.) │  │  │
│  │  │  - AI Router (OpenAI, Anthropic, Google)             │  │  │
│  │  │  - PII Detection & Masking                           │  │  │
│  │  │  - Local Data Processing                             │  │  │
│  │  │  - Cost Calculator                                   │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  Local Storage (SQLite/LevelDB)                      │  │  │
│  │  │  - Connection configs (encrypted)                    │  │  │
│  │  │  - Query history                                     │  │  │
│  │  │  - Local usage cache                                 │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └───┬──────────────────────────────────────────────────┬───┘  │
│      │                                                  │       │
│      │ Localhost connection (127.0.0.1)                │       │
│      │                                                  │       │
│  ┌───▼──────────────┐                          ┌───────▼─────┐ │
│  │ Legacy Database  │                          │  Legacy     │ │
│  │ (Oracle/SAP/     │                          │  SaaS APIs  │ │
│  │  PostgreSQL)     │                          │ (Salesforce)│ │
│  └──────────────────┘                          └─────────────┘ │
└──────────┬───────────────────────────────────────────┬─────────┘
           │                                           │
           │ HTTPS Only (Outbound)                     │
           │ - License validation                      │
           │ - Usage logging                           │
           │ - AI API calls                            │
           │                                           │
    ┌──────▼───────────────────────────────────────────▼──────┐
    │              Internet (HTTPS/443 Only)                  │
    └──────┬───────────────────────────────────┬──────────────┘
           │                                   │
    ┌──────▼──────────┐               ┌────────▼──────────┐
    │   AI Providers  │               │  Velanova Cloud   │
    │   - OpenAI      │               │    Backend        │
    │   - Anthropic   │               │  ┌──────────────┐ │
    │   - Google AI   │               │  │ Auth API     │ │
    │   - Azure       │               │  │ License API  │ │
    └─────────────────┘               │  │ Payment API  │ │
                                      │  │ Usage API    │ │
                                      │  └──────────────┘ │
                                      │  ┌──────────────┐ │
                                      │  │ PostgreSQL   │ │
                                      │  │ MongoDB      │ │
                                      │  │ Redis        │ │
                                      │  └──────────────┘ │
                                      └───────────────────┘
```

### 2.2 Component Breakdown

#### 2.2.1 Desktop Application Components

| Component            | Technology                           | Purpose                            |
| -------------------- | ------------------------------------ | ---------------------------------- |
| **UI Framework**     | Electron + React                     | Cross-platform desktop UI          |
| **Main Process**     | Node.js                              | Business logic, system integration |
| **Renderer Process** | React + TailwindCSS                  | User interface                     |
| **Database Drivers** | node-oracledb, pg, mysql2, tedious   | Legacy system connectivity         |
| **AI SDKs**          | OpenAI SDK, Anthropic SDK, Google AI | AI provider integration            |
| **Local Storage**    | SQLite (better-sqlite3)              | Encrypted local data storage       |
| **IPC**              | Electron IPC                         | Main-Renderer communication        |
| **Auto-Updater**     | electron-updater                     | Automatic app updates              |

#### 2.2.2 Cloud Backend Components

| Service                | Technology                               | Purpose                                       |
| ---------------------- | ---------------------------------------- | --------------------------------------------- |
| **Full-Stack App**     | Next.js 14+ (App Router)                 | Unified frontend + API routes                 |
| **Auth Service**       | NextAuth.js + JWT                        | User authentication & sessions                |
| **License Manager**    | Custom JWT logic                         | License validation & enforcement              |
| **Payment Gateway**    | Dodo Payments, PayPal, Razorpay          | Multi-provider payment processing             |
| **Database (Primary)** | PostgreSQL 16                            | Users, licenses, subscriptions, payments      |
| **Database (Logs)**    | MongoDB 7                                | Application logs, usage metrics, audit trails |
| **ORM**                | Prisma (PostgreSQL) + Mongoose (MongoDB) | Type-safe database access                     |

---

## 3. Functional Requirements

### 3.1 Desktop Application Features

#### FR-APP-001: Application Installation

- **Description:** Users can download and install the desktop app on Windows, macOS, and Linux
- **Platforms:**
  - Windows: MSI installer + Windows Store
  - macOS: DMG + Mac App Store
  - Linux: AppImage, deb, rpm
- **Installation Requirements:**
  - Disk space: 500MB
  - Memory: 2GB RAM minimum
  - No admin privileges required (user-level install)
- **Priority:** Critical

#### FR-APP-002: Auto-Updates

- **Description:** App automatically checks and downloads updates in background
- **Implementation:** electron-updater with delta downloads
- **Update Frequency:** Check daily, notify user when update available
- **Rollback:** Previous version backup kept for 30 days
- **Priority:** High

#### FR-APP-003: Offline Mode

- **Description:** Core features work without internet connectivity
- **Offline Capabilities:**
  - Query local legacy systems
  - View cached query history
  - Access saved connection configs
- **Online-Required Features:**
  - AI API calls
  - License validation (cached for 7 days)
  - Usage sync
- **Priority:** Medium

### 3.2 User Authentication & Licensing

#### FR-AUTH-001: User Registration

- **Description:** Users register via web portal or desktop app
- **Registration Flow:**
  1. User enters email
  2. Email verification link sent
  3. User creates password
  4. User redirected to payment page
- **OAuth Support:** Google, Microsoft, GitHub
- **Priority:** Critical

#### FR-AUTH-002: License Activation

- **Description:** Desktop app requires valid license to function
- **License Types:**
  - **Trial:** 14-day free trial, 100 AI queries
  - **Professional:** $49/month, unlimited queries, 1 user
  - **Team:** $199/month, 5 users, shared connections
  - **Enterprise:** Custom pricing, unlimited users, SSO
- **Activation Flow:**
  1. User launches app
  2. App prompts for license key
  3. User completes payment in browser
  4. License key sent via email + stored in app
  5. App validates license with backend
- **Grace Period:** 3 days after expiration
- **Priority:** Critical

#### FR-AUTH-003: License Validation

- **Description:** App validates license on startup and periodically
- **Validation Frequency:**
  - On app launch
  - Every 24 hours (background)
  - Before expensive operations (AI queries)
- **Cached Validation:** Valid for 7 days offline
- **Implementation:** JWT with public key verification
- **Priority:** Critical

#### FR-AUTH-004: Multi-Device Support

- **Description:** Single license can activate on N devices (based on plan)
- **Device Limits:**
  - Professional: 2 devices
  - Team: 5 devices per user
  - Enterprise: Unlimited
- **Device Management:** Users can deactivate devices via web portal
- **Priority:** High

### 3.3 Payment Processing

#### FR-PAY-001: Multi-Provider Support

- **Description:** Support multiple payment gateways for global reach
- **Providers:**
  - **Stripe:** Primary (US, EU, global)
  - **PayPal:** Fallback (global)
  - **Razorpay:** India-specific
- **Currency Support:** USD, EUR, GBP, INR, AUD, CAD
- **Priority:** Critical

#### FR-PAY-002: Subscription Management

- **Description:** Automated recurring billing and subscription lifecycle
- **Features:**
  - Auto-renewal on subscription date
  - Email reminders 7 days before renewal
  - Failed payment retry (3 attempts over 10 days)
  - Grace period on payment failure
  - Downgrade/upgrade support
- **Webhooks:** Handle Dodo Payments/PayPal/Razorpay webhooks
- **Priority:** Critical

#### FR-PAY-003: Usage-Based Billing

- **Description:** Charge overages for usage beyond plan limits
- **Billing Model:**
  - Base subscription: Fixed monthly fee
  - AI queries: $0.01 per query beyond included amount
  - Data processing: $0.001 per MB processed
- **Billing Cycle:** Monthly, prorated for mid-cycle changes
- **Invoice Generation:** PDF invoices with detailed breakdown
- **Priority:** High

#### FR-PAY-004: Refund Processing

- **Description:** Support refund requests via admin portal
- **Refund Window:** 30 days from purchase
- **Refund Types:**
  - Full refund (unused subscriptions)
  - Prorated refund (partial month)
  - Goodwill refund (admin discretion)
- **Processing Time:** 5-10 business days
- **Priority:** Medium

### 3.4 Legacy System Integration

#### FR-LSI-001: Connection Manager (Top 10 Legacy Systems)

- **Description:** UI for adding, testing, and managing legacy system connections
- **Top 10 Supported Systems (Priority Order):**
  1. **PostgreSQL** - Most common open-source database
  2. **MySQL** - Popular web application database
  3. **Oracle Database** - Enterprise database standard
  4. **SQL Server** - Microsoft enterprise database
  5. **SAP HANA** - Enterprise resource planning database
  6. **MongoDB** - NoSQL document database
  7. **Salesforce** - CRM platform (REST API)
  8. **ServiceNow** - IT service management (REST API)
  9. **Jira** - Project management (REST API)
  10. **Zendesk** - Customer support platform (REST API)
- **Additional Support:** CSV/Excel file import for data migration
- **Connection Storage:** Encrypted SQLite database locally
- **Priority:** Critical

#### FR-LSI-002: Connection Testing

- **Description:** Validate connection before saving
- **Test Operations:**
  - Network connectivity check
  - Authentication validation
  - Permission verification (read access)
  - Sample query execution
- **Test Result Display:**
  - Success: Show table count / API endpoints
  - Failure: Detailed error message with troubleshooting tips
- **Priority:** High

#### FR-LSI-003: Credential Encryption

- **Description:** All passwords and API keys encrypted at rest
- **Encryption Method:**
  - Algorithm: AES-256-GCM
  - Key Derivation: PBKDF2 with user's master password
  - Salt: Random per-user salt stored separately
- **Master Password:** User sets on first launch, required to decrypt
- **Password Recovery:** Not possible (by design); user must recreate connections
- **Priority:** Critical

#### FR-LSI-004: Connection Pooling

- **Description:** Reuse database connections for performance
- **Pool Configuration:**
  - Min connections: 1
  - Max connections: 5 per legacy system
  - Idle timeout: 10 minutes
  - Connection test on borrow
- **Priority:** Medium

#### FR-LSI-005: Query Builder

- **Description:** Visual interface for building SQL/API queries
- **Features:**
  - Table/field picker from schema
  - Filter builder (WHERE clause)
  - Sort and limit controls
  - Preview results (first 100 rows)
  - Save queries for reuse
- **Export Options:** CSV, JSON, Excel
- **Priority:** Medium

### 3.5 AI Integration

#### FR-AI-001: Multi-Provider Support

- **Description:** Support multiple AI providers with automatic failover
- **Providers:**
  - **OpenAI:** GPT-4o, GPT-4o-mini, o1-preview
  - **Anthropic:** Claude Opus, Sonnet, Haiku
  - **Google:** Gemini Pro, Gemini Flash
  - **Azure OpenAI:** GPT-4, GPT-3.5
  - **Local Models:** Ollama integration (optional)
- **API Key Management:** User provides own keys or uses platform's pay-per-use
- **Priority:** Critical

#### FR-AI-002: Automatic Model Selection

- **Description:** Route queries to optimal model based on complexity and cost
- **Selection Rules:**
  - Simple queries (<200 tokens): GPT-4o-mini, Claude Haiku
  - Medium queries (200-1000 tokens): GPT-4o, Claude Sonnet
  - Complex queries (>1000 tokens): o1-preview, Claude Opus
  - Reasoning tasks: o1-preview, Claude Opus
  - Code generation: GPT-4o, Claude Sonnet
- **User Override:** Allow manual model selection
- **Priority:** High

#### FR-AI-003: Prompt Templates

- **Description:** Pre-built and custom prompt templates
- **Built-In Templates:**
  - Data summarization
  - SQL query generation
  - Report generation
  - Anomaly detection
  - Data quality checks
- **Custom Templates:** User can create and save templates
- **Template Variables:** ${table}, ${data}, ${question}
- **Priority:** Medium

#### FR-AI-004: Context Window Management

- **Description:** Automatically chunk large datasets to fit model context limits
- **Chunking Strategy:**
  - GPT-4o: 128K tokens → chunk at 100K
  - Claude Opus: 200K tokens → chunk at 180K
  - Summarize-then-analyze for multi-chunk queries
- **Token Counting:** Accurate pre-flight token estimation
- **Priority:** High

#### FR-AI-005: Response Streaming

- **Description:** Stream AI responses in real-time for better UX
- **Implementation:** Server-Sent Events (SSE) from AI providers
- **UI Display:** Typewriter effect with progress indicator
- **Cancellation:** User can stop generation mid-stream
- **Priority:** Medium

### 3.6 Data Processing & Privacy

#### FR-DATA-001: PII Detection

- **Description:** Automatically detect personally identifiable information
- **Detection Methods:**
  - **Regex Patterns:** Email, phone, SSN, credit card, IP address
  - **NER (Named Entity Recognition):** spaCy for names, locations
  - **Custom Rules:** User-defined PII patterns
- **Supported Languages:** English, Spanish, French, German
- **Priority:** Critical

#### FR-DATA-002: PII Masking

- **Description:** Mask or redact PII before sending to AI
- **Masking Options:**
  - **Redact:** Replace with [EMAIL], [NAME], [SSN]
  - **Hash:** SHA-256 hash (reversible with key)
  - **Tokenize:** Replace with unique tokens
  - **Fake Data:** Replace with realistic fake data (Faker.js)
- **User Control:** Toggle PII masking on/off per query
- **Audit:** Log all PII detection events locally
- **Priority:** Critical

#### FR-DATA-003: Data Size Limits

- **Description:** Enforce limits on data sent to AI to control costs
- **Limits:**
  - Max rows per query: 10,000 (configurable)
  - Max file size: 10MB
  - Max tokens per request: 100K (model-dependent)
- **Overflow Handling:** Prompt user to filter or sample data
- **Priority:** High

#### FR-DATA-004: Local Data Processing

- **Description:** All data processing happens on user's machine
- **Guarantee:** Legacy data never transmitted to our backend
- **Transmission:** Only anonymized metadata (query count, model used, cost)
- **Verification:** Network traffic logging feature for transparency
- **Priority:** Critical

### 3.7 Cost Tracking & Analytics

#### FR-COST-001: Real-Time Cost Tracking

- **Description:** Display cost of each AI query in real-time
- **Cost Calculation:**
  - Fetch latest pricing from provider APIs daily
  - Calculate: (input_tokens / 1000) _ input_price + (output_tokens / 1000) _ output_price
  - Add platform markup (10-20%)
- **Display:** Show cost before and after query execution
- **Priority:** High

#### FR-COST-002: Usage Dashboard

- **Description:** Local dashboard showing usage statistics
- **Metrics:**
  - Total queries today/week/month
  - Cost breakdown by AI provider
  - Cost by legacy system
  - Average cost per query
  - Top 10 most expensive queries
- **Charts:** Line charts, pie charts, bar charts
- **Export:** CSV, PDF reports
- **Priority:** High

#### FR-COST-003: Budget Alerts

- **Description:** Notify user when approaching budget limits
- **Alert Types:**
  - Daily budget exceeded
  - Weekly budget 80% reached
  - Monthly projection exceeds budget
- **Alert Methods:** Desktop notification, email (optional)
- **Budget Configuration:** User sets custom budgets
- **Priority:** Medium

#### FR-COST-004: Query History

- **Description:** Searchable history of all queries and costs
- **Storage:** SQLite database (encrypted)
- **Retention:** 90 days default, configurable up to 365 days
- **Search:** Full-text search on queries and results
- **Export:** Export selected queries to CSV
- **Priority:** Medium

### 3.8 Security & Compliance

#### FR-SEC-001: End-to-End Encryption

- **Description:** All sensitive data encrypted at rest and in transit
- **At Rest:**
  - Connection credentials: AES-256-GCM
  - Query history: AES-256-GCM
  - License key: Stored in OS keychain (Windows Credential Manager, macOS Keychain, Linux Secret Service)
- **In Transit:**
  - All network calls: TLS 1.3
  - Certificate pinning for backend API
- **Priority:** Critical

#### FR-SEC-002: Audit Logging

- **Description:** Log all security-relevant events locally
- **Logged Events:**
  - User login/logout
  - Connection added/modified/deleted
  - AI query executed (anonymized)
  - License validation attempts
  - Failed authentication attempts
- **Storage:** Local MongoDB-compatible embedded DB (NeDB)
- **Retention:** 90 days, auto-purge older logs
- **Priority:** High

#### FR-SEC-003: Network Traffic Logging

- **Description:** Optional feature to log all network requests for transparency
- **Purpose:** Allow customers to verify no data leakage
- **Log Contents:**
  - Destination URL
  - Request headers (sanitized)
  - Response status code
  - Data size (bytes)
  - Timestamp
- **Exclusions:** Request/response bodies (too sensitive)
- **Priority:** Medium

#### FR-SEC-004: Compliance Certifications

- **Description:** Desktop app and backend meet compliance standards
- **Certifications:**
  - SOC 2 Type II (backend)
  - GDPR compliant (data processing agreement)
  - HIPAA eligible (BAA available for enterprise)
- **Data Residency:** User data stored in region of choice (US, EU, Asia)
- **Priority:** High

---

## 4. Database Architecture

### 4.1 PostgreSQL Schema (Cloud Backend)

PostgreSQL stores user accounts, licenses, subscriptions, and payment records.

#### Table: `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- NULL for OAuth users
  full_name VARCHAR(255),
  company_name VARCHAR(255),
  oauth_provider VARCHAR(50), -- 'google', 'microsoft', 'github', NULL
  oauth_id VARCHAR(255),
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' -- 'active', 'suspended', 'deleted'
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);
```

#### Table: `licenses`

```sql
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  license_key VARCHAR(500) UNIQUE NOT NULL, -- JWT token
  plan_type VARCHAR(50) NOT NULL, -- 'trial', 'professional', 'team', 'enterprise'
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'suspended', 'cancelled'
  issued_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  last_validated_at TIMESTAMP,
  device_limit INTEGER DEFAULT 2,
  query_limit INTEGER, -- NULL for unlimited
  metadata JSONB DEFAULT '{}', -- Custom fields for enterprise
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_licenses_user ON licenses(user_id);
CREATE INDEX idx_licenses_key ON licenses(license_key);
CREATE INDEX idx_licenses_status ON licenses(status);
```

#### Table: `devices`

```sql
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES licenses(id) ON DELETE CASCADE,
  device_fingerprint VARCHAR(255) UNIQUE NOT NULL, -- Machine ID hash
  device_name VARCHAR(255), -- "John's MacBook Pro"
  os_platform VARCHAR(50), -- 'windows', 'darwin', 'linux'
  os_version VARCHAR(100),
  app_version VARCHAR(50),
  first_activated_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'deactivated'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_devices_license ON devices(license_id);
CREATE INDEX idx_devices_fingerprint ON devices(device_fingerprint);
```

#### Table: `subscriptions`

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  license_id UUID REFERENCES licenses(id),
  payment_provider VARCHAR(50) NOT NULL, -- 'dodo', 'paypal', 'razorpay'
  provider_subscription_id VARCHAR(255), -- Dodo/PayPal/Razorpay subscription ID
  provider_customer_id VARCHAR(255), -- Dodo/PayPal/Razorpay customer ID
  plan_type VARCHAR(50) NOT NULL,
  billing_cycle VARCHAR(20), -- 'monthly', 'yearly'
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50), -- 'active', 'past_due', 'cancelled', 'unpaid'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_provider ON subscriptions(payment_provider, provider_subscription_id);
```

#### Table: `payments`

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  payment_provider VARCHAR(50) NOT NULL,
  provider_payment_id VARCHAR(255), -- Dodo/PayPal/Razorpay payment ID
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50), -- 'succeeded', 'pending', 'failed', 'refunded'
  payment_method VARCHAR(50), -- 'card', 'paypal', 'upi'
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_subscription ON payments(subscription_id);
CREATE INDEX idx_payments_status ON payments(status);
```

#### Table: `invoices`

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  amount_subtotal DECIMAL(10, 2) NOT NULL,
  amount_tax DECIMAL(10, 2) DEFAULT 0,
  amount_total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50), -- 'draft', 'open', 'paid', 'void'
  invoice_pdf_url TEXT,
  billing_period_start TIMESTAMP,
  billing_period_end TIMESTAMP,
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
```

#### Table: `usage_summary`

```sql
CREATE TABLE usage_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  license_id UUID REFERENCES licenses(id),
  date DATE NOT NULL,
  query_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 4) DEFAULT 0,
  ai_provider_breakdown JSONB DEFAULT '{}', -- {openai: 50, anthropic: 30}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_usage_summary_user_date ON usage_summary(user_id, date DESC);
CREATE INDEX idx_usage_summary_license ON usage_summary(license_id);
```

#### Table: `ai_pricing`

```sql
CREATE TABLE ai_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  input_price_per_1k DECIMAL(10, 6) NOT NULL,
  output_price_per_1k DECIMAL(10, 6) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  effective_date DATE NOT NULL,
  expires_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, model_name, effective_date)
);

CREATE INDEX idx_ai_pricing_provider_model ON ai_pricing(provider, model_name, effective_date DESC);
```

### 4.2 MongoDB Schema (Logs)

MongoDB stores application logs, AI query logs, and audit trails.

#### Collection: `app_logs`

```javascript
{
  _id: ObjectId,
  user_id: UUID,
  license_id: UUID,
  device_fingerprint: String,
  level: String, // 'info', 'warn', 'error', 'debug'
  event_type: String, // 'app_launch', 'connection_test', 'ai_query', etc.
  message: String,
  metadata: {
    app_version: String,
    os_platform: String,
    // Additional context
  },
  timestamp: ISODate,
  created_at: ISODate
}

// Indexes
db.app_logs.createIndex({ user_id: 1, timestamp: -1 })
db.app_logs.createIndex({ event_type: 1, timestamp: -1 })
db.app_logs.createIndex({ timestamp: -1 })
```

#### Collection: `ai_query_logs`

```javascript
{
  _id: ObjectId,
  user_id: UUID,
  license_id: UUID,
  device_fingerprint: String,
  query_id: UUID, // Unique query identifier
  ai_provider: String, // 'openai', 'anthropic', 'google'
  model: String, // 'gpt-4o', 'claude-sonnet-4'
  prompt_summary: String, // First 100 chars (anonymized)
  input_tokens: Number,
  output_tokens: Number,
  total_tokens: Number,
  cost: Number,
  latency_ms: Number,
  status: String, // 'success', 'error', 'cancelled'
  error_message: String, // If status is error
  metadata: {
    legacy_system_type: String, // 'postgresql', 'salesforce', etc.
    query_type: String, // 'data_summary', 'sql_generation', etc.
    pii_detected: Boolean,
    pii_masked: Boolean
  },
  timestamp: ISODate,
  created_at: ISODate
}

// Indexes
db.ai_query_logs.createIndex({ user_id: 1, timestamp: -1 })
db.ai_query_logs.createIndex({ license_id: 1, timestamp: -1 })
db.ai_query_logs.createIndex({ ai_provider: 1, model: 1, timestamp: -1 })
db.ai_query_logs.createIndex({ timestamp: -1 })
```

#### Collection: `audit_logs`

```javascript
{
  _id: ObjectId,
  user_id: UUID,
  license_id: UUID,
  device_fingerprint: String,
  action: String, // 'login', 'logout', 'connection_added', 'license_validated'
  resource_type: String, // 'user', 'license', 'connection'
  resource_id: String,
  changes: {
    before: Object, // Previous state (anonymized)
    after: Object  // New state (anonymized)
  },
  ip_address: String,
  user_agent: String,
  status: String, // 'success', 'failure'
  timestamp: ISODate,
  created_at: ISODate
}

// Indexes
db.audit_logs.createIndex({ user_id: 1, timestamp: -1 })
db.audit_logs.createIndex({ action: 1, timestamp: -1 })
db.audit_logs.createIndex({ timestamp: -1 })

// TTL Index: Auto-delete logs older than 90 days
db.audit_logs.createIndex({ created_at: 1 }, { expireAfterSeconds: 7776000 })
```

#### Collection: `error_reports`

```javascript
{
  _id: ObjectId,
  user_id: UUID,
  license_id: UUID,
  device_fingerprint: String,
  error_type: String, // 'crash', 'api_error', 'connection_error'
  error_message: String,
  stack_trace: String,
  app_version: String,
  os_platform: String,
  os_version: String,
  context: {
    screen: String, // Current screen when error occurred
    action: String, // User action that triggered error
    // Additional debug info
  },
  timestamp: ISODate,
  created_at: ISODate
}

// Indexes
db.error_reports.createIndex({ error_type: 1, timestamp: -1 })
db.error_reports.createIndex({ app_version: 1, timestamp: -1 })
```

### 4.3 Redis Schema (Caching & Sessions)

Redis stores sessions, rate limiting, and temporary data.

#### Key Patterns:

```
# Session Management
session:{session_id} → JSON (TTL: 24 hours)
{
  user_id: UUID,
  license_id: UUID,
  device_fingerprint: String,
  expires_at: Timestamp
}

# License Cache (for offline validation)
license:cache:{license_key} → JSON (TTL: 7 days)
{
  license_id: UUID,
  user_id: UUID,
  plan_type: String,
  status: String,
  expires_at: Timestamp,
  cached_at: Timestamp
}

# Rate Limiting (per user)
ratelimit:{user_id}:ai_queries → Counter (TTL: 1 hour)
ratelimit:{user_id}:api_calls → Counter (TTL: 1 minute)

# AI Provider Health Check
ai_provider:health:{provider} → JSON (TTL: 5 minutes)
{
  status: String, // 'healthy', 'degraded', 'down'
  last_check: Timestamp,
  latency_ms: Number
}

# Pricing Cache
ai_pricing:cache → JSON (TTL: 24 hours)
{
  openai: { gpt-4o: { input: 0.0025, output: 0.01 }, ... },
  anthropic: { ... }
}

# User Online Status
user:online:{user_id} → String (TTL: 5 minutes)
"true"

# Failed Payment Retry Queue
failed_payment:queue → List
[subscription_id_1, subscription_id_2, ...]
```

---

## 5. Non-Functional Requirements

### 5.1 Desktop Application Performance

#### NFR-APP-PERF-001: App Launch Time

- **Requirement:** App launches within 3 seconds on modern hardware
- **Measurement:** From click to main window visible
- **Optimization:**
  - Lazy load modules
  - Cache database drivers
  - Optimize Electron bundle size

#### NFR-APP-PERF-002: UI Responsiveness

- **Requirement:** UI remains responsive during background operations
- **Implementation:**
  - All heavy operations in Electron main process
  - IPC communication non-blocking
  - Loading indicators for operations > 500ms

#### NFR-APP-PERF-003: Memory Usage

- **Requirement:** < 500MB RAM under normal usage
- **Measurement:** With 3 connections, 100 query history
- **Optimization:**
  - Limit query result cache size
  - Cleanup unused database connections
  - Dispose unused React components

#### NFR-APP-PERF-004: Legacy Query Performance

- **Requirement:** < 100ms overhead for legacy database queries
- **Implementation:** Connection pooling, prepared statements

### 5.2 Cloud Backend Performance

#### NFR-BACKEND-PERF-001: API Response Time

- **Requirement:** 95th percentile < 150ms for API endpoints
- **Endpoints:**
  - License validation: < 50ms
  - User authentication: < 100ms
  - Usage logging: < 200ms (async)
- **Monitoring:** Datadog APM or New Relic

#### NFR-BACKEND-PERF-002: Payment Processing

- **Requirement:** Payment webhooks processed within 5 seconds
- **Implementation:**
  - Webhook queue with Bull/BullMQ
  - Retry failed webhooks with exponential backoff

#### NFR-BACKEND-PERF-003: Database Query Performance

- **Requirement:** All queries < 200ms at 90th percentile
- **Implementation:**
  - Proper indexing on PostgreSQL
  - MongoDB query optimization
  - Redis for hot data

### 5.3 Scalability

#### NFR-SCALE-001: User Capacity

- **Requirement:** Support 100,000 active users
- **Implementation:**
  - Stateless API servers (horizontal scaling)
  - Database connection pooling
  - Redis for session management

#### NFR-SCALE-002: Concurrent Requests

- **Requirement:** Handle 10,000 API requests/second
- **Implementation:**
  - Load balancer (AWS ALB or Nginx)
  - Auto-scaling based on CPU/memory
  - Rate limiting per user (100 req/min)

#### NFR-SCALE-003: Data Storage

- **Requirement:** Handle 1TB+ of logs and usage data
- **Implementation:**
  - MongoDB sharding
  - TTL-based log rotation (90 days)
  - Archive to S3 for long-term storage

### 5.4 Availability & Reliability

#### NFR-AVAIL-001: Backend Uptime SLA

- **Requirement:** 99.9% uptime (8.76 hours downtime/year)
- **Implementation:**
  - Multi-AZ deployment (AWS/Azure)
  - Health checks on all services
  - Auto-recovery on failure

#### NFR-AVAIL-002: Disaster Recovery

- **Requirement:** RPO < 1 hour, RTO < 4 hours
- **Implementation:**
  - PostgreSQL: Daily backups + WAL archiving
  - MongoDB: Replica set with 3 nodes
  - Redis: AOF persistence

#### NFR-AVAIL-003: Graceful Degradation

- **Requirement:** App continues working if backend unavailable
- **Offline Capabilities:**
  - License validation (7-day cache)
  - Query history access
  - Local legacy system queries
- **Sync on Reconnect:** Upload cached usage logs

### 5.5 Security

#### NFR-SEC-001: Encryption Standards

- **Requirement:** Industry-standard encryption at rest and in transit
- **At Rest:**
  - Desktop app: AES-256-GCM for credentials
  - PostgreSQL: Transparent data encryption
  - MongoDB: Encryption at rest enabled
- **In Transit:**
  - TLS 1.3 for all network communication
  - Certificate pinning in desktop app

#### NFR-SEC-002: Authentication Security

- **Requirement:** Secure authentication with modern standards
- **Implementation:**
  - Password hashing: Argon2id
  - JWT tokens: RS256 with 1-hour expiration
  - Refresh tokens: 30-day expiration
  - OAuth 2.0 for third-party auth

#### NFR-SEC-003: Vulnerability Management

- **Requirement:** No critical vulnerabilities in production
- **Process:**
  - Weekly dependency scans (npm audit, Snyk)
  - Monthly penetration testing
  - Bug bounty program
  - 24-hour patch for critical vulns

#### NFR-SEC-004: Data Privacy

- **Requirement:** Comply with GDPR, CCPA, and data residency laws
- **Implementation:**
  - Data processing agreement (DPA)
  - Right to erasure (user data deletion)
  - Data export in JSON format
  - Region-specific deployments (US, EU, Asia)

### 5.6 Maintainability

#### NFR-MAINT-001: Code Quality

- **Requirement:** Maintainable, testable codebase
- **Standards:**
  - TypeScript for type safety
  - ESLint + Prettier
  - Code coverage > 70%
  - Code review required for all PRs

#### NFR-MAINT-002: Observability

- **Requirement:** Complete visibility into system health
- **Implementation:**
  - Structured logging (Winston/Bunyan)
  - Error tracking (Sentry)
  - Metrics dashboard (Grafana)
  - Distributed tracing (optional)

#### NFR-MAINT-003: Automated Deployment

- **Requirement:** One-click deployments with rollback
- **Implementation:**
  - CI/CD: GitHub Actions
  - Desktop app: Auto-update via electron-updater
  - Backend: Blue-green deployment

### 5.7 Usability

#### NFR-USABILITY-001: Onboarding Time

- **Requirement:** Users productive within 15 minutes
- **Measurement:** From download to first AI query
- **Implementation:**
  - Interactive tutorial on first launch
  - Sample connections for testing
  - Pre-built prompt templates

#### NFR-USABILITY-002: Accessibility

- **Requirement:** WCAG 2.1 Level AA compliance
- **Implementation:**
  - Keyboard navigation
  - Screen reader support
  - High contrast mode
  - Resizable UI elements

#### NFR-USABILITY-003: Error Messages

- **Requirement:** Actionable error messages with solutions
- **Examples:**
  - "Connection failed: Check that database is running on localhost:5432"
  - "License expired: Renew at https://app.velanova.com/billing"
  - "PII detected: Review and mask before sending to AI"

---

## 6. Payment Gateway Integration

### 6.1 Dodo Payments Integration (Primary)

#### Implementation:

```javascript
// backend/src/payment/dodo.service.js
const { DodoPayments } = require('@dodopayments/payments-sdk');

const dodo = new DodoPayments({
  apiKey: process.env.DODO_API_KEY,
  environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
});

async function createSubscription(userId, productId, paymentMethodId) {
  // 1. Create or retrieve customer
  const customer = await dodo.customers.create({
    email: user.email,
    name: user.full_name,
    metadata: { user_id: userId },
  });

  // 2. Create subscription
  const subscription = await dodo.subscriptions.create({
    customer_id: customer.id,
    product_id: productId,
    payment_method_id: paymentMethodId,
    billing_period: 'monthly',
    metadata: { user_id: userId },
  });

  // 3. Store in database
  await db.subscriptions.create({
    user_id: userId,
    payment_provider: 'dodo',
    provider_subscription_id: subscription.id,
    provider_customer_id: customer.id,
    status: subscription.status,
  });

  return subscription;
}

// Webhook handler
app.post('/webhooks/dodo', async (req, res) => {
  const signature = req.headers['x-dodo-signature'];

  // Verify webhook signature
  const isValid = dodo.webhooks.verify(req.body, signature, process.env.DODO_WEBHOOK_SECRET);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;

  switch (event.type) {
    case 'payment.succeeded':
      await handlePaymentSuccess(event.data);
      break;
    case 'payment.failed':
      await handlePaymentFailure(event.data);
      break;
    case 'subscription.created':
      await handleSubscriptionCreated(event.data);
      break;
    case 'subscription.updated':
      await handleSubscriptionUpdated(event.data);
      break;
    case 'subscription.cancelled':
      await handleSubscriptionCancelled(event.data);
      break;
  }

  res.json({ status: 'success' });
});
```

#### Price IDs:

```
Professional Monthly: price_professional_monthly_usd
Professional Yearly: price_professional_yearly_usd
Team Monthly: price_team_monthly_usd
Team Yearly: price_team_yearly_usd
```

### 6.2 PayPal Integration (Fallback)

#### Implementation:

```javascript
// backend/src/payment/paypal.service.js
const paypal = require('@paypal/checkout-server-sdk');

const environment = new paypal.core.LiveEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

async function createSubscription(userId, planId) {
  const request = new paypal.v1.billing.SubscriptionsCreateRequest();
  request.requestBody({
    plan_id: planId,
    subscriber: {
      email_address: user.email,
      name: { given_name: user.full_name },
    },
    application_context: {
      return_url: 'https://app.velanova.com/payment/success',
      cancel_url: 'https://app.velanova.com/payment/cancel',
    },
  });

  const response = await client.execute(request);

  await db.subscriptions.create({
    user_id: userId,
    payment_provider: 'paypal',
    provider_subscription_id: response.result.id,
    status: response.result.status,
  });

  return response.result;
}

// Webhook handler
app.post('/webhooks/paypal', async (req, res) => {
  const event = req.body;

  // Verify webhook signature
  const isValid = await paypal.webhooks.verify(event);
  if (!isValid) return res.status(401).send('Invalid signature');

  switch (event.event_type) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
      await handleSubscriptionActivated(event.resource);
      break;
    case 'BILLING.SUBSCRIPTION.CANCELLED':
      await handleSubscriptionCancelled(event.resource);
      break;
    case 'PAYMENT.SALE.COMPLETED':
      await handlePaymentSuccess(event.resource);
      break;
  }

  res.json({ status: 'success' });
});
```

### 6.3 Razorpay Integration (India)

#### Implementation:

```javascript
// backend/src/payment/razorpay.service.js
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createSubscription(userId, planId) {
  const subscription = await razorpay.subscriptions.create({
    plan_id: planId,
    customer_notify: 1,
    total_count: 12, // 12 months
    notes: { user_id: userId },
  });

  await db.subscriptions.create({
    user_id: userId,
    payment_provider: 'razorpay',
    provider_subscription_id: subscription.id,
    status: subscription.status,
  });

  return subscription;
}

// Webhook handler
app.post('/webhooks/razorpay', async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  const isValid = Razorpay.validateWebhookSignature(JSON.stringify(req.body), signature, secret);

  if (!isValid) return res.status(401).send('Invalid signature');

  const event = req.body;

  switch (event.event) {
    case 'subscription.activated':
      await handleSubscriptionActivated(event.payload.subscription.entity);
      break;
    case 'subscription.charged':
      await handlePaymentSuccess(event.payload.payment.entity);
      break;
    case 'subscription.cancelled':
      await handleSubscriptionCancelled(event.payload.subscription.entity);
      break;
  }

  res.json({ status: 'ok' });
});
```

### 6.4 Payment Provider Selection Logic

```javascript
// Desktop app: Select provider based on user's region
function selectPaymentProvider(userCountry, userCurrency, userPreference) {
  // India: Use Razorpay (best UPI support)
  if (userCountry === 'IN' || userCurrency === 'INR') {
    return 'razorpay';
  }

  // PayPal for users who prefer it
  if (userPreference === 'paypal') {
    return 'paypal';
  }

  // Default: Dodo Payments (AI-optimized, 150+ countries, Merchant of Record)
  return 'dodo';
}
```

---

## 7. Cloud Backend Deployment

### 7.1 Infrastructure (AWS)

```yaml
# infrastructure/aws/main.tf (Terraform)
resource "aws_instance" "api_server" {
  ami           = "ami-0c55b159cbfafe1f0" # Ubuntu 22.04
  instance_type = "t3.medium"
  count         = 2 # Multiple instances for redundancy

  user_data = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y docker.io docker-compose
    systemctl enable docker
    systemctl start docker
  EOF

  tags = {
    Name = "velanova-api-${count.index}"
  }
}

resource "aws_db_instance" "postgres" {
  identifier           = "velanova-postgres"
  engine               = "postgres"
  engine_version       = "16.1"
  instance_class       = "db.t3.medium"
  allocated_storage    = 100
  storage_encrypted    = true
  multi_az             = true
  backup_retention_period = 30

  db_name  = "velanova"
  username = "admin"
  password = var.db_password
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "velanova-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
}

resource "aws_docdb_cluster" "mongodb" {
  cluster_identifier      = "velanova-docdb"
  engine                  = "docdb"
  master_username         = "admin"
  master_password         = var.mongodb_password
  backup_retention_period = 7
  preferred_backup_window = "07:00-09:00"
  storage_encrypted       = true
}

resource "aws_lb" "main" {
  name               = "velanova-alb"
  load_balancer_type = "application"
  subnets            = aws_subnet.public[*].id

  tags = {
    Name = "velanova-load-balancer"
  }
}
```

### 7.2 Docker Compose (Backend Services)

```yaml
# backend/docker-compose.yml
version: '3.8'

services:
  api:
    build: ./api
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${POSTGRES_URL}
      - MONGODB_URL=${MONGODB_URL}
      - REDIS_URL=${REDIS_URL}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - PAYPAL_CLIENT_ID=${PAYPAL_CLIENT_ID}
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - redis
    restart: always
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3

  worker:
    build: ./worker
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${POSTGRES_URL}
      - MONGODB_URL=${MONGODB_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - redis
    restart: always

  admin:
    build: ./admin
    ports:
      - '3001:3000'
    environment:
      - NEXT_PUBLIC_API_URL=https://api.velanova.com
    restart: always

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis-data:/data
    restart: always
    command: redis-server --appendonly yes

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - api
    restart: always

volumes:
  redis-data:
```

### 7.3 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Build Docker images
        run: |
          docker build -t velanova/api:${{ github.sha }} ./backend/api
          docker build -t velanova/worker:${{ github.sha }} ./backend/worker

      - name: Push to Docker Hub
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker push velanova/api:${{ github.sha }}
          docker push velanova/worker:${{ github.sha }}

      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/velanova
            docker-compose pull
            docker-compose up -d --force-recreate
            docker system prune -af
```

---

## 8. Desktop App Deployment

### 8.1 Electron Build Configuration

```javascript
// electron-builder.yml
appId: com.velanova.app
productName: Velanova
copyright: Copyright © 2026 Velanova Inc.

directories:
  output: dist
  buildResources: build

files:
  - from: .
    filter:
      - package.json
      - app
      - node_modules

mac:
  category: public.app-category.developer-tools
  target:
    - dmg
    - zip
  icon: build/icon.icns
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist

dmg:
  contents:
    - x: 410
      y: 150
      type: link
      path: /Applications
    - x: 130
      y: 150
      type: file

win:
  target:
    - nsis
    - portable
  icon: build/icon.ico
  certificateSubjectName: "Velanova Inc"
  signingHashAlgorithms:
    - sha256

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: always

linux:
  target:
    - AppImage
    - deb
    - rpm
  category: Development
  icon: build/icons

publish:
  provider: github
  owner: velanova
  repo: desktop-app
  private: true
```

### 8.2 Auto-Update Configuration

```javascript
// main.js (Electron)
const { autoUpdater } = require('electron-updater');

autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'velanova',
  repo: 'desktop-app',
  private: true,
  token: process.env.GH_TOKEN,
});

// Check for updates on startup
app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
});

// Check every 4 hours
setInterval(
  () => {
    autoUpdater.checkForUpdatesAndNotify();
  },
  4 * 60 * 60 * 1000
);

autoUpdater.on('update-available', info => {
  dialog
    .showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `Version ${info.version} is available. Download now?`,
      buttons: ['Download', 'Later'],
    })
    .then(result => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
});

autoUpdater.on('update-downloaded', info => {
  dialog
    .showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. Restart to apply?',
      buttons: ['Restart', 'Later'],
    })
    .then(result => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
});
```

---

## 9. Testing Strategy

### 9.1 Desktop App Testing

#### Unit Tests (Jest)

```javascript
// __tests__/legacy-connector.test.js
const { PostgreSQLAdapter } = require('../src/adapters/postgresql');

describe('PostgreSQLAdapter', () => {
  test('connects to database successfully', async () => {
    const adapter = new PostgreSQLAdapter();
    await adapter.connect({
      host: 'localhost',
      port: 5432,
      database: 'test_db',
      user: 'test_user',
      password: 'test_pass',
    });

    expect(adapter.isConnected()).toBe(true);
  });

  test('executes query and returns results', async () => {
    const adapter = new PostgreSQLAdapter();
    await adapter.connect(testConfig);

    const results = await adapter.query('SELECT 1 as num');
    expect(results).toEqual([{ num: 1 }]);
  });
});
```

#### Integration Tests (Playwright)

```javascript
// __tests__/e2e/connection-flow.spec.js
const { test, expect, _electron } = require('@playwright/test');

test('user can add and test PostgreSQL connection', async () => {
  const app = await _electron.launch({ args: ['.'] });
  const window = await app.firstWindow();

  // Navigate to connections
  await window.click('text=Connections');
  await window.click('text=Add Connection');

  // Fill form
  await window.selectOption('select[name=type]', 'postgresql');
  await window.fill('input[name=host]', 'localhost');
  await window.fill('input[name=port]', '5432');
  await window.fill('input[name=database]', 'test_db');
  await window.fill('input[name=username]', 'test_user');
  await window.fill('input[name=password]', 'test_pass');

  // Test connection
  await window.click('button:has-text("Test Connection")');
  await expect(window.locator('.success-message')).toContainText('Connected successfully');

  // Save connection
  await window.click('button:has-text("Save")');
  await expect(window.locator('.connection-list')).toContainText('test_db');

  await app.close();
});
```

### 9.2 Backend API Testing

#### API Tests (Supertest)

```javascript
// __tests__/api/auth.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Authentication API', () => {
  test('POST /api/auth/register - creates new user', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'SecurePass123!',
      full_name: 'Test User',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user_id');
  });

  test('POST /api/auth/login - returns JWT token', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'SecurePass123!',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('refresh_token');
  });
});
```

### 9.3 Load Testing (k6)

```javascript
// load-tests/license-validation.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<150'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const response = http.post(
    'https://api.velanova.com/api/licenses/validate',
    JSON.stringify({
      license_key: __ENV.TEST_LICENSE_KEY,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(response, {
    'status is 200': r => r.status === 200,
    'response time < 150ms': r => r.timings.duration < 150,
  });

  sleep(1);
}
```

---

## 10. Monitoring & Observability

### 10.1 Application Monitoring

```javascript
// Desktop app: Send telemetry to backend
const analytics = {
  async track(event, properties) {
    await fetch('https://api.velanova.com/api/telemetry', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getLicenseKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        properties,
        timestamp: new Date().toISOString(),
        app_version: app.getVersion(),
        platform: process.platform,
      }),
    });
  },
};

// Track key events
analytics.track('app_launched', {});
analytics.track('connection_added', { type: 'postgresql' });
analytics.track('ai_query_executed', { provider: 'openai', model: 'gpt-4o' });
```

### 10.2 Error Tracking (Sentry)

```javascript
// Desktop app
const Sentry = require('@sentry/electron');

Sentry.init({
  dsn: 'https://xxx@sentry.io/xxx',
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    return event;
  },
});

// Capture errors
try {
  await legacyConnector.connect(config);
} catch (error) {
  Sentry.captureException(error, {
    tags: { component: 'legacy-connector' },
    extra: { connection_type: config.type },
  });
  throw error;
}
```

---

## 11. Appendix

### 11.1 Technology Stack Summary

| Layer             | Technology               | Version | Purpose                  |
| ----------------- | ------------------------ | ------- | ------------------------ |
| **Desktop App**   | Electron                 | 28+     | Cross-platform desktop   |
| **UI Framework**  | React                    | 18+     | User interface           |
| **Styling**       | TailwindCSS              | 3+      | UI styling               |
| **Local Storage** | SQLite (better-sqlite3)  | Latest  | Encrypted local data     |
| **Backend API**   | Node.js + Express        | 20+     | REST API                 |
| **Auth**          | Passport.js + JWT        | Latest  | Authentication           |
| **Payment**       | Stripe, PayPal, Razorpay | Latest  | Multi-provider billing   |
| **Primary DB**    | PostgreSQL               | 16      | User & subscription data |
| **Log DB**        | MongoDB (DocumentDB)     | 7+      | Application & audit logs |
| **Cache**         | Redis                    | 7+      | Sessions & rate limiting |
| **Monitoring**    | Sentry, Datadog          | Latest  | Error tracking & APM     |

### 11.2 Pricing Summary

| Plan             | Price        | Features                                     |
| ---------------- | ------------ | -------------------------------------------- |
| **Trial**        | Free 14 days | 100 AI queries, 1 connection, all features   |
| **Professional** | $49/month    | Unlimited queries, 5 connections, 2 devices  |
| **Team**         | $199/month   | Unlimited queries, 20 connections, 5 users   |
| **Enterprise**   | Custom       | Unlimited everything, SSO, dedicated support |

### 11.3 Development Timeline

| Phase                      | Duration | Deliverables                                   |
| -------------------------- | -------- | ---------------------------------------------- |
| **Phase 1: MVP**           | 8 weeks  | Desktop app with PostgreSQL + OpenAI, basic UI |
| **Phase 2: Payments**      | 3 weeks  | Stripe integration, license system             |
| **Phase 3: More Adapters** | 4 weeks  | Oracle, MySQL, Salesforce connectors           |
| **Phase 4: Analytics**     | 3 weeks  | Cost dashboard, usage tracking                 |
| **Phase 5: Polish**        | 2 weeks  | UI improvements, testing, docs                 |
| **Total**                  | 20 weeks | Production-ready desktop app                   |

### 11.4 Glossary

- **License Key:** JWT token containing user entitlements
- **Device Fingerprint:** Unique machine identifier
- **PII:** Personally Identifiable Information
- **RPO/RTO:** Recovery Point/Time Objective
- **Webhook:** HTTP callback for real-time events

---

**End of Document**
