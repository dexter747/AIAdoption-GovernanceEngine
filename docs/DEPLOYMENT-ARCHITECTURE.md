# Deployment Architecture Guide

## Current Components Overview

### What You Have:
1. **Landing Site** (Next.js) - Public marketing, downloads, payments
2. **Admin Dashboard** (Next.js) - Internal management
3. **Desktop App** (Electron) - Local AI + database tool
4. **Express API** - Backend for desktop app (AI calls, MCP, license validation)

### Services Decided:
- ✅ **File Storage**: Cloudinary (desktop app installers)
- ✅ **Database**: Supabase (PostgreSQL)
- ✅ **Payments**: Dodo, PayPal, Razorpay
- ❓ **Express API**: Where to host?
- ❓ **Next.js Apps**: Vercel or VPS?

---

## 🎯 Recommended Architecture: HYBRID APPROACH

### Why Hybrid?

Your desktop app has **unique requirements** that don't fit traditional serverless:
- **Long-running AI requests** (can take 30+ seconds)
- **Stateful MCP connections** (need persistent processes)
- **WebSocket support** (for real-time updates)
- **Background jobs** (license checks, usage tracking)

**Verdict**: Don't put everything in one place. Use the **best tool for each job**.

---

## ✅ RECOMMENDED SETUP

```
┌─────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT MAP                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│   Vercel (Edge)     │  ← Landing Site + Admin Dashboard
│                     │     - Auto-scaling
│   Next.js Apps      │     - Global CDN
│   Port: 443         │     - Serverless functions
│                     │     - Web payments, auth
└──────────┬──────────┘
           │
           ├──→ Supabase (Database) ← PostgreSQL, Auth, Storage
           │
           ├──→ Cloudinary (CDN) ← Desktop app installers (.exe, .dmg)
           │
           └──→ Payment Gateways ← Webhooks to Vercel

┌─────────────────────┐
│  Railway/Render     │  ← Express API (for desktop app)
│  (VPS Alternative)  │     - Long-running processes ✅
│                     │     - Stateful MCP servers ✅
│  Express Server     │     - WebSocket support ✅
│  Port: 5500         │     - Background workers ✅
│                     │     - Better for AI calls ✅
└──────────┬──────────┘
           │
           ├──→ AI Providers (OpenAI, Anthropic, etc.)
           ├──→ MCP Servers (spawn as child processes)
           └──→ Supabase (shared database)

┌─────────────────────┐
│   User's Computer   │  ← Desktop App (Electron)
│                     │     - Downloads from Cloudinary
│   AI Nexus Desktop  │     - Authenticates with Vercel
│                     │     - Makes API calls to Railway
│                     │     - Connects to user's databases
└─────────────────────┘
```

---

## 📦 Detailed Breakdown

### 1. **Landing Site + Admin Dashboard** → **Vercel**

**Why Vercel:**
- ✅ **Best for Next.js** (built by same team)
- ✅ **Auto-scaling** (handles traffic spikes)
- ✅ **Global Edge Network** (fast worldwide)
- ✅ **Free SSL** + CDN
- ✅ **Easy deployment** (git push = deploy)
- ✅ **Serverless functions** (API routes work great)
- ✅ **Preview deployments** (test before production)

**What runs here:**
- Marketing pages
- User authentication (NextAuth)
- Payment processing (Dodo, PayPal, Razorpay webhooks)
- Admin dashboard UI
- User management
- License generation

**URL Structure:**
```
https://ainexus.com          → Landing site
https://admin.ainexus.com    → Admin dashboard
```

---

### 2. **Express API** → **Railway.app** or **Render.com**

**Why NOT Vercel for Express:**
- ❌ Serverless functions timeout after 10-60 seconds
- ❌ No persistent processes (MCP needs long-running servers)
- ❌ Can't spawn child processes reliably
- ❌ No WebSocket support (serverless)
- ❌ Expensive for high usage

