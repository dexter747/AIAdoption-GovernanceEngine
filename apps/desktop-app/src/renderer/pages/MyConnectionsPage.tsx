import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
 Database, Plus, Trash2, RefreshCw,
 Loader2, Search, Grid3x3, List,
 Power, Bot
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { getSimpleConnectionTypes, CONNECTION_LIBRARY } from '../config/connection-types';
import ConnectionIcon from '../components/ConnectionIcon';

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
 <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500/80">
 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Live
 </span>
 );
 case 'disconnected':
 return (
 <span className="flex items-center gap-1 text-[10px] font-medium text-white/30">
 <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />Off
 </span>
 );
 case 'connecting':
 return (
 <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400/70">
 <Loader2 className="w-2.5 h-2.5 animate-spin" />Connecting
 </span>
 );
 case 'error':
 return (
 <span className="flex items-center gap-1 text-[10px] font-medium text-red-400/70">
 <span className="w-1.5 h-1.5 bg-red-500/70 rounded-full" />Error
 </span>
 );
 default:
 return null;
 }
 };

 if (isLoading) {
 return (
 <div className="h-full flex items-center justify-center bg-[#0b0b0b]">
 <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
 </div>
 );
 }

 const connected = connections.filter(c => c.status === 'connected').length;
 const errored   = connections.filter(c => c.status === 'error').length;
 const queries   = connections.reduce((a, c) => a + (c.queriesCount || 0), 0);

 return (
 <div className="h-full flex flex-col overflow-hidden">

 {/* ── Toolbar ──────────────────────────────────────────── */}
 <div className="toolbar app-region-drag">
 <h1 className="text-[13px] font-medium text-white/80 mr-3 app-region-no-drag select-none">
 My Connections
 </h1>
 <div className="w-px h-4 bg-white/[0.08] mx-1" />
 {/* stat pills */}
 <div className="flex items-center gap-2 app-region-no-drag">
 <span className="text-[11px] text-white/40 tabular-nums">{connections.length} total</span>
 {connected > 0 && <span className="text-[11px] text-emerald-500/70 tabular-nums">{connected} live</span>}
 {errored  > 0 && <span className="text-[11px] text-red-500/60 tabular-nums">{errored} err</span>}
 {queries  > 0 && <span className="text-[11px] text-white/30 tabular-nums">{queries} queries</span>}
 </div>
 <div className="flex-1" />
 {/* search */}
 <div className="relative app-region-no-drag">
 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
 <input
 type="text"
 placeholder="Filter connections…"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="input-desktop pl-7 w-44"
 />
 </div>
 {/* view toggle */}
 <div className="flex items-center gap-0.5 bg-white/[0.05] rounded-[6px] p-0.5 app-region-no-drag">
 {([['grid', Grid3x3], ['list', List]] as const).map(([m, Icon]) => (
 <button key={m} onClick={() => setViewMode(m)}
 className={cn('p-1.5 rounded-[5px] transition-all',
 viewMode === m ? 'bg-white/[0.1] text-white' : 'text-white/30 hover:text-white/60')}>
 <Icon className="w-3 h-3" />
 </button>
 ))}
 </div>
 <div className="w-px h-4 bg-white/[0.08] mx-1" />
 {/* action buttons */}
 <button onClick={loadConnections}
 className="app-region-no-drag h-6 px-2.5 rounded-[5px] text-[11px] font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.05] flex items-center gap-1.5 transition-all">
 <RefreshCw className="w-3 h-3" />
 </button>
 <Link to="/library"
 className="app-region-no-drag h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-white/[0.08] text-white/70 hover:bg-white/[0.13] flex items-center gap-1.5 transition-all">
 <Plus className="w-3 h-3" />Add
 </Link>
 </div>

 {/* ── Content ──────────────────────────────────────────── */}
 <div className="flex-1 overflow-auto p-4 bg-[#0b0b0b]">
 {filteredConnections.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center gap-3">
 <Database className="w-8 h-8 text-white/15" />
 <p className="text-[12px] text-white/30">
 {connections.length === 0
 ? 'No connections yet — browse the Library to add one'
 : 'No connections match your filter'}
 </p>
 {connections.length === 0 && (
 <Link to="/library"
 className="mt-1 h-7 px-3.5 rounded-[6px] text-[12px] font-medium bg-white/[0.07] text-white/60 hover:bg-white/[0.12] flex items-center gap-1.5 transition-all">
 <Plus className="w-3 h-3" />Browse Library
 </Link>
 )}
 </div>
 ) : viewMode === 'grid' ? (
 <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
 {filteredConnections.map((conn) => {
 const connInfo = getConnectionInfo(conn.type);
 return (
 <motion.div key={conn.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
 className="group flex flex-col gap-2.5 p-3 rounded-lg border border-white/[0.07] bg-[#111] hover:bg-[#151515] transition-colors">
 <div className="flex items-start justify-between">
 <ConnectionIcon logo={CONNECTION_LIBRARY[conn.type]?.logo} icon={connInfo.icon}
 color={connInfo.color} bgColor={CONNECTION_LIBRARY[conn.type]?.bgColor ?? 'bg-gray-500/10'} size="sm" />
 {getStatusBadge(conn.status)}
 </div>
 <div>
 <p className="text-[12.5px] font-medium text-white/80 truncate">{conn.name}</p>
 <p className="text-[11px] text-white/35">{connInfo.name}</p>
 {conn.host && <p className="text-[10.5px] text-white/25 font-mono mt-0.5 truncate">{conn.host}{conn.port ? `:${conn.port}` : ''}</p>}
 </div>
 <div className="flex items-center gap-1.5 mt-auto">
 <button onClick={() => testConnection(conn.id)} disabled={testingConnection === conn.id}
 className="h-6 px-2 rounded-[5px] text-[11px] text-white/40 hover:text-white/70 hover:bg-white/[0.06] flex items-center gap-1 transition-all">
 {testingConnection === conn.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}
 </button>
 <button onClick={() => startChat(conn.id)}
 className="flex-1 h-6 rounded-[5px] text-[11px] font-medium bg-white/[0.07] text-white/70 hover:bg-white/[0.12] flex items-center justify-center gap-1.5 transition-all">
 <Bot className="w-3 h-3" />Chat
 </button>
 <button onClick={() => deleteConnection(conn.id)}
 className="h-6 px-2 rounded-[5px] text-[11px] text-white/25 hover:text-red-400/70 hover:bg-white/[0.04] flex items-center transition-all">
 <Trash2 className="w-3 h-3" />
 </button>
 </div>
 </motion.div>
 );
 })}
 </div>
 ) : (
 /* List view */
 <div className="rounded-lg border border-white/[0.07] overflow-hidden">
 {/* List header */}
 <div className="grid grid-cols-[28px_1fr_140px_80px_100px] items-center gap-3 px-3 py-2 border-b border-white/[0.07] bg-[#0e0e0e]">
 <div />
 <span className="text-[10.5px] font-medium text-white/25 uppercase tracking-wider">Name</span>
 <span className="text-[10.5px] font-medium text-white/25 uppercase tracking-wider">Host</span>
 <span className="text-[10.5px] font-medium text-white/25 uppercase tracking-wider">Status</span>
 <span className="text-[10.5px] font-medium text-white/25 uppercase tracking-wider text-right">Actions</span>
 </div>
 {filteredConnections.map((conn, i) => {
 const connInfo = getConnectionInfo(conn.type);
 return (
 <div key={conn.id}
 className={cn('grid grid-cols-[28px_1fr_140px_80px_100px] items-center gap-3 px-3 py-2 border-b border-white/[0.04] transition-colors',
 i % 2 === 0 ? 'bg-[#0d0d0d] hover:bg-[#101010]' : 'bg-[#0b0b0b] hover:bg-[#0e0e0e]')}>
 <ConnectionIcon logo={CONNECTION_LIBRARY[conn.type]?.logo} icon={connInfo.icon}
 color={connInfo.color} bgColor={CONNECTION_LIBRARY[conn.type]?.bgColor ?? 'bg-gray-500/10'} size="sm"
 className="!w-7 !h-7 rounded-md" />
 <div className="min-w-0">
 <p className="text-[12px] font-medium text-white/80 truncate">{conn.name}</p>
 <p className="text-[10.5px] text-white/35 truncate">{connInfo.name}</p>
 </div>
 <p className="text-[11px] text-white/30 font-mono truncate">
 {conn.host ? `${conn.host}${conn.port ? `:${conn.port}` : ''}` : '—'}
 </p>
 <div>{getStatusBadge(conn.status)}</div>
 <div className="flex items-center gap-1 justify-end">
 <button onClick={() => testConnection(conn.id)} disabled={testingConnection === conn.id}
 className="h-6 px-2 rounded-[5px] text-[11px] text-white/35 hover:text-white/60 hover:bg-white/[0.05] transition-all">
 {testingConnection === conn.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}
 </button>
 <button onClick={() => startChat(conn.id)}
 className="h-6 px-2 rounded-[5px] text-[11px] font-medium bg-white/[0.06] text-white/60 hover:bg-white/[0.11] flex items-center gap-1 transition-all">
 <Bot className="w-3 h-3" />
 </button>
 <button onClick={() => deleteConnection(conn.id)}
 className="h-6 px-2 rounded-[5px] text-[11px] text-white/20 hover:text-red-400/60 hover:bg-white/[0.04] transition-all">
 <Trash2 className="w-3 h-3" />
 </button>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 );
}
