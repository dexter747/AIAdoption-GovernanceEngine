import { useState, useEffect } from 'react';
import {
 Database, Plus, Trash2, X,
 Loader2, RefreshCw,
 Search, Grid3x3, List, Shield,
 Zap, HardDrive, Warehouse,
 Building2, Briefcase, Users, Heart, Truck,
 Banknote, ShoppingCart, Radio, FileText, Landmark, Monitor,
 CheckCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CONNECTION_LIBRARY as CONNECTION_TYPES } from '../config/connection-types';
import ConnectionIcon from '../components/ConnectionIcon';

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
  { id: 'all',          name: 'All',           icon: Grid3x3 },
  { id: 'database',     name: 'Databases',     icon: Database },
  { id: 'nosql',        name: 'NoSQL',         icon: HardDrive },
  { id: 'enterprise',   name: 'Enterprise',    icon: Building2 },
  { id: 'erp',          name: 'ERP',           icon: Briefcase },
  { id: 'crm',          name: 'CRM & Sales',   icon: Users },
  { id: 'hcm',          name: 'HCM & HR',      icon: Heart },
  { id: 'healthcare',   name: 'Healthcare',    icon: Heart },
  { id: 'insurance',    name: 'Insurance',     icon: Shield },
  { id: 'supply-chain', name: 'Supply Chain',  icon: Truck },
  { id: 'finance',      name: 'Finance',       icon: Banknote },
  { id: 'commerce',     name: 'Commerce',      icon: ShoppingCart },
  { id: 'telecom',      name: 'Telecom',       icon: Radio },
  { id: 'document',     name: 'Documents',     icon: FileText },
  { id: 'government',   name: 'Government',    icon: Landmark },
  { id: 'legacy',       name: 'Mainframe',     icon: Monitor },
  { id: 'warehouse',    name: 'Data Warehouse',icon: Warehouse },
  { id: 'mcp',          name: 'MCP & APIs',    icon: Zap },
];

