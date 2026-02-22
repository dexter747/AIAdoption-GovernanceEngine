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
    lastUsed: '5 min ago',
  },
  {
    id: '2',
    name: 'Analytics DB',
    type: 'MySQL',
    host: 'analytics.example.com',
    database: 'analytics',
    status: 'connected',
    lastUsed: '1 hour ago',
  },
  {
    id: '3',
    name: 'Legacy System',
    type: 'Oracle',
    host: 'legacy.internal',
    database: 'LEGACY',
    status: 'disconnected',
    lastUsed: '3 days ago',
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
          <h1 className="font-medium text-white">Connections</h1>
          <p className="text-muted-foreground mt-1">Manage your database connections</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Connection
        </button>
      </div>

      {/* Supported Databases */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Supported Databases</h2>
        <div className="flex flex-wrap gap-3">
          {[
            'PostgreSQL',
            'MySQL',
            'Oracle',
            'SQL Server',
            'MongoDB',
            'Salesforce',
            'SAP HANA',
            'SQLite',
          ].map(db => (
            <span key={db} className="px-3 py-1.5 rounded-lg bg-zinc-950 text-muted-foreground">
              {db}
            </span>
          ))}
        </div>
      </div>

      {/* Connections List */}
      <div className="grid gap-4">
        {connections.map(conn => (
          <div key={conn.id} className="rounded-xl p-6 bg-black border-zinc-800">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${conn.status === 'connected' ? 'bg-white/5' : 'bg-secondary'}`}
                >
                  <Database
                    className={`w-6 h-6 ${
                      conn.status === 'connected' ? 'text-zinc-400' : 'text-muted-foreground'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{conn.name}</h3>
                    <span
                      className={`px-2 py-0.5 font-medium rounded-full ${conn.status === 'connected' ? 'bg-white/5 text-zinc-400' : 'bg-secondary text-muted-foreground'}`}
                    >
                      {conn.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{conn.type}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Host: {conn.host}</span>
                    <span>Database: {conn.database}</span>
                    <span>Last used: {conn.lastUsed}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-muted-foreground hover:text-zinc-300 rounded-lg transition-colors hover:bg-zinc-950">
                  <Play className="w-4 h-4" />
                </button>
                <button className="p-2 text-muted-foreground rounded-lg transition-colors hover:text-zinc-400 hover:bg-zinc-950">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="p-2 text-muted-foreground hover:text-zinc-400 rounded-lg transition-colors hover:bg-zinc-950">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {connections.length === 0 && (
        <div className="rounded-xl p-12 text-center bg-zinc-950 border-zinc-800">
          <Database className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="font-medium mb-2 text-white">No connections yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first database connection to get started.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Connection
          </button>
        </div>
      )}
    </div>
  );
}