**Why Railway/Render:**
- ✅ **Long-running processes** (no timeouts)
- ✅ **Persistent containers** (MCP servers stay alive)
- ✅ **WebSocket support** (real-time updates)
- ✅ **Spawn child processes** (MCP servers as children)
- ✅ **Background workers** (cron jobs, queues)
- ✅ **Fixed pricing** ($5-10/month)
- ✅ **Easy deployment** (git push or Docker)
- ✅ **Logs and monitoring** built-in

**What runs here:**
- License validation for desktop app
- AI model routing (OpenAI, Anthropic, etc.)
- MCP server management (spawn/manage processes)
- Usage tracking and analytics
- Background jobs (cleanup, notifications)

**URL:**
```
https://api.ainexus.com → Express API
```

**Alternative Options:**
1. **Railway.app** - $5-10/month, easiest setup
2. **Render.com** - $7/month, Docker support
3. **DigitalOcean App Platform** - $12/month, more control
4. **Fly.io** - Pay-as-you-go, edge deployment

---

### 3. **Database** → **Supabase**

**Why Supabase:**
- ✅ **Managed PostgreSQL** (no maintenance)
- ✅ **Built-in auth** (can use their JWT)
- ✅ **Real-time subscriptions** (WebSocket)
- ✅ **Storage** (alternative to Cloudinary)
- ✅ **Edge Functions** (serverless Deno)
- ✅ **Free tier** generous (500MB database, 2GB bandwidth)
- ✅ **Auto backups** + point-in-time recovery

**What's stored:**
- Users and subscriptions
- Licenses and activations
- Usage analytics
- Payment history
- Desktop app connections

**Connection:**
```typescript
// Both Next.js (Vercel) and Express (Railway) connect to same Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
```

---

### 4. **File Storage** → **Cloudinary**

**Why Cloudinary:**
- ✅ **CDN delivery** (fast downloads worldwide)
- ✅ **Version management** (track releases)
- ✅ **Automatic optimization** (compression)
- ✅ **Free tier** (25GB storage, 25GB bandwidth)
- ✅ **Simple API** (upload from admin dashboard)

**What's stored:**
- Desktop app installers (.exe, .dmg, .AppImage, .deb)
- App icons and assets
- User avatars (optional)

**URL structure:**
```
https://res.cloudinary.com/ainexus/raw/upload/v1/releases/windows/AI-Nexus-Setup-1.0.0.exe
https://res.cloudinary.com/ainexus/raw/upload/v1/releases/macos/AI-Nexus-1.0.0.dmg
```

---

## 🔐 Authentication Flow

### Google Sign-In + JWT

```
┌──────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                        │
└──────────────────────────────────────────────────────────────┘

1. User visits landing site (Vercel)
   ↓
2. Clicks "Sign in with Google"
   ↓
3. NextAuth redirects to Google OAuth
   ↓
4. Google returns user info
   ↓
5. Next.js creates JWT token (signed)
   ↓
6. User downloads desktop app from Cloudinary
   ↓
7. Desktop app opens, asks for license key
   ↓
8. User enters license key (JWT from Vercel)
   ↓
9. Desktop app sends JWT to Express API (Railway)
   ↓
10. Express validates JWT signature
   ↓
11. Express checks license in Supabase
   ↓
12. Desktop app authenticated ✅
```

### Implementation:

**Next.js (Vercel) - Generate License:**
```typescript
// apps/landing-site/src/app/api/licenses/generate/route.ts
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const { userId, plan } = await req.json();
  
  // Create license in database
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  const { data: license } = await supabase
    .from('licenses')
    .insert({
      user_id: userId,
      plan: plan,
      status: 'active',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    })
    .select()
    .single();
  
  // Generate JWT
  const token = jwt.sign(
    {
      licenseId: license.id,
      userId: userId,
      plan: plan,
      expiresAt: license.expires_at
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1y' }
  );
  
  return Response.json({ licenseKey: token });
}
```

