/**
 * API Keys Management Page
 * Allows users to add/edit/delete their AI provider API keys
 */

import React, { useState, useEffect } from 'react';

interface Provider {
  id: string;
  name: string;
  icon: string;
  url: string;
}

interface UserApiKey {
  id: string;
  provider: string;
  key_name: string;
  key_preview: string;
  is_active: boolean;
  is_valid: boolean;
  last_used_at: string | null;
  total_requests: number;
  total_tokens: number;
  total_cost_cents: number;
  provider_info: Provider;
}

const PROVIDERS: Provider[] = [
  { id: 'openai', name: 'OpenAI', icon: '🤖', url: 'https://platform.openai.com/api-keys' },
  { id: 'anthropic', name: 'Anthropic', icon: '🧠', url: 'https://console.anthropic.com/settings/keys' },
  { id: 'google', name: 'Google AI', icon: '🔮', url: 'https://aistudio.google.com/app/apikey' },
  { id: 'groq', name: 'Groq (FREE)', icon: '⚡', url: 'https://console.groq.com/keys' },
  { id: 'cohere', name: 'Cohere', icon: '🌀', url: 'https://dashboard.cohere.com/api-keys' },
  { id: 'mistral', name: 'Mistral', icon: '💨', url: 'https://console.mistral.ai/api-keys/' },
  { id: 'perplexity', name: 'Perplexity', icon: '🔍', url: 'https://www.perplexity.ai/settings/api' },
  { id: 'deepseek', name: 'DeepSeek', icon: '🐋', url: 'https://platform.deepseek.com/api_keys' },
  { id: 'together', name: 'Together AI', icon: '🤝', url: 'https://api.together.xyz/settings/api-keys' },
  { id: 'replicate', name: 'Replicate', icon: '🔄', url: 'https://replicate.com/account/api-tokens' },
  { id: 'huggingface', name: 'HuggingFace', icon: '🤗', url: 'https://huggingface.co/settings/tokens' },
  { id: 'openrouter', name: 'OpenRouter', icon: '🛤️', url: 'https://openrouter.ai/keys' },
  { id: 'azure_openai', name: 'Azure OpenAI', icon: '☁️', url: 'https://portal.azure.com/' },
  { id: 'aws_bedrock', name: 'AWS Bedrock', icon: '🪨', url: 'https://console.aws.amazon.com/' },
  { id: 'ollama', name: 'Ollama (Local)', icon: '🦙', url: 'https://ollama.ai/' },
];

export default function APIKeysPage() {
  const [keys, setKeys] = useState<UserApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await window.electron.express.getUserApiKeys();
      setKeys(result || []);
    } catch (err: any) {
      console.error('Failed to load keys:', err);
      // If table doesn't exist or auth error, show empty state
      setKeys([]);
      if (err.message && !err.message.includes('user_provider_keys')) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async (provider: string, apiKey: string, keyName: string) => {
    try {
      setError(null);
      await window.electron.express.addUserApiKey(provider, apiKey, keyName);
      setShowAddModal(false);
      setSelectedProvider(null);
      await loadKeys();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    try {
      setError(null);
      await window.electron.express.deleteUserApiKey(keyId);
      await loadKeys();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTestKey = async (keyId: string) => {
    setTestingKey(keyId);
    try {
      const result = await window.electron.express.testUserApiKey(keyId);
      if (result?.success) {
        alert('API key is valid! ✅');
      } else {
        alert(`API key test failed: ${result?.message || 'Unknown error'}`);
      }
      await loadKeys();
    } catch (err: any) {
      alert(`API key test failed: ${err.message}`);
    } finally {
      setTestingKey(null);
    }
  };

  const openProviderUrl = (url: string) => {
    window.electron.system.openExternal(url);
  };

  // Get providers that don't have keys yet
  const availableProviders = PROVIDERS.filter(
    p => !keys.some(k => k.provider === p.id)
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white">
            AI Provider API Keys
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add your own API keys to use AI providers. Your keys are encrypted and stored securely.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>➕</span> Add API Key
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Configured Keys */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
          Your API Keys ({keys.length})
        </h2>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : keys.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No API keys configured yet
            </p>
            <p className="text-sm text-gray-400">
              Add your first API key to start using AI providers
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map(key => (
              <div
                key={key.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{key.provider_info?.icon || '🔑'}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {key.provider_info?.name || key.provider}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {key.key_preview} • {key.key_name}
                    </div>
                    {key.last_used_at && (
                      <div className="text-xs text-gray-400">
                        Last used: {new Date(key.last_used_at).toLocaleDateString()}
                        {' • '}
                        {key.total_requests} requests • ${(key.total_cost_cents / 100).toFixed(2)} spent
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Status Badge */}
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    key.is_valid 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {key.is_valid ? '✓ Valid' : '✗ Invalid'}
                  </span>
                  
                  {/* Test Button */}
                  <button
                    onClick={() => handleTestKey(key.id)}
                    disabled={testingKey === key.id}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {testingKey === key.id ? '⏳' : '🧪'} Test
                  </button>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Providers */}
      <div>
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
          Available Providers ({availableProviders.length})
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableProviders.map(provider => (
            <button
              key={provider.id}
              onClick={() => {
                setSelectedProvider(provider);
                setShowAddModal(true);
              }}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <span className="text-2xl block mb-2">{provider.icon}</span>
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                {provider.name}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                + Add key
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Add Key Modal */}
      {showAddModal && (
        <AddKeyModal
          provider={selectedProvider}
          providers={availableProviders}
          onClose={() => {
            setShowAddModal(false);
            setSelectedProvider(null);
          }}
          onAdd={handleAddKey}
          openProviderUrl={openProviderUrl}
        />
      )}
    </div>
  );
}

// Add Key Modal Component
function AddKeyModal({
  provider,
  providers,
  onClose,
  onAdd,
  openProviderUrl
}: {
  provider: Provider | null;
  providers: Provider[];
  onClose: () => void;
  onAdd: (provider: string, apiKey: string, keyName: string) => void;
  openProviderUrl: (url: string) => void;
}) {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(provider);
  const [apiKey, setApiKey] = useState('');
  const [keyName, setKeyName] = useState('Default Key');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || !apiKey) return;
    
    setSaving(true);
    try {
      await onAdd(selectedProvider.id, apiKey, keyName);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">
              Add API Key
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Provider Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Provider
              </label>
              {provider ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-2xl">{provider.icon}</span>
                  <span className="font-medium">{provider.name}</span>
                </div>
              ) : (
                <select
                  value={selectedProvider?.id || ''}
                  onChange={(e) => setSelectedProvider(providers.find(p => p.id === e.target.value) || null)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="">Select a provider...</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.icon} {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Get API Key Link */}
            {selectedProvider && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Need an API key?{' '}
                  <button
                    type="button"
                    onClick={() => openProviderUrl(selectedProvider.url)}
                    className="underline font-medium"
                  >
                    Get one from {selectedProvider.name} →
                  </button>
                </p>
              </div>
            )}

            {/* Key Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Key Name (optional)
              </label>
              <input
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g., Production Key, Personal"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>

            {/* API Key Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showKey ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Your key is encrypted before storage. We never see or store the plain text.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedProvider || !apiKey || saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Add Key'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
