import { useState } from 'react';
import { Database, Plus, Settings, Trash2, Play } from 'lucide-react';

const connections = [
  { 
    id: '1', 
    name: 'Production DB', 
    type: 'PostgreSQL', 
    host: 'db.example.com', 
    database: 'production',
    status: 'connected',
    lastUsed: '5 min ago'
  },
  { 
    id: '2', 
    name: 'Analytics DB', 
    type: 'MySQL', 
    host: 'analytics.example.com', 
    database: 'analytics',
    status: 'connected',
    lastUsed: '1 hour ago'
  },
  { 
    id: '3', 
    name: 'Legacy System', 
    type: 'Oracle', 
    host: 'legacy.internal', 
    database: 'LEGACY',
    status: 'disconnected',
    lastUsed: '3 days ago'
  },
];

export default function ConnectionsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  
  // TODO: Implement add connection modal
  console.debug('showAddModal state:', showAddModal);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-black dark:text-white">Connections</h1>
          <p className="text-gray-500 mt-1">Manage your database connections</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Connection
        </button>
      </div>

      {/* Supported Databases */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-500 mb-4">Supported Databases</h2>
        <div className="flex flex-wrap gap-3">
          {['PostgreSQL', 'MySQL', 'Oracle', 'SQL Server', 'MongoDB', 'Salesforce', 'SAP HANA', 'SQLite'].map((db) => (
            <span key={db} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-sm rounded-lg">
              {db}
            </span>
          ))}
        </div>
      </div>

      {/* Connections List */}
      <div className="grid gap-4">
        {connections.map((conn) => (
          <div 
            key={conn.id}
            className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  conn.status === 'connected' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <Database className={`w-6 h-6 ${
                    conn.status === 'connected' ? 'text-green-500' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-black dark:text-white">{conn.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      conn.status === 'connected' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {conn.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{conn.type}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>Host: {conn.host}</span>
                    <span>Database: {conn.database}</span>
                    <span>Last used: {conn.lastUsed}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors">
                  <Play className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {connections.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center">
          <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black dark:text-white mb-2">No connections yet</h3>
          <p className="text-gray-500 mb-4">Add your first database connection to get started.</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Connection
          </button>
        </div>
      )}
    </div>
  );
}
