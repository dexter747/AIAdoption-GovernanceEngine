import { useState, useEffect, useCallback } from 'react';
import {
  Kanban, Plus, Sparkles, AlertTriangle, CheckCircle2, Clock, Loader2,
  BarChart3, ArrowRight, ShieldAlert, TrendingUp, Target, Trash2,
  ChevronDown, X, Activity, CircleDot, AlertCircle, Lightbulb,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { cn } from '../lib/utils';

/* ── Types ─────────────────────────────────────────────────────────── */
interface Project { id: string; name: string; description?: string; status: string; priority: string; start_date?: string; target_end_date?: string; budget?: number; spent?: number; health_score: number; tags: string[]; created_at: string }
interface Task { id: string; title: string; status: string; priority: string; assignee?: string; due_date?: string; estimated_hours?: number; actual_hours?: number }
interface Risk { id: string; title: string; description?: string; category: string; likelihood: string; impact: string; status: string; mitigation?: string; ai_detected: boolean }
interface Insight { id: string; type: string; severity: string; title: string; body: string; created_at: string }
interface DashStats { totalProjects: number; activeProjects: number; avgHealth: number; totalTasks: number; completedTasks: number; blockedTasks: number; overdueTasks: number; openRisks: number; criticalRisks: number; recentInsights: Insight[]; projectsByStatus: Record<string, number>; tasksByStatus: Record<string, number> }

type View = 'dashboard' | 'project';
const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];
const STATUS_COLORS: Record<string, string> = { planning: 'text-blue-400', active: 'text-emerald-400', on_hold: 'text-amber-400', completed: 'text-zinc-500', cancelled: 'text-red-400' };
const PRIORITY_BADGE: Record<string, string> = { low: 'bg-zinc-800 text-zinc-400', medium: 'bg-blue-900/40 text-blue-400', high: 'bg-amber-900/40 text-amber-400', critical: 'bg-red-900/40 text-red-400' };
const HEALTH_COLOR = (s: number) => s >= 70 ? 'text-emerald-400' : s >= 40 ? 'text-amber-400' : 'text-red-400';

const api = async (path: string, opts?: RequestInit) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/projects${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts?.headers } });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return json.data;
};