**Express API (Railway) - Validate License:**
```typescript
// apps/express-api/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

export async function validateLicense(req, res, next) {
  const licenseKey = req.headers.authorization?.replace('Bearer ', '');
  
  if (!licenseKey) {
    return res.status(401).json({ error: 'License key required' });
  }
  
  try {
    // Verify JWT signature
    const decoded = jwt.verify(licenseKey, process.env.JWT_SECRET!);
    
    // Check license in database
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    
    const { data: license } = await supabase
      .from('licenses')
      .select('*')
      .eq('id', decoded.licenseId)
      .single();
    
    if (!license || license.status !== 'active') {
      return res.status(401).json({ error: 'Invalid license' });
    }
    
    // Check expiration
    if (new Date(license.expires_at) < new Date()) {
      return res.status(401).json({ error: 'License expired' });
    }
    
    // Attach to request
    req.license = license;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid license key' });
  }
}
```

**Desktop App - Authenticate:**
```typescript
// apps/desktop-app/src/main/auth.ts
import Store from 'electron-store';

const store = new Store();

export async function activateLicense(licenseKey: string) {
  try {
    // Validate with Express API
    const response = await fetch('https://api.ainexus.com/api/licenses/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${licenseKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Invalid license key');
    }
    
    const { license } = await response.json();
    
    // Store license locally
    store.set('licenseKey', licenseKey);
    store.set('license', license);
    
    return { success: true, license };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function getStoredLicense() {
  return store.get('licenseKey');
}

export async function checkLicenseValid() {
  const licenseKey = getStoredLicense();
  if (!licenseKey) return false;
  
  try {
    const response = await fetch('https://api.ainexus.com/api/licenses/check', {
      headers: { 'Authorization': `Bearer ${licenseKey}` }
    });
    return response.ok;
  } catch {
    return false;
  }
}
```

---

## 💳 Payment Flow

### How Payments Work with Local Software

```
┌──────────────────────────────────────────────────────────────┐
│                      PAYMENT FLOW                             │
└──────────────────────────────────────────────────────────────┘

1. User browses landing site (Vercel)
   ↓
2. Selects a plan (Professional, Enterprise)
   ↓
3. Clicks "Subscribe" → Redirects to payment gateway
   ↓
4. Payment gateway (Dodo/PayPal/Razorpay) processes payment
   ↓
5. Gateway sends webhook to Vercel API route
   ↓
6. Vercel API route:
   - Creates user in Supabase
   - Generates license key (JWT)
   - Sends email with license + download link
   ↓
7. User downloads desktop app from Cloudinary
   ↓
8. User installs and opens desktop app
   ↓
9. App asks for license key
   ↓
10. User enters license key
   ↓
11. Desktop app validates with Express API (Railway)
   ↓
12. License valid ✅ → App unlocked
```

### Implementation:

**Payment Webhook Handler (Vercel):**
```typescript
// apps/landing-site/src/app/api/webhooks/payment/route.ts
import { createClient } from '@supabase/supabase-js';
import { sendLicenseEmail } from '@/lib/email';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  const body = await req.json();
  
  // Verify webhook signature (Dodo/PayPal/Razorpay specific)
  const isValid = verifyWebhookSignature(body, req.headers);
  if (!isValid) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const { email, plan, amount, paymentId } = body;
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  // Create user
  const { data: user } = await supabase
    .from('users')
    .insert({ email, plan, payment_id: paymentId })
    .select()
    .single();
  
  // Generate license
  const { data: license } = await supabase
    .from('licenses')
    .insert({
      user_id: user.id,
      plan: plan,
      status: 'active',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    })
    .select()
    .single();
  
  // Create JWT license key
  const licenseKey = jwt.sign(
    {
      licenseId: license.id,
      userId: user.id,
      plan: plan,
      expiresAt: license.expires_at
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1y' }
  );
  
  // Send email with license key and download link
  await sendLicenseEmail({
    to: email,
    licenseKey: licenseKey,
    downloadUrl: 'https://ainexus.com/download',
    plan: plan
  });
  
  return Response.json({ success: true });
}
```

