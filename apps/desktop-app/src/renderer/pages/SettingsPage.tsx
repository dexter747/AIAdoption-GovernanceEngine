import { useState } from 'react';
import { Key, Bell, Database, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn('w-9 h-5 rounded-full transition-colors relative flex-shrink-0',
        on ? 'bg-emerald-600/80' : 'bg-white/[0.08]')}
    >
      <span className={cn('absolute top-0.5 w-4 h-4 bg-white/90 rounded-full shadow transition-all',
        on ? 'left-4' : 'left-0.5')} />
    </button>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    defaultDatabase: 'production',
    autoConnect: true,
    saveHistory: true,
    apiProvider: 'openai',
    apiKey: '',
    notifications: true,
    soundEffects: false,
  });

  const tabs = [
    { id: 'general',       name: 'General',       icon: Database },
    { id: 'ai',            name: 'AI Provider',   icon: Key },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security',      name: 'Security',      icon: Shield },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-semibold text-white/80 app-region-no-drag select-none">Settings</h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        <div className="flex items-center gap-0.5 app-region-no-drag">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn('tab-strip-item flex items-center gap-1.5',
                activeTab === tab.id ? 'is-active' : '')}>
              <tab.icon className="w-3 h-3" />{tab.name}
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
                <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Default Database</label>
                <select
                  value={settings.defaultDatabase}
                  onChange={e => setSettings({ ...settings, defaultDatabase: e.target.value })}
                  className="input-desktop w-full"
                >
                  <option value="production">Production DB</option>
                  <option value="analytics">Analytics DB</option>
                </select>
              </div>
              <div className="rounded-lg border border-white/[0.06] overflow-hidden">
                {([
                  { key: 'autoConnect', label: 'Auto-connect on startup',  desc: 'Connect to the default database at launch' },
                  { key: 'saveHistory', label: 'Save query history',        desc: 'Store your previous queries locally' },
                ] as const).map(({ key, label, desc }, i) => (
                  <div key={key} className={cn('flex items-center justify-between px-4 py-3', i === 0 && 'border-b border-white/[0.04]')}>
                    <div>
                      <p className="text-[12px] font-medium text-white/70">{label}</p>
                      <p className="text-[10.5px] text-white/30">{desc}</p>
                    </div>
                    <Toggle on={settings[key]} onToggle={() => setSettings({ ...settings, [key]: !settings[key] })} />
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'ai' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">AI Provider</label>
                <select
                  value={settings.apiProvider}
                  onChange={e => setSettings({ ...settings, apiProvider: e.target.value })}
                  className="input-desktop w-full"
                >
                  <option value="openai">OpenAI (GPT-4)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="google">Google (Gemini)</option>
                  <option value="ollama">Ollama (Local)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">API Key</label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={e => setSettings({ ...settings, apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="input-desktop w-full"
                />
                <p className="text-[10.5px] text-white/25 mt-1.5">Stored securely on this device only</p>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <div className="rounded-lg border border-white/[0.06] overflow-hidden">
              {([
                { key: 'notifications', label: 'Desktop notifications', desc: 'Show in-app toast messages' },
                { key: 'soundEffects',  label: 'Sound effects',         desc: 'Play sounds for actions' },
              ] as const).map(({ key, label, desc }, i) => (
                <div key={key} className={cn('flex items-center justify-between px-4 py-3', i === 0 && 'border-b border-white/[0.04]')}>
                  <div>
                    <p className="text-[12px] font-medium text-white/70">{label}</p>
                    <p className="text-[10.5px] text-white/30">{desc}</p>
                  </div>
                  <Toggle on={settings[key]} onToggle={() => setSettings({ ...settings, [key]: !settings[key] })} />
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
                  <p className="text-[10.5px] text-white/30">All sensitive data is encrypted locally</p>
                </div>
              </div>
              <button className="w-full text-left px-4 py-3 rounded-lg border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] transition-colors">
                <p className="text-[12px] font-medium text-white/70">Clear all stored data</p>
                <p className="text-[10.5px] text-white/30">Remove all connections, history, and settings</p>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] transition-colors">
                <p className="text-[12px] font-medium text-white/70">Export data</p>
                <p className="text-[10.5px] text-white/30">Download all your data in JSON format</p>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
