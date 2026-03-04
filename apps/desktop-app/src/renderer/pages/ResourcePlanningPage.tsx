import { useState, useEffect } from 'react';
import {
  Users2, Plus, Sparkles, Loader2, Trash2, X, BarChart3, AlertTriangle,
  CheckCircle2, ArrowUpRight, TrendingUp, Briefcase,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { cn } from '../lib/utils';

interface Resource { id: string; name: string; role: string; department?: string; skills: string[]; available_hours_week: number; status: string; email?: string }
interface Allocation { id: string; resource_id: string; project_name: string; allocated_hours: number; start_date: string; end_date: string; status: string; resources?: { name: string; role: string } }
interface UtilRow { resource: { id: string; name: string; role: string; department?: string; skills: string[] }; utilization: number; allocatedHours: number; availableHours: number; status: string; activeProjects: string[] }
interface Dashboard { totalResources: number; activeResources: number; avgUtilization: number; overAllocated: number; idle: number; optimalRange: number; departmentUtilization: { department: string; avgUtilization: number; count: number }[]; topSkills: { skill: string; count: number }[]; utilizationBreakdown: UtilRow[] }

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
const UTIL_COLOR = (u: number) => u > 100 ? 'text-red-400' : u > 80 ? 'text-emerald-400' : u > 0 ? 'text-amber-400' : 'text-zinc-600';
const UTIL_BAR = (u: number) => u > 100 ? 'bg-red-500' : u > 80 ? 'bg-emerald-500' : u > 0 ? 'bg-amber-500' : 'bg-zinc-700';

type Tab = 'overview' | 'team' | 'allocations';

const api = async (path: string, opts?: RequestInit) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/resources${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts?.headers } });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed');
  return json.data;
};