---

## 🏗️ Why NOT Single VPS (Hostinger)?

You asked about running everything on one VPS. Here's why it's **not recommended**:

### Problems with Single VPS:

❌ **Single Point of Failure**
- If server goes down, EVERYTHING is offline
- Vercel has 99.99% uptime, your VPS might not

❌ **Manual Maintenance**
- You manage OS updates, security patches
- Configure Nginx, SSL certificates
- Monitor server health
- Handle backups

❌ **Scaling Issues**
- Can't auto-scale (fixed resources)
- Traffic spike = server crash
- Need to manually upgrade server

❌ **More Expensive Long-term**
- VPS: $20-50/month for decent specs
- Hybrid: $5 Railway + Free Vercel + Free Supabase tier = $5/month

❌ **Slower Globally**
- Single location (no CDN)
- Users far from server = slow
- Vercel serves from 100+ edge locations

❌ **Security Risk**
- You manage all security
- One misconfiguration = breach
- Vercel/Railway handle security for you

❌ **No Preview Deployments**
- Can't test changes safely
- Vercel gives preview URLs for every PR

---

## ✅ Why Hybrid Wins

### Hybrid Approach Benefits:

✅ **Best Performance**
- Next.js on Vercel = Global edge network
- Express on Railway = Low latency for AI calls
- Supabase = Optimized database

✅ **Cost Effective**
- Start free: Vercel free, Railway $5, Supabase free
- Scale only what you need
- VPS = fixed cost regardless of usage

✅ **Zero Maintenance**
- No server management
- Automatic updates
- Built-in monitoring

✅ **Easy Scaling**
- Vercel auto-scales web apps
- Railway scales Express API
- Supabase handles database scaling

✅ **Better for Development**
- Preview deployments
- Easy rollbacks
- CI/CD built-in

✅ **Reliability**
- Multiple providers = redundancy
- If Railway goes down, web still works
- Professional SLA guarantees

---

## 💰 Cost Comparison

### Option A: Single VPS (Hostinger/DigitalOcean)
```
VPS (4GB RAM, 2 CPU):     $20-30/month
Domain:                    $12/year
SSL Certificate:           $0 (Let's Encrypt)
Backups:                   $5/month
Total:                     ~$30/month
```

### Option B: Hybrid (Recommended)
```
Vercel (Next.js):          $0 (Free tier)
Railway (Express):         $5/month
Supabase:                  $0 (Free tier, 500MB)
Cloudinary:                $0 (Free tier, 25GB)
Domain:                    $12/year
Total:                     ~$6/month
```

**Hybrid is 80% cheaper and better!**

---

## 🚀 Final Recommendation

```
┌─────────────────────────────────────────────────────────────┐
│              RECOMMENDED TECH STACK                          │
└─────────────────────────────────────────────────────────────┘

🌐 Web (Landing + Admin)    → Vercel (Next.js)
🔌 Desktop Backend (API)    → Railway.app (Express)
🗄️  Database                → Supabase (PostgreSQL)
📦 File Storage             → Cloudinary (Installers)
🔐 Authentication           → NextAuth + JWT
💳 Payments                 → Dodo + PayPal + Razorpay
📧 Emails                   → Resend or SendGrid
```

### Deployment Steps:

1. **Push Next.js apps to GitHub**
2. **Connect Vercel** → Auto-deploy on push
3. **Deploy Express to Railway** → One-click from GitHub
4. **Setup Supabase** → Create project, get connection string
5. **Configure Cloudinary** → Get API keys
6. **Setup payment webhooks** → Point to Vercel API routes
7. **Configure environment variables** → All platforms
8. **Done!** 🎉

---

## 📚 Next Steps

Want me to create:
1. **Deployment guides** for each platform?
2. **Environment variable setup** for all services?
3. **CI/CD pipeline** configuration?
4. **Monitoring and analytics** setup?

Let me know what you'd like me to implement next!
