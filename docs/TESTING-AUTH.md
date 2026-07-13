# Testing Google OAuth (Simplified)

## ✅ Current Status

- ✅ Database schema created in Supabase
- ✅ Dev server running on http://localhost:3000
- ✅ Auth configuration simplified (no service role key needed)
- ✅ NextAuth and JWT secrets generated

## 🔄 What You Need to Do Now

### 1. Configure Google OAuth Credentials

**Quick Steps:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Copy **Client ID** and **Client Secret**

### 2. Update Environment Variables

Open `.env.local` and update:

```env
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
```

### 3. Restart Dev Server

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
pnpm dev
```

### 4. Test the Auth Flow

1. Open: http://localhost:3000/login
2. Click **"Sign in with Google"**
3. You should see Google's consent screen
4. Sign in with your Google account
5. After success, you'll be redirected to `/download`

## 🎯 What Happens Behind the Scenes

1. **NextAuth** handles Google OAuth flow
2. User signs in with Google credentials
3. Google redirects back to your app with auth token
4. NextAuth creates a session (JWT)
5. User is redirected to `/download` page

## 🔮 Next: Supabase Integration

After Google OAuth works, we'll connect it to Supabase:

1. Configure Supabase Auth Google provider
2. Users will be created in Supabase automatically
3. The database trigger will create user profiles
4. We can then add payment & license features

## 🐛 Troubleshooting

### "Invalid Client" Error

- Double-check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Make sure there are no extra spaces
- Restart dev server after changing `.env.local`

### "redirect_uri_mismatch" Error

- The redirect URI in Google Console must exactly match:
  ```
  http://localhost:3000/api/auth/callback/google
  ```
- No trailing slash
- Check port number (3000)

### Button doesn't work

- Open browser console (F12)
- Check for JavaScript errors
- Make sure you're on http://localhost:3000/login

## 📝 After Testing

Once Google OAuth works, let me know and we'll:

1. Connect it to Supabase Auth
2. Implement payment integration
3. Create license generation system
4. Build desktop app activation
