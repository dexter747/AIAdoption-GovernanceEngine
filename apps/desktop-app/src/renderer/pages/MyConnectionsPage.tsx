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
import { getSimpleConnectionTypes } from '../config/connection-types';

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
const CONNECTION_TYPES = getSimpleConnectionTypes();

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
 <span className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
 <span className="w-2 h-2 bg-zinc-800 rounded-full animate-pulse" />
 Connected
 </span>
 );
 case 'disconnected':
 return (
 <span className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
 <span className="w-2 h-2 bg-zinc-700 rounded-full" />
 Disconnected
 </span>
 );
 case 'connecting':
 return (
 <span className="flex items-center gap-1.5 text-zinc-300 text-xs font-medium">
 <Loader2 className="w-3 h-3 animate-spin" />
 Connecting
 </span>
 );
 case 'error':
 return (
 <span className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
 <span className="w-2 h-2 bg-zinc-800 rounded-full" />
 Error
 </span>
 );
 default:
 return null;
 }
 };

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-black">
 <div className="text-center">
 <Loader2 className="w-8 h-8 text-zinc-300 animate-spin mx-auto mb-4" />
 <p className="text-muted-foreground">Loading connections...</p>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen p-6 bg-black text-white">
 <div className="max-w-7xl mx-auto space-y-6">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="font-medium text-white">My Connections</h1>
 <p className="mt-1 text-white/50">
 Manage your connected databases and services
 </p>
 </div>
 <div className="flex items-center gap-3">
 <Button 
 variant="outline" 
 onClick={loadConnections}
 className="border-white/10 text-white hover:bg-background/10"
 >
 <RefreshCw className="w-4 h-4 mr-2" />
 Refresh
 </Button>
 <Link to="/library">
 <Button className="bg-white hover:bg-zinc-200 text-black">
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
 className="rounded-xl p-5 bg-zinc-900 border-white/10"
 >
 <div className="flex items-center justify-between">
 <div>
 <p className="text-white/50">Total Connections</p>
 <p className="font-medium mt-1 text-white">{connections.length}</p>
 </div>
 <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
 <Database className="w-6 h-6 text-zinc-300" />
 </div>
 </div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="rounded-xl p-5 bg-zinc-900 border-white/10"
 >
 <div className="flex items-center justify-between">
 <div>
 <p className="text-white/50">Active</p>
 <p className="text-3xl font-medium text-zinc-400 mt-1">
 {connections.filter(c => c.status === 'connected').length}
 </p>
 </div>
 <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
 <CheckCircle className="w-6 h-6 text-zinc-400" />
 </div>
 </div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 className="rounded-xl p-5 bg-zinc-900 border-white/10"
 >
 <div className="flex items-center justify-between">
 <div>
 <p className="text-white/50">With Errors</p>
 <p className="text-3xl font-medium text-zinc-400 mt-1">
 {connections.filter(c => c.status === 'error').length}
 </p>
 </div>
 <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
 <XCircle className="w-6 h-6 text-zinc-400" />
 </div>
 </div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 className="rounded-xl p-5 bg-zinc-900 border-white/10"
 >
 <div className="flex items-center justify-between">
 <div>
 <p className="text-white/50">Total Queries</p>
 <p className="text-3xl font-medium text-zinc-300 mt-1">
 {connections.reduce((acc, c) => acc + (c.queriesCount || 0), 0)}
 </p>
 </div>
 <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
 <Zap className="w-6 h-6 text-zinc-300" />
 </div>
 </div>
 </motion.div>
 </div>

 {/* Search and View Toggle */}
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

 {/* Connections Grid/List */}
 {filteredConnections.length === 0 ? (
 <div className="text-center py-16 rounded-2xl bg-zinc-900 border-white/10">
 <Database className="w-16 h-16 mx-auto mb-4 text-white/20" />
 <h3 className="font-medium mb-2 text-white/70">No connections yet</h3>
 <p className="mb-6 max-w-md mx-auto text-white/50">
 Add connections from the library to start querying your data with AI
 </p>
 <Link to="/library">
 <Button className="bg-white hover:bg-zinc-200 text-black">
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
 'group relative border rounded-2xl overflow-hidden transition-all hover:shadow-lg bg-zinc-900',
 conn.status === 'connected' 
 ? 'border-zinc-700/40' 
 : conn.status === 'error'
 ? 'border-zinc-700/40'
 : 'border-white/10'
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
 <h3 className="font-medium text-white">{conn.name}</h3>
 {getStatusBadge(conn.status)}
 </div>
 <p className="text-white/50">{connInfo.name}</p>
 {conn.host && (
 <p className="mt-1 text-white/30">
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
 className="border-white/10 text-white hover:bg-background/10"
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
 className="bg-white hover:bg-zinc-200 text-black"
 onClick={() => startChat(conn.id)}
 >
 <Bot className="w-4 h-4 mr-1" />
 Chat
 </Button>

 <div className="relative">
 <Button
 size="sm"
 variant="ghost"
 className="text-white/50"
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
 className="absolute right-0 top-full mt-1 rounded-xl shadow-xl overflow-hidden z-10 w-40 bg-zinc-800 border-white/10"
 >
 <button
 onClick={() => {
 setShowMenu(null);
 // Edit functionality
 }}
 className="w-full flex items-center gap-2 px-4 py-2.5 text-white/70 hover:bg-background/10"
 >
 <Edit2 className="w-4 h-4" />
 Edit
 </button>
 <button
 onClick={() => {
 setShowMenu(null);
 deleteConnection(conn.id);
 }}
 className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 hover:bg-white/5"
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
 <div className="px-6 py-3 border-t bg-background/5 border-white/10">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2 text-white/40">
 <Zap className="w-3 h-3" />
 MCP Enabled
 </div>
 <span className="text-white/30">
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
 <div className="bg-gradient-to-r from-white/5 to-white/5 border border-zinc-700/30 rounded-2xl p-6">
 <div className="flex items-start gap-4">
 <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
 <Bot className="w-5 h-5 text-zinc-300" />
 </div>
 <div className="flex-1">
 <h3 className="font-medium mb-1 text-white">AI-Powered CRUD Operations</h3>
 <p className="text-white/60">
 Use natural language to Create, Read, Update, and Delete data in your connected systems. 
 The AI chat interface on your Dashboard can query and modify data across all your connections.
 </p>
 </div>
 <Link to="/">
 <Button variant="outline" className="border-zinc-700/40 text-zinc-300 hover:bg-white/5">
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
