import { autoUpdater } from 'electron-updater';
import { BrowserWindow, dialog, app } from 'electron';

// Simple logger compatible with electron-updater
const log = {
  info: (...args: any[]) => console.log('[AutoUpdater]', ...args),
  error: (...args: any[]) => console.error('[AutoUpdater]', ...args),
  warn: (...args: any[]) => console.warn('[AutoUpdater]', ...args),
  debug: (...args: any[]) => console.debug('[AutoUpdater]', ...args),
};

// Configure logging
autoUpdater.logger = log as any;

export class AutoUpdaterManager {
  private mainWindow: BrowserWindow | null = null;
  private isChecking = false;

  constructor() {
    // Configure auto-updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    
    // Set update feed URL for production
    if (process.env.NODE_ENV === 'production') {
      autoUpdater.setFeedURL({
        provider: 'generic',
        url: 'https://releases.velanova.com',
        channel: 'latest',
      } as any);
    }

    this.setupEventHandlers();
  }

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  private setupEventHandlers() {
    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for update...');
      this.sendStatusToWindow('Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
      log.info('Update available:', info);
      this.sendStatusToWindow('Update available', info);
      
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: `A new version (${info.version}) is available. Would you like to download it now?`,
        buttons: ['Download', 'Later'],
        defaultId: 0,
        cancelId: 1,
      }).then(({ response }) => {
        if (response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
    });

    autoUpdater.on('update-not-available', (info) => {
      log.info('Update not available:', info);
      this.sendStatusToWindow('Up to date', info);
    });

    autoUpdater.on('error', (err) => {
      log.error('Error in auto-updater:', err);
      this.sendStatusToWindow('Update error', err.message);
    });

    autoUpdater.on('download-progress', (progress) => {
      log.info(`Download progress: ${progress.percent}%`);
      this.sendStatusToWindow('Downloading update', {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        total: progress.total,
        transferred: progress.transferred,
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded:', info);
      this.sendStatusToWindow('Update downloaded', info);
      
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'The update has been downloaded. Restart the application to apply the update.',
        buttons: ['Restart Now', 'Later'],
        defaultId: 0,
        cancelId: 1,
      }).then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });
  }

  private sendStatusToWindow(status: string, data?: any) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('update-status', { status, data });
    }
  }

  async checkForUpdates(): Promise<{ available: boolean; version?: string; error?: string }> {
    if (this.isChecking) {
      return { available: false, error: 'Already checking for updates' };
    }

    this.isChecking = true;

    try {
      const result = await autoUpdater.checkForUpdates();
      
      if (result && result.updateInfo) {
        const currentVersion = app.getVersion();
        const newVersion = result.updateInfo.version;
        
        if (this.compareVersions(newVersion, currentVersion) > 0) {
          return { available: true, version: newVersion };
        }
      }
      
      return { available: false };
    } catch (error: any) {
      log.error('Error checking for updates:', error);
      return { available: false, error: error.message };
    } finally {
      this.isChecking = false;
    }
  }

  async downloadUpdate(): Promise<boolean> {
    try {
      await autoUpdater.downloadUpdate();
      return true;
    } catch (error) {
      log.error('Error downloading update:', error);
      return false;
    }
  }

  installUpdate() {
    autoUpdater.quitAndInstall();
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    
    return 0;
  }
}

export const autoUpdaterManager = new AutoUpdaterManager();
