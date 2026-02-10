import { useState, useEffect } from 'react';
import { 
  Database, Plus, Edit2, Trash2, PowerOff, 
  CheckCircle, XCircle, Loader2, RefreshCw,
  Search, Grid3x3, List, Shield,
  Server, Zap, HardDrive, Warehouse, Headphones
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CONNECTION_LIBRARY as CONNECTION_TYPES } from '../config/connection-types';

interface DatabaseConnection {
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
}

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Grid3x3 },
  { id: 'database', name: 'Databases', icon: Database },
  { id: 'nosql', name: 'NoSQL', icon: HardDrive },
  { id: 'enterprise', name: 'Enterprise', icon: Server },
  { id: 'crm', name: 'CRM & Support', icon: Headphones },
  { id: 'warehouse', name: 'Data Warehouse', icon: Warehouse },
];

export default function ConnectionsDashboard() {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

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
      setConnections(connsArray);
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

  // Filter connections
  const filteredConnections = connections.filter(conn => {
    const matchesSearch = conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conn.type.toLowerCase().includes(searchQuery.toLowerCase());
    const connType = CONNECTION_TYPES[conn.type as keyof typeof CONNECTION_TYPES];
    const matchesCategory = selectedCategory === 'all' || connType?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter available connection types by category for "Add New" section
  const filteredTypes = Object.entries(CONNECTION_TYPES).filter(([_key, value]) => 
    selectedCategory === 'all' || value.category === selectedCategory
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <span className="flex items-center gap-1.5 text-green-400 text-xs">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Connected
          </span>
        );
      case 'disconnected':
        return (
          <span className="flex items-center gap-1.5 text-white/40 text-xs">
            <span className="w-2 h-2 bg-white/40 rounded-full" />
            Disconnected
          </span>
        );
      case 'connecting':
        return (
          <span className="flex items-center gap-1.5 text-blue-400 text-xs">
            <Loader2 className="w-3 h-3 animate-spin" />
            Connecting
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 text-red-400 text-xs">
            <span className="w-2 h-2 bg-red-400 rounded-full" />
            Error
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium text-black dark:text-white">Connections</h1>
            <p className="text-gray-500 dark:text-white/50 mt-1">
              Connect your databases and enterprise systems
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
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-white/50 text-sm">Total Connections</p>
                <p className="text-3xl font-medium text-black dark:text-white mt-1">{connections.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-400" />
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
                <p className="text-3xl font-medium mt-1 text-green-500">
                  {connections.filter(c => c.status === 'connected').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
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
                <p className="text-gray-500 dark:text-white/50 text-sm">Inactive</p>
                <p className="text-3xl font-medium mt-1 text-gray-600 dark:text-white/60">
                  {connections.filter(c => c.status === 'disconnected').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                <PowerOff className="w-6 h-6 text-gray-400 dark:text-white/40" />
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
                <p className="text-gray-500 dark:text-white/50 text-sm">Errors</p>
                <p className="text-3xl font-medium mt-1 text-red-500">
                  {connections.filter(c => c.status === 'error').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-white dark:bg-white/10' : 'text-gray-500 dark:text-white/60 hover:text-black dark:hover:text-white'}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-white dark:bg-white/10' : 'text-gray-500 dark:text-white/60 hover:text-black dark:hover:text-white'}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Existing Connections */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : filteredConnections.length > 0 ? (
          <div>
            <h2 className="text-lg font-medium mb-4">Your Connections</h2>
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                : 'space-y-3'
            )}>
              <AnimatePresence>
                {filteredConnections.map((connection, index) => {
                  const connType = CONNECTION_TYPES[connection.type as keyof typeof CONNECTION_TYPES] 
                    || CONNECTION_TYPES.mysql;
                  
                  return (
                    <motion.div
                      key={connection.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'group bg-white/5 border rounded-xl overflow-hidden hover:border-white/20 transition-all',
                        connType.borderColor
                      )}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                              connType.bgColor
                            )}>
                              {connType.icon}
                            </div>
                            <div>
                              <h3 className="font-medium">{connection.name}</h3>
                              <p className="text-white/50 text-sm">{connType.name}</p>
                            </div>
                          </div>
                          {getStatusBadge(connection.status)}
                        </div>

                        {connection.host && (
                          <div className="text-sm text-white/40 mb-3 font-mono truncate">
                            {connection.host}:{connection.port || 'default'}
                          </div>
                        )}

                        {connection.database && (
                          <div className="text-sm text-white/60 mb-3">
                            Database: <span className="font-mono">{connection.database}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 text-white/60 hover:text-white hover:bg-white/10"
                            onClick={() => testConnection(connection.id)}
                            disabled={testingConnection === connection.id}
                          >
                            {testingConnection === connection.id ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Zap className="w-3 h-3 mr-1" />
                            )}
                            Test
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/60 hover:text-white hover:bg-white/10"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/60 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => deleteConnection(connection.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ) : connections.length === 0 ? null : (
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
            <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No connections found</h3>
            <p className="text-white/50">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Add New Connection Section */}
        <div>
          <h2 className="text-lg font-medium mb-4">
            {connections.length === 0 ? 'Get Started - Add a Connection' : 'Add New Connection'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredTypes.map(([key, config], index) => (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedType(key)}
                className={cn(
                  'group relative p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all text-left',
                  selectedType === key && 'border-blue-500 bg-blue-500/10'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3',
                  config.bgColor
                )}>
                  {config.icon}
                </div>
                <h3 className="font-medium text-sm">{config.name}</h3>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-4 h-4 text-white/40" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Quick Setup Guide */}
        {connections.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">Quick Setup Guide</h3>
                <div className="space-y-2 text-white/70 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center">1</span>
                    Select a connection type above
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center">2</span>
                    Enter your database credentials
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center">3</span>
                    Test the connection
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center">4</span>
                    Start querying with natural language!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Note */}
        <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
          <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-sm text-white/60">
            All connections are encrypted and stored securely on your local device. 
            Your credentials never leave your machine.
          </p>
        </div>
      </div>
    </div>
  );
}
