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
 free: { color: 'bg-secondary text-muted-foreground', icon: null, label: 'Free' },
 starter: { color: 'bg-blue-500/10 text-blue-400', icon: <Sparkles className="w-3 h-3" />, label: 'Starter' },
 pro: { color: 'bg-purple-500/10 text-purple-400', icon: <Sparkles className="w-3 h-3" />, label: 'Pro' },
 enterprise: { color: 'bg-amber-500/10 text-amber-400', icon: <Crown className="w-3 h-3" />, label: 'Enterprise' },
 };
 return badges[tier] || badges.free;
 };

 const badge = getTierBadge();

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-black">
 <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
 </div>
 );
 }

 return (
 <div className="p-8 max-w-2xl mx-auto">
 <div className="mb-8">
 <h1 className="font-medium flex items-center gap-2 text-white">
 <Key className="w-6 h-6 text-blue-500" />
 License Management
 </h1>
 <p className="text-muted-foreground mt-1">Manage your Velanova license</p>
 </div>

 {/* Current License Status */}
 {isValid && license && (
 <div className="rounded-xl p-6 mb-8 bg-gray-900 border-gray-800">
 <div className="flex items-start justify-between">
 <div>
 <div className="flex items-center gap-2 mb-2">
 <CheckCircle className="w-5 h-5 text-green-500" />
 <span className="font-medium text-white">License Active</span>
 <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${badge.color}`}>
 {badge.icon}
 {badge.label}
 </span>
 </div>
 
 <div className="mt-4 space-y-2 text-sm">
 <div className="flex items-center gap-2 text-muted-foreground">
 <span className="w-24 text-muted-foreground">License Key:</span>
 <code className="px-2 py-1 rounded font-mono text-xs bg-gray-800">
 {license.key.slice(0, 8)}...{license.key.slice(-4)}
 </code>
 <button 
 onClick={copyLicenseKey}
 className="p-1 rounded hover:bg-gray-700"
 >
 <Copy className="w-4 h-4" />
 </button>
 </div>
 
 {daysRemaining !== null && (
 <div className="flex items-center gap-2">
 <span className="w-24 text-muted-foreground">Expires:</span>
 <span className={daysRemaining < 7 ? 'text-red-500' : 'text-muted-foreground'}>
 {daysRemaining} days remaining
 </span>
 </div>
 )}
 
 <div className="flex items-center gap-2">
 <span className="w-24 text-muted-foreground">Machines:</span>
 <span className="text-muted-foreground">
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
 <div className="mt-6 pt-4 border-t border-gray-700">
 <h3 className="font-medium mb-3 text-white">Included Features</h3>
 <div className="grid grid-cols-2 gap-2">
 {license.features.map((feature) => (
 <div key={feature} className="flex items-center gap-2 text-muted-foreground">
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
 <div className="rounded-xl p-6 mb-8 bg-gray-900 border-gray-800">
 <div className="flex items-center gap-2 mb-4">
 <Shield className="w-5 h-5 text-blue-500" />
 <h2 className="font-medium text-white">Activate License</h2>
 </div>

 {error && (
 <div className="mb-4 p-3 border rounded-lg flex items-center gap-2 bg-red-900/20 border-red-800 text-red-400">
 <XCircle className="w-4 h-4" />
 {error}
 </div>
 )}

 {success && (
 <div className="mb-4 p-3 rounded-lg flex items-center gap-2 bg-green-900/20 border-green-800 text-green-400">
 <CheckCircle className="w-4 h-4" />
 License activated successfully!
 </div>
 )}

 <div className="space-y-4">
 <div>
 <label className="block font-medium mb-1 text-gray-300">
 License Key
 </label>
 <input
 type="text"
 value={licenseKey}
 onChange={(e) => setLicenseKey(e.target.value)}
 placeholder="XXXX-XXXX-XXXX-XXXX"
 className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-700 bg-gray-800 text-white"
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
 <p className="text-sm text-muted-foreground">
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
 <div className="rounded-xl p-4 bg-amber-900/20 border-amber-800">
 <div className="flex items-start gap-3">
 <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
 <div>
 <h3 className="font-medium text-amber-400">Free Trial Available</h3>
 <p className="mt-1 text-amber-500">
 You can use Velanova with limited features without a license. 
 Upgrade to Pro for unlimited AI providers, MCP integration, and more.
 </p>
 </div>
 </div>
 </div>
 )}

 {/* Upgrade Options for Free/Starter */}
 {isValid && !isPro && (
 <div className="bg-gradient-to-r rounded-xl p-6 from-purple-900/20 to-blue-900/20 border-purple-800">
 <div className="flex items-center gap-2 mb-2">
 <Sparkles className="w-5 h-5 text-purple-500" />
 <h3 className="font-medium text-white">Upgrade to Pro</h3>
 </div>
 <p className="mb-4 text-muted-foreground">
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
