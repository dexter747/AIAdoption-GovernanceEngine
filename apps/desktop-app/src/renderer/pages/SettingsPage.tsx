import { useState } from 'react';
import { Save, Key, Bell, Database, Shield } from 'lucide-react';

export default function SettingsPage() {
 const [activeTab, setActiveTab] = useState('general');
 const [settings, setSettings] = useState({
 defaultDatabase: 'production',
 autoConnect: true,
 saveHistory: true,
 maxHistoryItems: 100,
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
 ];

 return (
 <div className="p-8">
 {/* Header */}
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="font-medium text-white">Settings</h1>
 <p className="text-muted-foreground mt-1">Manage your application preferences</p>
 </div>
 <button className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors">
 <Save className="w-4 h-4" />
 Save Changes
 </button>
 </div>

 {/* Tabs */}
 <div className="flex gap-1 p-1 rounded-lg mb-6 w-fit bg-zinc-950">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${ activeTab === tab.id ? 'bg-background shadow-sm text-white' : 'text-muted-foreground hover:text-white'}`}
 >
 <tab.icon className="w-4 h-4" />
 {tab.name}
 </button>
 ))}
 </div>

 {/* Content */}
 <div className="rounded-xl p-6 bg-black border-zinc-800">
 {activeTab === 'general' && (
 <div className="space-y-6">
 <h3 className="font-medium text-white">General Settings</h3>
 
 <div className="grid gap-6 max-w-md">
 <div>
 <label className="block font-medium mb-2 text-white">
 Default Database
 </label>
 <select
 value={settings.defaultDatabase}
 onChange={(e) => setSettings({ ...settings, defaultDatabase: e.target.value })}
 className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-zinc-950 border-zinc-800 text-white"
 >
 <option value="production">Production DB</option>
 <option value="analytics">Analytics DB</option>
 </select>
 </div>

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-white">Auto-connect on startup</p>
 <p className="text-xs text-muted-foreground">Automatically connect to default database</p>
 </div>
 <button
 onClick={() => setSettings({ ...settings, autoConnect: !settings.autoConnect })}
 className={`w-12 h-6 rounded-full transition-colors ${ settings.autoConnect ? 'bg-zinc-800' : 'bg-zinc-800'}`}
 >
 <div className={`w-5 h-5 bg-background rounded-full shadow transition-transform ${
 settings.autoConnect ? 'translate-x-6' : 'translate-x-0.5'
 }`} />
 </button>
 </div>

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-white">Save query history</p>
 <p className="text-xs text-muted-foreground">Store your previous queries locally</p>
 </div>
 <button
 onClick={() => setSettings({ ...settings, saveHistory: !settings.saveHistory })}
 className={`w-12 h-6 rounded-full transition-colors ${ settings.saveHistory ? 'bg-zinc-800' : 'bg-zinc-800'}`}
 >
 <div className={`w-5 h-5 bg-background rounded-full shadow transition-transform ${
 settings.saveHistory ? 'translate-x-6' : 'translate-x-0.5'
 }`} />
 </button>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'ai' && (
 <div className="space-y-6">
 <h3 className="font-medium text-white">AI Provider Settings</h3>
 
 <div className="grid gap-6 max-w-md">
 <div>
 <label className="block font-medium mb-2 text-white">
 AI Provider
 </label>
 <select
 value={settings.apiProvider}
 onChange={(e) => setSettings({ ...settings, apiProvider: e.target.value })}
 className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-zinc-950 border-zinc-800 text-white"
 >
 <option value="openai">OpenAI (GPT-4)</option>
 <option value="anthropic">Anthropic (Claude)</option>
 <option value="google">Google (Gemini)</option>
 <option value="ollama">Ollama (Local)</option>
 </select>
 </div>

 <div>
 <label className="block font-medium mb-2 text-white">
 API Key
 </label>
 <input
 type="password"
 value={settings.apiKey}
 onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
 placeholder="sk-..."
 className="w-full px-4 py-2 rounded-lg placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-zinc-950 border-zinc-800 text-white"
 />
 <p className="text-xs text-muted-foreground mt-1">Your API key is stored securely on your device</p>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'notifications' && (
 <div className="space-y-6">
 <h3 className="font-medium text-white">Notification Settings</h3>
 
 <div className="grid gap-6 max-w-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-white">Enable notifications</p>
 <p className="text-xs text-muted-foreground">Show desktop notifications</p>
 </div>
 <button
 onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
 className={`w-12 h-6 rounded-full transition-colors ${ settings.notifications ? 'bg-zinc-800' : 'bg-zinc-800'}`}
 >
 <div className={`w-5 h-5 bg-background rounded-full shadow transition-transform ${
 settings.notifications ? 'translate-x-6' : 'translate-x-0.5'
 }`} />
 </button>
 </div>

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-white">Sound effects</p>
 <p className="text-xs text-muted-foreground">Play sounds for actions</p>
 </div>
 <button
 onClick={() => setSettings({ ...settings, soundEffects: !settings.soundEffects })}
 className={`w-12 h-6 rounded-full transition-colors ${ settings.soundEffects ? 'bg-zinc-800' : 'bg-zinc-800'}`}
 >
 <div className={`w-5 h-5 bg-background rounded-full shadow transition-transform ${
 settings.soundEffects ? 'translate-x-6' : 'translate-x-0.5'
 }`} />
 </button>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'security' && (
 <div className="space-y-6">
 <h3 className="font-medium text-white">Security Settings</h3>
 
 <div className="grid gap-4 max-w-md">
 <div className="p-4 rounded-lg bg-zinc-950">
 <div className="flex items-center gap-3 mb-2">
 <Shield className="w-5 h-5 text-zinc-400" />
 <p className="font-medium text-white">Data Encryption</p>
 </div>
 <p className="text-xs text-muted-foreground">All sensitive data is encrypted locally using AES-256</p>
 </div>

 <button className="w-full text-left p-4 rounded-lg transition-colors bg-zinc-950 hover:bg-zinc-900">
 <p className="font-medium text-white">Clear all stored data</p>
 <p className="text-xs text-muted-foreground">Remove all connections, history, and settings</p>
 </button>

 <button className="w-full text-left p-4 rounded-lg transition-colors bg-zinc-950 hover:bg-zinc-900">
 <p className="font-medium text-white">Export data</p>
 <p className="text-xs text-muted-foreground">Download all your data in JSON format</p>
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
