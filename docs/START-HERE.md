# 🎯 Quick Start Guide

## Four Application Components

### 1. 🌐 Landing Site (Public Website)
**URL:** domain.com (production) | localhost:3000 (dev)
**Purpose:** Marketing, downloads, user login, payments

```bash
# Run landing site only
pnpm --filter landing-site dev
```

Visit: http://localhost:3000

**Pages:**
- `/` - Home page with features
- `/download` - Platform-specific downloads
- `/subscribe` - Pricing and subscriptions
- `/login` - User authentication

---

### 2. 🔐 Admin Dashboard (Internal Tool)
**URL:** admin.domain.com (production) | localhost:3001 (dev)
**Purpose:** Admin management, analytics, user management

```bash
# Run admin dashboard only
pnpm --filter admin-dashboard dev
```

Visit: http://localhost:3001

**Features:**
- User management
- License management
- Subscription analytics
- Usage tracking
### 3. 🖥️ Desktop App (End-User Application)
**Platform:** Windows, macOS, Linux
**Purpose:** Native desktop app with AI + database integration

```bash
# Run desktop app only
pnpm --filter desktop-app dev
```

Opens native Electron window (NOT a browser)

**Features:**
- Connect to 10+ database types
- Query data with 10 AI providers
- Offline AI with Ollama
- License activation
- Settings management

---

### 4. 🔌 Express API (Optional Backend)
**URL:** api.domain.com (production) | localhost:5500 (dev)
**Purpose:** Separate backend for license validation, AI routing

```bash
# Run Express API only
pnpm --filter express-api dev
```

Visit: http://localhost:5500/health

**Endpoints:**
- `/api/licenses/validate` - License validation
- `/api/ai/query` - AI routing
- `/api/usage/track` - Usage analytics

---

## Development Commands

```bash
# Run web apps (landing + admin + desktop)
pnpm dev

# Run with Express API
pnpm dev          # Terminal 1
pnpm dev:express  # Terminal 2

# Run specific apps
pnpm --filter landing-site dev    # Landing site on :3000
pnpm --filter admin-dashboard dev # Admin dashboard on :3001
pnpm --filter desktop-app dev     # Desktop app (native window)
pnpm --filter express-api dev     # Express API on :5500

# Build for production
pnpm build:landing
pnpm build:admin
pnpm build:desktop

# Install dependencies
pnpm install
```

---

## Port Map (Development)

| Application | Port | Access |
|-------------|------|--------|
| Landing Site | 3000 | http://localhost:3000 |
| Admin Dashboard | 3001 | http://localhost:3001 |
| Desktop App (Vite) | 5173 | Internal (Electron loads this) |
| Express API (optional) | 5500 | http://localhost:5500 |

---

## Production URLs

| Application | Development | Production |
|-------------|-------------|------------|
| Landing Site | localhost:3000 | https://domain.com |
| Admin Dashboard | localhost:4000 | https://admin.domain.com |
| Desktop App | Native window | Desktop application |

---

## Key Differences from Traditional Apps

### ✅ What Makes This Architecture Special:

1. **Separate Deployments**
   - Landing site and admin dashboard are COMPLETELY independent
   - Can deploy/update one without affecting the other
   - Different domains, different databases if needed

2. **Desktop App is Native**
   - NOT a web app running in browser
   - Full OS integration (file system, native dialogs, etc.)
   - Can run offline with local databases
   - Auto-updates via Electron

3. **Scalability**
   - Landing site can handle millions of users (Vercel edge)
   - Admin dashboard can be IP-restricted
   - Desktop app runs entirely on user's machine

---

## What to Do Next

### 1. **Start Development**
```bash
pnpm dev
```

### 2. **Access Applications**
- Landing: http://localhost:3000
- Admin: http://localhost:4000
- Desktop: Native window opens automatically

### 3. **Set Up Environment Variables**
Copy `.env.example` to `.env` in each app:
- `apps/landing-site/.env`
- `apps/admin-dashboard/.env`

### 4. **Configure Database**
```bash
cd apps/landing-site
pnpm prisma migrate dev
pnpm prisma generate
```

### 5. **Read Documentation**
- [RUNNING.md](./RUNNING.md) - Detailed running instructions
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [QUICKSTART.md](./QUICKSTART.md) - Original development guide

---

## Architecture Benefits

### 🎯 Separation of Concerns
- **Landing** = Marketing + Payments (public)
- **Admin** = Management (internal)
- **Desktop** = End-user tool (distributed)

### 🚀 Independent Scaling
- Scale landing site to handle traffic spikes
- Keep admin dashboard small and secure
- Desktop app scales with user count (runs locally)

### 🔒 Enhanced Security
- Admin dashboard on separate subdomain
- Can IP-whitelist admin access
- Desktop app data stays on user's machine

### 💰 Cost Effective
- Deploy landing/admin to Vercel (free tier)
- No server costs for desktop app logic
- Only pay for API usage and storage

---

## Common Questions

**Q: Why not one big Next.js app?**
A: Separation allows independent deployment, better security (admin isolation), and clearer architecture.

**Q: Does desktop app need internet?**
A: Yes for license validation and cloud AI. But can work offline with Ollama (local AI).

**Q: Can I use different databases?**
A: Yes! Each app can have its own database if needed. Or share one PostgreSQL instance.

**Q: How do users get the desktop app?**
A: Download from landing site (domain.com/download). Auto-detects their OS.

**Q: Where does desktop app data go?**
A: All data processing happens locally. Only license checks and anonymized analytics go to cloud.

---

## Need Help?

1. Check [RUNNING.md](./RUNNING.md) for detailed instructions
2. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
3. Check [QUICKSTART.md](./QUICKSTART.md) for original setup guide
4. Review code in `apps/` folder

**Ready to start?**
```bash
pnpm dev
```

Then open:
- http://localhost:3000 (Landing Site)
- http://localhost:4000 (Admin Dashboard)
- Electron window (Desktop App)
