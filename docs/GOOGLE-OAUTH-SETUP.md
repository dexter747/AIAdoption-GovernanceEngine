# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: `Velanova` (or your app name)
4. Click "Create"

## Step 2: Enable Google+ API

1. In the sidebar, navigate to: **APIs & Services** → **Library**
2. Search for: `Google+ API`
3. Click on it and press **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Select: **External** (unless you have Google Workspace)
3. Click **Create**

### Fill in the form:

**App Information:**

- App name: `Velanova`
- User support email: `your-email@domain.com`
- App logo: (Optional) Upload your logo

**App Domain:**

- Application home page: `https://your-domain.com` (or localhost for testing)
- Application privacy policy link: `https://your-domain.com/privacy`
- Application terms of service link: `https://your-domain.com/terms`

**Authorized domains:**

- Add: `your-domain.com`
- For local testing, you can skip this

**Developer contact information:**

- Email addresses: `your-email@domain.com`

4. Click **Save and Continue**

### Scopes (Step 2):

- Click **Add or Remove Scopes**
- Select:
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`
- Click **Update** → **Save and Continue**

### Test users (Step 3):

- Add your email for testing: `your-email@gmail.com`
- Click **Save and Continue**

## Step 4: Create OAuth Credentials

1. Go to: **APIs & Services** → **Credentials**
2. Click: **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Velanova Web Client`

### Authorized JavaScript origins:

```
http://localhost:3000
https://your-production-domain.com
https://your-staging-domain.vercel.app
```

### Authorized redirect URIs:

```
http://localhost:3000/api/auth/google/callback
http://localhost:3001/api/auth/google/callback
https://your-production-domain.com/api/auth/google/callback
https://your-staging-domain.vercel.app/api/auth/google/callback
```

**Note:** Use port 3000 for landing-site, port 3001 for admin-dashboard

5. Click **Create**
6. **IMPORTANT:** Copy the **Client ID** and **Client Secret**

## Step 5: Update Environment Variables

Update `.env.local` in `apps/landing-site/`:

```env
# App URL (must match your authorized redirect URI domain)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# NextAuth (use the generated secrets from terminal)
NEXTAUTH_SECRET=5ObPqrSAoAqhZLIXB0oCfXcLLL8Ay1qAaamjvBoX1M8=
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (paste your credentials here)
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# JWT for license keys (use the second generated secret)
JWT_SECRET=pHfIFnGr1nBV8aUkySn+Jhl3nAoLgIDxVnd28VBJr7o=
```

For `apps/admin-dashboard/.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3001
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

## Step 6: Get Supabase Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `lwounfzhkuuqvgkvwxvt`
3. Go to: **Settings** → **API**
4. Under "Project API keys", copy the **service_role** key (not the anon key)
5. **⚠️ WARNING:** This key bypasses Row Level Security - keep it secret!

Update `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 7: Setup Supabase Database

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **+ New Query**
3. Copy and paste the entire content of `database/schema.sql`
4. Click **Run**
5. Verify tables created: **Database** → **Tables**

You should see:

- `users`
- `licenses`
- `device_activations`
- `subscriptions`
- `payments`
- `usage_logs`
- `api_keys`

## Step 8: Configure Supabase Auth

1. In Supabase Dashboard, go to: **Authentication** → **Providers**
2. Find **Google** and toggle it **ON**
3. Paste your **Google Client ID** and **Client Secret**
4. Click **Save**

## Step 9: Test the Authentication Flow

1. Start the dev server:

   ```bash
   cd apps/landing-site
   pnpm dev
   ```

2. Open: `http://localhost:3000/login`

3. Click **Sign in with Google**

4. You should be redirected to Google's consent screen

5. After accepting, you'll be redirected back to `/download`

6. Check Supabase Dashboard → **Authentication** → **Users**
   - Your user should appear there

7. Check: **Database** → **Table Editor** → `users`
   - Your profile should be created automatically via trigger

## Troubleshooting

### Error: "redirect_uri_mismatch"

- Make sure the redirect URI in Google Console exactly matches:
  `http://localhost:3000/api/auth/callback/google`
- No trailing slashes
- Exact port number

### Error: "Invalid client"

- Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- No extra spaces or quotes
- Make sure they're in `.env.local` not `.env`

### User not appearing in Supabase

- Check that SUPABASE_SERVICE_ROLE_KEY is correct
- Make sure the `create_user_profile()` trigger is created
- Check Supabase logs for errors

### Session not persisting

- Make sure NEXTAUTH_SECRET is set
- Clear browser cookies and try again
- Check browser console for errors

## Production Deployment (Vercel)

1. Add environment variables in Vercel dashboard:
   - Go to your project → **Settings** → **Environment Variables**
   - Add all variables from `.env.local`
   - Update `NEXTAUTH_URL` to your production domain

2. Update Google OAuth redirect URIs:
   - Add: `https://your-domain.vercel.app/api/auth/callback/google`

3. Update Supabase Auth allowed redirect URLs:
   - **Authentication** → **URL Configuration**
   - Add: `https://your-domain.vercel.app/**`

## Security Checklist

- ✅ Never commit `.env.local` to Git
- ✅ Use different OAuth credentials for dev/staging/prod
- ✅ Keep service_role key secret (never expose to frontend)
- ✅ Enable Row Level Security on all tables
- ✅ Use HTTPS in production
- ✅ Set up CORS properly for API routes
- ✅ Rotate secrets regularly
- ✅ Monitor Supabase logs for suspicious activity

## Next Steps

Once authentication is working:

1. Implement payment integration (Dodo, PayPal, Razorpay)
2. Create license generation system
3. Build desktop app activation flow
4. Add email notifications with Resend
5. Create admin dashboard for user management
