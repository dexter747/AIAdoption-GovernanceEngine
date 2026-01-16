import path from 'path';
import { app } from 'electron';
import Store from 'electron-store';

export class SettingsManager {
  private store: Store;

  constructor() {
    this.store = new Store({
      name: 'settings',
      encryptionKey: 'your-encryption-key', // Should be generated per-user
    });
  }

  async get(key: string): Promise<any> {
    return this.store.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    this.store.set(key, value);
  }

  async getAll(): Promise<Record<string, any>> {
    return this.store.store;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  close() {
    // electron-store doesn't need explicit closing
  }
}
