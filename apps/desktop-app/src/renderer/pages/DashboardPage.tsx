import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
 Database, MessageSquare, Zap, TrendingUp,
 Plus, Sparkles, Activity, Brain,
 Server, ExternalLink, Clock, Shield
} from 'lucide-react';
import { cn } from '../lib/utils';

interface DashboardStats {
 connections: number;
 queries: number;
 tokens: string;
 responseTime: string;
}

interface RecentQuery {
 id: number;
 query: string;
 database: string;
 time: string;
 status: 'success' | 'error' | 'pending';
 model?: string;
}

interface ConnectedDB {
 id: number;
 name: string;
 type: string;
 status: 'connected' | 'disconnected' | 'error';
 queries: number;
 icon: string;
}

const DEFAULT_STATS: DashboardStats = {
 connections: 0,
 queries: 0,
 tokens: '0',
 responseTime: '0ms'
};

const QUICK_ACTIONS = [
 { icon: Plus, label: 'New Connection', href: '/connections-dashboard', color: 'from-zinc-400 to-zinc-500' },
 { icon: MessageSquare, label: 'Start Chat', href: '/chat', color: 'from-zinc-400 to-zinc-500' },
 { icon: Brain, label: 'API Keys', href: '/settings/api-keys', color: 'from-zinc-400 to-zinc-600' },
 { icon: Shield, label: 'License', href: '/license', color: 'from-zinc-500 to-zinc-500' },
];

const DB_ICONS: Record<string, string> = {
 'PostgreSQL': '🐘',
 'MySQL': '🐬',
 'MongoDB': '🍃',
 'Redis': '🔥',
 'SQLite': '📦',
 'Oracle': '🔴',
 'SQL Server': '🔷',
 'Snowflake': '❄️',
 'BigQuery': '📊',
};

