import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface License {
  id: string;
  key: string;
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'expired' | 'suspended' | 'invalid';
  expiresAt: string | null;
  features: string[];
  maxMachines: number;
  activeMachines: number;
}

interface LicenseContextType {
  license: License | null;
  isLoading: boolean;
  isValid: boolean;
  isPro: boolean;
  isEnterprise: boolean;
  isTrial: boolean;
  daysRemaining: number | null;
  activateLicense: (key: string) => Promise<{ success: boolean; error?: string }>;
  deactivateLicense: () => Promise<void>;
  refreshLicense: () => Promise<void>;
  hasFeature: (feature: string) => boolean;
}

const LicenseContext = createContext<LicenseContextType | null>(null);

const TIER_FEATURES: Record<string, string[]> = {
  free: ['basic_chat'],
  starter: ['basic_chat', 'history', 'export'],
  pro: ['basic_chat', 'history', 'export', 'custom_prompts', 'mcp_integration'],
  enterprise: ['basic_chat', 'history', 'export', 'custom_prompts', 'mcp_integration', 'sso', 'audit_log', 'priority_support'],
};

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [license, setLicense] = useState<License | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredLicense();
  }, []);

  const loadStoredLicense = async () => {
    try {
      const storedLicense = await window.electron?.license.get();
      if (storedLicense) {
        // Validate on startup
        const result = await window.electron?.license.validate(storedLicense.key);
        if (result?.valid) {
          const tier = result.tier || 'free';
          setLicense({
            id: storedLicense.id || crypto.randomUUID(),
            key: storedLicense.key,
            tier,
            status: 'active',
            expiresAt: result.expiresAt || null,
            features: result.features || TIER_FEATURES[tier] || [],
            maxMachines: result.maxMachines || 1,
            activeMachines: result.activeMachines || 1,
          });
        } else {
          // License invalid, clear it
          setLicense(null);
        }
      }
    } catch (error) {
      console.error('Failed to load license:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activateLicense = async (key: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const result = await window.electron?.license.validate(key);
      
      if (!result) {
        return { success: false, error: 'Failed to connect to license server' };
      }

      if (result.valid) {
        const tier = result.tier || 'pro';
        const newLicense: License = {
          id: crypto.randomUUID(),
          key,
          tier,
          status: 'active',
          expiresAt: result.expiresAt || null,
          features: result.features || TIER_FEATURES[tier] || [],
          maxMachines: result.maxMachines || 1,
          activeMachines: result.activeMachines || 1,
        };
        
        setLicense(newLicense);
        
        // Store license locally
        await window.electron?.settings.set('license', { 
          key, 
          id: newLicense.id,
          activatedAt: new Date().toISOString() 
        });
        
        return { success: true };
      } else {
        return { success: false, error: result.reason || result.error || 'Invalid license key' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Activation failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateLicense = async () => {
    try {
      await window.electron?.settings.set('license', null);
      setLicense(null);
    } catch (error) {
      console.error('Failed to deactivate license:', error);
    }
  };

  const refreshLicense = async () => {
    if (!license?.key) return;
    
    setIsLoading(true);
    try {
      // Re-validate the current license key
      const result = await window.electron?.license.validate(license.key);
      if (result?.valid) {
        const tier = result.tier || license.tier;
        setLicense(prev => prev ? {
          ...prev,
          tier,
          status: 'active',
          expiresAt: result.expiresAt || prev.expiresAt,
          features: result.features || TIER_FEATURES[tier] || prev.features,
        } : null);
      } else {
        setLicense(prev => prev ? { ...prev, status: 'expired' } : null);
      }
    } catch (error) {
      console.error('Failed to refresh license:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasFeature = (feature: string): boolean => {
    if (!license) return TIER_FEATURES.free.includes(feature);
    return license.features.includes(feature);
  };

  const daysRemaining = license?.expiresAt 
    ? Math.max(0, Math.ceil((new Date(license.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const isValid = license?.status === 'active';
  const isPro = license?.tier === 'pro' || license?.tier === 'enterprise';
  const isEnterprise = license?.tier === 'enterprise';
  const isTrial = license?.tier === 'free';

  return (
    <LicenseContext.Provider value={{
      license,
      isLoading,
      isValid,
      isPro,
      isEnterprise,
      isTrial,
      daysRemaining,
      activateLicense,
      deactivateLicense,
      refreshLicense,
      hasFeature,
    }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
}