export default function ConnectionsDashboard() {
 const [connections, setConnections] = useState<DatabaseConnection[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('all');
 const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
 const [selectedType, setSelectedType] = useState<string | null>(null);
 const [testingConnection, setTestingConnection] = useState<string | null>(null);
 const [showAddModal, setShowAddModal] = useState(false);
 const [addForm, setAddForm] = useState({ name: '', host: '', port: '', database: '', username: '', password: '', ssl: false });
 const [addLoading, setAddLoading] = useState(false);
 const [addError, setAddError] = useState<string | null>(null);

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
 case 'connected': return <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500/80"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Live</span>;
 case 'disconnected': return <span className="flex items-center gap-1 text-[10px] font-medium text-white/30"><span className="w-1.5 h-1.5 bg-white/20 rounded-full" />Off</span>;
 case 'connecting': return <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400/70"><Loader2 className="w-2.5 h-2.5 animate-spin" />…</span>;
 case 'error': return <span className="flex items-center gap-1 text-[10px] font-medium text-red-400/70"><span className="w-1.5 h-1.5 bg-red-500/70 rounded-full" />Err</span>;
 default: return null;
 }
 };

 return (
 <div className="h-full flex flex-col overflow-hidden">

 {/* ── Toolbar ─────────────────────────────────────────── */}
 <div className="toolbar app-region-drag">
 <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">Connections</h1>
 <div className="w-px h-4 bg-white/[0.08] mx-3" />
 <div className="flex items-center gap-3 app-region-no-drag text-[11px] text-white/40">
 <span className="tabular-nums"><strong className="text-white/60 font-medium">{connections.length}</strong> total</span>
 {connections.filter(c => c.status === 'connected').length > 0 &&
 <span className="text-emerald-500/65 tabular-nums">{connections.filter(c => c.status === 'connected').length} live</span>}
 {connections.filter(c => c.status === 'error').length > 0 &&
 <span className="text-red-400/60 tabular-nums">{connections.filter(c => c.status === 'error').length} err</span>}
 </div>
 <div className="flex-1" />
 {/* search */}
 <div className="relative app-region-no-drag">
 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
 <input type="text" placeholder="Search…" value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 className="input-desktop pl-7 w-44" />
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
 <button onClick={loadConnections}
 className="app-region-no-drag h-6 px-2 rounded-[5px] text-[11px] text-white/35 hover:text-white/60 hover:bg-white/[0.05] flex items-center transition-all">
 <RefreshCw className="w-3 h-3" />
 </button>
 </div>

 {/* ── Category strip ──────────────────────────────────── */}
 <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/[0.05] overflow-x-auto shrink-0 scrollbar-none">
 {CATEGORIES.map(cat => {
 const Icon = cat.icon;
 return (
 <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
 className={cn('tab-strip-item whitespace-nowrap flex items-center gap-1.5',
 selectedCategory === cat.id ? 'is-active' : '')}>
 <Icon className="w-3 h-3" />{cat.name}
 </button>
 );
 })}
 </div>

 {/* ── Content ─────────────────────────────────────────── */}
 <div className="flex-1 overflow-auto p-4 space-y-6">

 {/* Existing connections */}
 {isLoading ? (
 <div className="flex items-center justify-center py-12">
 <Loader2 className="w-5 h-5 animate-spin text-white/20" />
 </div>
 ) : filteredConnections.length > 0 && (
 <div>
 <p className="text-[10.5px] font-medium text-white/30 uppercase tracking-wider mb-2.5">Your Connections</p>
 {viewMode === 'grid' ? (
 <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
 {filteredConnections.map(conn => {
 const ct = CONNECTION_TYPES[conn.type as keyof typeof CONNECTION_TYPES] || CONNECTION_TYPES.mysql;
 return (
 <div key={conn.id}
 className="group flex flex-col gap-2.5 p-3 rounded-lg border border-white/[0.07] bg-[#111] hover:bg-[#151515] transition-colors">
 <div className="flex items-start justify-between">
 <ConnectionIcon logo={ct.logo} icon={ct.icon} color={ct.color} bgColor={ct.bgColor} size="sm" />
 {getStatusBadge(conn.status)}
 </div>
 <div className="min-w-0">
 <p className="text-[12.5px] font-medium text-white/80 truncate">{conn.name}</p>
 <p className="text-[11px] text-white/35">{ct.name}</p>
 {conn.host && <p className="text-[10.5px] text-white/22 font-mono mt-0.5 truncate">{conn.host}{conn.port ? `:${conn.port}` : ''}</p>}
 </div>
 <div className="flex items-center gap-1.5">
 <button onClick={() => testConnection(conn.id)} disabled={testingConnection === conn.id}
 className="h-6 px-2 rounded-[5px] text-[11px] text-white/40 hover:text-white/70 hover:bg-white/[0.06] flex items-center gap-1 transition-all flex-1 justify-center">
 {testingConnection === conn.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Zap className="w-3 h-3" />Test</>}
 </button>
 <button onClick={() => deleteConnection(conn.id)}
 className="h-6 px-2 rounded-[5px] text-[11px] text-white/20 hover:text-red-400/60 hover:bg-white/[0.04] flex items-center transition-all">
 <Trash2 className="w-3 h-3" />
 </button>
 </div>
 </div>
 );
 })}
 </div>
 ) : (
 <div className="rounded-lg border border-white/[0.07] overflow-hidden">
 <div className="grid grid-cols-[28px_1fr_140px_80px_100px] gap-3 px-3 py-2 border-b border-white/[0.07] bg-[#0e0e0e]">
 <div /><span className="text-[10.5px] font-medium text-white/25 uppercase tracking-wider">Name</span>
 <span className="text-[10.5px] font-medium text-white/25 uppercase tracking-wider">Host</span>
 <span className="text-[10.5px] font-medium text-white/25 uppercase tracking-wider">Status</span>
 <span className="text-[10.5px] font-medium text-white/25 uppercase tracking-wider text-right">Actions</span>
 </div>
 {filteredConnections.map((conn, i) => {
 const ct = CONNECTION_TYPES[conn.type as keyof typeof CONNECTION_TYPES] || CONNECTION_TYPES.mysql;
 return (
 <div key={conn.id}
 className={cn('grid grid-cols-[28px_1fr_140px_80px_100px] items-center gap-3 px-3 py-2 border-b border-white/[0.04] transition-colors',
 i % 2 === 0 ? 'bg-[#0d0d0d] hover:bg-[#101010]' : 'bg-[#0b0b0b] hover:bg-[#0e0e0e]')}>
 <ConnectionIcon logo={ct.logo} icon={ct.icon} color={ct.color} bgColor={ct.bgColor} size="sm"
 className="!w-7 !h-7 rounded-md" />
 <div className="min-w-0">
 <p className="text-[12px] font-medium text-white/80 truncate">{conn.name}</p>
 <p className="text-[10.5px] text-white/35">{ct.name}</p>
 </div>
 <p className="text-[11px] text-white/30 font-mono truncate">
 {conn.host ? `${conn.host}${conn.port ? `:${conn.port}` : ''}` : '—'}
 </p>
 <div>{getStatusBadge(conn.status)}</div>
 <div className="flex items-center gap-1 justify-end">
 <button onClick={() => testConnection(conn.id)} disabled={testingConnection === conn.id}
 className="h-6 px-2 rounded-[5px] text-[11px] text-white/35 hover:text-white/60 hover:bg-white/[0.05] transition-all">
 {testingConnection === conn.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
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
 )}

 {/* Add new connection type picker */}
 <div>
 <p className="text-[10.5px] font-medium text-white/30 uppercase tracking-wider mb-2.5">
 {connections.length === 0 ? 'Select a connector to get started' : 'Add New Connection'}
 </p>
 <div className="grid gap-2 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
 {filteredTypes.map(([key, config]) => (
     <button key={key} onClick={() => {
       setSelectedType(key);
       setAddForm({ name: `My ${config.name}`, host: '', port: '', database: '', username: '', password: '', ssl: false });
       setAddError(null);
       setShowAddModal(true);
     }}
     className={cn(
     'group flex flex-col items-start gap-2 p-3 rounded-lg border transition-all text-left',
     selectedType === key
     ? 'border-white/[0.18] bg-white/[0.06]'
     : 'border-white/[0.06] bg-[#111] hover:bg-[#151515] hover:border-white/[0.1]'
     )}>
     <ConnectionIcon logo={config.logo} icon={config.icon} color={config.color} bgColor={config.bgColor} size="sm"
     className="!w-8 !h-8 rounded-[7px] shadow-none" />
     <p className="text-[11.5px] font-medium text-white/70 leading-tight">{config.name}</p>
     </button>
     ))}
     </div>
     </div>

     </div>

     {/* ── Add Connection Modal ────────────────────────── */}
     {showAddModal && selectedType && (() => {
       const ct = CONNECTION_TYPES[selectedType as keyof typeof CONNECTION_TYPES];
       return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
           <div className="w-full max-w-md rounded-xl border border-white/[0.10] bg-[#111] shadow-2xl p-6">
             <div className="flex items-center justify-between mb-5">
               <div className="flex items-center gap-3">
                 {ct && <ConnectionIcon logo={ct.logo} icon={ct.icon} color={ct.color} bgColor={ct.bgColor} size="sm" />}
                 <div>
                   <h2 className="text-[14px] font-medium text-white">Add {ct?.name || selectedType}</h2>
                   <p className="text-[11px] text-white/35">Enter connection details</p>
                 </div>
               </div>
               <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-all">
                 <X className="w-4 h-4" />
               </button>
             </div>

             {addError && (
               <div className="mb-4 flex items-center gap-2 text-[11px] text-red-400/80 px-3 py-2 rounded-[5px] border border-red-500/20 bg-red-950/20">
                 <X className="w-3.5 h-3.5 flex-shrink-0" />{addError}
               </div>
             )}

             <div className="space-y-3">
               <div>
                 <label className="block text-[10.5px] font-medium text-white/40 uppercase tracking-wider mb-1">Name</label>
                 <input type="text" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                   className="input-desktop w-full" placeholder="My Database" />
               </div>
               <div className="grid grid-cols-3 gap-2">
                 <div className="col-span-2">
                   <label className="block text-[10.5px] font-medium text-white/40 uppercase tracking-wider mb-1">Host</label>
                   <input type="text" value={addForm.host} onChange={e => setAddForm(f => ({ ...f, host: e.target.value }))}
                     className="input-desktop w-full" placeholder="localhost" />
                 </div>
                 <div>
                   <label className="block text-[10.5px] font-medium text-white/40 uppercase tracking-wider mb-1">Port</label>
                   <input type="text" value={addForm.port} onChange={e => setAddForm(f => ({ ...f, port: e.target.value }))}
                     className="input-desktop w-full" placeholder="5432" />
                 </div>
               </div>
               <div>
                 <label className="block text-[10.5px] font-medium text-white/40 uppercase tracking-wider mb-1">Database</label>
                 <input type="text" value={addForm.database} onChange={e => setAddForm(f => ({ ...f, database: e.target.value }))}
                   className="input-desktop w-full" placeholder="mydb" />
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <div>
                   <label className="block text-[10.5px] font-medium text-white/40 uppercase tracking-wider mb-1">Username</label>
                   <input type="text" value={addForm.username} onChange={e => setAddForm(f => ({ ...f, username: e.target.value }))}
                     className="input-desktop w-full" placeholder="admin" />
                 </div>
                 <div>
                   <label className="block text-[10.5px] font-medium text-white/40 uppercase tracking-wider mb-1">Password</label>
                   <input type="password" value={addForm.password} onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                     className="input-desktop w-full" placeholder="••••••" />
                 </div>
               </div>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" checked={addForm.ssl} onChange={e => setAddForm(f => ({ ...f, ssl: e.target.checked }))}
                   className="w-3.5 h-3.5 rounded border-white/20 bg-white/[0.05] accent-emerald-500" />
                 <span className="text-[11px] text-white/50">Use SSL/TLS</span>
               </label>
             </div>

             <div className="flex items-center gap-2 mt-5">
               <button onClick={() => setShowAddModal(false)}
                 className="flex-1 h-8 rounded-[5px] text-[11px] font-medium border border-white/[0.08] text-white/50 hover:bg-white/[0.04] transition-all">
                 Cancel
               </button>
               <button
                 disabled={addLoading || !addForm.name.trim()}
                 onClick={async () => {
                   setAddLoading(true);
                   setAddError(null);
                   try {
                     const config = {
                       name: addForm.name,
                       type: selectedType,
                       host: addForm.host || undefined,
                       port: addForm.port ? parseInt(addForm.port, 10) : undefined,
                       database: addForm.database || undefined,
                       username: addForm.username || undefined,
                       password: addForm.password || undefined,
                       ssl: addForm.ssl,
                     };
                     // Try MCP first, fall back to Express
                     try {
                       await window.electron.mcp?.addConnection?.(config);
                     } catch {
                       await window.electron.express?.addUserConnection?.(
                         config.name,
                         config.type,
                         { host: config.host, port: config.port, database: config.database, username: config.username, password: config.password, ssl: config.ssl },
                       );
                     }
                     setShowAddModal(false);
                     setSelectedType(null);
                     loadConnections();
                   } catch (err: any) {
                     setAddError(err?.message || 'Failed to add connection');
                   } finally {
                     setAddLoading(false);
                   }
                 }}
                 className="flex-1 h-8 rounded-[5px] text-[11px] font-medium bg-white/[0.10] text-white/80 hover:bg-white/[0.16] flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
               >
                 {addLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                 {addLoading ? 'Adding…' : 'Add Connection'}
               </button>
             </div>
           </div>
         </div>
       );
     })()}
