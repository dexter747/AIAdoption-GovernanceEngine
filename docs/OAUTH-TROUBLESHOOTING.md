# OAuth Troubleshooting Guide

## Error 400: redirect_uri_mismatch

**Problem:** You see "Error 400: redirect_uri_mismatch" when trying to sign in with Google.

**Cause:** The redirect URI in your app doesn't match what's configured in Google Cloud Console.

### Solution

1. **Check your environment variables** in `.env.local`:

   For **landing-site**:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   ```

   For **admin-dashboard**:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
   ```

2. **Update Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to: **APIs & Services** → **Credentials**
   - Click your OAuth 2.0 Client ID
   - Under **Authorized redirect URIs**, ensure you have:
     ```
     http://localhost:3000/api/auth/google/callback
     http://localhost:3001/api/auth/google/callback
     ```
   - For production, also add:
     ```
     https://your-domain.com/api/auth/google/callback
     https://admin.your-domain.com/api/auth/google/callback
     ```
   - Click **Save**

3. **Wait 5 minutes** for Google's cache to update

4. **Clear your browser cache** or use incognito mode

5. **Try signing in again**

---

## "Access blocked: This app's request is invalid"

**Cause:** One or more environment variables are missing or incorrect.

### Checklist:

- [ ] `GOOGLE_CLIENT_ID` is set
- [ ] `GOOGLE_CLIENT_SECRET` is set
- [ ] `GOOGLE_REDIRECT_URI` matches Google Console exactly
- [ ] `NEXT_PUBLIC_APP_URL` matches your actual domain
- [ ] Redirect URI is in the correct format: `/api/auth/google/callback` (NOT `/api/auth/callback/google`)

---

## OAuth consent screen not configured

**Error:** "OAuth consent screen is not configured"

**Solution:**
1. Go to Google Cloud Console
2. Navigate to: **APIs & Services** → **OAuth consent screen**
3. Fill in required fields:
   - App name
   - User support email
   - Developer contact email
4. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
5. Add test users (for development)
6. Save

---

## "This app hasn't been verified"

**During development:**
- Click "Advanced" → "Go to [App Name] (unsafe)"
- This is normal for apps in testing mode

**For production:**
- Submit your app for Google verification
- Or limit users to your organization (Google Workspace only)

---

## Environment Variables Not Loading

**Symptoms:**
- `GOOGLE_CLIENT_ID` is undefined
- Getting "Google OAuth not configured" error

**Solutions:**

1. **Check file name:** Must be `.env.local` (not `.env`)

2. **Restart dev server** after adding variables:
   ```bash
   # Kill the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

3. **Check file location:**
   ```
   apps/landing-site/.env.local     ✅
   apps/landing-site/.env           ❌ (won't be loaded by Next.js)
   .env.local                       ❌ (wrong location, too high up)
   ```

4. **Verify syntax:**
   ```env
   # ✅ Correct
   GOOGLE_CLIENT_ID=123456.apps.googleusercontent.com
   
   # ❌ Wrong (no quotes needed)
   GOOGLE_CLIENT_ID="123456.apps.googleusercontent.com"
   
   # ❌ Wrong (no spaces around =)
   GOOGLE_CLIENT_ID = 123456.apps.googleusercontent.com
   ```

---

## Different redirect URIs for different environments

**Local development:**
```env
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

**Staging (Vercel):**
```env
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/api/auth/google/callback
```

**Production:**
```env
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
```

**Important:** Each environment needs its own redirect URI added to Google Cloud Console.

---

## Quick Debug Commands

**Check if variables are loaded:**
```bash
# In your app's dev server terminal
echo $GOOGLE_CLIENT_ID
```

**Test OAuth flow manually:**
1. Open: `http://localhost:3000/api/auth/google`
2. Should redirect to Google sign-in
3. After sign-in, should redirect to: `http://localhost:3000/api/auth/google/callback?code=...`

**Check Next.js environment:**
```typescript
// Add to a test API route
console.log({
  clientId: process.env.GOOGLE_CLIENT_ID,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
});
```

---

## Still having issues?

1. **Double-check all redirect URIs** match exactly (including protocol, port, and path)
2. **Ensure OAuth consent screen is configured** with correct scopes
3. **Add your email as a test user** in Google Cloud Console
4. **Clear browser cookies** for `localhost` and `accounts.google.com`
5. **Try a different browser** or incognito mode
6. **Check Google Cloud Console logs**: APIs & Services → Credentials → OAuth 2.0 Client IDs → [Your Client] → Logs

---

## Reference

See [GOOGLE-OAUTH-SETUP.md](./GOOGLE-OAUTH-SETUP.md) for complete setup instructions.
