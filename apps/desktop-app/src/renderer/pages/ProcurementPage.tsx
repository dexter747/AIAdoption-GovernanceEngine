import { useState, useEffect } from 'react';
import {
  ShoppingCart, Plus, Sparkles, Loader2, AlertTriangle, Clock,
  FileText, Trash2, ChevronRight, Shield, DollarSign, ArrowLeft,
  RefreshCw, Building2, BarChart3,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';

interface Contract { id: string; title: string; vendor: string; contract_type: string; value?: number; currency: string; start_date?: string; end_date?: string; renewal_date?: string; auto_renew: boolean; status: string; risk_score?: number; department?: string; owner?: string; tags: string[]; created_at: string }
interface DashData { totalContracts: number; activeContracts: number; expiringContracts: number; expiredContracts: number; totalValue: number; avgRiskScore: number; highRiskContracts: number; pendingReviews: number; byType: Record<string, number>; recentContracts: Contract[] }

const RISK_COLOR = (s: number) => s > 70 ? 'text-red-400' : s > 40 ? 'text-amber-400' : 'text-emerald-400';
const RISK_BAR = (s: number) => s > 70 ? 'bg-red-500' : s > 40 ? 'bg-amber-500' : 'bg-emerald-500';
const STATUS_BADGE: Record<string, string> = { draft: 'bg-zinc-800 text-zinc-400', review: 'bg-blue-900/30 text-blue-400', active: 'bg-emerald-900/30 text-emerald-400', expiring: 'bg-amber-900/30 text-amber-400', expired: 'bg-red-900/30 text-red-400', terminated: 'bg-zinc-800 text-zinc-600' };
const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

type View = 'dashboard' | 'detail';

const api = async (path: string, opts?: RequestInit) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/procurement${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts?.headers } });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed');
  return json.data;
};

