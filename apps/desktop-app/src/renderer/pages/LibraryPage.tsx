import { useState, useEffect } from 'react';
import { 
  Search, Grid3x3, List, Plus, Check,
  Database, Server, HardDrive, Warehouse, Headphones,
  Loader2, Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Comprehensive connection types - all available integrations
const CONNECTION_LIBRARY = {
  // Relational Databases
  mysql: { 
    icon: '🐬', 
    name: 'MySQL', 
    description: 'Open-source relational database',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    category: 'database'
  },
  postgres: { 
    icon: '🐘', 
    name: 'PostgreSQL', 
    description: 'Advanced open-source database',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    category: 'database'
  },
  mariadb: { 
    icon: '🦭', 
    name: 'MariaDB', 
    description: 'MySQL-compatible database',
    color: 'from-sky-500 to-sky-600',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    category: 'database'
  },
  sqlserver: { 
    icon: '🔷', 
    name: 'SQL Server', 
    description: 'Microsoft enterprise database',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    category: 'database'
  },
  oracle: { 
    icon: '🔴', 
    name: 'Oracle', 
    description: 'Enterprise-grade database',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    category: 'database'
  },
  sqlite: { 
    icon: '📦', 
    name: 'SQLite', 
    description: 'Lightweight embedded database',
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    category: 'database'
  },
  
  // NoSQL Databases
  mongodb: { 
    icon: '🍃', 
    name: 'MongoDB', 
    description: 'Document-oriented NoSQL database',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    category: 'nosql'
  },
  redis: { 
    icon: '🔥', 
    name: 'Redis', 
    description: 'In-memory data store',
    color: 'from-red-400 to-red-500',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/30',
    category: 'nosql'
  },
  elasticsearch: { 
    icon: '🔍', 
    name: 'Elasticsearch', 
    description: 'Search and analytics engine',
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    category: 'nosql'
  },
  dynamodb: { 
    icon: '⚡', 
    name: 'DynamoDB', 
    description: 'AWS managed NoSQL database',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    category: 'nosql'
  },
  cassandra: { 
    icon: '👁️', 
    name: 'Cassandra', 
    description: 'Distributed NoSQL database',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    category: 'nosql'
  },
  
  // Enterprise Systems
  'sap-hana': { 
    icon: '💎', 
    name: 'SAP HANA', 
    description: 'In-memory enterprise platform',
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    category: 'enterprise'
  },
  salesforce: { 
    icon: '☁️', 
    name: 'Salesforce', 
    description: 'CRM and enterprise cloud platform',
    color: 'from-sky-400 to-sky-500',
    bgColor: 'bg-sky-400/10',
    borderColor: 'border-sky-400/30',
    category: 'enterprise'
  },
  servicenow: { 
    icon: '⚡', 
    name: 'ServiceNow', 
    description: 'IT service management platform',
    color: 'from-teal-400 to-teal-500',
    bgColor: 'bg-teal-400/10',
    borderColor: 'border-teal-400/30',
    category: 'enterprise'
  },
  workday: { 
    icon: '👥', 
    name: 'Workday', 
    description: 'HR and finance management',
    color: 'from-orange-400 to-orange-500',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400/30',
    category: 'enterprise'
  },
  jira: { 
    icon: '📋', 
    name: 'Jira', 
    description: 'Project and issue tracking',
    color: 'from-blue-400 to-blue-500',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/30',
    category: 'enterprise'
  },
  confluence: { 
    icon: '📝', 
    name: 'Confluence', 
    description: 'Team collaboration and documentation',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    category: 'enterprise'
  },
  
  // Support & CRM
  zendesk: { 
    icon: '🎫', 
    name: 'Zendesk', 
    description: 'Customer support platform',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    category: 'crm'
  },
  hubspot: { 
    icon: '🧡', 
    name: 'HubSpot', 
    description: 'Marketing and sales CRM',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    category: 'crm'
  },
  intercom: { 
    icon: '💬', 
    name: 'Intercom', 
    description: 'Customer messaging platform',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    category: 'crm'
  },
  freshdesk: { 
    icon: '🎯', 
    name: 'Freshdesk', 
    description: 'Help desk software',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    category: 'crm'
  },
  
  // Cloud Data Warehouses
  snowflake: { 
    icon: '❄️', 
    name: 'Snowflake', 
    description: 'Cloud data platform',
    color: 'from-cyan-400 to-cyan-500',
    bgColor: 'bg-cyan-400/10',
    borderColor: 'border-cyan-400/30',
    category: 'warehouse'
  },
  bigquery: { 
    icon: '📊', 
    name: 'BigQuery', 
    description: 'Google serverless data warehouse',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    category: 'warehouse'
  },
  redshift: { 
    icon: '🔶', 
    name: 'Redshift', 
    description: 'AWS cloud data warehouse',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    category: 'warehouse'
  },
  databricks: { 
    icon: '🧱', 
    name: 'Databricks', 
    description: 'Unified analytics platform',
    color: 'from-red-400 to-orange-500',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/30',
    category: 'warehouse'
  },
  
  // MCP Servers / Custom
  'mcp-server': { 
    icon: '🔌', 
    name: 'MCP Server', 
    description: 'Model Context Protocol server',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    category: 'mcp'
  },
  'custom-api': { 
    icon: '🔗', 
    name: 'Custom API', 
    description: 'Connect to any REST/GraphQL API',
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    category: 'mcp'
  },
};

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Grid3x3 },
  { id: 'database', name: 'Databases', icon: Database },
  { id: 'nosql', name: 'NoSQL', icon: HardDrive },
  { id: 'enterprise', name: 'Enterprise', icon: Server },
  { id: 'crm', name: 'CRM & Support', icon: Headphones },
  { id: 'warehouse', name: 'Data Warehouse', icon: Warehouse },
  { id: 'mcp', name: 'MCP & APIs', icon: Zap },
];

