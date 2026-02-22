/**
 * API Keys / BYOK Page — rebuilt with Lucide icons, toast notifications,
 * status dots, and the correct theme.
 */

import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Eye, EyeOff, ExternalLink, Loader2, Check, X,
  RefreshCw, Shield, Zap, BrainCircuit, FlaskConical, Cloud, ChevronDown,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Provider {
  id: string;
  name: string;
  tag?: string;
  url: string;
  placeholder: string;
}

interface UserApiKey {
  id: string;
  provider: string;
  key_name: string;
  key_preview: string;
  is_active: boolean;
  is_valid: boolean | null;
  last_used_at: string | null;
  total_requests: number;
  total_tokens: number;
  total_cost_cents: number;
  provider_info: Provider;
}

// ─── Provider registry ────────────────────────────────────────────────────────
const PROVIDERS: Provider[] = [
  { id: 'openai',      name: 'OpenAI',        url: 'https://platform.openai.com/api-keys',                 placeholder: 'sk-...' },
  { id: 'anthropic',   name: 'Anthropic',     url: 'https://console.anthropic.com/settings/keys',          placeholder: 'sk-ant-...' },
  { id: 'google',      name: 'Google AI',     url: 'https://aistudio.google.com/app/apikey',               placeholder: 'AIza...' },
  { id: 'groq',        name: 'Groq',          tag: 'FREE', url: 'https://console.groq.com/keys',           placeholder: 'gsk_...' },
  { id: 'cohere',      name: 'Cohere',        url: 'https://dashboard.cohere.com/api-keys',                placeholder: 'your-key...' },
  { id: 'mistral',     name: 'Mistral',       url: 'https://console.mistral.ai/api-keys/',                 placeholder: 'your-key...' },
  { id: 'perplexity',  name: 'Perplexity',   url: 'https://www.perplexity.ai/settings/api',               placeholder: 'pplx-...' },
  { id: 'deepseek',    name: 'DeepSeek',      url: 'https://platform.deepseek.com/api_keys',               placeholder: 'sk-...' },
  { id: 'together',    name: 'Together AI',   url: 'https://api.together.xyz/settings/api-keys',           placeholder: 'your-key...' },
  { id: 'openrouter',  name: 'OpenRouter',    url: 'https://openrouter.ai/keys',                           placeholder: 'sk-or-...' },
  { id: 'replicate',   name: 'Replicate',     url: 'https://replicate.com/account/api-tokens',             placeholder: 'r8_...' },
  { id: 'huggingface', name: 'HuggingFace',   url: 'https://huggingface.co/settings/tokens',               placeholder: 'hf_...' },
  { id: 'azure_openai',name: 'Azure OpenAI',  url: 'https://portal.azure.com/',                            placeholder: 'your-key...' },
  { id: 'aws_bedrock', name: 'AWS Bedrock',   url: 'https://console.aws.amazon.com/',                      placeholder: 'AKIA...' },
  { id: 'ollama',      name: 'Ollama',        tag: 'LOCAL', url: 'https://ollama.ai/',                     placeholder: 'http://localhost:11434' },
];

// Domain map for the Google favicon service
const PROVIDER_DOMAINS: Record<string, string> = {
  openai: 'openai.com',
  anthropic: 'anthropic.com',
  google: 'aistudio.google.com',
  groq: 'groq.com',
  cohere: 'cohere.com',
  mistral: 'mistral.ai',
  perplexity: 'perplexity.ai',
  deepseek: 'deepseek.com',
  together: 'together.ai',
  openrouter: 'openrouter.ai',
  replicate: 'replicate.com',
  huggingface: 'huggingface.co',
  azure_openai: 'microsoft.com',
  aws_bedrock: 'aws.amazon.com',
  ollama: 'ollama.com',
};

const PROVIDER_RING: Record<string, string> = {
  openai: 'ring-emerald-500/20 bg-emerald-950/40',
  anthropic: 'ring-orange-500/20 bg-orange-950/40',
  google: 'ring-blue-500/20 bg-blue-950/40',
  groq: 'ring-violet-500/20 bg-violet-950/40',
  mistral: 'ring-amber-500/20 bg-amber-950/40',
  perplexity: 'ring-teal-500/20 bg-teal-950/40',
  deepseek: 'ring-sky-500/20 bg-sky-950/40',
};

