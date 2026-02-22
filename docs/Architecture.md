# Velanova Platform - Architecture Documentation

**Version:** 2.0  
**Date:** January 16, 2026  
**Architecture Pattern:** Client-Server with Local-First Processing

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Desktop Application Architecture](#3-desktop-application-architecture)
4. [Cloud Backend Architecture](#4-cloud-backend-architecture)
5. [Data Flow & Integration Patterns](#5-data-flow--integration-patterns)
6. [Security Architecture](#6-security-architecture)
7. [Deployment Architecture](#7-deployment-architecture)
8. [Technology Stack](#8-technology-stack)
9. [Scalability & Performance](#9-scalability--performance)
10. [Development & Operations](#10-development--operations)

---

## 1. Executive Summary

### 1.1 Architecture Philosophy

Velanova is built on a **local-first, privacy-preserving architecture** where sensitive data never leaves the customer's infrastructure. The platform consists of two main components:

1. **Desktop Application (Electron):** Runs on customer's machines/servers, handles all legacy data processing and AI interactions locally
2. **Cloud Backend (Next.js):** Lightweight web application managing authentication, licensing, payments, and admin functions

### 1.2 Key Architectural Decisions

| Decision                    | Rationale                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| **Electron Desktop App**    | Cross-platform (Windows, macOS, Linux) with single codebase; access to native system resources |
| **Local Data Processing**   | Data privacy compliance; no legacy data transmission to our servers                            |
| **Next.js Full-Stack**      | Unified frontend/backend; server components for performance; API routes for backend logic      |
| **PostgreSQL + MongoDB**    | PostgreSQL for relational data (users, payments); MongoDB for flexible logs/metrics            |
| **SQLite Local Storage**    | Embedded database for desktop app; encrypted; no server required                               |
| **Multi-Payment Providers** | Global reach: Dodo Payments (global), PayPal (fallback), Razorpay (India)                      |

### 1.3 Architecture Constraints

- **No Legacy Data in Cloud:** Only anonymized metadata (query counts, costs) transmitted
- **Offline-First Desktop App:** Core features work without internet (7-day license cache)
- **HTTPS Only:** All network communication encrypted with TLS 1.3
- **Stateless Backend:** All APIs stateless for horizontal scaling

---

## 2. Architecture Overview

### 2.1 System Context Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            External Systems                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │  AI Providers    │  │ Payment Gateway  │  │  Email Service   │       │
│  │  - OpenAI        │  │  - Dodo Payments │  │  - Nodemailer    │       │
│  │  - Anthropic     │  │  - PayPal        │  │    (SMTP)        │       │
│  │  - Google AI     │  │  - Razorpay      │  │  - Gmail         │       │
│  │  - Cohere        │  │                  │  │  - SendGrid      │       │
│  │  - Mistral AI    │  │                  │  │  - AWS SES       │       │
│  │  - Groq          │  │                  │  │                  │       │
│  │  - Perplexity    │  │                  │  │                  │       │
│  │  - Ollama (Local)│  │                  │  │                  │       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘       │
│                                                                         │
└────────────────────────────┬───────────────────────────┬────────────────┘
                             │ HTTPS/API                 │ HTTPS/API
                             │                           │
┌────────────────────────────┼───────────────────────────┼─────────────────┐
│                 Velanova Platform                      │                 │
│                                                        │                 │
│  ┌───────────────────────────────────────────────────┐│                 │
│  │         Desktop Application (Electron)            ││                 │
│  │         Installed on Customer's Machine           ││                 │
│  │  ┌──────────────────────────────────────────┐    ││                 │
│  │  │  UI: React + TailwindCSS                 │    ││                 │
│  │  │  - Connection Manager                    │    ││                 │
│  │  │  - AI Query Interface                    │    ││                 │
│  │  │  - Cost Dashboard                        │    ││                 │
│  │  └──────────────────────────────────────────┘    ││                 │
│  │  ┌──────────────────────────────────────────┐    ││                 │
│  │  │  Logic: Node.js/Electron Main Process    │    ││                 │
│  │  │  - Legacy Connectors (Top 10)            │    ││                 │
│  │  │  - AI Router & Cost Tracker              │    ││                 │
│  │  │  - PII Detection & Masking               │    ││                 │
│  │  └──────────────────────────────────────────┘    ││                 │
│  │  ┌──────────────────────────────────────────┐    ││                 │
│  │  │  Storage: SQLite (Encrypted)             │    ││                 │
│  │  │  - Connection configs                    │    ││                 │
│  │  │  - Query history                         │    ││                 │
│  │  └──────────────────────────────────────────┘    ││                 │
│  └──────────────┬────────────────────────────────────┘│                │
│                 │ Localhost                            │               │
│                 │ (127.0.0.1)                          │               │
│  ┌──────────────▼────────────────────────────────────┐│                 │
│  │  Customer's Legacy Systems                        ││                 │
│  │  - PostgreSQL, MySQL, Oracle, SQL Server          ││                 │
│  │  - SAP HANA, MongoDB                              ││                 │
│  │  - Salesforce, ServiceNow, Jira, Zendesk          ││                 │
│  └───────────────────────────────────────────────────┘│                 │
└────────────────────────┬───────────────────────────────┼─────────────────┘
                         │ HTTPS/API                     │
                         │ (License, Usage)              │
                         │                               │
┌────────────────────────▼───────────────────────────────▼─────────────────┐
│                   Cloud Backend (Next.js)                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  Next.js 14 Full-Stack Application (App Router)                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │ │
│  │  │  Web Pages   │  │  API Routes  │  │  Server Components       │  │ │
│  │  │  - Marketing │  │  - Auth      │  │  - Admin Dashboard       │  │ │
│  │  │  - Docs      │  │  - License   │  │  - Usage Analytics       │  │ │
│  │  │  - Pricing   │  │  - Payment   │  │  - User Management       │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  Data Layer                                                          │ │
│  │  ┌────────────────────────┐  ┌────────────────────────┐             │ │
│  │  │  PostgreSQL 16         │  │  MongoDB 7             │             │ │
│  │  │  - Users               │  │  - Application logs    │             │ │
│  │  │  - Licenses            │  │  - AI query logs       │             │ │
│  │  │  - Subscriptions       │  │  - Audit trails        │             │ │
│  │  │  - Payments            │  │  - Error reports       │             │ │
│  │  └────────────────────────┘  └────────────────────────┘             │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Deployment Model

| Component          | Deployment                      | Responsibility             |
| ------------------ | ------------------------------- | -------------------------- |
| **Desktop App**    | Customer's machine/server       | Customer installs & runs   |
| **Legacy Systems** | Customer's infrastructure       | Customer owns & manages    |
| **Cloud Backend**  | Our infrastructure (Vercel/AWS) | We host & maintain         |
| **Databases**      | Our infrastructure              | We manage backups, scaling |
| **AI Providers**   | Third-party SaaS                | External APIs              |

---

## 3. Desktop Application Architecture

### 3.1 Electron Application Structure

```
desktop-app/
├── package.json                 # Dependencies & build config
├── electron-builder.yml         # Build configuration for all platforms
├── src/
│   ├── main/                    # Electron Main Process
│   │   ├── index.ts             # App entry point
│   │   ├── window.ts            # Window management
│   │   ├── ipc-handlers.ts      # IPC communication handlers
│   │   ├── updater.ts           # Auto-update logic
│   │   ├── connectors/          # Legacy system adapters
│   │   │   ├── base.connector.ts           # Base connector interface
│   │   │   ├── postgresql.connector.ts     # PostgreSQL adapter
│   │   │   ├── mysql.connector.ts          # MySQL adapter
│   │   │   ├── oracle.connector.ts         # Oracle adapter
│   │   │   ├── sqlserver.connector.ts      # SQL Server adapter
│   │   │   ├── sap-hana.connector.ts       # SAP HANA adapter
│   │   │   ├── mongodb.connector.ts        # MongoDB adapter
│   │   │   ├── salesforce.connector.ts     # Salesforce API adapter
│   │   │   ├── servicenow.connector.ts     # ServiceNow API adapter
│   │   │   ├── jira.connector.ts           # Jira API adapter
│   │   │   └── zendesk.connector.ts        # Zendesk API adapter
│   │   ├── ai/                  # AI integration
│   │   │   ├── router.ts        # Model selection & routing
│   │   │   ├── providers/
│   │   │   │   ├── openai.provider.ts
│   │   │   │   ├── anthropic.provider.ts
│   │   │   │   └── google.provider.ts
│   │   │   └── cost-tracker.ts  # Cost calculation
│   │   ├── data/                # Data processing
│   │   │   ├── pii-detector.ts  # PII detection (regex + NER)
│   │   │   └── masker.ts        # Data masking utilities
│   │   └── storage/             # Local data management
│   │       ├── database.ts      # SQLite connection
│   │       └── encryption.ts    # AES-256-GCM encryption
│   │
│   ├── renderer/                # React UI (Renderer Process)
│   │   ├── index.html
│   │   ├── index.tsx            # React entry point
│   │   ├── App.tsx              # Root component
│   │   ├── components/
│   │   │   ├── ConnectionManager/
│   │   │   │   ├── ConnectionList.tsx
│   │   │   │   ├── ConnectionForm.tsx
│   │   │   │   └── ConnectionTest.tsx
│   │   │   ├── AIQuery/
│   │   │   │   ├── QueryInput.tsx
│   │   │   │   ├── QueryResponse.tsx
│   │   │   │   └── PromptTemplates.tsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── CostChart.tsx
│   │   │   │   ├── UsageStats.tsx
│   │   │   │   └── QueryHistory.tsx
│   │   │   └── Settings/
│   │   │       ├── LicenseInfo.tsx
│   │   │       └── Preferences.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useConnections.ts
│   │   │   ├── useAIQuery.ts
│   │   │   └── useLicense.ts
│   │   └── utils/
│   │       └── ipc.ts           # IPC helper functions
│   │
│   └── shared/                  # Shared types & utilities
│       ├── types.ts             # TypeScript interfaces
│       ├── constants.ts
│       └── utils.ts
│
├── dist/                        # Build output
│   ├── mac/                     # macOS builds (DMG, PKG)
│   ├── win/                     # Windows builds (EXE, MSI)
│   └── linux/                   # Linux builds (AppImage, deb, rpm)
│
└── assets/                      # App icons & resources
    ├── icon.icns               # macOS icon
    ├── icon.ico                # Windows icon
    └── icons/                  # Linux icon set
```

### 3.2 Electron Main Process Architecture

The main process handles all system-level operations and business logic:

```typescript
// main/index.ts - Main process entry point
import { app, BrowserWindow } from 'electron';
import { setupIpcHandlers } from './ipc-handlers';
import { initAutoUpdater } from './updater';
import { initDatabase } from './storage/database';

app.on('ready', async () => {
  // Initialize local SQLite database
  await initDatabase();

  // Setup IPC communication with renderer
  setupIpcHandlers();

  // Initialize auto-updater
  initAutoUpdater();

  // Create main window
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL(
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../renderer/index.html')}`
  );
});
```

### 3.3 IPC Communication Pattern

Desktop app uses Electron's IPC (Inter-Process Communication) for secure renderer-main communication:

```typescript
// main/ipc-handlers.ts
import { ipcMain } from 'electron';
import { ConnectionManager } from './connectors/manager';
import { AIRouter } from './ai/router';
import { LicenseValidator } from './license/validator';

export function setupIpcHandlers() {
  // Connection Management
  ipcMain.handle('connection:add', async (event, config) => {
    const conn = await ConnectionManager.create(config);
    return { success: true, id: conn.id };
  });

  ipcMain.handle('connection:test', async (event, config) => {
    const result = await ConnectionManager.test(config);
    return result;
  });

  ipcMain.handle('connection:query', async (event, { connId, sql }) => {
    const data = await ConnectionManager.query(connId, sql);
    return data;
  });

  // AI Queries
  ipcMain.handle('ai:query', async (event, { prompt, data, options }) => {
    const response = await AIRouter.query(prompt, data, options);
    return response;
  });

  // License Validation
  ipcMain.handle('license:validate', async (event, licenseKey) => {
    const isValid = await LicenseValidator.validate(licenseKey);
    return isValid;
  });
}

// renderer/utils/ipc.ts
export const ipc = {
  connections: {
    add: config => window.electron.invoke('connection:add', config),
    test: config => window.electron.invoke('connection:test', config),
    query: (connId, sql) => window.electron.invoke('connection:query', { connId, sql }),
  },
  ai: {
    query: (prompt, data, options) => window.electron.invoke('ai:query', { prompt, data, options }),
  },
  license: {
    validate: key => window.electron.invoke('license:validate', key),
  },
};
```

### 3.4 Legacy System Connectors

Each legacy system has a dedicated connector implementing the `BaseConnector` interface:

```typescript
// main/connectors/base.connector.ts
export interface BaseConnector {
  connect(config: ConnectionConfig): Promise<void>;
  disconnect(): Promise<void>;
  test(): Promise<TestResult>;
  query(sql: string): Promise<any[]>;
  getSchema(): Promise<Schema>;
}

export interface ConnectionConfig {
  type:
    | 'postgresql'
    | 'mysql'
    | 'oracle'
    | 'sqlserver'
    | 'sap-hana'
    | 'mongodb'
    | 'salesforce'
    | 'servicenow'
    | 'jira'
    | 'zendesk';
  name: string;
  host: string;
  port: number;
  database?: string;
  username: string;
  password: string; // Encrypted before storage
  options?: Record<string, any>;
}

// main/connectors/postgresql.connector.ts
import { Pool } from 'pg';
import { BaseConnector, ConnectionConfig } from './base.connector';

export class PostgreSQLConnector implements BaseConnector {
  private pool: Pool;
  private config: ConnectionConfig;

  async connect(config: ConnectionConfig): Promise<void> {
    this.config = config;
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      max: 5, // Connection pool size
      idleTimeoutMillis: 600000, // 10 minutes
    });
  }

  async query(sql: string): Promise<any[]> {
    const result = await this.pool.query(sql);
    return result.rows;
  }

  async test(): Promise<TestResult> {
    try {
      const result = await this.pool.query('SELECT version()');
      const tableCount = await this.pool.query(
        `SELECT COUNT(*) FROM information_schema.tables 
         WHERE table_schema = 'public'`
      );

      return {
        success: true,
        message: `Connected successfully. ${tableCount.rows[0].count} tables found.`,
        metadata: { version: result.rows[0].version },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        troubleshooting: [
          'Check that PostgreSQL is running',
          'Verify host and port are correct',
          'Ensure user has connect permission',
        ],
      };
    }
  }

  async getSchema(): Promise<Schema> {
    const tables = await this.pool.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    return this.parseSchema(tables.rows);
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }
}
```

### 3.5 AI Router & Cost Tracking

```typescript
// main/ai/router.ts
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { CostTracker } from './cost-tracker';

export class AIRouter {
  private static openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  private static anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  static async query(prompt: string, data: any, options?: QueryOptions) {
    const { model, provider } = this.selectModel(prompt, data, options);

    const startTime = Date.now();
    let response, usage;

    // Route to appropriate provider
    if (provider === 'openai') {
      response = await this.openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: 'You are analyzing data from a legacy system.' },
          { role: 'user', content: `${prompt}\n\nData: ${JSON.stringify(data)}` },
        ],
      });
      usage = response.usage;
    } else if (provider === 'anthropic') {
      response = await this.anthropic.messages.create({
        model,
        max_tokens: 4096,
        messages: [{ role: 'user', content: `${prompt}\n\nData: ${JSON.stringify(data)}` }],
      });
      usage = response.usage;
    }

    const latency = Date.now() - startTime;

    // Track cost locally
    const cost = CostTracker.calculate({
      provider,
      model,
      inputTokens: usage.prompt_tokens || usage.input_tokens,
      outputTokens: usage.completion_tokens || usage.output_tokens,
    });

    await CostTracker.logQuery({
      provider,
      model,
      tokens: usage,
      cost,
      latency,
      timestamp: new Date(),
    });

    return {
      result: response.content || response.choices[0].message.content,
      model,
      provider,
      cost,
      tokens: usage,
      latency,
    };
  }

  private static selectModel(prompt: string, data: any, options?: QueryOptions) {
    // User override
    if (options?.model && options?.provider) {
      return { model: options.model, provider: options.provider };
    }

    // Estimate token count
    const estimatedTokens = this.estimateTokens(prompt, data);

    // Auto-select based on complexity
    if (estimatedTokens < 200) {
      return { model: 'gpt-4o-mini', provider: 'openai' };
    } else if (estimatedTokens < 1000) {
      return { model: 'gpt-4o', provider: 'openai' };
    } else {
      return { model: 'claude-sonnet-4', provider: 'anthropic' };
    }
  }
}
```

---

## 4. Cloud Backend Architecture

```
cloud-backend/
├── package.json
├── next.config.js
├── tsconfig.json
├── prisma/
│   ├── schema.prisma            # PostgreSQL schema
│   └── migrations/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Homepage
│   │   ├── (marketing)/         # Route group: public pages
│   │   │   ├── pricing/
│   │   │   ├── docs/
│   │   │   └── about/
│   │   ├── (auth)/              # Route group: auth pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/         # Route group: user dashboard
│   │   │   ├── layout.tsx       # Dashboard layout
│   │   │   ├── dashboard/
│   │   │   ├── billing/
│   │   │   ├── devices/
│   │   │   └── settings/
│   │   ├── (admin)/             # Route group: admin panel
│   │   │   ├── layout.tsx       # Admin layout
│   │   │   ├── users/
│   │   │   ├── licenses/
│   │   │   ├── analytics/
│   │   │   └── payments/
│   │   └── api/                 # API Routes
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── register/route.ts
│   │       │   └── [...nextauth]/route.ts
│   │       ├── licenses/
│   │       │   ├── validate/route.ts
│   │       │   ├── activate/route.ts
│   │       │   └── [id]/route.ts
│   │       ├── payments/
│   │       │   ├── create-subscription/route.ts
│   │       │   └── webhooks/
│   │       │       ├── Dodo Payments/route.ts
│   │       │       ├── paypal/route.ts
│   │       │       └── razorpay/route.ts
│   │       └── usage/
│   │           ├── log/route.ts
│   │           └── summary/route.ts
│   │
│   ├── lib/                     # Shared utilities
│   │   ├── prisma.ts            # Prisma client
│   │   ├── mongodb.ts           # MongoDB client
│   │   ├── auth.ts              # NextAuth config
│   │   ├── jwt.ts               # JWT utilities
│   │   └── payment/
│   │       ├── Dodo Payments.ts
│   │       ├── paypal.ts
│   │       └── razorpay.ts
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # Shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── UsageChart.tsx
│   │   │   └── DeviceList.tsx
│   │   └── admin/
│   │       ├── UserTable.tsx
│   │       ├── LicenseManager.tsx
│   │       └── PaymentDashboard.tsx
│   │
│   └── types/                   # TypeScript types
│       ├── user.ts
│       ├── license.ts
│       └── payment.ts
│
└── public/
    ├── images/
    └── docs/
