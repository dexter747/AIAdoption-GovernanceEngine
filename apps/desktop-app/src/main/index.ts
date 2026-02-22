import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import http from 'http';
import { expressClient } from './api/express-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Hardware / power optimisations ────────────────────────────────────────
// Must be called BEFORE app.whenReady() / before the GPU process starts.
//
// These flags make the app run well on old laptops with mediocre GPUs:
//   • No shader-disk-cache → avoids stalls on slow HDDs at first launch
//   • In-process GPU      → eliminates one extra OS process on machines with
//     ≤ 4 GB RAM (the GPU sandbox process costs ~60 MB).
//   • Disable GPU memory buffer → safer on machines with < 512 MB VRAM
//   • No vsync enforcement → lets Chromium decide its own paint cadence
//     (Chromium is already smart about this; forcing 60 fps on 30 Hz panels wastes power)
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=256'); // cap V8 heap
// Chromium can still use hardware acceleration; we just remove fragile features:
app.commandLine.appendSwitch(
  'disable-features',
  'VizDisplayCompositor,UseSkiaRenderer,ThrottleDisplayNoneAndVisibilityHiddenCrossOriginIframes'
);
// ─────────────────────────────────────────────────────────────────────────

// Safe logger to prevent EPIPE errors when stdout is closed
const safeLog = (...args: any[]) => {
  try {
    console.log(...args);
  } catch (e) {
    // Ignore EPIPE errors during hot reload or when renderer disconnects
  }
};

const store = new Store({
  name: 'auth',
  encryptionKey: 'velanova-secure-key-2024',
});

let mainWindow: BrowserWindow | null = null;

interface AuthData {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
  };
  expiresAt: number;
}

function getStoredAuth(): AuthData | null {
  const authData = store.get('authData') as AuthData | undefined;
  if (!authData) {
    expressClient.setAuthToken('');
    return null;
  }
  if (authData.expiresAt && Date.now() > authData.expiresAt) {
    store.delete('authData');
    expressClient.setAuthToken('');
    return null;
  }
  // Sync auth token with expressClient
  if (authData.accessToken) {
    expressClient.setAuthToken(authData.accessToken);
  }
  return authData;
}

function createWindow() {
  console.log('[createWindow] Creating BrowserWindow...');
  const iconFile = process.platform === 'darwin' ? 'icon.icns' : 'icon.png';
  const iconPath = path.join(app.getAppPath(), 'build', iconFile);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    icon: iconPath,
    // Fill with app bg colour immediately — eliminates the white flash on slow machines
    backgroundColor: '#080808',
    webPreferences: {
      preload: path.join(__dirname, '../../dist/main/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      // Keep JS timers running even when window loses focus — essential for
      // in-flight AI requests, MCP heartbeats, and token-refresh loops.
      backgroundThrottling: false,
      // Reduce idle GPU usage — our UI has no WebGL / heavy canvas work
      offscreen: false,
    },
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 15, y: 15 },
    show: false,
  });
  console.log('[createWindow] BrowserWindow created');

  mainWindow.once('ready-to-show', () => {
    console.log('[createWindow] Window ready to show');
    mainWindow?.show();
  });

  if (process.env.NODE_ENV === 'development') {
    const devPort = process.env.VITE_DEV_PORT || '5199';
    console.log('[createWindow] Loading dev URL:', `http://localhost:${devPort}`);
    mainWindow.loadURL(`http://localhost:${devPort}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    console.log('[createWindow] Window closed');
    mainWindow = null;
  });
}

// Local HTTP server for OAuth callbacks (fallback to deep links)
const AUTH_CALLBACK_PORT = 42069;
let callbackServer: http.Server | null = null;

function startCallbackServer() {
  if (callbackServer) return;

  callbackServer = http.createServer((req, res) => {
    safeLog('📡 HTTP callback received:', req.url);

    if (req.url?.startsWith('/auth/callback')) {
      const url = new URL(req.url, `http://localhost:${AUTH_CALLBACK_PORT}`);
      const token = url.searchParams.get('token');
      const refreshToken = url.searchParams.get('refresh');
      const userParam = url.searchParams.get('user');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>Authentication Successful</title></head>
          <body style="font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center;">
              <h1 style="color: #10b981;">✓ Authentication Successful!</h1>
              <p>You can close this window and return to the desktop app.</p>
            </div>
          </body>
        </html>
      `);

      // Handle the auth data
      if (token) {
        try {
          // Decode JWT to get user info and expiry
          let user: { id: string; email: string; name: string; image?: string } = {
            id: '',
            email: '',
            name: '',
          };
          let expiresAt = Date.now() + 60 * 60 * 1000; // Default 1 hour

          // Decode JWT payload
          const parts = token.split('.');
          if (parts.length === 3) {
            const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
            user = {
              id: payload.sub || payload.email,
              email: payload.email,
              name: payload.name || payload.email?.split('@')[0],
              image: payload.image,
            };
            if (payload.exp) {
              expiresAt = payload.exp * 1000;
            }
          }

          // Override with user param if provided
          if (userParam) {
            try {
              user = JSON.parse(decodeURIComponent(userParam));
            } catch {}
          }

          safeLog('✅ HTTP callback auth data parsed:', { email: user.email });

          const authData: AuthData = {
            accessToken: token,
            refreshToken: refreshToken || undefined,
            user,
            expiresAt,
          };

          store.set('authData', authData);
          expressClient.setAuthToken(authData.accessToken);
          safeLog('💾 Auth data saved to store via HTTP callback');

          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('auth:success', authData);
            safeLog('📨 Auth success event sent to renderer via HTTP callback');

            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
            mainWindow.show();
          }
        } catch (e) {
          console.error('❌ Failed to parse HTTP callback auth data:', e);
        }
      }
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  callbackServer.listen(AUTH_CALLBACK_PORT, 'localhost', () => {
    safeLog(`🌐 OAuth callback server listening on http://localhost:${AUTH_CALLBACK_PORT}`);
  });

  callbackServer.on('error', err => {
    console.error('❌ Callback server error:', err);
  });
}

