import { useState, useEffect, useMemo } from 'react';
import { Database, Plus, Power, PowerOff, Trash2, Settings, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { CONNECTION_LIBRARY } from '../config/connection-types';
import { getFieldSchema } from '../config/connection-fields';

interface MCPConnection {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  lastConnected?: Date;
  error?: string;
  mcpServerType: 'docker' | 'npm' | 'custom';
}

export default function ConnectionsPageEnhanced() {
  const [connections, setConnections] = useState<MCPConnection[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dockerAvailable, setDockerAvailable] = useState(false);

  useEffect(() => {
    loadConnections();
    checkDocker();
  }, []);

  const loadConnections = async () => {
    try {
      const conns = await window.electron.mcp.getAllConnections();
      setConnections(conns);
    } catch (error: any) {
      // Silently handle API key errors - user might not have backend configured yet
      if (!error?.message?.includes('Invalid API key')) {
        console.error('Failed to load connections:', error);
      }
    }
  };

  const checkDocker = async () => {
    try {
      const available = await window.electron.mcp.checkDocker();
      setDockerAvailable(available);
    } catch (error: any) {
      // Silently handle - Docker might not be installed
      if (!error?.message?.includes('Invalid API key')) {
        console.error('Failed to check Docker:', error);
      }
    }
  };

  const handleToggleConnection = async (id: string, currentlyEnabled: boolean) => {
    setLoading(true);
    try {
      if (currentlyEnabled) {
        await window.electron.mcp.disableConnection(id);
      } else {
        await window.electron.mcp.enableConnection(id);
      }
      await loadConnections();
    } catch (error: any) {
      alert(`Failed to ${currentlyEnabled ? 'disable' : 'enable'} connection: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this connection?')) {
      return;
    }

    setLoading(true);
    try {
      await window.electron.mcp.deleteConnection(id);
      await loadConnections();
    } catch (error: any) {
      alert(`Failed to delete connection: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const info = CONNECTION_LIBRARY[type];
    const defaultClass = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${defaultClass}`}>
        {info ? info.name : type.toUpperCase()}
      </span>
    );
  };

  const getMCPBadge = (serverType: string) => {
    const icons: Record<string, string> = {
      docker: '🐳',
      npm: '📦',
      custom: '⚙️',
    };

    return (
      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
        {icons[serverType]} {serverType}
      </span>
    );
  };

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">MCP Connections</h1>
          <p className="text-gray-500 mt-1">
            Manage Model Context Protocol connections to databases and systems
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Connection
        </button>
      </div>

      {/* Docker Status Warning */}
      {!dockerAvailable && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Docker not detected
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Some MCP connections require Docker. Install Docker Desktop to enable Docker-based MCP servers.
            </p>
          </div>
        </div>
      )}

      {/* Connections List */}
      <div className="flex-1 overflow-y-auto">
        {connections.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Database className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                No connections yet
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Add your first MCP connection to get started
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Connection
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Status Icon */}
                    <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
                      {getStatusIcon(conn.status)}
                    </div>

                    {/* Connection Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-black dark:text-white">
                          {conn.name}
                        </h3>
                        {getTypeBadge(conn.type)}
                        {getMCPBadge(conn.mcpServerType)}
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Status:</span>
                          <span className={
                            conn.status === 'connected' ? 'text-green-600 dark:text-green-400' :
                            conn.status === 'error' ? 'text-red-600 dark:text-red-400' :
                            'text-gray-500'
                          }>
                            {conn.status}
                          </span>
                        </div>

                        {conn.lastConnected && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Last connected:</span>
                            <span>{new Date(conn.lastConnected).toLocaleString()}</span>
                          </div>
                        )}

                        {conn.error && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-xs">
                            {conn.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleConnection(conn.id, conn.enabled)}
                      disabled={loading}
                      className={`p-2 rounded-lg transition-colors ${
                        conn.enabled
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                      }`}
                      title={conn.enabled ? 'Disable connection' : 'Enable connection'}
                    >
                      {loading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : conn.enabled ? (
                        <Power className="w-5 h-5" />
                      ) : (
                        <PowerOff className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      onClick={() => {/* TODO: Open edit modal */}}
                      className="p-2 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                      title="Edit connection"
                    >
                      <Settings className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleDeleteConnection(conn.id)}
                      disabled={loading || conn.enabled}
                      className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete connection"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Connection Modal */}
      {showAddModal && (
        <AddConnectionModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadConnections();
          }}
        />
      )}
    </div>
  );
}

// Add Connection Modal Component
function AddConnectionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [selectedType, setSelectedType] = useState('postgresql');
  const [connectionName, setConnectionName] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Get the field schema for the currently selected type
  const fieldSchema = useMemo(() => getFieldSchema(selectedType), [selectedType]);

  // When type changes, reset field values with defaults from the schema
  useEffect(() => {
    const defaults: Record<string, string> = {};
    for (const field of fieldSchema.fields) {
      if (field.defaultValue !== undefined) {
        defaults[field.key] = String(field.defaultValue);
      }
    }
    setFieldValues(defaults);
  }, [selectedType, fieldSchema]);

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build the config: standard ConnectionConfig fields + options for extra fields
      const config: Record<string, any> = {
        name: connectionName,
        type: selectedType,
        options: {} as Record<string, string>,
      };

      // Map field values to standard ConnectionConfig fields where appropriate
      const standardFields = ['host', 'port', 'database', 'username', 'password', 'ssl'];
      for (const [key, value] of Object.entries(fieldValues)) {
        if (value === undefined || value === '') continue;
        if (standardFields.includes(key)) {
          config[key] = key === 'port' ? parseInt(value, 10) : value;
        } else {
          config.options[key] = value;
        }
      }

      await window.electron.mcp.addConnection(config);
      onSuccess();
    } catch (error: any) {
      alert(`Failed to add connection: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Group fields by their group property
  const groupedFields = useMemo(() => {
    const groups = new Map<string, typeof fieldSchema.fields>();
    for (const field of fieldSchema.fields) {
      const group = field.group || 'Connection';
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(field);
    }
    return groups;
  }, [fieldSchema]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-black dark:text-white">Add MCP Connection</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Connection Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Connection Name
            </label>
            <input
              type="text"
              required
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="My Connection"
            />
          </div>

          {/* System Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              System Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(CONNECTION_LIBRARY).map(([key, info]) => (
                <option key={key} value={key}>{info.icon} {info.name}</option>
              ))}
            </select>
          </div>

          {/* Dynamic Fields grouped by category */}
          {Array.from(groupedFields.entries()).map(([groupName, fields]) => (
            <fieldset key={groupName} className="space-y-3">
              {groupedFields.size > 1 && (
                <legend className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  {groupName}
                </legend>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fields.map((field) => (
                  <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={fieldValues[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select...</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={fieldValues[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 h-20"
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    ) : (
                      <input
                        type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
                        value={fieldValues[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </fieldset>
          ))}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Connection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
