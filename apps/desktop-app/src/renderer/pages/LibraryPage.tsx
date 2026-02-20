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
import { CONNECTION_LIBRARY } from '../config/connection-types';

const CATEGORIES = [
 { id: 'all', name: 'All', icon: Grid3x3 },
 { id: 'database', name: 'Databases', icon: Database },
 { id: 'nosql', name: 'NoSQL', icon: HardDrive },
 { id: 'enterprise', name: 'Enterprise', icon: Server },
 { id: 'erp', name: 'ERP', icon: Server },
 { id: 'crm', name: 'CRM & Sales', icon: Headphones },
 { id: 'hcm', name: 'HCM & HR', icon: Server },
 { id: 'healthcare', name: 'Healthcare', icon: Server },
 { id: 'insurance', name: 'Insurance', icon: Server },
 { id: 'supply-chain', name: 'Supply Chain', icon: Warehouse },
 { id: 'finance', name: 'Finance', icon: Server },
 { id: 'commerce', name: 'Commerce', icon: Server },
 { id: 'telecom', name: 'Telecom', icon: Server },
 { id: 'document', name: 'Documents', icon: Server },
 { id: 'government', name: 'Government', icon: Server },
 { id: 'education', name: 'Education', icon: Server },
 { id: 'asset', name: 'Assets', icon: Server },
 { id: 'procurement', name: 'Procurement', icon: Server },
 { id: 'legacy', name: 'Legacy', icon: Server },
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
 <div className="min-h-screen p-6 bg-black text-white">
 <div className="max-w-7xl mx-auto space-y-6">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="font-medium text-white">Connection Library</h1>
 <p className="mt-1 text-white/50">
 Browse and add connections to your workspace
 </p>
 </div>
 </div>

 {/* Search and Filters */}
 <div className="flex items-center gap-4">
 <div className="flex-1 relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
 <input
 type="text"
 placeholder="Search connections..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600/60 bg-zinc-900 border-white/10 placeholder:text-white/40"
 />
 </div>
 <div className="flex items-center gap-2 rounded-lg p-1 bg-zinc-900">
 <button
 onClick={() => setViewMode('grid')}
 className={cn(
 'p-2 rounded-md transition-colors',
 viewMode === 'grid' 
 ? 'shadow-sm bg-background/10 text-white' 
 : 'text-muted-foreground hover:text-white'
 )}
 >
 <Grid3x3 className="w-4 h-4" />
 </button>
 <button
 onClick={() => setViewMode('list')}
 className={cn(
 'p-2 rounded-md transition-colors',
 viewMode === 'list' 
 ? 'shadow-sm bg-background/10 text-white' 
 : 'text-muted-foreground hover:text-white'
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
 ? 'bg-zinc-800 text-white'
 : 'bg-zinc-900 text-white/60 hover:bg-background/10'
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
 'group relative border rounded-2xl overflow-hidden transition-all hover:shadow-lg bg-zinc-900',
 isAdded 
 ? 'border-zinc-700/40' 
 : 'border-white/10 hover:border-white/20'
 )}
 >
 {isAdded && (
 <div className="absolute top-3 right-3 bg-zinc-800 text-white p-1 rounded-full">
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
 <h3 className="font-medium text-white">{conn.name}</h3>
 <p className="mt-1 text-white/50">{conn.description}</p>
 </div>

 <div className={cn('mt-4', viewMode === 'list' && 'mt-0')}>
 {isAdded ? (
 <Button
 variant="outline"
 size="sm"
 className="w-full border-zinc-700/60 text-zinc-400 hover:bg-white/5"
 onClick={() => navigate('/my-connections')}
 >
 <Check className="w-4 h-4 mr-2" />
 Added
 </Button>
 ) : (
 <Button
 size="sm"
 className="w-full bg-white hover:bg-zinc-200 text-black"
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
 <Database className="w-12 h-12 mx-auto mb-4 text-white/20" />
 <h3 className="font-medium text-white/50">No connections found</h3>
 <p className="mt-1 text-white/30">Try adjusting your search or filters</p>
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
 className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden bg-zinc-900"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="p-6 border-b border-white/10">
 <div className="flex items-center gap-4">
 <div className={cn(
 'w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br shadow-lg',
 CONNECTION_LIBRARY[selectedType as keyof typeof CONNECTION_LIBRARY]?.color
 )}>
 {CONNECTION_LIBRARY[selectedType as keyof typeof CONNECTION_LIBRARY]?.icon}
 </div>
 <div>
 <h2 className="font-medium text-white">
 Add {CONNECTION_LIBRARY[selectedType as keyof typeof CONNECTION_LIBRARY]?.name}
 </h2>
 <p className="text-white/50">
 Configure your connection settings
 </p>
 </div>
 </div>
 </div>

 <div className="p-6 space-y-4">
 <div>
 <label className="block font-medium mb-1.5 text-white/70">
 Connection Name
 </label>
 <input
 type="text"
 value={connectionConfig.name}
 onChange={(e) => setConnectionConfig({ ...connectionConfig, name: e.target.value })}
 placeholder="My Database"
 className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600/60 bg-background/5 border-white/10"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block font-medium mb-1.5 text-white/70">
 Host
 </label>
 <input
 type="text"
 value={connectionConfig.host}
 onChange={(e) => setConnectionConfig({ ...connectionConfig, host: e.target.value })}
 placeholder="localhost"
 className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600/60 bg-background/5 border-white/10"
 />
 </div>
 <div>
 <label className="block font-medium mb-1.5 text-white/70">
 Port
 </label>
 <input
 type="number"
 value={connectionConfig.port}
 onChange={(e) => setConnectionConfig({ ...connectionConfig, port: parseInt(e.target.value) })}
 placeholder="5432"
 className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600/60 bg-background/5 border-white/10"
 />
 </div>
 </div>

 <div>
 <label className="block font-medium mb-1.5 text-white/70">
 Database Name
 </label>
 <input
 type="text"
 value={connectionConfig.database}
 onChange={(e) => setConnectionConfig({ ...connectionConfig, database: e.target.value })}
 placeholder="mydb"
 className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600/60 bg-background/5 border-white/10"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block font-medium mb-1.5 text-white/70">
 Username
 </label>
 <input
 type="text"
 value={connectionConfig.username}
 onChange={(e) => setConnectionConfig({ ...connectionConfig, username: e.target.value })}
 placeholder="root"
 className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600/60 bg-background/5 border-white/10"
 />
 </div>
 <div>
 <label className="block font-medium mb-1.5 text-white/70">
 Password
 </label>
 <input
 type="password"
 value={connectionConfig.password}
 onChange={(e) => setConnectionConfig({ ...connectionConfig, password: e.target.value })}
 placeholder="••••••••"
 className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600/60 bg-background/5 border-white/10"
 />
 </div>
 </div>

 <div className="border rounded-xl p-4 bg-white/5 border-zinc-700/30">
 <div className="flex items-start gap-3">
 <Zap className="w-5 h-5 text-zinc-300 mt-0.5" />
 <div>
 <p className="font-medium text-zinc-400">MCP Integration</p>
 <p className="mt-1 text-zinc-400/70">
 This connection will be available via MCP, allowing AI to perform CRUD operations 
 on your data using natural language.
 </p>
 </div>
 </div>
 </div>
 </div>

 <div className="p-6 border-t flex items-center justify-end gap-3 border-white/10">
 <Button
 variant="outline"
 onClick={() => setShowAddModal(false)}
 className="border-white/10"
 >
 Cancel
 </Button>
 <Button
 onClick={saveConnection}
 disabled={!connectionConfig.name || isAdding}
 className="bg-white hover:bg-zinc-200 text-black"
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
