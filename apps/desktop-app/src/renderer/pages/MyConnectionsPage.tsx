import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Database, Plus, Edit2, Trash2, RefreshCw,
  CheckCircle, XCircle, Loader2, Search, Grid3x3, List,
  Power, MoreVertical, Zap, ArrowRight, Bot
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface UserConnection {
  id: string;
  name: string;
  type: string;
  host?: string;
  port?: number;
  database?: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastConnected?: Date;
  createdAt: Date;
  encrypted: boolean;
  queriesCount?: number;
}

// Connection types with icons
const CONNECTION_TYPES: Record<string, { icon: string; name: string; color: string }> = {
  mysql: { icon: '🐬', name: 'MySQL', color: 'from-blue-500 to-blue-600' },
  postgres: { icon: '🐘', name: 'PostgreSQL', color: 'from-indigo-500 to-indigo-600' },
  mariadb: { icon: '🦭', name: 'MariaDB', color: 'from-sky-500 to-sky-600' },
  sqlserver: { icon: '🔷', name: 'SQL Server', color: 'from-red-500 to-red-600' },
  oracle: { icon: '🔴', name: 'Oracle', color: 'from-orange-500 to-orange-600' },
  sqlite: { icon: '📦', name: 'SQLite', color: 'from-gray-500 to-gray-600' },
  mongodb: { icon: '🍃', name: 'MongoDB', color: 'from-green-500 to-green-600' },
  redis: { icon: '🔥', name: 'Redis', color: 'from-red-400 to-red-500' },
  elasticsearch: { icon: '🔍', name: 'Elasticsearch', color: 'from-yellow-500 to-yellow-600' },
  dynamodb: { icon: '⚡', name: 'DynamoDB', color: 'from-purple-500 to-purple-600' },
  cassandra: { icon: '👁️', name: 'Cassandra', color: 'from-teal-500 to-teal-600' },
  'sap-hana': { icon: '💎', name: 'SAP HANA', color: 'from-cyan-500 to-cyan-600' },
  salesforce: { icon: '☁️', name: 'Salesforce', color: 'from-sky-400 to-sky-500' },
  servicenow: { icon: '⚡', name: 'ServiceNow', color: 'from-teal-400 to-teal-500' },
  workday: { icon: '👥', name: 'Workday', color: 'from-orange-400 to-orange-500' },
  jira: { icon: '📋', name: 'Jira', color: 'from-blue-400 to-blue-500' },
  confluence: { icon: '📝', name: 'Confluence', color: 'from-blue-500 to-blue-600' },
  zendesk: { icon: '🎫', name: 'Zendesk', color: 'from-emerald-500 to-emerald-600' },
  hubspot: { icon: '🧡', name: 'HubSpot', color: 'from-orange-500 to-orange-600' },
  intercom: { icon: '💬', name: 'Intercom', color: 'from-blue-500 to-blue-600' },
  freshdesk: { icon: '🎯', name: 'Freshdesk', color: 'from-green-500 to-green-600' },
  snowflake: { icon: '❄️', name: 'Snowflake', color: 'from-cyan-400 to-cyan-500' },
  bigquery: { icon: '📊', name: 'BigQuery', color: 'from-blue-500 to-blue-600' },
  redshift: { icon: '🔶', name: 'Redshift', color: 'from-red-500 to-red-600' },
  databricks: { icon: '🧱', name: 'Databricks', color: 'from-red-400 to-orange-500' },
  'mcp-server': { icon: '🔌', name: 'MCP Server', color: 'from-purple-500 to-pink-500' },
  'custom-api': { icon: '🔗', name: 'Custom API', color: 'from-gray-500 to-gray-600' },
};

