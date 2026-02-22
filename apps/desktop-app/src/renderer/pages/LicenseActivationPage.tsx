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
 starter: { color: 'bg-white/5 text-zinc-400', icon: <Sparkles className="w-3 h-3" />, label: 'Starter' },
 pro: { color: 'bg-white/5 text-zinc-400', icon: <Sparkles className="w-3 h-3" />, label: 'Pro' },
 enterprise: { color: 'bg-white/5 text-zinc-400', icon: <Crown className="w-3 h-3" />, label: 'Enterprise' },
 };
 return badges[tier] || badges.free;
 };

 const badge = getTierBadge();

 if (isLoading) {
 return (
   <div className="h-full flex items-center justify-center">
    <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
   </div>
  );
 }

 return (
  <div className="h-full flex flex-col overflow-hidden">
   {/* Toolbar */}
   <div className="toolbar app-region-drag">
    <Key className="w-3.5 h-3.5 text-white/30 app-region-no-drag" />
    <h1 className="ml-2 text-[13px] font-medium text-white/80 app-region-no-drag select-none">License</h1>
    {isValid && license && (
     <>
      <div className="w-px h-4 bg-white/[0.08] mx-3" />
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 app-region-no-drag capitalize ${
       license.tier === 'pro' || license.tier === 'enterprise'
        ? 'border-amber-500/30 text-amber-400/80 bg-amber-950/30'
        : 'border-white/10 text-white/30'
      }`}>
       {badge.icon}{badge.label}
      </span>
     </>
    )}
   </div>

   <div className="flex-1 overflow-auto p-6 bg-[#0b0b0b]">

     {/* Active license card */}
     {isValid && license && (
       <div className="max-w-lg mb-5">
         <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
           <div className="flex items-start justify-between mb-4">
             <div className="flex items-center gap-2">
               <CheckCircle className="w-4 h-4 text-emerald-500/70" />
               <span className="text-[13px] font-medium text-white/80">License Active</span>
             </div>
             <button onClick={handleDeactivate}
               className="text-[11px] text-white/25 hover:text-red-400/70 transition-colors">
               Deactivate
             </button>
           </div>
           <div className="space-y-2 text-[12px]">
             <div className="flex items-center gap-2">
               <span className="w-28 text-white/35">Key</span>
               <code className="font-mono text-white/60 text-[11px]">
                 {license.key.slice(0, 8)}...{license.key.slice(-4)}
               </code>
               <button onClick={copyLicenseKey}
                 className="p-0.5 rounded hover:bg-white/[0.06] transition-colors">
                 <Copy className="w-3 h-3 text-white/30" />
               </button>
             </div>
             {daysRemaining !== null && (
               <div className="flex items-center gap-2">
                 <span className="w-28 text-white/35">Expires</span>
                 <span className={daysRemaining < 7 ? 'text-amber-400/80' : 'text-white/50'}>
                   {daysRemaining} days remaining
                 </span>
               </div>
             )}
             <div className="flex items-center gap-2">
               <span className="w-28 text-white/35">Machines</span>
               <span className="text-white/50">
                 {license.activeMachines} / {license.maxMachines === -1 ? '∞' : license.maxMachines}
               </span>
             </div>
           </div>
           {license.features.length > 0 && (
             <div className="mt-4 pt-4 border-t border-white/[0.05]">
               <p className="text-[11px] font-medium text-white/30 uppercase tracking-wider mb-2">Included Features</p>
               <div className="grid grid-cols-2 gap-1.5">
                 {license.features.map(f => (
                   <div key={f} className="flex items-center gap-1.5 text-[11px] text-white/50">
                     <CheckCircle className="w-3 h-3 text-emerald-500/50 flex-shrink-0" />
                     {f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                   </div>
                 ))}
               </div>
             </div>
           )}
         </div>

         {/* Upgrade prompt for non-pro */}
         {!isPro && (
           <div className="mt-3 flex items-center gap-3 px-4 py-3 rounded-lg border border-white/[0.06] bg-white/[0.015]">
             <Sparkles className="w-4 h-4 text-white/25 flex-shrink-0" />
             <div className="flex-1">
               <p className="text-[12px] font-medium text-white/60">Upgrade to Pro</p>
               <p className="text-[10.5px] text-white/30">Unlock all AI providers, MCP, and advanced features.</p>
             </div>
             <button onClick={() => window.electron?.system.openExternal('https://velanova.ai/pricing')}
               className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/60 transition-colors flex-shrink-0">
               View plans <ExternalLink className="w-3 h-3" />
             </button>
           </div>
         )}
       </div>
     )}

     {/* No license — activation form */}
     {!isValid && (
       <div className="max-w-sm space-y-4">
         <div>
           <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5">License Key</label>
           {error && (
             <div className="mb-2 flex items-center gap-2 text-[11px] text-red-400/80 px-3 py-2 rounded-[5px] border border-red-500/20 bg-red-950/20">
               <XCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
             </div>
           )}
           {success && (
             <div className="mb-2 flex items-center gap-2 text-[11px] text-emerald-400/80 px-3 py-2 rounded-[5px] border border-emerald-500/20 bg-emerald-950/20">
               <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />License activated!
             </div>
           )}
           <input
             type="text"
             value={licenseKey}
             onChange={e => setLicenseKey(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && handleActivate()}
             placeholder="XXXX-XXXX-XXXX-XXXX"
             className="input-desktop w-full font-mono"
           />
         </div>
         <button
           onClick={handleActivate}
           disabled={isActivating || !licenseKey.trim()}
           className="h-7 px-4 rounded-[5px] text-[11px] font-medium bg-white/[0.08] text-white/70 hover:bg-white/[0.14] flex items-center gap-1.5 transition-all disabled:opacity-40"
         >
           {isActivating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Key className="w-3 h-3" />}
           {isActivating ? 'Activating…' : 'Activate License'}
         </button>

         <div className="pt-2 border-t border-white/[0.04]">
           <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-white/[0.06] bg-white/[0.015]">
             <AlertCircle className="w-3.5 h-3.5 text-white/25 mt-0.5 flex-shrink-0" />
             <div>
               <p className="text-[12px] font-medium text-white/50">Free plan active</p>
               <p className="text-[10.5px] text-white/30 mt-0.5">Use Velanova with limited features, or
                 <button onClick={() => window.electron?.system.openExternal('https://velanova.ai/pricing')}
                   className="ml-1 text-white/40 hover:text-white/60 underline underline-offset-2 transition-colors">purchase a license
                 </button>
               </p>
             </div>
           </div>
         </div>
       </div>
     )}

   </div>
  </div>
 );
}
