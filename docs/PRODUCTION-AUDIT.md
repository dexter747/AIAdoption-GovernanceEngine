# Production Readiness Audit & Fixes

**Date:** Auto-generated  
**Status:** Significant hardening applied — see remaining items below

---

## Fixes Applied This Session

### 1. Script Path Resolution (All 8 CLI Scripts)

- **Bug:** `ROOT_DIR` computed via `new URL('.', import.meta.url).pathname` URL-encodes the `&` in the workspace path, causing all `existsSync` calls to fail silently
- **Fix:** Changed to `dirname(fileURLToPath(import.meta.url))` using Node's `url` module
- **Files:** `scripts/{health-check,deploy-desktop,update-downloads,db-up,db-down,admin-seed,admin-delete,debug-all}.js`

### 2. Script Syntax Error

- **Bug:** `update-downloads.js` used `await import('fs')` inside a non-async function
- **Fix:** Used the already-imported `createWriteStream` from `fs`

### 3. Express API Security Hardening

- **Added:** `helmet` (security headers), `express-rate-limit` (300 req/15min for API, 20 req/15min for auth)
- **Added:** `trust proxy` for correct client IP behind load balancers
- **Added:** Body size limits (`1mb`) on `express.json()` and `urlencoded`
- **Fixed:** Duplicate error handler (removed inline, kept structured `errorHandler`)
- **Added:** 404 handler
- **Added:** Startup warnings for missing `JWT_SECRET` and `ENCRYPTION_KEY`
- **File:** `apps/express-api/src/server.js`

### 4. Pricing Unification

Unified all pricing across 4 locations to canonical: Free ($0) / Professional ($49/mo) / Team ($199/mo) / Enterprise (Custom)

- **PricingSection.tsx:** Expanded from 3 tiers to 4, fixed Professional from $199 → $49
- **create-checkout/route.ts:** Fixed PLAN_PRICES from $499/$4990 → $49/$468 for Professional, added Team tier
- **subscribe/page.tsx:** Already correct (verified)
- **pricing/page.tsx:** Already correct (verified)

### 5. Payment Provider Branding

Changed all Stripe/PayPal/Lemon Squeezy references to **Dodo Payments**:

- `subscribe/page.tsx`, `Footer.tsx`, `PricingSection.tsx`, `privacy/page.tsx`, `cookies/page.tsx`

### 6. Admin Dashboard API Auth

- **Created:** `src/lib/api-auth.ts` — reusable `requireAdmin()` guard
- **Protected:** All 7 data API routes (10 handlers total): stats, users, payments, analytics, downloads, licenses, licenses/[id]
- Previously, all data API routes were completely unprotected — anyone could query admin data

### 7. Broken Links & Content

- **Footer:** Removed dead `/tutorials` link, `/changelog` → GitHub releases
- **Download page:** Version 1.2.0 → 1.0.0, local paths → Cloudinary URLs
- **Email domains:** Standardized all `velanova.io` → `velanova.com`
- **Admin sidebar:** Replaced hardcoded `admin@velanova.com` with auth context
- **Admin settings:** Removed test Stripe keys

### 8. Environment Cleanup

- All 3 `.env.example` files cleaned up:
  - Removed: Prisma, MongoDB, Stripe, PayPal, Razorpay, SMTP, SendGrid, Azure, AWS, Sentry, Datadog
  - Added: Dodo Payments, Cloudinary, Resend, JWT, all actual AI providers

### 9. Cloudinary Integration

- Added credentials to `apps/express-api/.env`
- Fixed docs page URLs to use correct cloud name (`de1fjyofa`)
- Updated root `.env.example` with Cloudinary section

---

## Remaining Work (Not Yet Fixed)

### CRITICAL — Must Fix Before Launch

| #   | Issue                                                                                                                                        | Location                                                  | Effort                                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------- |
| 1   | **Checkout page is a simulated form** — collects card details in HTML, uses `setTimeout` to fake processing, shows "Development Mode" banner | `landing-site/src/app/subscribe/checkout/page.tsx`        | High — needs Dodo Payments JS SDK integration      |
| 2   | **Success page generates fake license keys** via `Math.random()`                                                                             | `landing-site/src/app/subscribe/success/page.tsx`         | Medium — needs backend license generation API call |
| 3   | **Webhook signature NOT verified** on Dodo payment webhook                                                                                   | `express-api/src/server.js:534`                           | Medium — needs Dodo webhook secret verification    |
| 4   | **Webhook emails are stub-only** — 4 email functions `console.log` with `// TODO`                                                            | `landing-site/src/app/api/webhooks/dodo/route.ts:196`     | Medium — needs Resend integration                  |
| 5   | **Desktop-token API route broken** — calls legacy `auth()` which returns null                                                                | `landing-site/src/app/api/auth/desktop-token/route.ts:18` | Low — rewrite to use JWT cookie                    |