```

### 4.2 API Routes Architecture

```typescript
// app/api/licenses/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { license_key } = await request.json();

    // Verify JWT signature
    const payload = await verifyJWT(license_key);

    // Check database for license status
    const license = await prisma.license.findUnique({
      where: { license_key },
      include: { user: true },
    });

    if (!license) {
      return NextResponse.json({ error: 'Invalid license' }, { status: 401 });
    }

    if (license.status !== 'active') {
      return NextResponse.json({ error: `License is ${license.status}` }, { status: 403 });
    }

    // Check expiration
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      await prisma.license.update({
        where: { id: license.id },
        data: { status: 'expired' },
      });

      return NextResponse.json({ error: 'License expired' }, { status: 403 });
    }

    // Update last validated timestamp
    await prisma.license.update({
      where: { id: license.id },
      data: { last_validated_at: new Date() },
    });

    return NextResponse.json({
      valid: true,
      license: {
        id: license.id,
        plan_type: license.plan_type,
        expires_at: license.expires_at,
        device_limit: license.device_limit,
      },
      user: {
        id: license.user.id,
        email: license.user.email,
        full_name: license.user.full_name,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.message },
      { status: 500 }
    );
  }
}
```

### 4.3 Payment Webhook Handler

```typescript
// app/api/payments/webhooks/Dodo Payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Dodo Payments from 'Dodo Payments';
import { prisma } from '@/lib/prisma';

