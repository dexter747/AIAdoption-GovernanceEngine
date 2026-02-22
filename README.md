# Velanova - AI Adoption & Governance Engine

Transform your legacy systems with AI-powered insights. Velanova connects your existing databases and enterprise software to cutting-edge AI models, enabling natural language queries and intelligent automation.

---

## 🏗️ Four Application Components

### 1. 🌐 [Landing Site](apps/landing-site) → **domain.com**

Public-facing website for marketing, downloads, and payments

- **Port:** 3000 (development)
- **Deploy:** https://domain.com

### 2. 🔐 [Admin Dashboard](apps/admin-dashboard) → **admin.domain.com**

Internal management portal for admins only

- **Port:** 3001 (development)
- **Deploy:** https://admin.domain.com

### 3. 🖥️ [Desktop App](apps/desktop-app) → **Local Application**

Native cross-platform desktop application

- **Platform:** Windows, macOS, Linux
- **Technology:** Electron + React

### 4. 🔌 [Express API](apps/express-api) → **api.domain.com** (Optional)

Separate backend for license validation and AI routing

- **Port:** 5500 (development)
- **Deploy:** https://api.domain.com

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run everything
pnpm dev
```

**Then access:**

- Landing Site: http://localhost:3000
- Admin Dashboard: http://localhost:3001
- Desktop App: Native Electron window opens

**With Express API:**

```bash
pnpm dev          # Terminal 1
pnpm dev:express  # Terminal 2 (optional)
```

**Individual apps:**

````bash
pnpm --filter landing-site dev      # Port 3000
pnpm --filter admin-dashboard dev   # Port 3001
pnpm --filter desktop-app dev       # Native window
pnpm --filter express-api dev       # Port 5500 (optional)
```---## 📖 Documentation| File | Purpose ||------|---------|| **[START-HERE.md](./START-HERE.md)** | 👈 **Begin here!** Quick overview || [RUNNING.md](./RUNNING.md) | Detailed running instructions || [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment guide || [QUICKSTART.md](./QUICKSTART.md) | Original setup guide || [docs/SRS.md](./docs/SRS.md) | Software requirements (1,836 lines) || [docs/Architecture.md](./docs/Architecture.md) | Technical architecture (908 lines) |---## 🎯 Key Features**Landing Site:**- Marketing home page- Download portal (Windows/macOS/Linux)- User login & registration- Payment processing (Dodo Payments)- Pricing & subscriptions**Admin Dashboard:**- User management- License management- Subscription analytics- Usage tracking- Database monitoring- System settings**Desktop App:**- Connect to 10+ database types- Query with 10 AI providers- Natural language queries- Offline AI support (Ollama)- License activation- Auto-updates---## 🛠️ Tech Stack- **Frontend:** Next.js 14, React 18, TypeScript, TailwindCSS- **Backend:** Next.js API, Prisma, Mongoose, NextAuth- **Desktop:** Electron 28, Vite, electron-store- **Payments:** Dodo Payments- **AI:** OpenAI, Anthropic, Google, Cohere, Mistral, Groq, Perplexity, Ollama- **Databases:** PostgreSQL, MySQL, Oracle, SQL Server, SAP HANA, MongoDB, Salesforce, Jira---## 📁 Structure```apps/├── landing-site/       # Public website (Next.js) → domain.com├── admin-dashboard/    # Admin portal (Next.js) → admin.domain.com├── desktop-app/        # Desktop app (Electron) → Native└── cloud-backend/      # Legacy API serverpackages/└── shared/             # Shared TypeScript types```---## 🌍 Deployment### Landing Site → domain.com```bashpnpm build:landing# Deploy to Vercel/Netlify```### Admin Dashboard → admin.domain.com```bashpnpm build:admin# Deploy to Vercel with IP whitelisting```### Desktop App → Installers```bashpnpm build:desktop# Outputs: .exe, .msi, .dmg, .AppImage, .deb, .rpm```---## 🆘 Getting Help1. **New here?** Read [START-HERE.md](./START-HERE.md)2. **Running issues?** Check [RUNNING.md](./RUNNING.md)3. **Deploying?** See [DEPLOYMENT.md](./DEPLOYMENT.md)4. **Questions?** Open a GitHub issue---**Ready to start? Run `pnpm dev` and open localhost:3000!** 🚀
````
