import { useState, useEffect } from 'react';
import {
  Scale, Plus, Sparkles, Loader2, AlertTriangle, AlertCircle, Clock,
  ExternalLink, FileText, Trash2, ChevronRight, Shield, Search,
  ArrowLeft, Lightbulb, BarChart3, CircleDot,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { cn } from '../lib/utils';

interface Change { id: string; title: string; summary?: string; body?: string; change_type: string; jurisdiction: string; sector: string[]; effective_date?: string; severity: string; status: string; ai_impact_summary?: string; ai_action_items?: string[]; ai_risk_score?: number; tags: string[]; external_url?: string; created_at: string }
interface DashData { totalChanges: number; newChanges: number; underReview: number; criticalChanges: number; highChanges: number; avgRiskScore: number; pendingAssessments: number; activeSources: number; changesByType: Record<string, number>; recentChanges: Change[] }

const SEVERITY_BADGE: Record<string, string> = { low: 'bg-blue-900/30 text-blue-400', medium: 'bg-amber-900/30 text-amber-400', high: 'bg-orange-900/30 text-orange-400', critical: 'bg-red-900/30 text-red-400' };
const STATUS_BADGE: Record<string, string> = { new: 'bg-indigo-900/30 text-indigo-400', under_review: 'bg-amber-900/30 text-amber-400', assessed: 'bg-emerald-900/30 text-emerald-400', implemented: 'bg-zinc-800 text-zinc-400', dismissed: 'bg-zinc-800 text-zinc-600' };
const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

type View = 'dashboard' | 'detail';

const api = async (path: string, opts?: RequestInit) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/regulatory${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts?.headers } });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed');
  return json.data;
};

