'use client';

import { useState } from 'react';
import { 
  Key, Shield, CheckCircle, XCircle, AlertCircle, 
  Loader2, Copy, ExternalLink, Sparkles, Crown
} from 'lucide-react';
import { useLicense } from '../context/LicenseContext';

export default function LicenseActivationPage() {
  const { 
    license, 
    isLoading, 
    isValid,
    isPro,
    daysRemaining,
    activateLicense, 
    deactivateLicense 
  } = useLicense();
  
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter a license key');
      return;
    }

    setError(null);
    setSuccess(false);
    setIsActivating(true);

    const result = await activateLicense(licenseKey.trim());
    
    setIsActivating(false);
    
    if (result.success) {
      setSuccess(true);
      setLicenseKey('');
    } else {
      setError(result.error || 'Activation failed');
    }
  };

  const handleDeactivate = async () => {
    if (confirm('Are you sure you want to deactivate your license? You can reactivate it later.')) {
      await deactivateLicense();
    }
  };

  const copyLicenseKey = () => {
    if (license?.key) {
      navigator.clipboard.writeText(license.key);
    }
  };

  const getTierBadge = () => {
    const tier = license?.tier || 'free';
    const badges: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      free: { color: 'bg-gray-100 text-gray-700', icon: null, label: 'Free' },
      starter: { color: 'bg-blue-100 text-blue-700', icon: <Sparkles className="w-3 h-3" />, label: 'Starter' },
      pro: { color: 'bg-purple-100 text-purple-700', icon: <Sparkles className="w-3 h-3" />, label: 'Pro' },
      enterprise: { color: 'bg-amber-100 text-amber-700', icon: <Crown className="w-3 h-3" />, label: 'Enterprise' },
    };
    return badges[tier] || badges.free;
  };

  const badge = getTierBadge();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-black dark:text-white flex items-center gap-2">
          <Key className="w-6 h-6 text-blue-500" />
          License Management
        </h1>
        <p className="text-gray-500 mt-1">Manage your AI Nexus license</p>
      </div>

      {/* Current License Status */}
      {isValid && license && (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-black dark:text-white">License Active</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${badge.color}`}>
                  {badge.icon}
                  {badge.label}
                </span>
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="w-24 text-gray-500">License Key:</span>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-xs">
                    {license.key.slice(0, 8)}...{license.key.slice(-4)}
                  </code>
                  <button 
                    onClick={copyLicenseKey}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                
                {daysRemaining !== null && (
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-gray-500">Expires:</span>
                    <span className={daysRemaining < 7 ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}>
                      {daysRemaining} days remaining
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <span className="w-24 text-gray-500">Machines:</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {license.activeMachines} / {license.maxMachines === -1 ? '∞' : license.maxMachines}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleDeactivate}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Deactivate
            </button>
          </div>

          {/* Features */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-black dark:text-white mb-3">Included Features</h3>
            <div className="grid grid-cols-2 gap-2">
              {license.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activation Form */}
      {!isValid && (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-500" />
            <h2 className="font-medium text-black dark:text-white">Activate License</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              License activated successfully!
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                License Key
              </label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleActivate}
              disabled={isActivating || !licenseKey.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isActivating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Activate License
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have a license?{' '}
              <button 
                onClick={() => window.electron?.system.openExternal('https://domain.com/pricing')}
                className="text-blue-500 hover:underline inline-flex items-center gap-1"
              >
                Purchase one
                <ExternalLink className="w-3 h-3" />
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Trial Info */}
      {!isValid && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-700 dark:text-amber-400">Free Trial Available</h3>
              <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                You can use AI Nexus with limited features without a license. 
                Upgrade to Pro for unlimited AI providers, MCP integration, and more.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Options for Free/Starter */}
      {isValid && !isPro && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="font-medium text-black dark:text-white">Upgrade to Pro</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Unlock all AI providers, database integrations, and advanced features.
          </p>
          <button 
            onClick={() => window.electron?.system.openExternal('https://domain.com/pricing')}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
          >
            View Pricing
          </button>
        </div>
      )}
    </div>
  );
}
