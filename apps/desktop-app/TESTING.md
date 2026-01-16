# Desktop App Testing Guide

## Starting the Desktop App

The desktop app runs separately from the main `pnpm dev` command.

### Start in a new terminal:
```bash
cd "AI Adoption & Governance Engine"
pnpm --filter desktop-app dev
```

Or from the desktop-app directory:
```bash
cd apps/desktop-app
pnpm dev
```

## Testing Sign-in with Browser

1. **Launch the desktop app** - An Electron window should open showing the login screen

2. **Click "Sign in with Browser"** button

3. **Browser opens** - You'll be redirected to `http://localhost:3000/login?desktop=true&callback=ainexus://auth/callback`

4. **Sign in with Google** - Click the "Continue with Google" button

5. **Google OAuth flow** - Complete Google authentication

6. **Desktop callback** - Browser shows "Authentication Successful" and attempts to redirect to `ainexus://auth/callback`

7. **Desktop app receives auth** - The deep link should be caught by the desktop app and you should be logged in

## Troubleshooting

### Button doesn't do anything
- **Check Electron DevTools** (opened automatically in dev mode)
- Look for JavaScript errors in the console
- Check if `window.electron.auth.login()` is defined

### Browser doesn't open
- Check the terminal running the desktop app for errors
- Verify the landing site is running on `http://localhost:3000`

### Deep link doesn't redirect back
On **macOS**: Deep links work automatically in development
On **Windows**: You need to build and install the app first for protocol registration
On **Linux**: Requires protocol handler setup

### Port conflicts
The desktop app now runs on port **5199** by default. If you see port conflicts:
```bash
# Kill any processes using the port
lsof -ti:5199 | xargs kill -9

# Or change the port in package.json
"dev:renderer": "vite --port 5200",
"dev:electron": "wait-on http://localhost:5200 && cross-env NODE_ENV=development VITE_DEV_PORT=5200 electron ."
```

## Development Mode Limitations

In development, the deep link protocol (`ainexus://`) may not work perfectly on all platforms:

- **macOS**: Should work with `app.setAsDefaultProtocolClient()`
- **Windows/Linux**: May require building and installing the app

For testing without deep links, you can manually copy the token from the browser URL and test the auth flow.