export default function ProcurementPage() {
  const [view, setView] = useState<View>('dashboard');
  const [dash, setDash] = useState<DashData | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selected, setSelected] = useState<Contract | null>(null);
  const [clauses, setClauses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newVendor, setNewVendor] = useState('');
  const [newValue, setNewValue] = useState('');
  const [contractText, setContractText] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([api('/dashboard'), api('/contracts')]);
      setDash(d); setContracts(c);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const addContract = async () => {
    if (!newTitle.trim() || !newVendor.trim()) return;
    try {
      const c = await api('/contracts', { method: 'POST', body: JSON.stringify({ title: newTitle, vendor: newVendor, value: newValue ? Number(newValue) : undefined }) });
      setContracts(prev => [c, ...prev]);
      setNewTitle(''); setNewVendor(''); setNewValue(''); setShowAdd(false);
    } catch { /* */ }
  };

  const openContract = async (c: Contract) => {
    setSelected(c); setView('detail'); setAnalysis(null);
    try { setClauses(await api(`/contracts/${c.id}/clauses`)); } catch { setClauses([]); }
  };

  const analyzeContract = async () => {
    if (!selected || analyzing) return;
    setAnalyzing(true);
    try {
      const result = await api(`/contracts/${selected.id}/analyze`, { method: 'POST', body: JSON.stringify({ contractText: contractText || undefined }) });
      setAnalysis(result);
      // reload clauses
      setClauses(await api(`/contracts/${selected.id}/clauses`));
      setSelected(prev => prev ? { ...prev, risk_score: result.riskScore } : null);
    } catch { /* */ }
    setAnalyzing(false);
  };

  const deleteContract = async (id: string) => {
    try { await api(`/contracts/${id}`, { method: 'DELETE' }); setContracts(prev => prev.filter(c => c.id !== id)); if (selected?.id === id) { setView('dashboard'); setSelected(null); } } catch { /* */ }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-zinc-600" /></div>;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">Procurement & Contracts</h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        {dash && (
          <div className="flex items-center gap-4 app-region-no-drag">
            <span className="text-[11px] text-white/40"><FileText className="w-3 h-3 inline mr-1 text-white/25" /><span className="font-medium text-white/60">{dash.activeContracts}</span> active</span>
            {dash.expiringContracts > 0 && <span className="text-[11px] text-amber-400"><Clock className="w-3 h-3 inline mr-1" />{dash.expiringContracts} expiring</span>}
            {dash.highRiskContracts > 0 && <span className="text-[11px] text-red-400"><AlertTriangle className="w-3 h-3 inline mr-1" />{dash.highRiskContracts} high risk</span>}
          </div>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 app-region-no-drag">
          {view === 'detail' && <button onClick={() => setView('dashboard')} className="h-6 px-2.5 rounded-[5px] text-[11px] text-white/35 hover:text-white/60 hover:bg-white/[0.04]">← Back</button>}
          <button onClick={() => setShowAdd(true)} className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {view === 'dashboard' && dash && (
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-4 gap-3">
              {[
                { l: 'Contracts', v: dash.totalContracts, s: `${dash.activeContracts} active`, c: 'text-indigo-400', ic: FileText },
                { l: 'Total Value', v: `£${(dash.totalValue / 1000).toFixed(0)}k`, s: 'Across all contracts', c: 'text-emerald-400', ic: DollarSign },
                { l: 'Avg Risk', v: dash.avgRiskScore || '—', s: `${dash.highRiskContracts} high risk`, c: dash.avgRiskScore > 60 ? 'text-red-400' : 'text-amber-400', ic: Shield },
                { l: 'Expiring', v: dash.expiringContracts, s: 'Within 30 days', c: dash.expiringContracts > 0 ? 'text-amber-400' : 'text-emerald-400', ic: Clock },
              ].map(card => (
                <div key={card.l} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                  <div className="flex items-center justify-between mb-2"><span className="text-[10px] text-zinc-600 uppercase tracking-wider">{card.l}</span><card.ic className={cn('w-4 h-4', card.c)} /></div>
                  <div className={cn('text-[22px] font-semibold tabular-nums', card.c)}>{card.v}</div>
                  <span className="text-[11px] text-zinc-600">{card.s}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
              <h3 className="text-[12px] font-medium text-white/70 mb-3">Contracts by Type</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={Object.entries(dash.byType).filter(([,v]) => v > 0).map(([k, v]) => ({ name: k, count: v }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              <h3 className="text-[12px] font-medium text-white/60">All Contracts</h3>
              {contracts.length === 0 ? (
                <div className="text-center py-16 rounded-xl border border-white/[0.04] bg-[#0a0a0a]">
                  <ShoppingCart className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                  <p className="text-[13px] text-zinc-600">No contracts tracked yet</p>
                </div>
              ) : (
                contracts.map(c => (
                  <div key={c.id} onClick={() => openContract(c)} className="group rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 hover:border-white/[0.1] transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-medium text-white/80 truncate">{c.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-zinc-500"><Building2 className="w-3 h-3 inline mr-0.5" />{c.vendor}</span>
                          <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', STATUS_BADGE[c.status])}>{c.status}</span>
                          {c.value && <span className="text-[11px] text-zinc-600">{c.currency} {c.value.toLocaleString()}</span>}
                          {c.end_date && <span className="text-[10px] text-zinc-700">Ends {new Date(c.end_date).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {c.risk_score != null && <span className={cn('text-[14px] font-semibold tabular-nums', RISK_COLOR(c.risk_score))}>{c.risk_score}</span>}
                        <button onClick={e => { e.stopPropagation(); deleteContract(c.id); }} className="p-1.5 rounded text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === 'detail' && selected && (
          <div className="p-5 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-white/90">{selected.title}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[12px] text-zinc-500"><Building2 className="w-3.5 h-3.5 inline mr-1" />{selected.vendor}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded capitalize', STATUS_BADGE[selected.status])}>{selected.status}</span>
                  {selected.value && <span className="text-[12px] text-zinc-500">{selected.currency} {selected.value.toLocaleString()}</span>}
                  {selected.auto_renew && <span className="text-[10px] text-blue-400 flex items-center gap-0.5"><RefreshCw className="w-3 h-3" /> Auto-renew</span>}
                </div>
              </div>
              {selected.risk_score != null && (
                <div className="text-center">
                  <div className={cn('text-[28px] font-bold tabular-nums', RISK_COLOR(selected.risk_score))}>{selected.risk_score}</div>
                  <span className="text-[10px] text-zinc-600">Risk Score</span>
                </div>
              )}
            </div>

            {/* Analyze */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /><span className="text-[12px] font-medium text-white/70">AI Contract Analysis</span></div>
                <button onClick={analyzeContract} disabled={analyzing} className="h-6 px-2.5 rounded text-[11px] bg-indigo-600/80 text-white hover:bg-indigo-500 disabled:opacity-40 flex items-center gap-1">
                  {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Analyze
                </button>
              </div>
              <textarea value={contractText} onChange={e => setContractText(e.target.value)} placeholder="Paste contract text for deeper analysis (optional)…" rows={3} className="w-full px-3 py-2 rounded-lg text-[12px] bg-white/[0.03] border border-white/[0.06] text-white placeholder-zinc-600 focus:outline-none resize-none" />

              {analysis && (
                <>
                  <p className="text-[12px] text-zinc-400">{analysis.summary}</p>
                  {analysis.findings?.length > 0 && (
                    <div><h4 className="text-[11px] text-zinc-500 font-medium mb-1">Findings</h4>
                      {analysis.findings.map((f: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-zinc-400 py-1">
                          <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', f.severity === 'critical' || f.severity === 'high' ? 'bg-red-500' : 'bg-amber-500')} />
                          <div><span className="text-white/60">{f.title}</span> — {f.detail}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {analysis.recommendations?.length > 0 && (
                    <div><h4 className="text-[11px] text-zinc-500 font-medium mb-1">Recommendations</h4>
                      {analysis.recommendations.map((r: string, i: number) => (
                        <div key={i} className="text-[11px] text-zinc-400 py-0.5"><span className="text-indigo-400 mr-1">•</span>{r}</div>
                      ))}
                    </div>
                  )}
                  {analysis.missingClauses?.length > 0 && (
                    <div><h4 className="text-[11px] text-zinc-500 font-medium mb-1">Missing Clauses</h4>
                      {analysis.missingClauses.map((m: string, i: number) => (
                        <div key={i} className="text-[11px] text-amber-400/80 py-0.5"><AlertTriangle className="w-3 h-3 inline mr-1" />{m}</div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Clauses */}
            {clauses.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.06]"><span className="text-[12px] font-medium text-white/70">Analyzed Clauses ({clauses.length})</span></div>
                {clauses.map(cl => (
                  <div key={cl.id} className="px-4 py-2.5 border-b border-white/[0.03]">
                    <div className="flex items-center gap-2">
                      {cl.flagged && <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />}
                      <span className="text-[12px] text-white/70 flex-1">{cl.title}</span>
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', cl.risk_level === 'critical' ? 'bg-red-900/30 text-red-400' : cl.risk_level === 'high' ? 'bg-amber-900/30 text-amber-400' : 'bg-zinc-800 text-zinc-500')}>{cl.risk_level}</span>
                      <span className="text-[10px] text-zinc-600 capitalize">{cl.clause_type.replace('_', ' ')}</span>
                    </div>
                    {cl.ai_assessment && <p className="text-[11px] text-zinc-500 mt-0.5 ml-5">{cl.ai_assessment}</p>}
                    {cl.ai_recommendation && <p className="text-[11px] text-indigo-400/60 mt-0.5 ml-5">{cl.ai_recommendation}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5 w-[420px] space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-[13px] font-medium text-white">Add Contract</h3>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Contract title…" className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
            <input value={newVendor} onChange={e => setNewVendor(e.target.value)} placeholder="Vendor name…" className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
            <input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Value (optional)…" type="number" className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="h-7 px-3 rounded-md text-[11px] text-zinc-500">Cancel</button>
              <button onClick={addContract} disabled={!newTitle.trim() || !newVendor.trim()} className="h-7 px-3 rounded-md text-[11px] font-medium bg-indigo-600 text-white disabled:opacity-30">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