export default function RegulatoryIntelPage() {
  const [view, setView] = useState<View>('dashboard');
  const [dash, setDash] = useState<DashData | null>(null);
  const [changes, setChanges] = useState<Change[]>([]);
  const [selected, setSelected] = useState<Change | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [scanText, setScanText] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([api('/dashboard'), api('/changes')]);
      setDash(d); setChanges(c);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const addChange = async () => {
    if (!newTitle.trim()) return;
    try {
      const c = await api('/changes', { method: 'POST', body: JSON.stringify({ title: newTitle, summary: newSummary }) });
      setChanges(prev => [c, ...prev]);
      setNewTitle(''); setNewSummary(''); setShowAdd(false);
    } catch { /* */ }
  };

  const analyzeChange = async (id: string) => {
    setAnalyzing(true);
    try {
      const result = await api(`/changes/${id}/analyze`, { method: 'POST' });
      // reload change
      const updated = await api(`/changes/${id}`);
      setSelected(updated);
      setChanges(prev => prev.map(c => c.id === id ? updated : c));
    } catch { /* */ }
    setAnalyzing(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const updated = await api(`/changes/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setSelected(prev => prev?.id === id ? updated : prev);
      setChanges(prev => prev.map(c => c.id === id ? updated : c));
    } catch { /* */ }
  };

  const scanDocument = async () => {
    if (!scanText.trim()) return;
    setScanning(true);
    try {
      const detected = await api('/scan', { method: 'POST', body: JSON.stringify({ text: scanText }) });
      if (detected?.length > 0) setChanges(prev => [...detected, ...prev]);
      setScanText(''); setShowScan(false);
    } catch { /* */ }
    setScanning(false);
  };

  const filtered = filterSeverity ? changes.filter(c => c.severity === filterSeverity) : changes;

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-zinc-600" /></div>;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">Regulatory Intelligence</h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        {dash && (
          <div className="flex items-center gap-4 app-region-no-drag">
            <span className="text-[11px] text-white/40"><FileText className="w-3 h-3 inline mr-1 text-white/25" /><span className="font-medium text-white/60">{dash.totalChanges}</span> tracked</span>
            {dash.newChanges > 0 && <span className="text-[11px] text-indigo-400"><CircleDot className="w-3 h-3 inline mr-1" />{dash.newChanges} new</span>}
            {dash.criticalChanges > 0 && <span className="text-[11px] text-red-400"><AlertTriangle className="w-3 h-3 inline mr-1" />{dash.criticalChanges} critical</span>}
          </div>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 app-region-no-drag">
          {view === 'detail' && <button onClick={() => setView('dashboard')} className="h-6 px-2.5 rounded-[5px] text-[11px] text-white/35 hover:text-white/60 hover:bg-white/[0.04]">← Back</button>}
          <button onClick={() => setShowScan(true)} className="h-6 px-2.5 rounded-[5px] text-[11px] text-white/40 hover:text-white/60 hover:bg-white/[0.04] flex items-center gap-1"><Search className="w-3 h-3" /> Scan</button>
          <button onClick={() => setShowAdd(true)} className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* DASHBOARD */}
        {view === 'dashboard' && dash && (
          <div className="p-5 space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { l: 'Total Changes', v: dash.totalChanges, s: `${dash.newChanges} new`, c: 'text-indigo-400', ic: Scale },
                { l: 'Critical', v: dash.criticalChanges + dash.highChanges, s: `${dash.criticalChanges} critical`, c: 'text-red-400', ic: AlertTriangle },
                { l: 'Risk Score', v: dash.avgRiskScore || '—', s: 'Average AI score', c: 'text-amber-400', ic: Shield },
                { l: 'Pending', v: dash.pendingAssessments, s: 'Assessments due', c: 'text-blue-400', ic: Clock },
              ].map(card => (
                <div key={card.l} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                  <div className="flex items-center justify-between mb-2"><span className="text-[10px] text-zinc-600 uppercase tracking-wider">{card.l}</span><card.ic className={cn('w-4 h-4', card.c)} /></div>
                  <div className={cn('text-[22px] font-semibold tabular-nums', card.c)}>{card.v}</div>
                  <span className="text-[11px] text-zinc-600">{card.s}</span>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
              <h3 className="text-[12px] font-medium text-white/70 mb-3">Changes by Type</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={Object.entries(dash.changesByType).filter(([,v]) => v > 0).map(([k, v]) => ({ name: k.replace('_', ' '), count: v }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-600">Filter:</span>
              {['', 'critical', 'high', 'medium', 'low'].map(s => (
                <button key={s} onClick={() => setFilterSeverity(s)} className={cn('h-5 px-2 rounded text-[10px] transition-all', filterSeverity === s ? 'bg-white/[0.1] text-white' : 'text-zinc-600 hover:text-zinc-400')}>
                  {s || 'All'}
                </button>
              ))}
            </div>

            {/* Changes list */}
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-16 rounded-xl border border-white/[0.04] bg-[#0a0a0a]">
                  <Scale className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                  <p className="text-[13px] text-zinc-600">No regulatory changes tracked</p>
                </div>
              ) : (
                filtered.map(c => (
                  <div key={c.id} onClick={() => { setSelected(c); setView('detail'); }} className="group rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 hover:border-white/[0.1] transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-medium text-white/80 truncate">{c.title}</h4>
                        {c.summary && <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{c.summary}</p>}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', SEVERITY_BADGE[c.severity])}>{c.severity}</span>
                          <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', STATUS_BADGE[c.status])}>{c.status.replace('_', ' ')}</span>
                          <span className="text-[10px] text-zinc-700 capitalize">{c.change_type.replace('_', ' ')}</span>
                          {c.effective_date && <span className="text-[10px] text-zinc-700">{new Date(c.effective_date).toLocaleDateString()}</span>}
                          {c.ai_risk_score != null && <span className={cn('text-[10px] font-medium tabular-nums', c.ai_risk_score > 70 ? 'text-red-400' : c.ai_risk_score > 40 ? 'text-amber-400' : 'text-emerald-400')}>Risk: {c.ai_risk_score}</span>}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* DETAIL VIEW */}
        {view === 'detail' && selected && (
          <div className="p-5 space-y-5">
            <div>
              <h2 className="text-[16px] font-semibold text-white/90">{selected.title}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded', SEVERITY_BADGE[selected.severity])}>{selected.severity}</span>
                <select value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)} className="h-5 px-1 rounded text-[10px] bg-white/[0.04] border border-white/[0.06] text-zinc-400">
                  {['new', 'under_review', 'assessed', 'implemented', 'dismissed'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
                <span className="text-[10px] text-zinc-700 capitalize">{selected.change_type.replace('_', ' ')}</span>
                {selected.jurisdiction && <span className="text-[10px] text-zinc-700">{selected.jurisdiction}</span>}
                {selected.effective_date && <span className="text-[10px] text-zinc-600">Effective: {new Date(selected.effective_date).toLocaleDateString()}</span>}
                {selected.external_url && <a href={selected.external_url} target="_blank" rel="noopener" className="text-[10px] text-indigo-400 flex items-center gap-0.5 hover:underline"><ExternalLink className="w-3 h-3" /> Source</a>}
              </div>
            </div>

            {selected.summary && <div className="text-[12px] text-zinc-400 leading-relaxed rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">{selected.summary}</div>}
            {selected.body && <div className="text-[12px] text-zinc-500 leading-relaxed rounded-xl border border-white/[0.04] bg-[#0a0a0a] p-4 max-h-[200px] overflow-auto">{selected.body}</div>}

            {/* AI Analysis */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /><h3 className="text-[12px] font-medium text-white/70">AI Impact Analysis</h3></div>
                <button onClick={() => analyzeChange(selected.id)} disabled={analyzing} className="h-6 px-2.5 rounded text-[11px] bg-indigo-600/80 text-white hover:bg-indigo-500 disabled:opacity-40 flex items-center gap-1">
                  {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} {selected.ai_impact_summary ? 'Re-analyze' : 'Analyze'}
                </button>
              </div>

              {selected.ai_risk_score != null && (
                <div className="flex items-center gap-4">
                  <div><span className="text-[10px] text-zinc-600">Risk Score</span><div className={cn('text-[24px] font-bold tabular-nums', selected.ai_risk_score > 70 ? 'text-red-400' : selected.ai_risk_score > 40 ? 'text-amber-400' : 'text-emerald-400')}>{selected.ai_risk_score}</div></div>
                  <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', selected.ai_risk_score > 70 ? 'bg-red-500' : selected.ai_risk_score > 40 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${selected.ai_risk_score}%` }} />
                  </div>
                </div>
              )}

              {selected.ai_impact_summary && <p className="text-[12px] text-zinc-400 leading-relaxed">{selected.ai_impact_summary}</p>}

              {selected.ai_action_items && selected.ai_action_items.length > 0 && (
                <div>
                  <h4 className="text-[11px] text-zinc-500 font-medium mb-1.5">Required Actions</h4>
                  <div className="space-y-1">
                    {selected.ai_action_items.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-zinc-400"><span className="text-indigo-400 mt-0.5">•</span>{a}</div>
                    ))}
                  </div>
                </div>
              )}

              {!selected.ai_impact_summary && !analyzing && <p className="text-[11px] text-zinc-700">Click Analyze to generate AI impact assessment</p>}
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5 w-[420px] space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-[13px] font-medium text-white">Add Regulatory Change</h3>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title…" className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40" />
            <textarea value={newSummary} onChange={e => setNewSummary(e.target.value)} placeholder="Summary (optional)…" rows={3} className="w-full px-3 py-2 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="h-7 px-3 rounded-md text-[11px] text-zinc-500">Cancel</button>
              <button onClick={addChange} disabled={!newTitle.trim()} className="h-7 px-3 rounded-md text-[11px] font-medium bg-indigo-600 text-white disabled:opacity-30">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Scan Modal */}
      {showScan && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowScan(false)}>
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5 w-[500px] space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-[13px] font-medium text-white">Scan Document for Changes</h3>
            <p className="text-[11px] text-zinc-500">Paste regulatory text and AI will extract relevant changes</p>
            <textarea value={scanText} onChange={e => setScanText(e.target.value)} placeholder="Paste regulatory document text…" rows={8} className="w-full px-3 py-2 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowScan(false)} className="h-7 px-3 rounded-md text-[11px] text-zinc-500">Cancel</button>
              <button onClick={scanDocument} disabled={scanning || !scanText.trim()} className="h-7 px-3 rounded-md text-[11px] font-medium bg-indigo-600 text-white disabled:opacity-30 flex items-center gap-1">
                {scanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />} Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