export default function ResourcePlanningPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizations, setOptimizations] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDept, setNewDept] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [d, r, a] = await Promise.all([api('/dashboard'), api('/'), api('/allocations')]);
      setDashboard(d); setResources(r); setAllocations(a);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const addResource = async () => {
    if (!newName.trim()) return;
    try {
      const r = await api('/', { method: 'POST', body: JSON.stringify({ name: newName, role: newRole || 'developer', department: newDept || undefined }) });
      setResources(prev => [...prev, r]);
      setNewName(''); setNewRole(''); setNewDept(''); setShowAdd(false);
    } catch { /* silent */ }
  };

  const deleteResource = async (id: string) => {
    try { await api(`/${id}`, { method: 'DELETE' }); setResources(prev => prev.filter(r => r.id !== id)); } catch { /* */ }
  };

  const optimize = async () => {
    setOptimizing(true);
    try { const data = await api('/optimize', { method: 'POST' }); setOptimizations(data); } catch { /* */ }
    setOptimizing(false);
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-zinc-600" /></div>;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">Resource Planning</h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        {dashboard && (
          <div className="flex items-center gap-4 app-region-no-drag">
            <span className="text-[11px] text-white/40"><Users2 className="w-3 h-3 inline mr-1 text-white/25" /><span className="font-medium text-white/60">{dashboard.activeResources}</span> active</span>
            <span className={cn('text-[11px]', UTIL_COLOR(dashboard.avgUtilization))}><TrendingUp className="w-3 h-3 inline mr-1" /><span className="font-medium">{dashboard.avgUtilization}%</span> util</span>
            {dashboard.overAllocated > 0 && <span className="text-[11px] text-red-400"><AlertTriangle className="w-3 h-3 inline mr-1" />{dashboard.overAllocated} over</span>}
          </div>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-1 app-region-no-drag">
          {(['overview', 'team', 'allocations'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn('h-6 px-2.5 rounded-[5px] text-[11px] font-medium transition-all capitalize', tab === t ? 'bg-white/[0.1] text-white/80' : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]')}>
              {t}
            </button>
          ))}
          <div className="w-px h-4 bg-white/[0.06] mx-1" />
          <button onClick={optimize} disabled={optimizing} className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600/80 text-white hover:bg-indigo-500 disabled:opacity-40 flex items-center gap-1">
            {optimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Optimize
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* OVERVIEW */}
        {tab === 'overview' && dashboard && (
          <div className="p-5 space-y-5">
            {/* Stat row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { l: 'Team Size', v: dashboard.totalResources, s: `${dashboard.activeResources} active`, c: 'text-indigo-400' },
                { l: 'Avg Utilization', v: `${dashboard.avgUtilization}%`, s: dashboard.avgUtilization > 80 ? 'Optimal' : 'Capacity available', c: UTIL_COLOR(dashboard.avgUtilization) },
                { l: 'Over-allocated', v: dashboard.overAllocated, s: 'Need rebalancing', c: dashboard.overAllocated > 0 ? 'text-red-400' : 'text-emerald-400' },
                { l: 'Idle', v: dashboard.idle, s: 'Available for work', c: 'text-amber-400' },
              ].map(card => (
                <div key={card.l} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{card.l}</span>
                  <div className={cn('text-[22px] font-semibold tabular-nums mt-1', card.c)}>{card.v}</div>
                  <span className="text-[11px] text-zinc-600">{card.s}</span>
                </div>
              ))}
            </div>

            {/* Utilization bars */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
              <h3 className="text-[12px] font-medium text-white/70 mb-3">Team Utilization</h3>
              <div className="space-y-2">
                {dashboard.utilizationBreakdown.map(r => (
                  <div key={r.resource.id} className="flex items-center gap-3">
                    <span className="text-[11px] text-zinc-400 w-28 truncate">{r.resource.name}</span>
                    <span className="text-[10px] text-zinc-600 w-20">{r.resource.role}</span>
                    <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', UTIL_BAR(r.utilization))} style={{ width: `${Math.min(r.utilization, 100)}%` }} />
                    </div>
                    <span className={cn('text-[11px] tabular-nums w-10 text-right font-medium', UTIL_COLOR(r.utilization))}>{r.utilization}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-3">
              {dashboard.departmentUtilization.length > 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                  <h3 className="text-[12px] font-medium text-white/70 mb-3">By Department</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dashboard.departmentUtilization}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                      <XAxis dataKey="department" tick={{ fill: '#71717a', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                      <Bar dataKey="avgUtilization" fill="#6366f1" radius={[4, 4, 0, 0]} name="Avg %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {dashboard.topSkills.length > 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                  <h3 className="text-[12px] font-medium text-white/70 mb-3">Top Skills</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={dashboard.topSkills} dataKey="count" nameKey="skill" cx="50%" cy="50%" outerRadius={70} label>
                        {dashboard.topSkills.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* AI Recommendations */}
            {optimizations && (
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/10 p-4 space-y-3">
                <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /><h3 className="text-[12px] font-medium text-white/70">AI Recommendations</h3></div>
                {optimizations.recommendations?.map((rec: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 px-3 py-2 rounded-lg bg-white/[0.02]">
                    <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5', rec.priority === 'high' ? 'bg-red-500' : rec.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500')} />
                    <div><p className="text-[12px] text-white/70">{rec.title}</p><p className="text-[11px] text-zinc-600 mt-0.5">{rec.detail}</p></div>
                  </div>
                ))}
                {optimizations.capacityForecast && (
                  <div className="text-[11px] text-zinc-500 pt-1 border-t border-white/[0.04]">
                    Capacity: <span className="text-white/60">{optimizations.capacityForecast.current}</span> →
                    Next month: <span className="text-white/60">{optimizations.capacityForecast.nextMonth}</span>
                    {optimizations.capacityForecast.hiring_needed > 0 && <span className="text-amber-400 ml-2">+{optimizations.capacityForecast.hiring_needed} hires recommended</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TEAM TAB */}
        {tab === 'team' && (
          <div className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-[12px] font-medium text-white/60">Team Members ({resources.length})</h3>
              <button onClick={() => setShowAdd(true)} className="h-6 px-2.5 rounded text-[11px] bg-indigo-600/80 text-white hover:bg-indigo-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
            </div>
            {showAdd && (
              <div className="rounded-xl border border-white/[0.08] bg-[#111] p-4 space-y-2">
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" className="w-full h-7 px-2 rounded text-[12px] bg-white/[0.03] border border-white/[0.06] text-white placeholder-zinc-600 focus:outline-none" />
                <div className="flex gap-2">
                  <input value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Role" className="flex-1 h-7 px-2 rounded text-[12px] bg-white/[0.03] border border-white/[0.06] text-white placeholder-zinc-600 focus:outline-none" />
                  <input value={newDept} onChange={e => setNewDept(e.target.value)} placeholder="Department" className="flex-1 h-7 px-2 rounded text-[12px] bg-white/[0.03] border border-white/[0.06] text-white placeholder-zinc-600 focus:outline-none" />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAdd(false)} className="h-6 px-2 rounded text-[11px] text-zinc-500">Cancel</button>
                  <button onClick={addResource} className="h-6 px-3 rounded text-[11px] bg-indigo-600 text-white">Add</button>
                </div>
              </div>
            )}
            {resources.map(r => (
              <div key={r.id} className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 hover:border-white/[0.1] transition-all">
                <div>
                  <h4 className="text-[13px] font-medium text-white/80">{r.name}</h4>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-zinc-500">{r.role}</span>
                    {r.department && <span className="text-[11px] text-zinc-600">{r.department}</span>}
                    {r.skills?.length > 0 && <span className="text-[10px] text-zinc-700">{r.skills.slice(0, 3).join(', ')}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded', r.status === 'active' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-zinc-800 text-zinc-500')}>{r.status}</span>
                  <button onClick={() => deleteResource(r.id)} className="p-1.5 rounded text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ALLOCATIONS TAB */}
        {tab === 'allocations' && (
          <div className="p-5 space-y-3">
            <h3 className="text-[12px] font-medium text-white/60">Active Allocations ({allocations.length})</h3>
            {allocations.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-white/[0.04] bg-[#0a0a0a]">
                <Briefcase className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                <p className="text-[13px] text-zinc-600">No allocations yet</p>
              </div>
            ) : (
              allocations.map(a => (
                <div key={a.id} className="rounded-lg border border-white/[0.06] bg-[#0a0a0a] p-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-white/70 font-medium">{a.resources?.name || 'Unknown'}</span>
                      <ArrowUpRight className="w-3 h-3 text-zinc-700" />
                      <span className="text-[12px] text-indigo-400">{a.project_name}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-zinc-600">{a.allocated_hours}h/week</span>
                      <span className="text-[10px] text-zinc-700">{new Date(a.start_date).toLocaleDateString()} — {new Date(a.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded', a.status === 'active' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-zinc-800 text-zinc-500')}>{a.status}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