export default function DashboardPage() {
 const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
 const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([]);
 const [connections, setConnections] = useState<ConnectedDB[]>([]);

 useEffect(() => {
 loadDashboardData();
 }, []);

 const loadDashboardData = async () => {
 try {
 // Load connections - Try MCP (local) first, fall back to Express API
 const conns = await window.electron.mcp?.getAllConnections?.()
 || await window.electron.express?.getUserConnections?.()
 || [];
 const connArray = Array.isArray(conns) ? conns : (conns as any)?.data || [];
 
 setConnections(connArray.map((c: any, idx: number) => ({
 id: idx + 1,
 name: c.name || `Connection ${idx + 1}`,
 type: c.type || c.connection_type || 'Unknown',
 status: c.status || 'connected',
 queries: c.queries || 0,
 icon: DB_ICONS[c.type] || '🗄️'
 })));

 // Update stats from real data
 setStats({
 connections: connArray.length,
 queries: 0,
 tokens: '0',
 responseTime: '—'
 });

 // Load real query history if available
 try {
 const history = await (window.electron.express as any)?.getQueryHistory?.() || [];
 setRecentQueries(Array.isArray(history) ? history.slice(0, 5).map((q: any, i: number) => ({
 id: i + 1,
 query: q.query || q.text || '',
 database: q.database || q.connection_name || 'Unknown',
 time: q.created_at ? new Date(q.created_at).toLocaleString() : '',
 status: q.status || 'success',
 model: q.model || undefined,
 })) : []);
 } catch {
 // No query history available yet
 setRecentQueries([]);
 }

 } catch (error: any) {
 // Silently handle API key errors - user might not have backend configured yet
 if (!error?.message?.includes('Invalid API key')) {
 console.error('Failed to load dashboard data:', error);
 }
 }
 };

 const statCards = [
 { name: 'Connected Databases', value: stats.connections.toString(), icon: Database, color: 'blue', trend: '' },
 { name: 'AI Queries Today', value: stats.queries.toString(), icon: MessageSquare, color: 'green', trend: '' },
 { name: 'Tokens Used', value: stats.tokens, icon: Zap, color: 'purple', trend: '' },
 { name: 'Avg Response Time', value: stats.responseTime, icon: TrendingUp, color: 'orange', trend: '' },
 ];

 return (
 <div className="h-full flex flex-col overflow-hidden">

 {/* ── Toolbar ─────────────────────────────────────────── */}
 <div className="toolbar app-region-drag">
 <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">Dashboard</h1>
 <div className="w-px h-4 bg-white/[0.08] mx-3" />
 {/* Stat pills inline */}
 <div className="flex items-center gap-4 app-region-no-drag">
 {statCards.map(s => (
 <span key={s.name} className="flex items-center gap-1.5 text-[11px] text-white/40">
 <s.icon className="w-3 h-3 text-white/25" />
 <span className="tabular-nums font-medium text-white/60">{s.value}</span>
 <span>{s.name}</span>
 </span>
 ))}
 </div>
 <div className="flex-1" />
 {/* Quick action buttons */}
 <div className="flex items-center gap-1.5 app-region-no-drag">
 {QUICK_ACTIONS.map(a => (
 <Link key={a.label} to={a.href}
 className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.05] flex items-center gap-1.5 transition-all">
 <a.icon className="w-3 h-3" />{a.label}
 </Link>
 ))}
 <div className="w-px h-4 bg-white/[0.08] mx-1" />
 <Link to="/chat"
 className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-white/[0.08] text-white/70 hover:bg-white/[0.14] flex items-center gap-1.5 transition-all">
 <Sparkles className="w-3 h-3" />AI Chat
 </Link>
 </div>
 </div>

 {/* ── Body ────────────────────────────────────────────── */}
 <div className="flex-1 overflow-auto grid grid-cols-[1fr_280px] divide-x divide-white/[0.05]">

 {/* Left: Recent queries + AI models */}
 <div className="flex flex-col divide-y divide-white/[0.05] overflow-hidden">

 {/* Recent Queries panel */}
 <div className="flex flex-col flex-1 min-h-0">
 <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05]">
 <div className="flex items-center gap-2">
 <Activity className="w-3 h-3 text-white/25" />
 <span className="text-[11.5px] font-medium text-white/50 uppercase tracking-wider">Recent Queries</span>
 </div>
 <Link to="/queries" className="text-[10.5px] text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors">
 View all<ExternalLink className="w-2.5 h-2.5" />
 </Link>
 </div>

 <div className="flex-1 overflow-auto">
 {recentQueries.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full gap-2 py-12">
 <MessageSquare className="w-7 h-7 text-white/10" />
 <p className="text-[11px] text-white/25">No queries yet — start an AI chat</p>
 <Link to="/chat"
 className="mt-1 h-6 px-3 rounded-[5px] text-[11px] font-medium bg-white/[0.06] text-white/50 hover:bg-white/[0.1] flex items-center gap-1.5 transition-all">
 <Sparkles className="w-3 h-3" />Start Chat
 </Link>
 </div>
 ) : recentQueries.map((q, i) => (
 <div key={q.id}
 className={cn('grid grid-cols-[1fr_80px_70px] items-center gap-3 px-4 py-2.5 border-b border-white/[0.04] transition-colors',
 i % 2 === 0 ? 'bg-[#0d0d0d] hover:bg-[#101010]' : 'bg-[#0b0b0b] hover:bg-[#0e0e0e]')}>
 <div className="min-w-0">
 <p className="text-[12px] text-white/75 truncate font-mono">{q.query}</p>
 <div className="flex items-center gap-2 mt-0.5">
 <span className="flex items-center gap-1 text-[10.5px] text-white/30">
 <Database className="w-2.5 h-2.5" />{q.database}
 </span>
 {q.model && <span className="text-[10.5px] text-white/25">{q.model}</span>}
 </div>
 </div>
 <span className="text-[10.5px] text-white/25 flex items-center gap-1">
 <Clock className="w-2.5 h-2.5" />{q.time}
 </span>
 <span className={cn('text-[10px] font-medium',
 q.status === 'success' ? 'text-emerald-500/70' :
 q.status === 'error' ? 'text-red-400/70' : 'text-amber-400/60')}>
 {q.status}
 </span>
 </div>
 ))}
 </div>
 </div>

 {/* AI Models panel */}
 <div className="shrink-0">
 <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05]">
 <div className="flex items-center gap-2">
 <Brain className="w-3 h-3 text-white/25" />
 <span className="text-[11.5px] font-medium text-white/50 uppercase tracking-wider">AI Models</span>
 </div>
 <Link to="/settings/api-keys" className="text-[10.5px] text-white/30 hover:text-white/60 transition-colors">Configure →</Link>
 </div>
 <div className="flex flex-wrap gap-2 p-4">
 {[
 { name: 'OpenAI', configured: true },
 { name: 'Anthropic', configured: true },
 { name: 'Google', configured: false },
 { name: 'Groq', configured: true },
 { name: 'Mistral', configured: false },
 { name: 'xAI', configured: false },
 ].map(p => (
 <span key={p.name}
 className={cn('h-6 px-2.5 rounded-full text-[11px] font-medium border flex items-center gap-1.5 transition-all',
 p.configured
 ? 'bg-white/[0.06] border-white/[0.12] text-white/65'
 : 'bg-transparent border-white/[0.05] text-white/22')}>
 {p.configured && <span className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full" />}
 {p.name}
 </span>
 ))}
 </div>
 </div>
 </div>

 {/* Right: Connections sidebar */}
 <div className="flex flex-col overflow-hidden">
 <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05]">
 <div className="flex items-center gap-2">
 <Server className="w-3 h-3 text-white/25" />
 <span className="text-[11.5px] font-medium text-white/50 uppercase tracking-wider">Connections</span>
 </div>
 <Link to="/connections-dashboard"
 className="h-5 px-2 rounded-[4px] text-[10.5px] text-white/30 hover:text-white/60 hover:bg-white/[0.05] flex items-center gap-1 transition-colors">
 <Plus className="w-2.5 h-2.5" />Add
 </Link>
 </div>
 <div className="flex-1 overflow-auto">
 {connections.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full gap-2 py-12">
 <Database className="w-8 h-8 text-white/[0.07]" />
 <p className="text-[11px] text-white/22 text-center px-6">No connections yet</p>
 <Link to="/connections-dashboard"
 className="mt-1 h-6 px-3 rounded-[5px] text-[11px] font-medium bg-white/[0.06] text-white/50 hover:bg-white/[0.1] flex items-center gap-1.5 transition-all">
 <Plus className="w-3 h-3" />Browse Library
 </Link>
 </div>
 ) : connections.map((db, i) => (
 <div key={db.id}
 className={cn('flex items-center gap-2.5 px-3 py-2 border-b border-white/[0.04] transition-colors',
 i % 2 === 0 ? 'bg-[#0d0d0d] hover:bg-[#101010]' : 'bg-[#0b0b0b] hover:bg-[#0e0e0e]')}>
 <div className="w-7 h-7 rounded-[6px] bg-white/[0.05] flex items-center justify-center text-base shrink-0">
 {db.icon}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-[12px] text-white/75 font-medium truncate">{db.name}</p>
 <p className="text-[10.5px] text-white/30 truncate">{db.type}</p>
 </div>
 <span className={cn('text-[10px] font-medium',
 db.status === 'connected' ? 'text-emerald-500/65' :
 db.status === 'error' ? 'text-red-400/60' : 'text-white/22')}>
 {db.status === 'connected' ? '●' : '○'}
 </span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}
