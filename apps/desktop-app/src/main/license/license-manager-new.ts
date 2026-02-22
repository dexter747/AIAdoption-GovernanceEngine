import { app } from 'electron';
import * as keytar from 'keytar';
import crypto from 'crypto';
import axios from 'axios';

const SERVICE_NAME = 'velanova-desktop';
const ACCOUNT_NAME = 'license-key';
const API_URL = process.env.API_URL || 'http://localhost:5500';

export interface License {
  key: string;
  userId: string;
  planType: 'starter' | 'professional' | 'enterprise' | 'custom';
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  issuedAt: string;
  expiresAt: string;
  features: {
    maxAIProviders: number;
    maxDatabases: number;
    maxUsers: number;
    maxTokensPerMonth: number;
    maxQueriesPerDay: number;
  };
  deviceId?: string;
  validated: boolean;
  lastValidatedAt?: string;
}

export interface LicenseValidationResponse {
  valid: boolean;
  license?: License;
  error?: string;
}

class LicenseManager {
  private license: License | null = null;
  private deviceId: string;

  constructor() {
    this.deviceId = this.getDeviceId();
  }

  /**
   * Get unique device ID
   */
  private getDeviceId(): string {
    const machineId = app.getName() + '-' + require('os').hostname();
    return crypto.createHash('sha256').update(machineId).digest('hex');
  }

  /**
   * Store license securely in system keychain
   */
  async storeLicense(licenseKey: string): Promise<void> {
    try {
      await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, licenseKey);
    } catch (error) {
      console.error('Failed to store license:', error);
      // Fallback: store in user data (less secure)
      const fs = require('fs');
      const path = require('path');
      const userDataPath = app.getPath('userData');
      const licensePath = path.join(userDataPath, '.license');
      fs.writeFileSync(licensePath, licenseKey, { encoding: 'utf8' });
    }
  }

  /**
   * Retrieve license from system keychain
   */
  async retrieveLicense(): Promise<string | null> {
    try {
      return await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
    } catch (error) {
      console.error('Failed to retrieve license:', error);
      // Fallback: read from user data
      try {
        const fs = require('fs');
        const path = require('path');
        const userDataPath = app.getPath('userData');
        const licensePath = path.join(userDataPath, '.license');
        if (fs.existsSync(licensePath)) {
          return fs.readFileSync(licensePath, 'utf8');
        }
      } catch (fallbackError) {
        console.error('Fallback license retrieval failed:', fallbackError);
      }
      return null;
    }
  }

  /**
   * Delete stored license
   */
  async deleteLicense(): Promise<void> {
    try {
      await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
    } catch (error) {
      console.error('Failed to delete license:', error);
    }

    // Also delete fallback
    try {
      const fs = require('fs');
      const path = require('path');
      const userDataPath = app.getPath('userData');
      const licensePath = path.join(userDataPath, '.license');
      if (fs.existsSync(licensePath)) {
        fs.unlinkSync(licensePath);
      }
    } catch (error) {
      console.error('Failed to delete fallback license:', error);
    }
  }

  /**
   * Validate license with backend API
   */
  async validateLicense(licenseKey: string): Promise<LicenseValidationResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/api/licenses/validate`,
        {
          licenseKey,
          deviceId: this.deviceId,
          appVersion: app.getVersion(),
          platform: process.platform,
        },
        {
          timeout: 10000,
        }
      );

      if (response.data.valid) {
        this.license = {
          ...response.data.license,
          validated: true,
          lastValidatedAt: new Date().toISOString(),
        };
        await this.storeLicense(licenseKey);
        return { valid: true, license: this.license ?? undefined };
      }

      return { valid: false, error: response.data.error || 'Invalid license' };
    } catch (error: any) {
      console.error('License validation error:', error.message);
      return { valid: false, error: 'Failed to validate license. Please check your connection.' };
    }
  }

  /**
   * Activate license (first time setup)
   */
  async activateLicense(licenseKey: string): Promise<LicenseValidationResponse> {
    const validation = await this.validateLicense(licenseKey);

    if (validation.valid && validation.license) {
      this.license = validation.license;
      await this.storeLicense(licenseKey);
    }

    return validation;
  }

  /**
   * Load and validate stored license on app start
   */
  async loadLicense(): Promise<boolean> {
    const licenseKey = await this.retrieveLicense();

    if (!licenseKey) {
      return false;
    }

    // Try online validation
    const validation = await this.validateLicense(licenseKey);

    if (validation.valid) {
      return true;
    }

    // If online validation fails, try offline validation
    return this.offlineValidation(licenseKey);
  }

  /**
   * Offline license validation (grace period)
   */
  private offlineValidation(licenseKey: string): boolean {
    try {
      // Decode license (assuming JWT format)
      const parts = licenseKey.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));

      // Check expiration
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return false;
      }

      // Grace period: allow 7 days of offline use
      if (this.license?.lastValidatedAt) {
        const daysSinceValidation =
          (Date.now() - new Date(this.license.lastValidatedAt).getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceValidation > 7) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Offline validation error:', error);
      return false;
    }
  }

  /**
   * Get current license
   */
  getLicense(): License | null {
    return this.license;
  }

  /**
   * Check if license is valid and active
   */
  isLicenseValid(): boolean {
    if (!this.license) return false;
    if (this.license.status !== 'active') return false;

    const expiresAt = new Date(this.license.expiresAt);
    if (expiresAt < new Date()) return false;

    return true;
  }

  /**
   * Check if feature is available in current plan
   */
  hasFeature(feature: string): boolean {
    if (!this.license) return false;
    // Implement feature flag checking based on plan
    return true;
  }

  /**
   * Get usage limits for current plan
   */
  getLimits() {
    return (
      this.license?.features || {
        maxAIProviders: 0,
        maxDatabases: 0,
        maxUsers: 0,
        maxTokensPerMonth: 0,
        maxQueriesPerDay: 0,
      }
    );
  }

  /**
   * Deactivate license
   */
  async deactivateLicense(): Promise<void> {
    if (!this.license) return;

    try {
      await axios.post(`${API_URL}/api/licenses/deactivate`, {
        licenseKey: await this.retrieveLicense(),
        deviceId: this.deviceId,
      });
    } catch (error) {
      console.error('Failed to deactivate license:', error);
    }

    await this.deleteLicense();
    this.license = null;
  }

  /**
   * Refresh license from server
   */
  async refreshLicense(): Promise<boolean> {
    const licenseKey = await this.retrieveLicense();
    if (!licenseKey) return false;

    const validation = await this.validateLicense(licenseKey);
    return validation.valid;
  }

  /**
   * Get trial info
   */
  getTrialInfo() {
    if (!this.license) return null;

    const daysRemaining = Math.ceil(
      (new Date(this.license.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return {
      isTrialPeriod: this.license.planType === 'starter' && daysRemaining <= 14,
      daysRemaining: Math.max(0, daysRemaining),
      expiresAt: this.license.expiresAt,
    };
  }
}

export const licenseManager = new LicenseManager();