export default function ProjectIntelPage() {
  const [view, setView] = useState<View>('dashboard');
  const [stats, setStats] = useState<DashStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  /* ── Load dashboard ────────────────────────────────────────────── */
  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([api('/dashboard'), api('/projects')]);
      setStats(s);
      setProjects(p);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const openProject = async (proj: Project) => {
    setSelectedProject(proj);
    setView('project');
    try {
      const [t, r, ins] = await Promise.all([
        api(`/projects/${proj.id}/tasks`),
        api(`/projects/${proj.id}/risks`),
        api(`/projects/${proj.id}/insights`),
      ]);
      setTasks(t); setRisks(r); setInsights(ins);
    } catch { /* silent */ }
  };

  const createProject = async () => {
    if (!newName.trim()) return;
    try {
      const proj = await api('/projects', { method: 'POST', body: JSON.stringify({ name: newName, description: newDesc }) });
      setProjects(prev => [proj, ...prev]);
      setNewName(''); setNewDesc(''); setShowNewProject(false);
    } catch { /* silent */ }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim() || !selectedProject) return;
    try {
      const task = await api(`/projects/${selectedProject.id}/tasks`, { method: 'POST', body: JSON.stringify({ title: newTaskTitle }) });
      setTasks(prev => [task, ...prev]);
      setNewTaskTitle(''); setShowNewTask(false);
    } catch { /* silent */ }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await fetch(`/api/projects/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status }),
      });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    } catch { /* silent */ }
  };

  const runAnalysis = async () => {
    if (!selectedProject || analyzing) return;
    setAnalyzing(true);
    try {
      const [health, detected] = await Promise.all([
        api(`/projects/${selectedProject.id}/analyze-health`, { method: 'POST' }),
        api(`/projects/${selectedProject.id}/detect-risks`, { method: 'POST' }),
      ]);
      setSelectedProject(prev => prev ? { ...prev, health_score: health.healthScore } : null);
      // Reload insights and risks
      const [r, ins] = await Promise.all([api(`/projects/${selectedProject.id}/risks`), api(`/projects/${selectedProject.id}/insights`)]);
      setRisks(r); setInsights(ins);
    } catch { /* silent */ }
    setAnalyzing(false);
  };

  const deleteProject = async (id: string) => {
    try {
      await api(`/projects/${id}`, { method: 'DELETE' });
      setProjects(prev => prev.filter(p => p.id !== id));
      if (selectedProject?.id === id) { setView('dashboard'); setSelectedProject(null); }
    } catch { /* silent */ }
  };

  /* ── Render ────────────────────────────────────────────────────── */

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-zinc-600" /></div>;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">Project Intelligence</h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        {stats && (
          <div className="flex items-center gap-4 app-region-no-drag">
            <span className="flex items-center gap-1.5 text-[11px] text-white/40"><Target className="w-3 h-3 text-white/25" /><span className="tabular-nums font-medium text-white/60">{stats.activeProjects}</span> active</span>
            <span className={cn('flex items-center gap-1.5 text-[11px]', HEALTH_COLOR(stats.avgHealth))}><Activity className="w-3 h-3" /><span className="tabular-nums font-medium">{stats.avgHealth}%</span> health</span>
            {stats.overdueTasks > 0 && <span className="flex items-center gap-1.5 text-[11px] text-red-400"><AlertCircle className="w-3 h-3" />{stats.overdueTasks} overdue</span>}
          </div>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 app-region-no-drag">
          {view === 'project' && (
            <button onClick={() => setView('dashboard')} className="h-6 px-2.5 rounded-[5px] text-[11px] text-white/35 hover:text-white/60 hover:bg-white/[0.04]">← Dashboard</button>
          )}
          <button onClick={() => setShowNewProject(true)} className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1">
            <Plus className="w-3 h-3" /> New Project
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* ── DASHBOARD VIEW ──────────────────────────────────────── */}
        {view === 'dashboard' && stats && (
          <div className="p-5 space-y-5">
            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Projects', value: stats.totalProjects, sub: `${stats.activeProjects} active`, icon: Kanban, color: 'text-indigo-400' },
                { label: 'Tasks', value: stats.totalTasks, sub: `${stats.completedTasks} done`, icon: CheckCircle2, color: 'text-emerald-400' },
                { label: 'Health', value: `${stats.avgHealth}%`, sub: stats.avgHealth >= 70 ? 'On track' : 'Needs attention', icon: Activity, color: HEALTH_COLOR(stats.avgHealth) },
                { label: 'Risks', value: stats.openRisks, sub: `${stats.criticalRisks} critical`, icon: ShieldAlert, color: 'text-red-400' },
              ].map(card => (
                <div key={card.label} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-zinc-600 uppercase tracking-wider">{card.label}</span>
                    <card.icon className={cn('w-4 h-4', card.color)} />
                  </div>
                  <div className={cn('text-[22px] font-semibold tabular-nums', card.color)}>{card.value}</div>
                  <div className="text-[11px] text-zinc-600 mt-0.5">{card.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Projects by status */}
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Projects by Status</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={Object.entries(stats.projectsByStatus).filter(([, v]) => v > 0).map(([k, v]) => ({ name: k.replace('_', ' '), value: v }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                      {Object.entries(stats.projectsByStatus).filter(([, v]) => v > 0).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Tasks by status */}
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Tasks by Status</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={Object.entries(stats.tasksByStatus).map(([k, v]) => ({ name: k.replace('_', ' '), count: v }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Projects list */}
            <div className="space-y-2">
              <h3 className="text-[12px] font-medium text-white/60 mb-2">All Projects</h3>
              {projects.length === 0 ? (
                <div className="text-center py-16 rounded-xl border border-white/[0.04] bg-[#0a0a0a]">
                  <Kanban className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                  <p className="text-[13px] text-zinc-600">No projects yet</p>
                  <p className="text-[11px] text-zinc-700 mt-1">Create your first project to start tracking</p>
                </div>
              ) : (
                projects.map(p => (
                  <div key={p.id} onClick={() => openProject(p)} className="group rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 hover:border-white/[0.1] transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn('w-2 h-2 rounded-full', p.health_score >= 70 ? 'bg-emerald-500' : p.health_score >= 40 ? 'bg-amber-500' : 'bg-red-500')} />
                        <div className="min-w-0">
                          <h4 className="text-[13px] font-medium text-white/80 truncate">{p.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn('text-[10px] capitalize', STATUS_COLORS[p.status] || 'text-zinc-500')}>{p.status.replace('_', ' ')}</span>
                            <span className={cn('text-[10px] px-1.5 py-0.5 rounded', PRIORITY_BADGE[p.priority])}>{p.priority}</span>
                            {p.target_end_date && <span className="text-[10px] text-zinc-700">Due {new Date(p.target_end_date).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn('text-[14px] font-semibold tabular-nums', HEALTH_COLOR(p.health_score))}>{p.health_score}%</span>
                        <button onClick={e => { e.stopPropagation(); deleteProject(p.id); }} className="p-1.5 rounded-md text-zinc-700 hover:text-red-400 hover:bg-white/[0.04] opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recent insights */}
            {stats.recentInsights.length > 0 && (
              <div>
                <h3 className="text-[12px] font-medium text-white/60 mb-2">Recent Insights</h3>
                <div className="space-y-1.5">
                  {stats.recentInsights.map(ins => (
                    <div key={ins.id} className="flex items-start gap-3 rounded-lg border border-white/[0.04] bg-[#0a0a0a] px-4 py-2.5">
                      {ins.severity === 'critical' ? <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" /> : ins.severity === 'warning' ? <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" /> : <Lightbulb className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />}
                      <div><p className="text-[12px] text-white/70">{ins.title}</p><p className="text-[11px] text-zinc-600 mt-0.5">{ins.body}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PROJECT DETAIL VIEW ─────────────────────────────────── */}
        {view === 'project' && selectedProject && (
          <div className="p-5 space-y-5">
            {/* Project header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-white/90">{selectedProject.name}</h2>
                {selectedProject.description && <p className="text-[12px] text-zinc-500 mt-0.5">{selectedProject.description}</p>}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={cn('text-[11px] capitalize', STATUS_COLORS[selectedProject.status])}>{selectedProject.status.replace('_', ' ')}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded', PRIORITY_BADGE[selectedProject.priority])}>{selectedProject.priority}</span>
                  <span className={cn('text-[13px] font-semibold tabular-nums', HEALTH_COLOR(selectedProject.health_score))}>{selectedProject.health_score}% health</span>
                </div>
              </div>
              <button onClick={runAnalysis} disabled={analyzing} className="h-7 px-3 rounded-lg text-[11px] font-medium bg-indigo-600/80 text-white hover:bg-indigo-500 disabled:opacity-40 flex items-center gap-1.5 transition-all">
                {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI Analysis
              </button>
            </div>

            {/* Budget bar */}
            {selectedProject.budget && selectedProject.budget > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-zinc-500">Budget Utilization</span>
                  <span className="text-[11px] text-zinc-400 tabular-nums">{((selectedProject.spent || 0) / selectedProject.budget * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', (selectedProject.spent || 0) / selectedProject.budget > 0.9 ? 'bg-red-500' : 'bg-indigo-500')} style={{ width: `${Math.min(100, ((selectedProject.spent || 0) / selectedProject.budget) * 100)}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-zinc-700">£{(selectedProject.spent || 0).toLocaleString()}</span>
                  <span className="text-[10px] text-zinc-700">£{selectedProject.budget.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Tasks section */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <span className="text-[12px] font-medium text-white/70">Tasks ({tasks.length})</span>
                <button onClick={() => setShowNewTask(true)} className="h-5 px-2 rounded text-[10px] text-zinc-500 hover:text-white hover:bg-white/[0.06] flex items-center gap-1 transition-all">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              {showNewTask && (
                <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.04]">
                  <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Task title…" className="flex-1 h-7 px-2 rounded text-[12px] bg-white/[0.03] border border-white/[0.06] text-white placeholder-zinc-600 focus:outline-none" onKeyDown={e => e.key === 'Enter' && createTask()} />
                  <button onClick={createTask} className="h-7 px-2.5 rounded text-[11px] bg-indigo-600 text-white">Add</button>
                  <button onClick={() => setShowNewTask(false)} className="p-1 text-zinc-600"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}
              {tasks.length === 0 ? (
                <div className="px-4 py-6 text-center text-[12px] text-zinc-700">No tasks yet</div>
              ) : (
                <div className="max-h-[300px] overflow-auto">
                  {tasks.map(t => (
                    <div key={t.id} className="flex items-center gap-3 px-4 py-2 border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <select value={t.status} onChange={e => updateTaskStatus(t.id, e.target.value)} className="h-5 px-1 rounded text-[10px] bg-white/[0.03] border border-white/[0.06] text-zinc-400" onClick={e => e.stopPropagation()}>
                        {['todo', 'in_progress', 'review', 'done', 'blocked'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                      <span className={cn('text-[12px] flex-1', t.status === 'done' ? 'text-zinc-600 line-through' : 'text-white/70')}>{t.title}</span>
                      {t.assignee && <span className="text-[10px] text-zinc-700">{t.assignee}</span>}
                      {t.due_date && <span className={cn('text-[10px]', new Date(t.due_date) < new Date() && t.status !== 'done' ? 'text-red-400' : 'text-zinc-700')}>{new Date(t.due_date).toLocaleDateString()}</span>}
                      <span className={cn('text-[9px] px-1 py-0.5 rounded', PRIORITY_BADGE[t.priority])}>{t.priority}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Risks section */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <span className="text-[12px] font-medium text-white/70">Risks ({risks.length})</span>
              </div>
              {risks.length === 0 ? (
                <div className="px-4 py-6 text-center text-[12px] text-zinc-700">No risks detected — run AI Analysis to auto-detect</div>
              ) : (
                <div className="max-h-[250px] overflow-auto">
                  {risks.map(r => (
                    <div key={r.id} className="px-4 py-2.5 border-b border-white/[0.03]">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-1.5 h-1.5 rounded-full', r.impact === 'critical' || r.likelihood === 'critical' ? 'bg-red-500' : r.impact === 'high' ? 'bg-amber-500' : 'bg-blue-500')} />
                        <span className="text-[12px] text-white/70 flex-1">{r.title}</span>
                        {r.ai_detected && <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900/40 text-indigo-400">AI</span>}
                        <span className="text-[10px] text-zinc-600 capitalize">{r.category}</span>
                      </div>
                      {r.mitigation && <p className="text-[11px] text-zinc-600 mt-1 ml-3.5">{r.mitigation}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Insights */}
            {insights.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <span className="text-[12px] font-medium text-white/70">AI Insights ({insights.length})</span>
                </div>
                <div className="max-h-[250px] overflow-auto">
                  {insights.map(ins => (
                    <div key={ins.id} className="flex items-start gap-3 px-4 py-2.5 border-b border-white/[0.03]">
                      {ins.severity === 'critical' ? <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" /> : ins.severity === 'warning' ? <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" /> : <Lightbulb className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />}
                      <div>
                        <p className="text-[12px] text-white/70">{ins.title}</p>
                        <p className="text-[11px] text-zinc-600 mt-0.5">{ins.body}</p>
                        <span className="text-[9px] text-zinc-700 mt-0.5">{new Date(ins.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowNewProject(false)}>
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5 w-[420px] space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-[13px] font-medium text-white">New Project</h3>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Project name…" className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40" />
            <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)…" rows={3} className="w-full px-3 py-2 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewProject(false)} className="h-7 px-3 rounded-md text-[11px] text-zinc-500 hover:text-zinc-300">Cancel</button>
              <button onClick={createProject} disabled={!newName.trim()} className="h-7 px-3 rounded-md text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
