import { License, LicenseValidationResult } from '@shared/types';
import axios from 'axios';

const CLOUD_API_URL = process.env.CLOUD_API_URL || 'http://localhost:3001';

export class LicenseManager {
  private cachedLicense: License | null = null;
  private lastValidation: Date | null = null;

  async validate(licenseKey: string): Promise<LicenseValidationResult> {
    try {
      const response = await axios.post(`${CLOUD_API_URL}/api/licenses/validate`, {
        license_key: licenseKey,
      });

      if (response.data.valid) {
        this.cachedLicense = response.data.license;
        this.lastValidation = new Date();

        // Store license key in settings
        // TODO: Implement secure storage

        return { valid: true, license: response.data.license };
      }

      return { valid: false, error: response.data.error };
    } catch (error: any) {
      return {
        valid: false,
        error: error.response?.data?.error || 'Validation failed',
      };
    }
  }

  async getLicense(): Promise<License | null> {
    return this.cachedLicense;
  }

  async refreshValidation(): Promise<LicenseValidationResult> {
    // Check if we need to revalidate (every 7 days)
    if (this.lastValidation) {
      const daysSinceValidation =
        (Date.now() - this.lastValidation.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceValidation < 7) {
        return { valid: true, license: this.cachedLicense! };
      }
    }

    // Revalidate
    if (this.cachedLicense) {
      return await this.validate(this.cachedLicense.licenseKey);
    }

    return { valid: false, error: 'No license found' };
  }
}