function ProviderLogo({ id, name }: { id: string; name: string }) {
  const [imgErr, setImgErr] = React.useState(false);
  const domain = PROVIDER_DOMAINS[id];
  const ring = PROVIDER_RING[id] || 'ring-white/10 bg-white/[0.04]';
  return (
    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ring-1', ring)}>
      {domain && !imgErr ? (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt={name}
          className="w-[18px] h-[18px] object-contain"
          onError={() => setImgErr(true)}
        />
      ) : (
        <span className="text-[10px] font-medium text-white/50">{name.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}

// Validation status dot
function StatusDot({ valid }: { valid: boolean | null }) {
  if (valid === null)
    return <span className="w-2 h-2 rounded-full bg-zinc-700 inline-block" title="Not tested" />;
  if (valid)
    return <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" title="Valid" />;
  return <span className="w-2 h-2 rounded-full bg-red-400 inline-block" title="Invalid" />;
}

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────
function AddKeyModal({
  provider: initialProvider,
  providers,
  onClose,
  onAdd,
}: {
  provider: Provider | null;
  providers: Provider[];
  onClose: () => void;
  onAdd: (provider: string, apiKey: string, keyName: string) => Promise<void>;
}) {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(initialProvider);
  const [apiKey, setApiKey] = useState('');
  const [keyName, setKeyName] = useState('My Key');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || !apiKey.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      await onAdd(selectedProvider.id, apiKey.trim(), keyName.trim() || 'My Key');
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to save key');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        className="w-full max-w-md rounded-2xl border border-white/[0.07] bg-[#0e0e0e] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-[15px] font-medium text-white">Add API Key</h2>
            <p className="text-[12px] text-zinc-600 mt-0.5">Keys are AES-encrypted, stored locally</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Provider */}
          <div>
            <label className="block text-[12px] text-zinc-500 mb-1.5 font-medium">Provider</label>
            {initialProvider ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.03]">
                <ProviderLogo id={initialProvider.id} name={initialProvider.name} />
                <span className="text-[14px] text-white">{initialProvider.name}</span>
                {initialProvider.tag && (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400">{initialProvider.tag}</span>
                )}
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedProvider?.id || ''}
                  onChange={(e) => setSelectedProvider(providers.find((p) => p.id === e.target.value) ?? null)}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] text-[13px] text-white appearance-none pr-8 focus:outline-none focus:border-white/20"
                >
                  <option value="">Select a provider...</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.tag ? ` (${p.tag})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Get key link */}
          {selectedProvider && (
            <div className="flex items-center gap-2 text-[12px] text-zinc-600">
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Need a key?{' '}
                <button
                  type="button"
                  onClick={() => window.electron.system.openExternal(selectedProvider.url)}
                  className="text-zinc-400 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Get one from {selectedProvider.name}
                </button>
              </span>
            </div>
          )}

          {/* Key name */}
          <div>
            <label className="block text-[12px] text-zinc-500 mb-1.5 font-medium">Key name</label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g. Personal, Production..."
              className="w-full px-3 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] text-[13px] text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          {/* API key */}
          <div>
            <label className="block text-[12px] text-zinc-500 mb-1.5 font-medium">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={selectedProvider?.placeholder || 'sk-...'}
                required
                className="w-full px-3 py-2.5 pr-10 rounded-xl border border-white/[0.07] bg-white/[0.03] text-[13px] text-white font-mono placeholder:text-zinc-700 focus:outline-none focus:border-white/20 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {err && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-[12px] text-red-400">
              <X className="w-3.5 h-3.5 flex-shrink-0" /> {err}
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-medium border border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.14] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedProvider || !apiKey.trim() || saving}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-medium bg-white text-black hover:bg-zinc-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Add Key'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function APIKeysPage() {
  const [keys, setKeys] = useState<UserApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => { loadKeys(); }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  };

  const loadKeys = async () => {
    try {
      setLoading(true);
      const result = await window.electron.express.getUserApiKeys();
      setKeys(result || []);
    } catch (err: any) {
      if (!err.message?.includes('user_provider_keys')) {
        showToast('error', err.message || 'Failed to load API keys');
      }
      setKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async (provider: string, apiKey: string, keyName: string) => {
    await window.electron.express.addUserApiKey(provider, apiKey, keyName);
    setShowModal(false);
    setSelectedProvider(null);
    await loadKeys();
    showToast('success', 'API key saved successfully');
  };

  const handleDeleteKey = async (keyId: string) => {
    if (deletingKey === keyId) {
      // second click = confirm
      try {
        await window.electron.express.deleteUserApiKey(keyId);
        setDeletingKey(null);
        await loadKeys();
        showToast('success', 'API key deleted');
      } catch (err: any) {
        showToast('error', err.message || 'Failed to delete key');
        setDeletingKey(null);
      }
    } else {
      setDeletingKey(keyId);
      setTimeout(() => setDeletingKey((c) => (c === keyId ? null : c)), 3000);
    }
  };

  const handleTestKey = async (keyId: string) => {
    setTestingKey(keyId);
    try {
      const result = await window.electron.express.testUserApiKey(keyId);
      if (result?.success) {
        showToast('success', 'API key is valid');
      } else {
        showToast('error', `Key test failed: ${result?.message || 'Unknown error'}`);
      }
      await loadKeys();
    } catch (err: any) {
      showToast('error', `Key test failed: ${err.message}`);
    } finally {
      setTestingKey(null);
    }
  };

  const availableProviders = PROVIDERS.filter(
    (p) => !keys.some((k) => k.provider === p.id)
  );

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0b0b0b]">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">API Keys</h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        <span className="text-[11px] text-white/30 app-region-no-drag">BYOK — keys are AES-256 encrypted on-device</span>
        <div className="flex-1" />
        <button
          onClick={loadKeys}
          disabled={loading}
          className="app-region-no-drag p-1.5 rounded-[5px] text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
          title="Refresh"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
        </button>
        <button
          onClick={() => { setSelectedProvider(null); setShowModal(true); }}
          className="app-region-no-drag ml-2 h-6 px-3 rounded-[5px] text-[11px] font-medium bg-white/[0.08] text-white/70 hover:bg-white/[0.14] flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3 h-3" /> Add Key
        </button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            className={cn(
              'fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-[13px] font-medium max-w-sm w-full',
              toast.type === 'success'
                ? 'bg-[#0e0e0e] border-emerald-500/30 text-emerald-300'
                : 'bg-[#0e0e0e] border-red-500/30 text-red-300',
            )}
          >
            {toast.type === 'success'
              ? <Check className="w-4 h-4 flex-shrink-0" />
              : <X className="w-4 h-4 flex-shrink-0" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto p-5">
        <div className="max-w-3xl">
        {/* Privacy notice */}
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.05] bg-white/[0.02]">
          <Shield className="w-4 h-4 text-zinc-600 flex-shrink-0" />
          <p className="text-[12px] text-zinc-600">
            Your API keys are encrypted with AES-256 and stored only on this device. We never transmit or see them.
          </p>
        </div>

        {/* Configured Keys */}
        <section className="mb-10">
          <h2 className="text-[12px] font-medium text-zinc-600 uppercase tracking-widest mb-3">
            Configured Keys ({keys.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-700" />
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-white/[0.06] text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-3">
                <BrainCircuit className="w-6 h-6 text-zinc-700" />
              </div>
              <p className="text-[14px] text-zinc-500 mb-1">No API keys yet</p>
              <p className="text-[12px] text-zinc-700">Add your first key to use any AI provider</p>
            </div>
          ) : (
            <div className="space-y-2">
              {keys.map((key) => {
                const isDeleting = deletingKey === key.id;
                const isTesting = testingKey === key.id;
                return (
                  <motion.div
                    key={key.id}
                    layout
                    className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:border-white/[0.09] transition-all"
                  >
                    <ProviderLogo
                      id={key.provider}
                      name={key.provider_info?.name || key.provider}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[14px] font-medium text-white">
                          {key.provider_info?.name || key.provider}
                        </span>
                        {key.provider_info?.tag && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/25 text-emerald-500">
                            {key.provider_info.tag}
                          </span>
                        )}
                        <StatusDot valid={key.is_valid} />
                        <span className="text-[11px] text-zinc-700">
                          {key.is_valid === null ? 'Not tested' : key.is_valid ? 'Valid' : 'Invalid'}
                        </span>
                      </div>
                      <p className="text-[12px] text-zinc-600 font-mono truncate">
                        {key.key_preview} &nbsp;·&nbsp; {key.key_name}
                      </p>
                      {key.last_used_at && (
                        <p className="text-[11px] text-zinc-700 mt-0.5">
                          Last used {new Date(key.last_used_at).toLocaleDateString()}
                          {key.total_requests > 0 && ` · ${key.total_requests.toLocaleString()} reqs`}
                          {key.total_cost_cents > 0 && ` · $${(key.total_cost_cents / 100).toFixed(2)}`}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleTestKey(key.id)}
                        disabled={isTesting}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.07] text-[12px] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.14] transition-all"
                        title="Test key"
                      >
                        {isTesting
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <FlaskConical className="w-3.5 h-3.5" />}
                        Test
                      </button>
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] transition-all',
                          isDeleting
                            ? 'border-red-500/40 text-red-400 hover:bg-red-500/10'
                            : 'border-white/[0.07] text-zinc-600 hover:text-red-400 hover:border-red-500/30',
                        )}
                        title={isDeleting ? 'Click again to confirm delete' : 'Delete key'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {isDeleting ? 'Confirm?' : 'Delete'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Available Providers */}
        {availableProviders.length > 0 && (
          <section>
            <h2 className="text-[12px] font-medium text-zinc-600 uppercase tracking-widest mb-3">
              Add a Provider
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {availableProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => {
                    setSelectedProvider(provider);
                    setShowModal(true);
                  }}
                  className="group relative p-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12] hover:bg-white/[0.03] transition-all text-left"
                >
                  <ProviderLogo id={provider.id} name={provider.name} />
                  <p className="mt-2.5 text-[13px] font-medium text-zinc-300 leading-tight">{provider.name}</p>
                  {provider.tag && (
                    <span className="mt-1 inline-block text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/25 text-emerald-500">
                      {provider.tag}
                    </span>
                  )}
                  <p className="mt-1 text-[11px] text-zinc-700 group-hover:text-zinc-500 transition-colors">
                    + Add key
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>{/* closes max-w-3xl */}
      </div>{/* closes flex-1 overflow-auto p-5 */}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <AddKeyModal
            provider={selectedProvider}
            providers={availableProviders}
            onClose={() => { setShowModal(false); setSelectedProvider(null); }}
            onAdd={handleAddKey}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
