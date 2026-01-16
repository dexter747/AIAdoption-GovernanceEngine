import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store({
  name: 'auth',
  encryptionKey: 'ai-nexus-secure-key-2024',
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
  if (!authData) return null;
  if (authData.expiresAt && Date.now() > authData.expiresAt) {
    store.delete('authData');
    return null;
  }
  return authData;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 15, y: 15 },
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (process.env.NODE_ENV === 'development') {
    const devPort = process.env.VITE_DEV_PORT || '5173';
    mainWindow.loadURL(`http://localhost:${devPort}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const PROTOCOL = 'ainexus';

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
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.pathname === '/auth/callback' || parsedUrl.pathname === '//auth/callback') {
      const token = parsedUrl.searchParams.get('token');
      const userJson = parsedUrl.searchParams.get('user');
      
      if (token && userJson) {
        try {
          const user = JSON.parse(decodeURIComponent(userJson));
          const authData: AuthData = {
            accessToken: token,
            user,
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
          };
          store.set('authData', authData);
          mainWindow?.webContents.send('auth:success', authData);
        } catch (e) {
          console.error('Failed to parse auth data:', e);
          mainWindow?.webContents.send('auth:error', 'Invalid auth data');
        }
      }
    }
  } catch (e) {
    console.error('Failed to handle deep link:', e);
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('auth:check', async () => getStoredAuth());

ipcMain.handle('auth:login', async () => {
  // Use environment variable or fallback to localhost for development
  const baseUrl = process.env.LANDING_SITE_URL || 'http://localhost:3000';
  const loginUrl = `${baseUrl}/login?desktop=true&callback=ainexus://auth/callback`;
  await shell.openExternal(loginUrl);
  return { opened: true };
});

ipcMain.handle('auth:logout', async () => {
  store.delete('authData');
  return { success: true };
});

ipcMain.handle('auth:getUser', async () => {
  const authData = getStoredAuth();
  return authData?.user || null;
});

import './ipc-handlers';