interface ConnectionConfig {
  type: string;
  name: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  [key: string]: any;
}

export default function LibraryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [userConnections, setUserConnections] = useState<string[]>([]);
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfig>({
    type: '',
    name: '',
    host: '',
    port: 5432,
    database: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    loadUserConnections();
  }, []);

  const loadUserConnections = async () => {
    try {
      // Try MCP (local) first, fall back to Express API
      const conns = await window.electron.mcp?.getAllConnections?.()
        || await window.electron.express?.getUserConnections?.()
        || [];
      const result = conns as any;
      const connsArray = Array.isArray(result) ? result : result?.data || [];
      setUserConnections(connsArray.map((c: any) => c.type));
    } catch (error: any) {
      // Silently handle API key errors - user might not have backend configured yet
      if (!error?.message?.includes('Invalid API key')) {
        console.error('Failed to load connections:', error);
      }
    }
  };

  const filteredConnections = Object.entries(CONNECTION_LIBRARY).filter(([_key, value]) => {
    const matchesSearch = value.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         value.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || value.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddConnection = (type: string) => {
    const connType = CONNECTION_LIBRARY[type as keyof typeof CONNECTION_LIBRARY];
    setSelectedType(type);
    setConnectionConfig({
      type,
      name: `My ${connType.name}`,
      host: '',
      port: type === 'mysql' || type === 'mariadb' ? 3306 : 
            type === 'postgres' ? 5432 : 
            type === 'mongodb' ? 27017 :
            type === 'redis' ? 6379 : 5432,
      database: '',
      username: '',
      password: '',
    });
    setShowAddModal(true);
  };

  const saveConnection = async () => {
    if (!connectionConfig.name) return;
    
    setIsAdding(true);
    try {
      // Create the connection using the express API or MCP
      const expressAPI = window.electron.express;
      const mcpAPI = window.electron.mcp;
      
      if (expressAPI?.addUserConnection) {
        await expressAPI.addUserConnection(
          connectionConfig.name,
          connectionConfig.type,
          {
            host: connectionConfig.host,
            port: connectionConfig.port,
            database: connectionConfig.database,
            username: connectionConfig.username,
            password: connectionConfig.password,
            encrypted: true,
          }
        );
      } else if (mcpAPI?.addConnection) {
        await mcpAPI.addConnection({
          name: connectionConfig.name,
          type: connectionConfig.type as any,
          host: connectionConfig.host,
          port: connectionConfig.port,
          enabled: true,
        });
      }
      
      setShowAddModal(false);
      setSelectedType(null);
      await loadUserConnections();
      
      // Navigate to My Connections page
      navigate('/my-connections');
    } catch (error) {
      console.error('Failed to create connection:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">Connection Library</h1>
            <p className="text-gray-500 dark:text-white/50 mt-1">
              Browse and add connections to your workspace
            </p>
          </div>
        </div>

        {/* Search and Filters */}
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

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                selectedCategory === cat.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/10'
              )}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Connection Grid */}
        <div className={cn(
          'grid gap-4',
          viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
        )}>
          {filteredConnections.map(([key, conn]) => {
            const isAdded = userConnections.includes(key);
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'group relative bg-gray-50 dark:bg-zinc-900 border rounded-2xl overflow-hidden transition-all hover:shadow-lg',
                  isAdded 
                    ? 'border-green-500/50 dark:border-green-500/30' 
                    : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                )}
              >
                {isAdded && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white p-1 rounded-full">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                
                <div className={cn('p-6', viewMode === 'list' && 'flex items-center gap-6')}>
                  <div className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br shadow-lg',
                    conn.color
                  )}>
                    {conn.icon}
                  </div>
                  
                  <div className={cn('mt-4', viewMode === 'list' && 'mt-0 flex-1')}>
                    <h3 className="text-lg font-semibold text-black dark:text-white">{conn.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-white/50 mt-1">{conn.description}</p>
                  </div>

                  <div className={cn('mt-4', viewMode === 'list' && 'mt-0')}>
                    {isAdded ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-green-500/50 text-green-500 hover:bg-green-500/10"
                        onClick={() => navigate('/my-connections')}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Added
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => handleAddConnection(key)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredConnections.length === 0 && (
          <div className="text-center py-16">
            <Database className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 dark:text-white/50">No connections found</h3>
            <p className="text-sm text-gray-400 dark:text-white/30 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Add Connection Modal */}
      <AnimatePresence>
        {showAddModal && selectedType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br shadow-lg',
                    CONNECTION_LIBRARY[selectedType as keyof typeof CONNECTION_LIBRARY]?.color
                  )}>
                    {CONNECTION_LIBRARY[selectedType as keyof typeof CONNECTION_LIBRARY]?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-black dark:text-white">
                      Add {CONNECTION_LIBRARY[selectedType as keyof typeof CONNECTION_LIBRARY]?.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-white/50">
                      Configure your connection settings
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1.5">
                    Connection Name
                  </label>
                  <input
                    type="text"
                    value={connectionConfig.name}
                    onChange={(e) => setConnectionConfig({ ...connectionConfig, name: e.target.value })}
                    placeholder="My Database"
                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1.5">
                      Host
                    </label>
                    <input
                      type="text"
                      value={connectionConfig.host}
                      onChange={(e) => setConnectionConfig({ ...connectionConfig, host: e.target.value })}
                      placeholder="localhost"
                      className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1.5">
                      Port
                    </label>
                    <input
                      type="number"
                      value={connectionConfig.port}
                      onChange={(e) => setConnectionConfig({ ...connectionConfig, port: parseInt(e.target.value) })}
                      placeholder="5432"
                      className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1.5">
                    Database Name
                  </label>
                  <input
                    type="text"
                    value={connectionConfig.database}
                    onChange={(e) => setConnectionConfig({ ...connectionConfig, database: e.target.value })}
                    placeholder="mydb"
                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      value={connectionConfig.username}
                      onChange={(e) => setConnectionConfig({ ...connectionConfig, username: e.target.value })}
                      placeholder="root"
                      className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      value={connectionConfig.password}
                      onChange={(e) => setConnectionConfig({ ...connectionConfig, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-400">MCP Integration</p>
                      <p className="text-xs text-blue-600 dark:text-blue-300/70 mt-1">
                        This connection will be available via MCP, allowing AI to perform CRUD operations 
                        on your data using natural language.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-white/10 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="border-gray-200 dark:border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveConnection}
                  disabled={!connectionConfig.name || isAdding}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Connection
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
