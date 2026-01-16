import { ipcMain } from 'electron';
import { ConnectionManager } from './data/connection-manager';
import { AIRouter } from './ai/ai-router';
import { LicenseManager } from './license/license-manager';
import { SettingsManager } from './data/settings-manager';
import { app, shell } from 'electron';

const connectionManager = new ConnectionManager();
const aiRouter = new AIRouter();
const licenseManager = new LicenseManager();
const settingsManager = new SettingsManager();

// Connection handlers
ipcMain.handle('connection:test', async (_event, config) => {
  return await connectionManager.testConnection(config);
});

ipcMain.handle('connection:connect', async (_event, config) => {
  return await connectionManager.connect(config);
});

ipcMain.handle('connection:disconnect', async (_event, id) => {
  return await connectionManager.disconnect(id);
});

ipcMain.handle('connection:list', async () => {
  return await connectionManager.listConnections();
});

// AI handlers
ipcMain.handle('ai:query', async (_event, prompt, options) => {
  return await aiRouter.query(prompt, options);
});

ipcMain.handle('ai:get-models', async () => {
  return await aiRouter.getAvailableModels();
});

ipcMain.handle('ai:get-cost', async () => {
  return await aiRouter.getTotalCost();
});

// License handlers
ipcMain.handle('license:validate', async (_event, key) => {
  return await licenseManager.validate(key);
});

ipcMain.handle('license:get', async () => {
  return await licenseManager.getLicense();
});

ipcMain.handle('license:refresh', async () => {
  return await licenseManager.refreshValidation();
});

// Settings handlers
ipcMain.handle('settings:get', async (_event, key) => {
  return await settingsManager.get(key);
});

ipcMain.handle('settings:set', async (_event, key, value) => {
  return await settingsManager.set(key, value);
});

ipcMain.handle('settings:get-all', async () => {
  return await settingsManager.getAll();
});

// System handlers
ipcMain.handle('system:get-version', () => {
  return app.getVersion();
});

ipcMain.handle('system:check-updates', async () => {
  // Auto-updater logic will go here
  return { available: false };
});

ipcMain.handle('system:open-external', async (_event, url) => {
  await shell.openExternal(url);
  return true;
});
