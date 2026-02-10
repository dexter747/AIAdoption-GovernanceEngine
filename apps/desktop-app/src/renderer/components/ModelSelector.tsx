import React, { useEffect, useState } from 'react';

export interface AIProvider {
  id: string;
  name: string;
  enabled: boolean;
  models: AIModel[];
}

export interface AIModel {
  id: string;
  name: string;
  contextWindow: number;
  inputCostPer1k: number;
  outputCostPer1k: number;
  description?: string;
}

interface ModelSelectorProps {
  selectedProvider?: string;
  selectedModel?: string;
  onProviderChange: (providerId: string) => void;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  disabled = false,
}) => {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await window.electron.express.getProviders();
      
      if (result.success && result.data) {
        setProviders(result.data);
        
        // Auto-select first provider and model if none selected
        if (!selectedProvider && result.data.length > 0) {
          const firstProvider = result.data[0];
          onProviderChange(firstProvider.id);
          if (firstProvider.models.length > 0) {
            onModelChange(firstProvider.models[0].id);
          }
        }
      } else {
        setError(result.error || 'Failed to load providers');
      }
    } catch (err) {
      setError('Failed to connect to Express API');
      console.error('Error loading providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProviderModels = (): AIModel[] => {
    const provider = providers.find((p) => p.id === selectedProvider);
    return provider?.models || [];
  };

  const getSelectedModelDetails = (): AIModel | null => {
    const models = getSelectedProviderModels();
    return models.find((m) => m.id === selectedModel) || null;
  };

  const formatCost = (cost: number): string => {
    return `$${cost.toFixed(4)}`;
  };

  const formatContextWindow = (tokens: number): string => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K`;
    }
    return tokens.toString();
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-blue-500"></div>
          Loading AI providers...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-xl">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-red-400 font-medium">{error}</p>
              <button
                onClick={loadProviders}
                className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl backdrop-blur-xl">
        <p className="text-sm text-yellow-400">No AI providers available. Please check Express API configuration.</p>
      </div>
    );
  }

  const modelDetails = getSelectedModelDetails();

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Provider Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-500">AI Provider</label>
        <select
          value={selectedProvider || ''}
          onChange={(e) => {
            onProviderChange(e.target.value);
            const provider = providers.find((p) => p.id === e.target.value);
            if (provider && provider.models.length > 0) {
              onModelChange(provider.models[0].id);
            }
          }}
          disabled={disabled}
          className="w-full px-3 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 focus:border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id} className="bg-[#1A1A1A]">
              {provider.name} ({provider.models.length})
            </option>
          ))}
        </select>
      </div>

      {/* Model Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-500">Model</label>
        <select
          value={selectedModel || ''}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={disabled || !selectedProvider}
          className="w-full px-3 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 focus:border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {getSelectedProviderModels().map((model) => (
            <option key={model.id} value={model.id} className="bg-[#1A1A1A]">
              {model.name}
            </option>
          ))}
        </select>
      </div>

      {/* Model Details - Full Width */}
      {modelDetails && (
        <div className="col-span-2 p-3 bg-white/[0.03] border border-white/10 rounded-xl backdrop-blur-xl space-y-2">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-gray-500 block mb-1">Context</span>
              <span className="font-mono text-gray-300 font-medium">{formatContextWindow(modelDetails.contextWindow)}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Input</span>
              <span className="font-mono text-emerald-400 font-medium">{formatCost(modelDetails.inputCostPer1k)}/1K</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Output</span>
              <span className="font-mono text-emerald-400 font-medium">{formatCost(modelDetails.outputCostPer1k)}/1K</span>
            </div>
          </div>
          {modelDetails.description && (
            <p className="text-xs text-gray-500 pt-2 border-t border-white/5 leading-relaxed">{modelDetails.description}</p>
          )}
          {modelDetails.inputCostPer1k === 0 && modelDetails.outputCostPer1k === 0 && (
            <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs font-medium text-emerald-400">Free Model</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