const Dodo Payments = new Dodo Payments(process.env.Dodo Payments_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('Dodo Payments-signature')!;

  let event: Dodo Payments.Event;

  try {
    event = Dodo Payments.webhooks.constructEvent(
      body,
      sig,
      process.env.Dodo Payments_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'invoice.payment_succeeded':
      await handlePaymentSuccess(event.data.object as Dodo Payments.Invoice);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailure(event.data.object as Dodo Payments.Invoice);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionCancelled(event.data.object as Dodo Payments.Subscription);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Dodo Payments.Subscription);
      break;
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(invoice: Dodo Payments.Invoice) {
  const subscription = await prisma.subscription.findFirst({
    where: { provider_subscription_id: invoice.subscription as string },
    include: { license: true }
  });

  if (!subscription) return;

  // Record payment
  await prisma.payment.create({
    data: {
      user_id: subscription.user_id,
      subscription_id: subscription.id,
      payment_provider: 'Dodo Payments',
      provider_payment_id: invoice.payment_intent as string,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: 'succeeded',
      paid_at: new Date(invoice.status_transition.paid_at! * 1000)
    }
  });

  // Update subscription status
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'active',
      current_period_end: new Date(invoice.lines.data[0].period.end * 1000)
    }
  });

  // Ensure license is active
  if (subscription.license) {
    await prisma.license.update({
      where: { id: subscription.license.id },
      data: {
        status: 'active',
        expires_at: new Date(invoice.lines.data[0].period.end * 1000)
      }
    });
  }
}
```

### 4.4 Database Schema (Prisma)

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                String         @id @default(uuid())
  email             String         @unique
  password_hash     String?
  full_name         String?
  company_name      String?
  oauth_provider    String?
  oauth_id          String?
  email_verified    Boolean        @default(false)
  created_at        DateTime       @default(now())
  updated_at        DateTime       @updatedAt
  last_login_at     DateTime?
  status            String         @default("active")

  licenses          License[]
  subscriptions     Subscription[]
  payments          Payment[]

  @@index([email])
  @@index([oauth_provider, oauth_id])
}

model License {
  id                  String        @id @default(uuid())
  user_id             String
  license_key         String        @unique
  plan_type           String
  status              String        @default("active")
  issued_at           DateTime      @default(now())
  expires_at          DateTime?
  last_validated_at   DateTime?
  device_limit        Int           @default(2)
  query_limit         Int?
  metadata            Json          @default("{}")
  created_at          DateTime      @default(now())
  updated_at          DateTime      @updatedAt

  user                User          @relation(fields: [user_id], references: [id], onDelete: Cascade)
  devices             Device[]
  subscriptions       Subscription[]

  @@index([user_id])
  @@index([license_key])
  @@index([status])
}

model Device {
  id                   String      @id @default(uuid())
  license_id           String
  device_fingerprint   String      @unique
  device_name          String?
  os_platform          String?
  os_version           String?
  app_version          String?
  first_activated_at   DateTime    @default(now())
  last_seen_at         DateTime    @default(now())
  status               String      @default("active")
  created_at           DateTime    @default(now())

  license              License     @relation(fields: [license_id], references: [id], onDelete: Cascade)

  @@index([license_id])
  @@index([device_fingerprint])
}

model Subscription {
  id                        String    @id @default(uuid())
  user_id                   String
  license_id                String?
  payment_provider          String
  provider_subscription_id  String?
  provider_customer_id      String?
  plan_type                 String
  billing_cycle             String
  amount                    Decimal
  currency                  String    @default("USD")
  status                    String?
  current_period_start      DateTime?
  current_period_end        DateTime?
  cancel_at_period_end      Boolean   @default(false)
  cancelled_at              DateTime?
  created_at                DateTime  @default(now())
  updated_at                DateTime  @updatedAt

  user                      User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  license                   License?  @relation(fields: [license_id], references: [id])
  payments                  Payment[]

  @@index([user_id])
  @@index([payment_provider, provider_subscription_id])
}

model Payment {
  id                  String        @id @default(uuid())
  user_id             String
  subscription_id     String?
  payment_provider    String
  provider_payment_id String?
  amount              Decimal
  currency            String        @default("USD")
  status              String
  payment_method      String?
  failure_reason      String?
  metadata            Json          @default("{}")
  paid_at             DateTime?
  created_at          DateTime      @default(now())

  user                User          @relation(fields: [user_id], references: [id])
  subscription        Subscription? @relation(fields: [subscription_id], references: [id])

  @@index([user_id])
  @@index([subscription_id])
  @@index([status])
}
```

