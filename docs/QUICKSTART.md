# 🚀 Quick Start Guide

## ✅ Installation Complete!

All dependencies have been installed successfully. The project is ready for development.

## 📝 What Was Fixed

1. **Removed non-existent package**: `@dodopayments/payments-sdk` doesn't exist in npm
   - Created custom Dodo Payments client using axios
   - File: `apps/cloud-backend/src/lib/dodo-payments.ts`

2. **Fixed better-sqlite3 build issue**: Made it optional since it requires native compilation
   - Switched to `electron-store` for settings management (simpler, no native deps)
   - `better-sqlite3` is now in `optionalDependencies` for future use

3. **Updated nodemailer**: Fixed peer dependency warning with next-auth

## 🎯 Next Steps

### 1. Start Development

```bash
# Terminal 1: Start cloud backend (http://localhost:3001)
cd apps/cloud-backend
pnpm dev

# Terminal 2: Start desktop app (http://localhost:3000)
cd apps/desktop-app
pnpm dev
```

Or run both at once from root:

```bash
pnpm dev
```

### 2. Setup Environment Variables

```bash
cd apps/cloud-backend
cp .env.example .env
```

Edit `.env` with your values:

- Database URLs (PostgreSQL + MongoDB)
- Payment API keys (Dodo, PayPal, Razorpay)
- SMTP credentials for email

### 3. Initialize Database

```bash
cd apps/cloud-backend

# Generate Prisma client
pnpm prisma generate

# Create database tables
pnpm prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
pnpm prisma studio
```

### 4. Test the Setup

**Cloud Backend:**

- Open http://localhost:3001
- Should see "Velanova Cloud Backend" page

**Desktop App:**

- Electron window should open automatically
- You'll see a sidebar with Dashboard, Connections, AI Queries, Settings

## 📂 Project Structure

```
AI Adoption & Governance Engine/
├── apps/
│   ├── desktop-app/          # Electron + React
│   │   ├── src/
│   │   │   ├── main/         # Electron backend
│   │   │   └── renderer/     # React frontend
│   │   └── package.json
│   │
│   └── cloud-backend/        # Next.js API
│       ├── src/app/          # App Router (pages + API routes)
│       ├── prisma/           # Database schema
│       └── package.json
│
├── packages/
│   └── shared/               # Shared types
│
└── node_modules/             # ✅ Installed!
```

## 🛠️ Available Commands

### Root Level

```bash
pnpm dev              # Run all apps
pnpm build            # Build all apps
pnpm lint             # Lint all code
pnpm type-check       # TypeScript checks
pnpm format           # Format with Prettier
```

### Desktop App

```bash
cd apps/desktop-app
pnpm dev              # Development mode
pnpm build:all        # Build for all platforms
pnpm build:mac        # Build for macOS
pnpm build:win        # Build for Windows
pnpm build:linux      # Build for Linux
```

### Cloud Backend

```bash
cd apps/cloud-backend
pnpm dev              # Start Next.js dev server
pnpm build            # Production build
pnpm prisma generate  # Generate Prisma client
pnpm prisma migrate   # Run migrations
pnpm prisma studio    # Database GUI
```

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000 (desktop)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9
```

### Prisma Issues

```bash
# Reset database (WARNING: deletes all data)
cd apps/cloud-backend
pnpm prisma migrate reset

# Regenerate Prisma client
pnpm prisma generate
```

### Clean Install

```bash
# From root
pnpm clean
rm -rf node_modules
pnpm install
```

## 📚 Documentation

- [README.md](../README.md) - Main documentation
- [SRS.md](../docs/SRS.md) - Software requirements
- [Architecture.md](../docs/Architecture.md) - Technical architecture

## 🎉 You're All Set!

The monorepo is ready for development. Start with:

```bash
# From root directory
pnpm dev
```

Happy coding! 🚀
