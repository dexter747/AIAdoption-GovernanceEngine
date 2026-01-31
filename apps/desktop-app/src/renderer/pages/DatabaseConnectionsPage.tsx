/**
 * Database Connections Page
 * 
 * Allows users to add, manage, and test database connections via MCP
 */

import React, { useState, useEffect } from 'react';
import { mcpIntegration } from '../services/mcp-integration';

// Database connection types supported
const DATABASE_TYPES = [
  { 
    id: 'postgresql', 
    name: 'PostgreSQL', 
    icon: '🐘',
    fields: [
      { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost', required: true },
      { name: 'port', label: 'Port', type: 'number', placeholder: '5432', required: true, default: '5432' },
      { name: 'database', label: 'Database', type: 'text', placeholder: 'mydb', required: true },
      { name: 'user', label: 'Username', type: 'text', placeholder: 'postgres', required: true },
      { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
      { name: 'ssl', label: 'Use SSL', type: 'checkbox', required: false },
    ],
  },
  { 
    id: 'mysql', 
    name: 'MySQL', 
    icon: '🐬',
    fields: [
      { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost', required: true },
      { name: 'port', label: 'Port', type: 'number', placeholder: '3306', required: true, default: '3306' },
      { name: 'database', label: 'Database', type: 'text', placeholder: 'mydb', required: true },
      { name: 'user', label: 'Username', type: 'text', placeholder: 'root', required: true },
      { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
    ],
  },
  { 
    id: 'sqlite', 
    name: 'SQLite', 
    icon: '📁',
    fields: [
      { name: 'path', label: 'Database File Path', type: 'text', placeholder: '/path/to/database.db', required: true },
    ],
  },
  { 
    id: 'sqlserver', 
    name: 'SQL Server', 
    icon: '🔷',
    fields: [
      { name: 'server', label: 'Server', type: 'text', placeholder: 'localhost', required: true },
      { name: 'port', label: 'Port', type: 'number', placeholder: '1433', required: true, default: '1433' },
      { name: 'database', label: 'Database', type: 'text', placeholder: 'mydb', required: true },
      { name: 'user', label: 'Username', type: 'text', placeholder: 'sa', required: true },
      { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
      { name: 'trustServerCertificate', label: 'Trust Server Certificate', type: 'checkbox', required: false },
    ],
  },
  { 
    id: 'mongodb', 
    name: 'MongoDB', 
    icon: '🍃',
    fields: [
      { name: 'connectionString', label: 'Connection String', type: 'text', placeholder: 'mongodb://localhost:27017/mydb', required: true },
    ],
  },
];

interface Connection {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  tools: Array<{ name: string; description: string }>;
  config: Record<string, any>;
}

interface AddConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, type: string, config: Record<string, any>) => Promise<void>;
}

function AddConnectionModal({ isOpen, onClose, onAdd }: AddConnectionModalProps) {
  const [selectedType, setSelectedType] = useState(DATABASE_TYPES[0]);
  const [name, setName] = useState('');
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Initialize default values when type changes
    const defaults: Record<string, any> = {};
    selectedType.fields.forEach(field => {
      if (field.default) {
        defaults[field.name] = field.default;
      }
      if (field.type === 'checkbox') {
        defaults[field.name] = false;
      }
    });
    setConfig(defaults);
    setName(`My ${selectedType.name}`);
  }, [selectedType]);
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await onAdd(name, selectedType.id, config);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateConfig = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white mb-4">Add Database Connection</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Connection Name */}
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-1">Connection Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              placeholder="My Database"
              required
            />
          </div>
          
          {/* Database Type Selection */}
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">Database Type</label>
            <div className="grid grid-cols-3 gap-2">
              {DATABASE_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedType.id === type.id
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span className="text-2xl block mb-1">{type.icon}</span>
                  <span className="text-xs">{type.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Connection Fields */}
          <div className="space-y-3 mb-6">
            {selectedType.fields.map(field => (
              <div key={field.name}>
                <label className="block text-sm text-slate-400 mb-1">{field.label}</label>
                {field.type === 'checkbox' ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config[field.name] || false}
                      onChange={(e) => updateConfig(field.name, e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                    />
                    <span className="text-slate-300 text-sm">Enable</span>
                  </label>
                ) : (
                  <input
                    type={field.type}
                    value={config[field.name] || ''}
                    onChange={(e) => updateConfig(field.name, e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
          
          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DatabaseConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  
  // Load connections on mount
  useEffect(() => {
    loadConnections();
  }, []);
  
  const loadConnections = async () => {
    try {
      const conns = mcpIntegration.getConnections();
      setConnections(conns.map(c => ({
        ...c,
        config: {}, // Don't store sensitive config in state
      })));
    } catch (err: any) {
      // Silently handle API key errors - user might not have backend configured yet
      if (!err?.message?.includes('Invalid API key')) {
        console.error('Failed to load connections:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddConnection = async (name: string, type: string, config: Record<string, any>) => {
    const id = `conn-${Date.now()}`;
    const connection = await mcpIntegration.addConnection(id, name, type as any, config);
    
    setConnections(prev => [...prev, {
      ...connection,
      config: {}, // Don't store sensitive config
    }]);
  };
  
  const handleRemoveConnection = async (id: string) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;
    
    await mcpIntegration.removeConnection(id);
    setConnections(prev => prev.filter(c => c.id !== id));
  };
  
  const handleTestConnection = async (id: string) => {
    setTestingConnection(id);
    
    try {
      // Try to list tables as a test
      const result = await window.electron.mcp.listTables(id);
      
      if (result.success) {
        alert(`Connection successful! Found ${result.data?.length || 0} tables.`);
      } else {
        alert(`Connection test failed: ${result.error}`);
      }
    } catch (err) {
      alert(`Connection test failed: ${(err as Error).message}`);
    } finally {
      setTestingConnection(null);
    }
  };
  
  const getDbIcon = (type: string) => {
    const dbType = DATABASE_TYPES.find(t => t.id === type);
    return dbType?.icon || '🗄️';
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Database Connections</h1>
          <p className="text-slate-400 mt-1">
            Connect your databases to query them with AI
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Connection
        </button>
      </div>
      
      {/* Status Banner */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                mcpIntegration.getStatus().backendConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-slate-300 text-sm">
                {mcpIntegration.getStatus().backendConnected ? 'Connected to AI Nexus' : 'Disconnected'}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-600"></div>
            <span className="text-slate-400 text-sm">
              {connections.length} database{connections.length !== 1 ? 's' : ''} •{' '}
              {mcpIntegration.getStatus().totalTools} tools available
            </span>
          </div>
        </div>
      </div>
      
      {/* Connections List */}
      {connections.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
          <div className="text-4xl mb-4">🗄️</div>
          <h3 className="text-lg font-medium text-white mb-2">No Database Connections</h3>
          <p className="text-slate-400 mb-4">
            Add your first database connection to start querying with AI
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
          >
            Add Your First Database
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {connections.map(connection => (
            <div
              key={connection.id}
              className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-2xl">
                    {getDbIcon(connection.type)}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{connection.name}</h3>
                    <p className="text-slate-400 text-sm capitalize">
                      {connection.type} • {connection.tools.length} tools
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Status indicator */}
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    connection.status === 'connected'
                      ? 'bg-green-900/30 text-green-400'
                      : connection.status === 'error'
                      ? 'bg-red-900/30 text-red-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      connection.status === 'connected' ? 'bg-green-500' :
                      connection.status === 'error' ? 'bg-red-500' : 'bg-slate-500'
                    }`}></div>
                    {connection.status}
                  </div>
                  
                  {/* Test button */}
                  <button
                    onClick={() => handleTestConnection(connection.id)}
                    disabled={testingConnection === connection.id}
                    className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 text-sm disabled:opacity-50"
                  >
                    {testingConnection === connection.id ? 'Testing...' : 'Test'}
                  </button>
                  
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveConnection(connection.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg"
                    title="Remove connection"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Tools preview */}
              {connection.tools.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Available Tools:</p>
                  <div className="flex flex-wrap gap-2">
                    {connection.tools.slice(0, 5).map(tool => (
                      <span
                        key={tool.name}
                        className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs"
                      >
                        {tool.name}
                      </span>
                    ))}
                    {connection.tools.length > 5 && (
                      <span className="px-2 py-1 bg-slate-700 text-slate-400 rounded text-xs">
                        +{connection.tools.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* How it works section */}
      <div className="mt-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-medium text-white mb-4">How it works</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              1
            </div>
            <p className="text-slate-300 text-sm">Add your database connection</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              2
            </div>
            <p className="text-slate-300 text-sm">AI Nexus discovers your schema</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              3
            </div>
            <p className="text-slate-300 text-sm">Ask questions in natural language</p>
          </div>
        </div>
      </div>
      
      {/* Add Connection Modal */}
      <AddConnectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddConnection}
      />
    </div>
  );
}
