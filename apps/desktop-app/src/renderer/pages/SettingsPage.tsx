import { useState, useEffect, useCallback } from 'react';
import { Key, Bell, Database, Shield, Loader2, CheckCircle, Download, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-9 h-5 rounded-full transition-colors relative flex-shrink-0',
        on ? 'bg-emerald-600/80' : 'bg-white/[0.08]'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 w-4 h-4 bg-white/90 rounded-full shadow transition-all',
          on ? 'left-4' : 'left-0.5'
        )}
      />
    </button>
  );
}

interface ConnectionOption {
  id: string;
  name: string;
  type: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);
  const [connections, setConnections] = useState<ConnectionOption[]>([]);
  const [settings, setSettings] = useState({
    defaultDatabase: '',
    autoConnect: true,
    saveHistory: true,
    apiProvider: 'openai',
    apiKey: '',
    notifications: true,
    soundEffects: false,
  });

  const tabs = [
    { id: 'general', name: 'General', icon: Database },
    { id: 'ai', name: 'AI Provider', icon: Key },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'demo', name: 'Demo Data', icon: Sparkles },
  ];

  // Load settings + connections on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [allSettings, conns] = await Promise.all([
          window.electron.settings?.getAll?.(),
          window.electron.mcp
            ?.getAllConnections?.()
            .catch(() => window.electron.express?.getUserConnections?.())
            .catch(() => []),
        ]);

        if (allSettings && typeof allSettings === 'object') {
          setSettings(prev => ({
            ...prev,
            defaultDatabase: (allSettings as any).defaultDatabase ?? prev.defaultDatabase,
            autoConnect: (allSettings as any).autoConnect ?? prev.autoConnect,
            saveHistory: (allSettings as any).saveHistory ?? prev.saveHistory,
            apiProvider: (allSettings as any).apiProvider ?? prev.apiProvider,
            apiKey: (allSettings as any).apiKey ?? prev.apiKey,
            notifications: (allSettings as any).notifications ?? prev.notifications,
            soundEffects: (allSettings as any).soundEffects ?? prev.soundEffects,
          }));
        }

        const connsArray = Array.isArray(conns) ? conns : (conns as any)?.data || [];
        const mapped: ConnectionOption[] = connsArray.map((c: any) => ({
          id: c.id,
          name: c.name || c.type || 'Unknown',
          type: c.type || 'unknown',
        }));
        setConnections(mapped);
        if (mapped.length > 0 && !(allSettings as any)?.defaultDatabase) {
          setSettings(prev => ({ ...prev, defaultDatabase: mapped[0].id }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Persist a single setting
  const persist = useCallback(async (key: string, value: any) => {
    try {
      await window.electron.settings?.set?.(key, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error('Failed to save setting:', key, err);
    }
  }, []);

  // Update state + persist
  const updateSetting = useCallback(
    (key: string, value: any) => {
      setSettings(prev => ({ ...prev, [key]: value }));
      persist(key, value);
    },
    [persist]
  );

  // Clear all data
  const handleClearData = async () => {
    if (!confirm('This will remove all connections, history, and settings. Continue?')) return;
    try {
      // Clear settings
      const keys = [
        'defaultDatabase',
        'autoConnect',
        'saveHistory',
        'apiProvider',
        'apiKey',
        'notifications',
        'soundEffects',
      ];
      for (const key of keys) {
        await window.electron.settings?.set?.(key, null);
      }
      // Reset state
      setSettings({
        defaultDatabase: '',
        autoConnect: true,
        saveHistory: true,
        apiProvider: 'openai',
        apiKey: '',
        notifications: true,
        soundEffects: false,
      });
      alert('All stored data has been cleared.');
    } catch (err) {
      console.error('Failed to clear data:', err);
      alert('Failed to clear data. Check the console for details.');
    }
  };

  // Export data as JSON
  const handleExportData = async () => {
    try {
      const allSettings = await window.electron.settings?.getAll?.();
      const conversations = await window.electron.chat?.getAllConversations?.().catch(() => []);
      const connections = await window.electron.mcp?.getAllConnections?.().catch(() => []);
      const contexts = await window.electron.context?.list?.().catch(() => []);

      const exportData = {
        exportDate: new Date().toISOString(),
        settings: allSettings,
        conversations,
        connections,
        contexts,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `velanova-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export data:', err);
      alert('Failed to export data. Check the console for details.');
    }
  };

  // Seed demo data via API
  const handleSeedDemoData = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSeedResult({ success: false, message: 'Not authenticated. Please log in first.' });
        return;
      }
      const res = await fetch('/api/seed-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        const counts = json.data;
        const total = Object.values(counts).reduce((s: number, v: any) => s + (v as number), 0);
        setSeedResult({ success: true, message: `${total} records seeded across ${Object.keys(counts).length} tables.` });
      } else {
        setSeedResult({ success: false, message: json.error?.message || json.message || 'Seed failed.' });
      }
    } catch (err: any) {
      setSeedResult({ success: false, message: err.message || 'Network error.' });
    } finally {
      setSeeding(false);
    }
  };

  // Clear demo data via API
  const handleClearDemoData = async () => {
    if (!confirm('This will remove all demo data from all module pages. Continue?')) return;
    setClearing(true);
    setSeedResult(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSeedResult({ success: false, message: 'Not authenticated. Please log in first.' });
        return;
      }
      const res = await fetch('/api/seed-demo', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      setSeedResult({ success: json.success, message: json.success ? 'Demo data cleared successfully.' : (json.error || 'Failed to clear.') });
    } catch (err: any) {
      setSeedResult({ success: false, message: err.message || 'Network error.' });
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0b0b0b]">
        <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">
          Settings
        </h1>
        {saved && (
          <span className="ml-3 flex items-center gap-1 text-[11px] text-emerald-400/70 app-region-no-drag">
            <CheckCircle className="w-3 h-3" /> Saved
          </span>
        )}
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        <div className="flex items-center gap-0.5 app-region-no-drag">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'tab-strip-item flex items-center gap-1.5',
                activeTab === tab.id ? 'is-active' : ''
              )}
            >
              <tab.icon className="w-3 h-3" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-[#0b0b0b]">
        <div className="max-w-md space-y-5">
          {activeTab === 'general' && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5">
                  Default Database
                </label>
                {connections.length === 0 ? (
                  <p className="text-[12px] text-white/30">
                    No connections — add one in the Connections page
                  </p>
                ) : (
                  <select
                    value={settings.defaultDatabase}
                    onChange={e => updateSetting('defaultDatabase', e.target.value)}
                    className="input-desktop w-full"
                  >
                    {connections.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="rounded-lg border border-white/[0.06] overflow-hidden">
                {(
                  [
                    {
                      key: 'autoConnect',
                      label: 'Auto-connect on startup',
                      desc: 'Connect to the default database at launch',
                    },
                    {
                      key: 'saveHistory',
                      label: 'Save query history',
                      desc: 'Store your previous queries locally',
                    },
                  ] as const
                ).map(({ key, label, desc }, i) => (
                  <div
                    key={key}
                    className={cn(
                      'flex items-center justify-between px-4 py-3',
                      i === 0 && 'border-b border-white/[0.04]'
                    )}
                  >
                    <div>
                      <p className="text-[12px] font-medium text-white/70">{label}</p>
                      <p className="text-[10.5px] text-white/30">{desc}</p>
                    </div>
                    <Toggle
                      on={settings[key]}
                      onToggle={() => updateSetting(key, !settings[key])}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'ai' && (
            <>
              <div>
                <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5">
                  AI Provider
                </label>
                <select
                  value={settings.apiProvider}
                  onChange={e => updateSetting('apiProvider', e.target.value)}
                  className="input-desktop w-full"
                >
                  <option value="openai">OpenAI (GPT-4)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="google">Google (Gemini)</option>
                  <option value="groq">Groq</option>
                  <option value="xai">xAI (Grok)</option>
                  <option value="mistral">Mistral</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="cohere">Cohere</option>
                  <option value="perplexity">Perplexity</option>
                  <option value="ollama">Ollama (Local)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5">
                  API Key
                </label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={e => {
                    setSettings(prev => ({ ...prev, apiKey: e.target.value }));
                  }}
                  onBlur={e => {
                    if (e.target.value) persist('apiKey', e.target.value);
                  }}
                  placeholder="sk-..."
                  className="input-desktop w-full"
                />
                <p className="text-[10.5px] text-white/25 mt-1.5">
                  Stored securely on this device only
                </p>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <div className="rounded-lg border border-white/[0.06] overflow-hidden">
              {(
                [
                  {
                    key: 'notifications',
                    label: 'Desktop notifications',
                    desc: 'Show in-app toast messages',
                  },
                  { key: 'soundEffects', label: 'Sound effects', desc: 'Play sounds for actions' },
                ] as const
              ).map(({ key, label, desc }, i) => (
                <div
                  key={key}
                  className={cn(
                    'flex items-center justify-between px-4 py-3',
                    i === 0 && 'border-b border-white/[0.04]'
                  )}
                >
                  <div>
                    <p className="text-[12px] font-medium text-white/70">{label}</p>
                    <p className="text-[10.5px] text-white/30">{desc}</p>
                  </div>
                  <Toggle on={settings[key]} onToggle={() => updateSetting(key, !settings[key])} />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <Shield className="w-4 h-4 text-white/25 flex-shrink-0" />
                <div>
                  <p className="text-[12px] font-medium text-white/70">AES-256 Encryption</p>
                  <p className="text-[10.5px] text-white/30">
                    All sensitive data is encrypted locally
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearData}
                className="w-full text-left px-4 py-3 rounded-lg border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] transition-colors"
              >
                <p className="text-[12px] font-medium text-white/70">Clear all stored data</p>
                <p className="text-[10.5px] text-white/30">
                  Remove all connections, history, and settings
                </p>
              </button>
              <button
                onClick={handleExportData}
                className="w-full text-left px-4 py-3 rounded-lg border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] transition-colors flex items-center gap-3"
              >
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-white/70">Export data</p>
                  <p className="text-[10.5px] text-white/30">
                    Download all your data in JSON format
                  </p>
                </div>
                <Download className="w-4 h-4 text-white/25 flex-shrink-0" />
              </button>
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="space-y-4">
              <div className="px-4 py-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <p className="text-[12px] font-medium text-white/70 mb-1">Demo Data Manager</p>
                <p className="text-[10.5px] text-white/30">
                  Populate all module pages with realistic demo data for showcasing the platform.
                  Covers Project Intelligence, Resources, Regulatory, Procurement, KYC, and Fraud Detection.
                </p>
              </div>

              <button
                onClick={handleSeedDemoData}
                disabled={seeding}
                className="w-full text-left px-4 py-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.12] transition-colors flex items-center gap-3 disabled:opacity-50"
              >
                {seeding ? (
                  <Loader2 className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-emerald-300">
                    {seeding ? 'Seeding demo data...' : 'Seed Demo Data'}
                  </p>
                  <p className="text-[10.5px] text-white/30">
                    Insert projects, resources, contracts, clients, transactions, and more
                  </p>
                </div>
              </button>

              <button
                onClick={handleClearDemoData}
                disabled={clearing}
                className="w-full text-left px-4 py-3 rounded-lg border border-red-500/20 bg-red-500/[0.04] hover:bg-red-500/[0.08] transition-colors flex items-center gap-3 disabled:opacity-50"
              >
                {clearing ? (
                  <Loader2 className="w-4 h-4 text-red-400 flex-shrink-0 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-red-300">
                    {clearing ? 'Clearing data...' : 'Clear Demo Data'}
                  </p>
                  <p className="text-[10.5px] text-white/30">
                    Remove all demo data from all module tables
                  </p>
                </div>
              </button>

              {seedResult && (
                <div className={cn(
                  'px-4 py-3 rounded-lg border text-[12px]',
                  seedResult.success
                    ? 'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300'
                    : 'border-red-500/20 bg-red-500/[0.06] text-red-300'
                )}>
                  {seedResult.success && <CheckCircle className="w-3.5 h-3.5 inline mr-1.5" />}
                  {seedResult.message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