### HIGH — Should Fix Before Launch

| #   | Issue                                                                                                                | Location                                              | Effort                                             |
| --- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------- |
| 6   | **Subscription routes have no user-level auth** — anyone can cancel/upgrade anyone's subscription by guessing userId | `express-api/src/routes/subscriptions.js`             | Medium — add JWT middleware + user ID verification |
| 7   | **Admin auth is a simple token comparison** — no RBAC                                                                | `express-api/src/routes/admin.js:26`                  | Medium                                             |
| 8   | **Hardcoded JWT fallback secrets** in 5+ files — if env vars are unset, anyone can forge tokens                      | Multiple files                                        | Low — add startup validation to crash if not set   |
| 9   | **Contact form doesn't send emails** — just `setTimeout` simulation                                                  | `landing-site/src/app/contact/page.tsx`               | Medium — needs Resend integration                  |
| 10  | **Admin settings page non-functional** — `alert('Settings saved')` with no persistence                               | `admin-dashboard/src/app/dashboard/settings/page.tsx` | Medium — needs API route + Supabase table          |

### MEDIUM — Nice to Have for Launch

| #   | Issue                                                                                | Location                                          |
| --- | ------------------------------------------------------------------------------------ | ------------------------------------------------- |
| 11  | Blog page has 4 static entries with no actual post pages                             | `landing-site/src/app/blog/`                      |
| 12  | Demo page shows "Video Coming Soon" placeholder                                      | `landing-site/src/app/demo/page.tsx`              |
| 13  | Fabricated social proof stats (2,500+ enterprises, 10M+ queries)                     | Multiple components                               |
| 14  | `requiredEnvVars` array is empty — server silently starts without Supabase           | `express-api/src/config/index.js:9`               |
| 15  | In-memory rate limiter in admin login won't work in serverless                       | `admin-dashboard/src/app/api/auth/login/route.ts` |
| 16  | No graceful shutdown in active server (exists in unused `src/index.js`)              | `express-api/src/server.js`                       |
| 17  | Three competing server entry points in express-api                                   | `server.js`, `src/server.js`, `src/index.js`      |
| 18  | BYOK keys may not be decrypted (`// TODO: Decrypt the key`)                          | `express-api/src/providers/ai-router.js:463`      |
| 19  | `next-auth` dependency installed but unused in both landing-site and admin-dashboard | Both `package.json` files                         |
| 20  | Docs sub-pages don't exist (quickstart, installation, connectors, etc.)              | `landing-site/src/app/docs/page.tsx`              |

---

## Architecture Notes

### What Works Well

- **Auth flow:** Google OAuth → JWT cookies → protected pages (landing + admin)
- **Supabase integration:** All tables exist, queries work, RLS enabled
- **MCP servers:** 64/64 built and ready
- **Desktop app:** 17 pages, 102 IPC channels, all wired to real backends
- **Express API:** Full route coverage for subscriptions, licenses, AI routing, BYOK, connections
- **Health check:** Comprehensive system monitoring (13/14 passing)

### Architectural Decision Needed

The Express API has 3 server files. The production-quality one (`src/app.js` + `src/index.js`) has proper middleware (Helmet, rate limiting, sanitization, CSRF, Pino logging, graceful shutdown) but is **not used**. The active one (`src/server.js`) now has Helmet + rate limiting added, but the `src/app.js` architecture is superior. Consider migrating to it.

---

## Health Check Results (Post-Fix)

```
13/14 checks passed
✅ Express API .env     ✅ Landing .env.local
✅ Admin .env.local     ✅ All 7 env vars
✅ Landing Site :3000   ✅ Admin Dashboard :3001
✅ Express API :5500    ✅ 64/64 MCP servers built
✅ Renderer built       ✅ node_modules
✅ pnpm-lock.yaml
❌ Root .env (intentionally not used)
⬜ Desktop package artifacts (not built)
```