export default function MyConnectionsPage() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setIsLoading(true);
      // Try MCP (local) first, fall back to Express API
      const conns = await window.electron.mcp?.getAllConnections?.()
        || await window.electron.express?.getUserConnections?.()
        || [];
      const result = conns as any;
      const connsArray = Array.isArray(result) ? result : result?.data || [];
      setConnections(connsArray.map((c: any) => ({
        id: c.id,
        name: c.name,
        type: c.type || c.connection_type,
        host: c.host,
        port: c.port,
        database: c.database,
        status: c.status || 'disconnected',
        lastConnected: c.lastConnected ? new Date(c.lastConnected) : undefined,
        createdAt: new Date(c.createdAt || Date.now()),
        encrypted: c.encrypted || false,
        queriesCount: c.queriesCount || 0,
      })));
    } catch (error: any) {
      // Silently handle API key errors - user might not have backend configured yet
      if (!error?.message?.includes('Invalid API key')) {
        console.error('Failed to load connections:', error);
      }
      setConnections([]);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (connectionId: string) => {
    try {
      setTestingConnection(connectionId);
      const result = await window.electron.express?.testUserConnection?.(connectionId)
        || await window.electron.mcp?.testConnection?.(connectionId);
      
      const success = (result as any)?.success;
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: success ? 'connected' : 'error', lastConnected: new Date() }
          : conn
      ));
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId ? { ...conn, status: 'error' } : conn
      ));
    } finally {
      setTestingConnection(null);
    }
  };

  const deleteConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this connection?')) return;

    try {
      const expressDelete = window.electron.express?.deleteUserConnection;
      if (expressDelete) {
        await expressDelete(connectionId);
      } else {
        await window.electron.mcp?.deleteConnection?.(connectionId);
      }
      setConnections(prev => prev.filter(c => c.id !== connectionId));
    } catch (error) {
      console.error('Failed to delete connection:', error);
    }
  };

  const startChat = (connectionId: string) => {
    // Navigate to chat with this connection pre-selected
    navigate('/', { state: { selectedConnection: connectionId } });
  };

  const filteredConnections = connections.filter(conn => 
    conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getConnectionInfo = (type: string) => {
    return CONNECTION_TYPES[type] || { icon: '🗄️', name: type, color: 'from-gray-500 to-gray-600' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <span className="flex items-center gap-1.5 text-green-500 text-xs font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Connected
          </span>
        );
      case 'disconnected':
        return (
          <span className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            Disconnected
          </span>
        );
      case 'connecting':
        return (
          <span className="flex items-center gap-1.5 text-blue-500 text-xs font-medium">
            <Loader2 className="w-3 h-3 animate-spin" />
            Connecting
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            Error
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">My Connections</h1>
            <p className="text-gray-500 dark:text-white/50 mt-1">
              Manage your connected databases and services
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={loadConnections}
              className="border-gray-200 dark:border-white/10 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Link to="/library">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Connection
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-white/50 text-sm">Total Connections</p>
                <p className="text-3xl font-bold text-black dark:text-white mt-1">{connections.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-white/50 text-sm">Active</p>
                <p className="text-3xl font-bold text-green-500 mt-1">
                  {connections.filter(c => c.status === 'connected').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-white/50 text-sm">With Errors</p>
                <p className="text-3xl font-bold text-red-500 mt-1">
                  {connections.filter(c => c.status === 'error').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-white/50 text-sm">Total Queries</p>
                <p className="text-3xl font-bold text-purple-500 mt-1">
                  {connections.reduce((acc, c) => acc + (c.queriesCount || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and View Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-900 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm' 
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              )}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list' 
                  ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm' 
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Connections Grid/List */}
        {filteredConnections.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-2xl">
            <Database className="w-16 h-16 text-gray-300 dark:text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-white/70 mb-2">No connections yet</h3>
            <p className="text-gray-500 dark:text-white/50 mb-6 max-w-md mx-auto">
              Add connections from the library to start querying your data with AI
            </p>
            <Link to="/library">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Browse Library
              </Button>
            </Link>
          </div>
        ) : (
          <div className={cn(
            'grid gap-4',
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          )}>
            {filteredConnections.map((conn) => {
              const connInfo = getConnectionInfo(conn.type);
              return (
                <motion.div
                  key={conn.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'group relative bg-gray-50 dark:bg-zinc-900 border rounded-2xl overflow-hidden transition-all hover:shadow-lg',
                    conn.status === 'connected' 
                      ? 'border-green-500/30' 
                      : conn.status === 'error'
                      ? 'border-red-500/30'
                      : 'border-gray-200 dark:border-white/10'
                  )}
                >
                  <div className={cn('p-6', viewMode === 'list' && 'flex items-center gap-6')}>
                    {/* Connection Icon */}
                    <div className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br shadow-lg',
                      connInfo.color
                    )}>
                      {connInfo.icon}
                    </div>
                    
                    {/* Connection Info */}
                    <div className={cn('mt-4', viewMode === 'list' && 'mt-0 flex-1')}>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-black dark:text-white">{conn.name}</h3>
                        {getStatusBadge(conn.status)}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-white/50">{connInfo.name}</p>
                      {conn.host && (
                        <p className="text-xs text-gray-400 dark:text-white/30 mt-1">
                          {conn.host}{conn.port ? `:${conn.port}` : ''}{conn.database ? ` / ${conn.database}` : ''}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className={cn(
                      'flex items-center gap-2 mt-4',
                      viewMode === 'list' && 'mt-0'
                    )}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-200 dark:border-white/10 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                        onClick={() => testConnection(conn.id)}
                        disabled={testingConnection === conn.id}
                      >
                        {testingConnection === conn.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Power className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => startChat(conn.id)}
                      >
                        <Bot className="w-4 h-4 mr-1" />
                        Chat
                      </Button>

                      <div className="relative">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-500 dark:text-white/50"
                          onClick={() => setShowMenu(showMenu === conn.id ? null : conn.id)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>

                        <AnimatePresence>
                          {showMenu === conn.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-10 w-40"
                            >
                              <button
                                onClick={() => {
                                  setShowMenu(null);
                                  // Edit functionality
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setShowMenu(null);
                                  deleteConnection(conn.id);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* MCP Indicator */}
                  <div className="px-6 py-3 bg-gray-100/50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40">
                        <Zap className="w-3 h-3" />
                        MCP Enabled
                      </div>
                      <span className="text-xs text-gray-400 dark:text-white/30">
                        {conn.queriesCount || 0} queries
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Quick Tip */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-black dark:text-white mb-1">AI-Powered CRUD Operations</h3>
              <p className="text-sm text-gray-600 dark:text-white/60">
                Use natural language to Create, Read, Update, and Delete data in your connected systems. 
                The AI chat interface on your Dashboard can query and modify data across all your connections.
              </p>
            </div>
            <Link to="/">
              <Button variant="outline" className="border-blue-500/30 text-blue-500 hover:bg-blue-500/10">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
