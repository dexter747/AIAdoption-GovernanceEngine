# Google OAuth Setup Guide

## Current Configuration

The Google OAuth credentials are already in `.env.local`:

- **Client ID**: `1050526800573-q1dp83a3e9ud0riblc1jj6r8pqh7hslj.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-REDACTED`

## Required: Add Authorized Redirect URIs

You need to add these redirect URIs in the Google Cloud Console:

### For Development:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID
3. Click Edit
4. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/api/auth/callback/google
   http://localhost:3001/api/auth/callback/google
   ```
5. Click Save

### For Production:

Add your production domain:

```
https://yourdomain.com/api/auth/callback/google
```

## Testing the Auth Flow

1. **Restart the dev servers** (environment variables need to be loaded):

   ```bash
   # Stop the current pnpm dev process (Ctrl+C)
   pnpm dev
   ```

2. **Open the desktop app** (if not already running):

   ```bash
   pnpm --filter desktop-app dev
   ```

3. **Click "Sign in with Browser"** in the desktop app

4. **In the browser**, click "Continue with Google"

5. **Select your Google account** and authorize the app

6. **Check for errors**:
   - Browser console (F12)
   - Terminal running the landing site
   - Look for "redirect_uri_mismatch" error

## Common Errors

### "redirect_uri_mismatch"

**Cause**: The redirect URI in Google Cloud Console doesn't match the one being used.

**Solution**: Make sure you added `http://localhost:3000/api/auth/callback/google` to Authorized redirect URIs.

### "Access blocked: This app's request is invalid"

**Cause**: OAuth consent screen not configured or missing scopes.

**Solution**:

1. Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Configure the consent screen
3. Add test users (your email) if in "Testing" mode

### "Error: Missing or invalid Google credentials"

**Cause**: Environment variables not loaded.

**Solution**: Restart the dev server.

## Environment Variables Checklist

Landing site `.env.local` should have:

- ✅ `NEXTAUTH_URL=http://localhost:3000`
- ✅ `NEXTAUTH_SECRET` (any random string)
- ✅ `GOOGLE_CLIENT_ID` (from Google Cloud Console)
- ✅ `GOOGLE_CLIENT_SECRET` (from Google Cloud Console)

## OAuth Flow Diagram

```
Desktop App → Opens Browser → Landing Site (/login?desktop=true)
                                     ↓
                            Click "Continue with Google"
                                     ↓
                              Google OAuth Login
                                     ↓
                        Google redirects back to /api/auth/callback/google
                                     ↓
                              NextAuth processes
                                     ↓
                        Redirects to /auth/desktop-callback
                                     ↓
                   Deep link back to desktop app (velanova://)
```

## Quick Test (Without Desktop App)

To test Google OAuth without the desktop app:

1. Open browser to: `http://localhost:3000/login`
2. Click "Continue with Google"
3. Should redirect to Google OAuth
4. After signing in, should redirect to `/download`

If this works, then the issue is with the deep link, not OAuth.