function stopCallbackServer() {
  if (callbackServer) {
    callbackServer.close();
    callbackServer = null;
    console.log('🛑 OAuth callback server stopped');
  }
}

const PROTOCOL = 'velanova';

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    const url = commandLine.find(arg => arg.startsWith(`${PROTOCOL}://`));
    if (url) handleDeepLink(url);
  });

  // Handle initial launch with deep link on Windows
  if (process.platform === 'win32') {
    const deepLinkArg = process.argv.find(arg => arg.startsWith(`${PROTOCOL}://`));
    if (deepLinkArg) {
      app.whenReady().then(() => {
        setTimeout(() => handleDeepLink(deepLinkArg), 500);
      });
    }
  }
}

function handleDeepLink(url: string) {
  console.log('🔗 Deep link received:', url);

  try {
    const parsedUrl = new URL(url);
    console.log('📍 Parsed URL pathname:', parsedUrl.pathname);

    if (parsedUrl.pathname === '/auth/callback' || parsedUrl.pathname === '//auth/callback') {
      const token = parsedUrl.searchParams.get('token');
      const refreshToken = parsedUrl.searchParams.get('refresh');
      const userJson = parsedUrl.searchParams.get('user');

      console.log('🔑 Token exists:', !!token);

      if (token) {
        try {
          // Decode JWT to get user info and expiry
          let user: { id: string; email: string; name: string; image?: string } = {
            id: '',
            email: '',
            name: '',
          };
          let expiresAt = Date.now() + 60 * 60 * 1000; // Default 1 hour

          // Decode JWT payload
          const parts = token.split('.');
          if (parts.length === 3) {
            const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
            user = {
              id: payload.sub || payload.email,
              email: payload.email,
              name: payload.name || payload.email?.split('@')[0],
              image: payload.image,
            };
            if (payload.exp) {
              expiresAt = payload.exp * 1000;
            }
          }

          // Override with user param if provided
          if (userJson) {
            try {
              user = JSON.parse(decodeURIComponent(userJson));
            } catch {}
          }

          console.log('✅ User parsed successfully:', user.email);

          const authData: AuthData = {
            accessToken: token,
            refreshToken: refreshToken || undefined,
            user,
            expiresAt,
          };

          store.set('authData', authData);
          expressClient.setAuthToken(authData.accessToken);
          console.log('💾 Auth data saved to store');

          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('auth:success', authData);
            console.log('📨 Auth success event sent to renderer');

            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
            mainWindow.show();
          } else {
            console.warn('⚠️ Main window not available');
          }
        } catch (e) {
          console.error('❌ Failed to parse auth data:', e);
          mainWindow?.webContents.send('auth:error', 'Invalid auth data');
        }
      }
    }
  } catch (e) {
    console.error('Failed to handle deep link:', e);
  }
}

app.whenReady().then(() => {
  console.log('[main] app.whenReady() triggered');

  // Set dock icon on macOS (required in dev mode — packaged builds use the .icns in the bundle)
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(path.join(app.getAppPath(), 'build', 'icon.png'));
  }

  // Initialize express client with stored auth token on startup
  const storedAuth = getStoredAuth();
  if (storedAuth?.accessToken) {
    console.log('🔐 Initializing express client with stored auth token');
    expressClient.setAuthToken(storedAuth.accessToken);
  }

  console.log('[main] Creating window...');
  createWindow();
  console.log('[main] Window created, starting callback server...');
  startCallbackServer(); // Start HTTP callback server
  console.log('[main] Callback server started');
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  console.log('[main] All windows closed');
  stopCallbackServer(); // Stop HTTP callback server
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('auth:check', async () => getStoredAuth());

ipcMain.handle('auth:login', async () => {
  // Use environment variable or fallback to localhost for development
  const baseUrl = process.env.LANDING_SITE_URL || 'http://localhost:3000';
  const loginUrl = `${baseUrl}/login?desktop=true`;
  await shell.openExternal(loginUrl);
  return { opened: true };
});

ipcMain.handle('auth:logout', async () => {
  store.delete('authData');
  expressClient.setAuthToken('');
  return { success: true };
});

ipcMain.handle('auth:getUser', async () => {
  const authData = getStoredAuth();
  return authData?.user || null;
});

ipcMain.handle('auth:refresh', async () => {
  const authData = getStoredAuth();
  if (!authData?.refreshToken) {
    return { success: false, error: 'No refresh token' };
  }

  try {
    const baseUrl = process.env.LANDING_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: authData.refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();

    const newAuthData: AuthData = {
      accessToken: data.token,
      refreshToken: data.refreshToken,
      user: data.user,
      expiresAt: data.expiresAt,
    };

    store.set('authData', newAuthData);
    expressClient.setAuthToken(newAuthData.accessToken);

    return { success: true, authData: newAuthData };
  } catch (error: any) {
    console.error('Token refresh failed:', error);
    return { success: false, error: error.message };
  }
});

import './ipc-handlers';
