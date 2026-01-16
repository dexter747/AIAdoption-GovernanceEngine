# 🚀 Running the Applications

## Architecture Overview

### Four Application Components:

1. **Landing Site (Next.js)** - Public-facing website
   - Runs on: **localhost:3000** in development
   - Deploys to: **domain.com** in production
   - Purpose: Marketing, downloads, user login, payments

2. **Admin Dashboard (Next.js)** - Admin-only portal
   - Runs on: **localhost:3001** in development
   - Deploys to: **admin.domain.com** in production
   - Purpose: User management, analytics, system configuration

3. **Desktop App (Electron)** - Native desktop application
   - Runs on: **localhost:5173** (Vite dev server for React UI)
   - Opens as: **Native desktop window** (NOT a browser tab)
   - Purpose: End-user application with AI + database connectivity

4. **Express API (Optional)** - Backend API server
   - Runs on: **localhost:5500** in development
   - Deploys to: **api.domain.com** in production
   - Purpose: License validation, AI routing, usage tracking

---

## 🌐 Landing Site (domain.com)

### What It Is:
- Public-facing Next.js application
- Accessed through any web browser
- Provides:
  - Marketing home page
  - Download portal with platform detection
  - User authentication (login/signup)
  - Payment/subscription management
  - Pricing and features showcase

### Access Points (Development):
- **Home Page**: http://localhost:3000
- **Download Page**: http://localhost:3000/download
- **Subscribe Page**: http://localhost:3000/subscribe
- **Login Page**: http://localhost:3000/login

### Access Points (Production):
- **Home Page**: https://domain.com
- **Download Page**: https://domain.com/download
- **Subscribe Page**: https://domain.com/subscribe
- **Login Page**: https://domain.com/login

---

## 🔐 Admin Dashboard (admin.domain.com)

### What It Is:
- Admin-only Next.js application
- Accessed through any web browser
- Protected by authentication (admin users only)
- Provides:
  - User management (view, edit, delete users)
  - License management (generate, revoke, view usage)
  - Subscription oversight
  - Analytics and monitoring
  - Database health checks
  - System configuration

### Access Points (Development):
- **Dashboard Home**: http://localhost:3001
- **User Management**: http://localhost:3001/users
- **License Management**: http://localhost:3001/licenses
- **Analytics**: http://localhost:3001/analytics

### Access Points (Production):
- **Dashboard Home**: https://admin.domain.com
- **User Management**: https://admin.domain.com/users
- **License Management**: https://admin.domain.com/licenses
- **Analytics**: https://admin.domain.com/analytics

### What It Is:
- Admin-only Next.js application
- Accessed through web browser (requires admin authentication)
- Provides:
  - User management interface
  - License management
  - Subscription analytics
  - Usage tracking and metrics
  - System configuration
  - Database monitoring

### Access Points (Development):
- **Admin Dashboard**: http://localhost:4000

### Access Points (Production):
- **Admin Dashboard**: https://admin.domain.com

---

## 🖥️ Desktop App (Local)

### What It Is:
- **NOT a browser app** - It's a native desktop application
- Uses Electron (Chromium + Node.js bundled together)
- Appears as a standalone app window with native OS integration
- Can access:
  - Local file system
  - Local databases (PostgreSQL, MySQL, Oracle, SQL Server, MongoDB, etc.)
  - Native dialogs and notifications
  - System resources

### Development:
The Vite server (localhost:5173) serves the React UI, but Electron loads it into a **native application window**, not a browser tab.

---

## 📦 Starting the Applications

### Option 1: Run All Applications (Full Stack)
```bash
pnpm dev
```

This starts:
- ✅ Landing Site on **localhost:3000** (public website)
- ✅ Admin Dashboard on **localhost:3002** (admin portal)
- ✅ Cloud Backend API on **localhost:3001** (legacy API server)
- ✅ Desktop App opens as **native window** (Electron)

### Option 2: Run Landing Site Only
```bash
pnpm --filter landing-site dev
```
Then visit: http://localhost:3000

### Option 3: Run Admin Dashboard Only
```bash
pnpm --filter admin-dashboard dev
```
Then visit: http://localhost:3002

### Option 4: Run Desktop App Only
```bash
pnpm --filter desktop-app dev
```
A native Electron window will open (NOT a browser tab)

### Option 5: Run Cloud Backend Only (Legacy/API)
```bash
### Option 2: Run Express API (Optional)
```bash
pnpm dev:express
```
Express API server on port 5500

### Option 3: Run Individual Apps
```bash
# Landing site only
pnpm --filter landing-site dev

