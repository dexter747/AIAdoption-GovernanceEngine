import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
 Database, MessageSquare, Zap, TrendingUp, ArrowUpRight, Clock,
 Plus, ChevronRight, Sparkles, Activity, Brain,
 Server, Shield, Star, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
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
 <div className="min-h-screen p-8 bg-black">
 {/* Header */}
 <motion.div 
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 className="mb-8"
 >
 <div className="flex items-center justify-between">
 <div>
 <h1 className="font-medium text-white">Dashboard</h1>
 <p className="mt-1 text-white/50">Welcome back! Here's your AI workspace overview.</p>
 </div>
 <Link
 to="/chat"
 className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-medium hover:bg-zinc-200 transition-all shadow-lg shadow-white/5"
 >
 <Sparkles className="w-4 h-4" />
 Start AI Chat
 </Link>
 </div>
 </motion.div>

 {/* Quick Actions */}
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="grid grid-cols-4 gap-4 mb-8"
 >
 {QUICK_ACTIONS.map((action) => (
 <Link
 key={action.label}
 to={action.href}
 className="group flex items-center gap-4 p-4 rounded-2xl hover:shadow-lg transition-all bg-zinc-900 border-white/10 hover:border-white/20"
 >
 <div className={cn(
 "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
 action.color
 )}>
 <action.icon className="w-5 h-5 text-white" />
 </div>
 <div className="flex-1">
 <p className="font-medium group-hover:text-zinc-300 transition-colors text-white">
 {action.label}
 </p>
 </div>
 <ChevronRight className="w-4 h-4 group-hover:text-zinc-300 transition-colors text-white/30" />
 </Link>
 ))}
 </motion.div>

 {/* Stats Grid */}
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
 >
 {statCards.map((stat, idx) => (
 <motion.div
 key={stat.name}
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.1 * idx }}
 className="rounded-2xl p-6 transition-all bg-zinc-900 border-white/10 hover:shadow-none"
 >
 <div className="flex items-center justify-between mb-4">
 <div className={cn(
 "w-12 h-12 rounded-xl flex items-center justify-center",
 stat.color === 'blue' ? 'bg-white/5' :
 stat.color === 'green' ? 'bg-white/5' :
 stat.color === 'purple' ? 'bg-white/5' :
 'bg-white/5'
 )}>
 <stat.icon className={cn(
 "w-6 h-6",
 stat.color === 'blue' ? 'text-zinc-300' :
 stat.color === 'green' ? 'text-zinc-400' :
 stat.color === 'purple' ? 'text-zinc-300' :
 'text-zinc-400'
 )} />
 </div>
 <div className="flex items-center gap-1 text-zinc-400 text-sm font-medium">
 <ArrowUpRight className="w-4 h-4" />
 </div>
 </div>
 <p className="font-medium mb-1 text-white">{stat.value}</p>
 <p className="text-white/50">{stat.name}</p>
 <p className="text-xs text-zinc-400 mt-2">{stat.trend}</p>
 </motion.div>
 ))}
 </motion.div>

 {/* Content Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Recent Queries */}
 <motion.div 
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.3 }}
 className="rounded-2xl overflow-hidden bg-zinc-900 border-white/10"
 >
 <div className="px-6 py-5 border-b flex items-center justify-between border-white/10">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-400 to-zinc-600 flex items-center justify-center">
 <Activity className="w-5 h-5 text-white" />
 </div>
 <div>
 <h2 className="font-medium text-white">Recent Queries</h2>
 <p className="text-white/40">AI-powered database queries</p>
 </div>
 </div>
 <Link to="/queries" className="text-sm text-zinc-300 hover:text-zinc-400 font-medium flex items-center gap-1">
 View All
 <ExternalLink className="w-3 h-3" />
 </Link>
 </div>
 <div className="divide-white/5">
 {recentQueries.map((query) => (
 <div key={query.id} className="px-6 py-4 transition-colors hover:bg-background/5">
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1 min-w-0">
 <p className="font-medium truncate text-white">{query.query}</p>
 <div className="flex items-center gap-3 mt-2">
 <span className="flex items-center gap-1 text-white/40">
 <Database className="w-3 h-3" />
 {query.database}
 </span>
 <span className="text-white/30">•</span>
 <span className="flex items-center gap-1 text-white/40">
 <Clock className="w-3 h-3" />
 {query.time}
 </span>
 {query.model && (
 <>
 <span className="text-white/30">•</span>
 <span className="text-xs text-zinc-300 flex items-center gap-1">
 <Sparkles className="w-3 h-3" />
 {query.model}
 </span>
 </>
 )}
 </div>
 </div>
 <span className={cn(
 "px-2.5 py-1 text-xs font-medium rounded-full",
 query.status === 'success' 
 ? 'bg-white/5 text-zinc-400' 
 : query.status === 'error'
 ? 'bg-white/5 text-zinc-400'
 : 'bg-white/5 text-zinc-400'
 )}>
 {query.status}
 </span>
 </div>
 </div>
 ))}
 </div>
 </motion.div>

 {/* Connected Databases */}
 <motion.div 
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.3 }}
 className="rounded-2xl overflow-hidden bg-zinc-900 border-white/10"
 >
 <div className="px-6 py-5 border-b flex items-center justify-between border-white/10">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-500 to-zinc-600 flex items-center justify-center">
 <Server className="w-5 h-5 text-white" />
 </div>
 <div>
 <h2 className="font-medium text-white">Connected Databases</h2>
 <p className="text-white/40">Active data sources</p>
 </div>
 </div>
 <Link to="/connections-dashboard" className="text-sm text-zinc-300 hover:text-zinc-400 font-medium flex items-center gap-1">
 Add New
 <Plus className="w-3 h-3" />
 </Link>
 </div>
 <div className="divide-white/5">
 {connections.length === 0 ? (
 <div className="px-6 py-12 text-center">
 <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-background/5">
 <Database className="w-8 h-8 text-white/30" />
 </div>
 <p className="mb-4 text-white/50">No databases connected yet</p>
 <Link
 to="/connections-dashboard"
 className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
 >
 <Plus className="w-4 h-4" />
 Add Connection
 </Link>
 </div>
 ) : (
 connections.slice(0, 4).map((db) => (
 <div key={db.id} className="px-6 py-4 flex items-center justify-between transition-colors hover:bg-background/5">
 <div className="flex items-center gap-4">
 <div className={cn(
 "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
 db.status === 'connected' ? 'bg-white/5' : 'bg-background/5'
 )}>
 {db.icon}
 </div>
 <div>
 <p className="font-medium text-white">{db.name}</p>
 <p className="text-white/40">{db.type}</p>
 </div>
 </div>
 <div className="text-right">
 <span className={cn(
 "px-2.5 py-1 text-xs font-medium rounded-full",
 db.status === 'connected' 
 ? 'bg-white/5 text-zinc-400' 
 : 'bg-background/5 text-white/40'
 )}>
 {db.status}
 </span>
 <p className="mt-1 text-white/40">{db.queries} queries</p>
 </div>
 </div>
 ))
 )}
 </div>
 </motion.div>
 </div>

 {/* AI Models Section */}
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.4 }}
 className="mt-8 bg-gradient-to-r from-white/5 via-white/5 to-white/5 rounded-2xl p-6 border-white/10"
 >
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-400 to-zinc-600 flex items-center justify-center">
 <Brain className="w-5 h-5 text-white" />
 </div>
 <div>
 <h2 className="font-medium text-white">Available AI Models</h2>
 <p className="text-white/40">Configured LLM providers</p>
 </div>
 </div>
 <Link to="/settings/api-keys" className="text-sm text-zinc-300 hover:text-zinc-400 font-medium">
 Configure →
 </Link>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
 {[
 { name: 'OpenAI', models: ['GPT-4o', 'GPT-4o Mini', 'o1'], logo: '🟢', configured: true },
 { name: 'Anthropic', models: ['Claude 3.5 Sonnet', 'Claude 3 Opus'], logo: '🟤', configured: true },
 { name: 'Google', models: ['Gemini 2.0', 'Gemini 1.5 Pro'], logo: '🔵', configured: false },
 { name: 'Groq', models: ['Llama 3.3', 'Mixtral'], logo: '🦙', configured: true },
 { name: 'Mistral', models: ['Mistral Large', 'Codestral'], logo: '🟠', configured: false },
 { name: 'xAI', models: ['Grok 2'], logo: '⚫', configured: false },
 ].map((provider) => (
 <div
 key={provider.name}
 className={cn(
 "p-4 rounded-xl border transition-all",
 provider.configured
 ? "bg-white/[0.02] border-white/[0.08]"
 : "bg-white/[0.01] border-white/[0.04] opacity-60"
 )}
 >
 <div className="flex items-center gap-2 mb-2">
 <span className="text-xl">{provider.logo}</span>
 <span className="font-medium text-white text-sm">{provider.name}</span>
 {provider.configured && <Star className="w-3 h-3 text-zinc-400 ml-auto" />}
 </div>
 <p className="text-xs truncate text-white/40">
 {provider.models.join(', ')}
 </p>
 </div>
 ))}
 </div>
 </motion.div>
 </div>
 );
}