---

## 5. Data Flow & Integration Patterns

### 5.1 Legacy System Query Flow

```
1. User Input (Desktop App UI)
   User types: "Show me top 10 customers by revenue this year"
   ↓
2. React Component (Renderer Process)
   AIQueryInput.tsx captures input, calls IPC
   ↓
3. IPC Communication
   ipc.ai.query(prompt, options) → Main Process
   ↓
4. Legacy Connector (Main Process)
   - Selects active connection (e.g., PostgreSQL)
   - Builds SQL query from natural language (optional AI assist)
   - Executes: SELECT customer_name, SUM(revenue) FROM sales...
   ↓
5. Data Retrieval
   Query returns 10 rows from local PostgreSQL database
   ↓
6. PII Detection & Masking
   - Scan for PII (emails, names, SSNs)
   - Apply masking if enabled
   ↓
7. AI Router (Main Process)
   - Select model based on data size
   - Prepare prompt with data
   ↓
8. AI Provider API Call (Internet)
   HTTPS → OpenAI/Anthropic/Groq/Ollama
   - Send prompt + sanitized data
   - Receive AI-generated summary
   ↓
9. Cost Tracking (Local)
   - Calculate cost from token usage
   - Log to local SQLite
   ↓
10. Usage Logging (Cloud - Async)
    HTTPS → Cloud Backend API
    POST /api/usage/log
    {
```