# Admin dashboard only
pnpm --filter admin-dashboard dev

# Desktop app only
pnpm --filter desktop-app dev

# Express API only
pnpm --filter express-api dev
```

---

## 🎯 What You'll See

### Landing Site (Browser - domain.com)
Open http://localhost:3000 in **Chrome/Firefox/Safari** to see:
- Modern landing page with features showcase
- Download portal with platform detection
- Pricing page with subscription options
- User login and registration
- Payment processing pages

### Admin Dashboard (Browser - admin.domain.com)
Open http://localhost:3001 in **your browser** to see:
- Admin login page (protected)
- User management interface
- License and subscription management
- Usage analytics and metrics
- Database monitoring
- System settings

### Desktop App (Native Window)
An **Electron window** opens automatically showing:
- Desktop application UI
- Connection management interface
- AI query interface
- Settings and license management

### Express API (Optional Backend)
Access http://localhost:5500/health to verify:
- License validation endpoint
- AI query routing
- Usage tracking API
- Health checks

---

## 🔧 Key Differences

| Feature | Landing Site | Admin Dashboard | Desktop App | Express API |
|---------|--------------|-----------------|-------------|-------------|
| **Access** | Web browser | Web browser | Native window | API calls |
| **URL (dev)** | localhost:3000 | localhost:3001 | localhost:5173 (internal) | localhost:5500 |
| **URL (prod)** | domain.com | admin.domain.com | Runs locally | api.domain.com |
| **Purpose** | Marketing + Payments | Admin management | End-user tool | Backend logic |
| **Technology** | Next.js 14 | Next.js 14 | Electron + React | Express.js |
| **Users** | Public + customers | Admins only | End users | Desktop app |
| **Authentication** | User accounts | Admin accounts | License keys | API keys |

---

## 📦 Starting the Applications

### Option 1: Run All Web Apps (Recommended)
```bash
pnpm dev
```

This starts:
- ✅ Landing Site on **localhost:3000** (access in browser)
- ✅ Admin Dashboard on **localhost:3001** (access in browser)
- ✅ Desktop App opens as **native window** (React UI served from localhost:5173)

### Option 2: Run Everything Including Express API
```bash
# Terminal 1
pnpm dev

# Terminal 2
pnpm dev:express
```

### Option 3: Run Only Specific App
```bash
# Landing site only
pnpm --filter landing-site dev

# Admin dashboard only
pnpm --filter admin-dashboard dev

# Desktop app only
pnpm --filter desktop-app dev

# Express API only
pnpm --filter express-api dev
```

---

## 🎯 What You'll See

### Cloud Backend (Browser)
Open http://localhost:3000 in **Chrome/Firefox/Safari** to see:
- Modern landing page with features showcase
- Download portal with platform detection
- Pricing page with subscription options
- Admin dashboard with user management

### Desktop App (Native Window)
An **Electron window** opens automatically showing:
- Desktop application UI
- Connection management interface
- AI query interface
- Settings and license management

---

## 🔧 Key Differences

| Feature | Cloud Backend | Desktop App |
|---------|---------------|-------------|
| **Access** | Web browser | Native window |
| **URL** | localhost:3000 | localhost:5173 (internal) |
| **Purpose** | Admin + Marketing | End-user tool |
| **Technology** | Next.js 14 | Electron + React |
| **Database** | Remote (Prisma/Mongo) | Local connections |
| **Runs On** | Server | User's computer |

---

## 🐛 Troubleshooting

### "Cannot read properties of undefined (reading 'handle')"
This happens when Electron main process code runs outside Electron context. 
✅ **Fixed**: We now use `electron.js` loader that properly loads TypeScript via tsx.

### Both apps on port 3000?
✅ **Fixed**: 
- Cloud backend: **3000**
- Desktop app Vite: **5173**

### Next.js Warning about module type
✅ **Fixed**: Added `"type": "module"` to cloud-backend/package.json

---

## 📱 Production Builds

### Desktop App:
```bash
pnpm --filter desktop-app build
```
Creates installers:
- Windows: `.exe`, `.msi`
- macOS: `.dmg`
- Linux: `.AppImage`, `.deb`, `.rpm`

### Cloud Backend:
```bash
pnpm --filter cloud-backend build
```
Deploy to: Vercel, Netlify, or your own server

---

## 🎉 Summary

**Start everything:**
```bash
pnpm dev
```

**Then access:**
- 🌐 **Cloud Website**: Open browser → http://localhost:3000
- 🖥️ **Desktop App**: Electron window opens automatically

**The desktop app is NOT a browser - it's a native application with full OS integration!**
