# Database Setup Guide - Supabase

This guide will walk you through deploying the database schema to Supabase.

## 🎯 Prerequisites

- Supabase account (already configured)
- Project URL: `lwounfzhkuuqvgkvwxvt.supabase.co`
- Access to Supabase dashboard

---

## 📋 Quick Deploy (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to https://app.supabase.com/
2. Select your project: **lwounfzhkuuqvgkvwxvt**
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy & Run Schema

1. Open `/database/schema.sql` in your local editor
2. Copy the ENTIRE contents (all 225 lines)
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. Wait for "Success. No rows returned" message

### Step 3: Verify Tables Created

1. Click on **Table Editor** in left sidebar
2. You should see these 7 tables:
   - ✅ **users** - User profiles and authentication
   - ✅ **licenses** - License keys and plans
   - ✅ **device_activations** - Device tracking
   - ✅ **subscriptions** - Subscription management
   - ✅ **payments** - Payment records
   - ✅ **usage_logs** - AI usage tracking
   - ✅ **api_keys** - User API key storage

---

## 🔍 What Gets Created

### Tables (7 total)

#### 1. **users**
- Extends Supabase auth.users
- Stores: plan, total_usage_cost, trial_ends_at
- RLS enabled for user-specific access

#### 2. **licenses**
- License key management
- Fields: license_key, plan, status, expires_at, device_limit
- Supports: free, professional, enterprise plans
- Automatic expiration handling

#### 3. **device_activations**
- Tracks devices using licenses
- Fields: device_id, device_name, device_os, last_seen_at
- Enforces device limits per license

#### 4. **subscriptions**
- Subscription tracking for recurring payments
- Fields: plan, payment_provider, billing_cycle, amount
- Supports: Dodo, PayPal, Razorpay

#### 5. **payments**
- Payment history and records
- Fields: amount, currency, status, payment_provider
- Stores: completed, pending, failed, refunded

#### 6. **usage_logs**
- AI query usage tracking
- Fields: provider, model, tokens_used, cost
- Enables: cost tracking, analytics, billing

#### 7. **api_keys**
- User's AI provider API keys (BYOK)
- Fields: provider, encrypted_key, is_active
- Security: Keys stored encrypted

### Security Features

#### Row-Level Security (RLS)
All tables have RLS policies ensuring:
- Users can only access their own data
- Admin users can access all data (if needed)
- Service role bypasses RLS for backend operations

#### Triggers
- `update_updated_at_column()` - Auto-updates `updated_at` timestamp
- Applied to all tables for audit trail

#### Functions
- `handle_new_user()` - Auto-creates user profile on signup
- Triggered on auth.users insert

### Indexes
Optimized indexes on:
- `user_id` columns (fast user lookups)
- `status` columns (filter active/inactive)
- `created_at` columns (date range queries)
- `license_id` (device activation lookups)

---

## 🔐 Get Your Supabase Keys

### Required Environment Variables

You need 3 keys from Supabase:

1. **Project URL** (already known)
2. **Anon (Public) Key** - For frontend
3. **Service Role Key** - For backend (secret!)

### How to Get Keys:

1. Go to https://app.supabase.com/project/lwounfzhkuuqvgkvwxvt/settings/api
2. You'll see:
   - **Project URL**: `https://lwounfzhkuuqvgkvwxvt.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ Keep secret!)

### Add to .env files:

**Admin Dashboard** (`/apps/admin-dashboard/.env`):
```bash
VITE_SUPABASE_URL=https://lwounfzhkuuqvgkvwxvt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Express API** (`/apps/express-api/.env`):
```bash
SUPABASE_URL=https://lwounfzhkuuqvgkvwxvt.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

---

## ✅ Verification Steps

### Test 1: Check Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected output:
```
api_keys
device_activations
licenses
payments
subscriptions
usage_logs
users
```

### Test 2: Check RLS Policies
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

Should see policies for each table.

### Test 3: Check Triggers
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

Should see `update_updated_at` triggers.

### Test 4: Insert Test User
```sql
-- This should work (creates user profile automatically)
-- First, sign up a user through the admin dashboard
-- Then check if user profile was created:
SELECT * FROM users LIMIT 1;
```

---

## 🚀 Next Steps

After deploying the schema:

### 1. Configure Authentication (5 min)
- Go to **Authentication** → **Providers**
- Enable: Email, Google, GitHub (as needed)
- Configure OAuth callback URLs

### 2. Set Up Storage (Optional)
If you need file uploads:
- Go to **Storage**
- Create bucket: `user-files`
- Set up policies for user access

### 3. Test Admin Dashboard (5 min)
```bash
cd apps/admin-dashboard
npm run dev
```
- Visit http://localhost:3000
- Sign up/Login
- Check if user profile appears in Users table

### 4. Test Express API (5 min)
```bash
cd apps/express-api
npm install
npm run dev
```
- Visit http://localhost:5500/health
- Should return `{"status":"ok"}`

### 5. Generate TypeScript Types (Optional)
```bash
npx supabase gen types typescript --project-id lwounfzhkuuqvgkvwxvt > database/types.ts
```

---

## 🔧 Common Issues

### Issue 1: "Permission denied for schema public"
**Solution**: Make sure you're using the SQL Editor in Supabase dashboard, not local psql

### Issue 2: "Relation already exists"
**Solution**: Tables already created. Either drop them first or use a migration.

Drop all tables:
```sql
DROP TABLE IF EXISTS usage_logs CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS device_activations CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS licenses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

Then run the schema again.

### Issue 3: "Extension uuid-ossp not available"
**Solution**: Supabase enables this by default. If error persists, contact support.

---

## 📊 Database Schema Diagram

```
auth.users (Supabase managed)
    ↓ (1:1)
users
    ↓ (1:many)
    ├── licenses
    │   └── device_activations
    │
    ├── subscriptions
    │   └── payments
    │
    ├── usage_logs
    │
    └── api_keys
```

---

## 💾 Backup & Recovery

### Create Backup
Supabase automatically backs up your database daily.

Manual backup:
1. Go to **Database** → **Backups**
2. Click **Create Backup**
3. Name it (e.g., "Before deployment")

### Restore Backup
1. Go to **Database** → **Backups**
2. Find your backup
3. Click **Restore**

---

## 📈 Monitoring

### View Database Activity
- **Database** → **Logs** - View recent queries
- **Database** → **Performance** - Check slow queries
- **Database** → **Roles** - Manage users/permissions

### Set Up Alerts
1. Go to **Settings** → **Alerts**
2. Set alerts for:
   - Database size
   - Connection count
   - Query performance

---

## 🎓 Learn More

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **SQL Editor**: https://supabase.com/docs/guides/database/overview

---

## ✨ You're Done!

Database is now ready for:
- ✅ User authentication
- ✅ License management
- ✅ Device tracking
- ✅ Payment processing
- ✅ Usage analytics
- ✅ AI provider integration

**Next**: Set up AI provider API keys (see `/docs/API-KEYS-SETUP-GUIDE.md`)
