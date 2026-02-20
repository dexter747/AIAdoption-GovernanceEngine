# Velanova - AI Adoption & Governance Engine

A comprehensive desktop application with cloud backend for integrating AI into legacy software systems.

## 🏗️ Project Structure

This is a **pnpm monorepo** with Turborepo for build optimization.

```
velanova-monorepo/
├── apps/
│   ├── desktop-app/          # Electron + React + TypeScript
│   └── cloud-backend/         # Next.js 14 + Prisma + MongoDB
├── packages/
│   └── shared/                # Shared types and constants
├── docs/                      # Documentation
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (Install: `npm install -g pnpm`)
- **PostgreSQL** 16+ (for cloud backend)
- **MongoDB** 7+ (for logs/metrics)

### Installation

1. **Clone the repository:**
   ```bash
   cd "AI Adoption & Governance Engine"
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Setup environment variables:**
   ```bash
   # Cloud backend
   cd apps/cloud-backend
   cp .env.example .env
   # Edit .env with your database URLs and API keys
   ```

4. **Setup databases:**
   ```bash
   # Generate Prisma client
   cd apps/cloud-backend
   pnpm prisma generate
   
   # Run migrations
   pnpm prisma migrate dev
   ```

### Development

Run both desktop app and cloud backend concurrently:

```bash
# From root directory
pnpm dev
```

Or run individually:

```bash
# Desktop app only (port 3000)
pnpm dev:desktop

# Cloud backend only (port 3001)
pnpm dev:backend
```

### Building

```bash
# Build everything
pnpm build

# Build desktop app for all platforms
cd apps/desktop-app
pnpm build:all

# Build for specific platform
pnpm build:mac
pnpm build:win
pnpm build:linux
```

## 📦 Tech Stack

### Desktop App
- **Framework:** Electron 28
- **UI:** React 18 + TailwindCSS
- **State:** Zustand
- **Database Drivers:** pg, mysql2, oracledb, tedious, mongodb, jsforce
- **AI SDKs:** openai, anthropic, google-ai, cohere, mistral, groq, ollama

### Cloud Backend
- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL (Prisma) + MongoDB (Mongoose)
- **Auth:** NextAuth.js 5
- **Payments:** Dodo Payments, PayPal, Razorpay
- **Email:** Nodemailer (SMTP)

### Shared
- **Language:** TypeScript 5
- **Build Tool:** Turborepo
- **Package Manager:** pnpm 8

## 🗄️ Database Setup

### PostgreSQL (Cloud Backend)

```bash
# Using Docker
docker run --name velanova-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=velanova \
  -p 5432:5432 \
  -d postgres:16

# Or use managed service (Neon, Supabase, AWS RDS)
```

### MongoDB (Logs & Metrics)

```bash
# Using Docker
docker run --name velanova-mongo \
  -p 27017:27017 \
  -d mongo:7

# Or use MongoDB Atlas (recommended)
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Lint code
pnpm lint

# Type check
pnpm type-check

# Format code
pnpm format
```

## 📝 Environment Variables

### Cloud Backend (.env)

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/velanova"
MONGODB_URI="mongodb://localhost:27017/velanova"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret"
JWT_SECRET="your-jwt-secret"

# Payment Providers
DODO_API_KEY="..."
PAYPAL_CLIENT_ID="..."
RAZORPAY_KEY_ID="..."

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_USER="..."
SMTP_PASS="..."
```

## 🚢 Deployment

### Desktop App

Builds are automatically created for Windows, macOS, and Linux using electron-builder.

Distribution channels:
- Direct download from website
- Microsoft Store (Windows)
- Mac App Store (macOS)
- Snap Store / AppImage (Linux)

### Cloud Backend

Deploy to Vercel (recommended):

```bash
cd apps/cloud-backend
vercel deploy --prod
```

Or use:
- AWS (EC2, ECS, Lambda)
- Docker containers
- Other cloud providers

## 📚 Documentation

- [SRS.md](docs/SRS.md) - Software Requirements Specification
- [Architecture.md](docs/Architecture.md) - Technical Architecture
- [Claude.md](docs/Claude.md) - AI & Payment Clarifications

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For issues and questions:
- Email: support@velanova.com
- Documentation: https://docs.velanova.com
