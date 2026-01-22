import React, { useState, useEffect } from 'react';
import { 
  Database, Plus, Edit2, Trash2, Power, PowerOff, 
  CheckCircle, XCircle, Loader2, RefreshCw, Settings,
  Search, Filter, Grid3x3, List
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'mysql' | 'mongodb' | 'postgres' | 'sqlserver' | 'oracle' | 'sap-hana' | 
        'salesforce' | 'servicenow' | 'jira' | 'redis' | 'elasticsearch' | 
        'zendesk' | 'workday' | 'mariadb';
  host?: string;
  port?: number;
  database?: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastConnected?: Date;
  createdAt: Date;
  encrypted: boolean;
}

const DB_ICONS: Record<string, { icon: string; color: string; bgColor: string }> = {
  mysql: { icon: '🐬', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  mongodb: { icon: '🍃', color: 'text-green-600', bgColor: 'bg-green-100' },
  postgres: { icon: '🐘', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  sqlserver: { icon: '🔷', color: 'text-red-600', bgColor: 'bg-red-100' },
  oracle: { icon: '🔴', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  'sap-hana': { icon: '💎', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  salesforce: { icon: '☁️', color: 'text-sky-600', bgColor: 'bg-sky-100' },
  servicenow: { icon: '⚡', color: 'text-teal-600', bgColor: 'bg-teal-100' },
  jira: { icon: '📋', color: 'text-blue-700', bgColor: 'bg-blue-200' },
  redis: { icon: '🔥', color: 'text-red-500', bgColor: 'bg-red-100' },
  elasticsearch: { icon: '🔍', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  zendesk: { icon: '🎫', color: 'text-green-700', bgColor: 'bg-green-200' },
  workday: { icon: '👥', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  mariadb: { icon: '🦭', color: 'text-blue-500', bgColor: 'bg-blue-100' },
};

export default function ConnectionsDashboard() {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState<DatabaseConnection | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setIsLoading(true);
      const conns = await window.electron.getUserConnections();
      setConnections(conns || []);
    } catch (error) {
      console.error('Failed to load connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (connectionId: string) => {
    try {
      setTestingConnection(connectionId);
      const result = await window.electron.testConnection(connectionId);
      
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: result.success ? 'connected' : 'error', lastConnected: new Date() }
          : conn
      ));
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setTestingConnection(null);
    }
  };

  const deleteConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this connection?')) return;

    try {
      await window.electron.deleteConnection(connectionId);
      setConnections(prev => prev.filter(c => c.id !== connectionId));
    } catch (error) {
      console.error('Failed to delete connection:', error);
    }
  };

  const filteredConnections = connections.filter(conn => {
    const matchesSearch = conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conn.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || conn.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const connectionTypes = ['all', ...new Set(connections.map(c => c.type))];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'disconnected':
        return <PowerOff className="w-4 h-4 text-gray-400" />;
      case 'connecting':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Connections</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor your database connections
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Add Connection
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Connections</p>
                <p className="text-2xl font-bold mt-1">{connections.length}</p>
              </div>
              <Database className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {connections.filter(c => c.status === 'connected').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disconnected</p>
                <p className="text-2xl font-bold mt-1 text-gray-600">
                  {connections.filter(c => c.status === 'disconnected').length}
                </p>
              </div>
              <PowerOff className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold mt-1 text-red-600">
                  {connections.filter(c => c.status === 'error').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search connections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border rounded-md bg-background"
        >
          {connectionTypes.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Types' : type.toUpperCase()}
            </option>
          ))}
        </select>
        <div className="flex gap-2 border rounded-md p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={loadConnections}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Connections */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredConnections.length > 0 ? (
        <div className={cn(
          viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-3'
        )}>
          <AnimatePresence>
            {filteredConnections.map((connection) => {
              const dbInfo = DB_ICONS[connection.type] || DB_ICONS.mysql;
              
              return (
                <motion.div
                  key={connection.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="group hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center text-2xl', dbInfo.bgColor)}>
                            {dbInfo.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{connection.name}</CardTitle>
                            <CardDescription className="uppercase text-xs font-medium mt-1">
                              {connection.type}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(connection.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {connection.host && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Host: </span>
                          <span className="font-mono">{connection.host}:{connection.port}</span>
                        </div>
                      )}
                      {connection.database && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Database: </span>
                          <span className="font-mono">{connection.database}</span>
                        </div>
                      )}
                      {connection.lastConnected && (
                        <div className="text-xs text-muted-foreground">
                          Last connected: {new Date(connection.lastConnected).toLocaleString()}
                        </div>
                      )}

                      <div className="flex gap-2 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => testConnection(connection.id)}
                          disabled={testingConnection === connection.id}
                        >
                          {testingConnection === connection.id ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Power className="w-3 h-3 mr-1" />
                          )}
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingConnection(connection)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteConnection(connection.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No connections found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Add your first database connection to get started'}
            </p>
            {!searchQuery && filterType === 'all' && (
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Connection
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
