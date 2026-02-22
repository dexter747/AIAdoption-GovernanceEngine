# Authentication Setup Checklist

## ✅ Completed

- [x] Install NextAuth and dependencies
- [x] Create Supabase database schema (`database/schema.sql`)
- [x] Configure NextAuth with Google OAuth (`src/auth.ts`)
- [x] Create NextAuth API route (`src/app/api/auth/[...nextauth]/route.ts`)
- [x] Update login page with Google Sign In button
- [x] Create SessionProvider component
- [x] Wrap app in SessionProvider and ThemeProvider
- [x] Generate NextAuth secret: `5ObPqrSAoAqhZLIXB0oCfXcLLL8Ay1qAaamjvBoX1M8=`
- [x] Generate JWT secret: `pHfIFnGr1nBV8aUkySn+Jhl3nAoLgIDxVnd28VBJr7o=`

## 🔄 In Progress

### 1. Setup Supabase Database

- [ ] Go to [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Select project: `lwounfzhkuuqvgkvwxvt`
- [ ] Navigate to: **SQL Editor**
- [ ] Click **+ New Query**
- [ ] Copy entire content from `database/schema.sql`
- [ ] Click **Run** to create all tables, triggers, and RLS policies
- [ ] Verify in: **Database** → **Tables**

### 2. Get Supabase Service Role Key

- [ ] In Supabase Dashboard: **Settings** → **API**
- [ ] Copy **service_role** key (under "Project API keys")
- [ ] Update `.env.local`:
  ```
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
  ```

### 3. Configure Google OAuth

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create new project or select existing
- [ ] Enable Google+ API
- [ ] Configure OAuth consent screen
- [ ] Create OAuth 2.0 credentials (Web application)
- [ ] Add authorized redirect URI:
  ```
  http://localhost:3000/api/auth/callback/google
  ```
- [ ] Copy **Client ID** and **Client Secret**
- [ ] Update `.env.local`:
  ```
  GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=your-client-secret
  ```

### 4. Configure Supabase Google Auth

- [ ] In Supabase Dashboard: **Authentication** → **Providers**
- [ ] Enable **Google** provider
- [ ] Paste Google Client ID and Secret
- [ ] Click **Save**

## 📝 Pending Tasks

### 5. Test Authentication Flow

- [ ] Start dev server: `pnpm dev` (in `apps/landing-site`)
- [ ] Open: `http://localhost:3000/login`
- [ ] Click "Sign in with Google"
- [ ] Complete Google OAuth flow
- [ ] Verify redirect to `/download`
- [ ] Check user in Supabase: **Authentication** → **Users**
- [ ] Check user profile in: **Database** → **users** table

### 6. Payment Integration

- [ ] Sign up for Dodo Payments account
- [ ] Get API keys and webhook secret
- [ ] Sign up for PayPal Developer account
- [ ] Get PayPal credentials (sandbox + production)
- [ ] Sign up for Razorpay account
- [ ] Get Razorpay API keys
- [ ] Update `.env.local` with all payment credentials
- [ ] Create payment webhook handlers:
  - `src/app/api/webhooks/dodo/route.ts`
  - `src/app/api/webhooks/paypal/route.ts`
  - `src/app/api/webhooks/razorpay/route.ts`

### 7. Email Setup

- [ ] Sign up for Resend account
- [ ] Get API key
- [ ] Verify domain (for production)
- [ ] Update `.env.local`:
  ```
  RESEND_API_KEY=your-resend-api-key
  FROM_EMAIL=noreply@yourdomain.com
  ```
- [ ] Create email templates for:
  - Welcome email
  - License key delivery
  - Payment receipt
  - Subscription expiry warning

### 8. File Storage Setup

- [ ] Sign up for Cloudinary account
- [ ] Get cloud name, API key, API secret
- [ ] Update `.env.local`:
  ```
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
  CLOUDINARY_API_KEY=your-api-key
  CLOUDINARY_API_SECRET=your-api-secret
  ```
- [ ] Upload desktop app installers (Windows, macOS, Linux)

## 🚀 Deployment

### 9. Vercel Deployment

- [ ] Push code to GitHub
- [ ] Connect Vercel to GitHub repo
- [ ] Add all environment variables in Vercel dashboard
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Add production redirect URI in Google OAuth:
  ```
  https://yourdomain.com/api/auth/callback/google
  ```
- [ ] Deploy to production

### 10. Express API Deployment

- [ ] Create Express API routes for:
  - License validation
  - Payment webhook processing
  - Desktop app downloads
- [ ] Deploy to Vercel (using Vercel Pro)
- [ ] Update `NEXT_PUBLIC_API_URL` in landing-site `.env`

## 📚 Documentation

For detailed instructions, see:

- [Google OAuth Setup Guide](./GOOGLE-OAUTH-SETUP.md)
- [Deployment Architecture](./DEPLOYMENT-ARCHITECTURE.md)
- [Database Schema](../database/schema.sql)
- [Color Theme Guide](./COLOR-THEME-GUIDE.md)
- [MCP Integration Guide](./MCP-INTEGRATION.md)

## 🔒 Security Notes

- ⚠️ Never commit `.env.local` to Git
- ⚠️ Keep `SUPABASE_SERVICE_ROLE_KEY` secret (bypasses RLS)
- ⚠️ Use different credentials for dev/staging/production
- ⚠️ Enable Row Level Security on all Supabase tables
- ⚠️ Validate all webhooks with signature verification
- ⚠️ Use HTTPS in production
- ⚠️ Rotate secrets regularly

## 🐛 Common Issues

### "Invalid environment variable"

- Make sure `.env.local` is in `apps/landing-site/` folder
- Restart dev server after updating `.env.local`

### "redirect_uri_mismatch"

- Check Google OAuth redirect URI matches exactly
- No trailing slashes
- Correct port number (3000)

### "User not found in database"

- Verify `create_user_profile()` trigger is created in Supabase
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct
- Review Supabase logs for errors

### "Session undefined"

- Make sure SessionProvider wraps your app
- Check NEXTAUTH_SECRET is set
- Clear browser cookies and try again

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check terminal for server errors
3. Review Supabase logs: **Database** → **Logs**
4. Review NextAuth debug logs (set `debug: true` in auth.ts)
