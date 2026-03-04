import { useState, useEffect } from 'react';
import {
  ScanSearch, Plus, Sparkles, Loader2, AlertTriangle, UserCheck,
  FileText, Trash2, ChevronRight, Shield, Users, ArrowLeft,
  CheckCircle2, Clock, XCircle, Building2, User, ChevronDown,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';

interface Client { id: string; name: string; entity_type: string; jurisdiction: string; email?: string; risk_rating: string; overall_risk_score?: number; status: string; pep_status: boolean; industry?: string; source_of_wealth?: string; created_at: string }
interface Check { id: string; check_type: string; status: string; ai_assessment?: string; ai_risk_flags: string[]; ai_confidence?: number; completed_at?: string; created_at: string }
interface Doc { id: string; document_type: string; file_name: string; status: string; ai_extracted_data: any; ai_verification_result: any; created_at: string }
interface Workflow { id: string; template: string; status: string; current_step: number; total_steps: number; steps: any[]; completion_pct: number; created_at: string }
interface DashData { totalClients: number; byStatus: Record<string, number>; byRisk: Record<string, number>; checksTotal: number; checksPending: number; checksFailed: number; onboardingActive: number; avgCompletion: number; recentClients: Client[] }

type View = 'dashboard' | 'detail';

const RISK_CLR: Record<string, string> = { low: 'text-emerald-400', standard: 'text-blue-400', enhanced: 'text-amber-400', high: 'text-red-400', pep: 'text-purple-400' };
const RISK_BG: Record<string, string> = { low: 'bg-emerald-900/20 text-emerald-400', standard: 'bg-blue-900/20 text-blue-400', enhanced: 'bg-amber-900/20 text-amber-400', high: 'bg-red-900/20 text-red-400', pep: 'bg-purple-900/20 text-purple-400' };
const STATUS_BG: Record<string, string> = { prospect: 'bg-zinc-800 text-zinc-400', onboarding: 'bg-blue-900/30 text-blue-400', active: 'bg-emerald-900/30 text-emerald-400', suspended: 'bg-red-900/30 text-red-400', offboarded: 'bg-zinc-800 text-zinc-600' };
const CHECK_IC: Record<string, string> = { passed: 'text-emerald-400', failed: 'text-red-400', pending: 'text-zinc-500', in_progress: 'text-blue-400', expired: 'text-amber-400', needs_review: 'text-amber-400' };
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const api = async (path: string, opts?: RequestInit) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/kyc${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts?.headers } });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed');
  return json.data;
};

export default function KYCDashboardPage() {
  const [view, setView] = useState<View>('dashboard');
  const [dash, setDash] = useState<DashData | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Client | null>(null);
  const [checks, setChecks] = useState<Check[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const [riskResult, setRiskResult] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('individual');
  const [newEmail, setNewEmail] = useState('');
  const [tab, setTab] = useState<'checks' | 'docs' | 'workflow'>('checks');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try { const [d, c] = await Promise.all([api('/dashboard'), api('/clients')]); setDash(d); setClients(c); } catch { /* */ } finally { setLoading(false); }
  };

  const addClient = async () => {
    if (!newName.trim()) return;
    try {
      const c = await api('/clients', { method: 'POST', body: JSON.stringify({ name: newName, entity_type: newType, email: newEmail || undefined }) });
      setClients(prev => [c, ...prev]); setNewName(''); setNewEmail(''); setShowAdd(false);
    } catch { /* */ }
  };

  const openClient = async (c: Client) => {
    setSelected(c); setView('detail'); setRiskResult(null); setTab('checks');
    try {
      const [ch, d, w] = await Promise.all([api(`/clients/${c.id}/checks`), api(`/clients/${c.id}/documents`), api(`/clients/${c.id}/workflows`)]);
      setChecks(ch); setDocs(d); setWorkflows(w);
    } catch { setChecks([]); setDocs([]); setWorkflows([]); }
  };

  const deleteClient = async (id: string) => {
    try { await api(`/clients/${id}`, { method: 'DELETE' }); setClients(prev => prev.filter(c => c.id !== id)); if (selected?.id === id) { setView('dashboard'); setSelected(null); } } catch { /* */ }
  };

  const assessRisk = async () => {
    if (!selected || assessing) return;
    setAssessing(true);
    try {
      const result = await api(`/clients/${selected.id}/assess-risk`, { method: 'POST' });
      setRiskResult(result);
      setSelected(prev => prev ? { ...prev, risk_rating: result.riskRating, overall_risk_score: result.riskScore } : null);
    } catch { /* */ }
    setAssessing(false);
  };

  const addCheck = async (checkType: string) => {
    if (!selected) return;
    try { const c = await api(`/clients/${selected.id}/checks`, { method: 'POST', body: JSON.stringify({ check_type: checkType }) }); setChecks(prev => [c, ...prev]); } catch { /* */ }
  };

  const startWorkflow = async (template: string) => {
    if (!selected) return;
    try { const w = await api(`/clients/${selected.id}/workflows`, { method: 'POST', body: JSON.stringify({ template }) }); setWorkflows(prev => [w, ...prev]); } catch { /* */ }
  };

  const advanceWf = async (wfId: string) => {
    try { const w = await api(`/workflows/${wfId}/advance`, { method: 'POST' }); setWorkflows(prev => prev.map(x => x.id === wfId ? w : x)); } catch { /* */ }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-zinc-600" /></div>;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">KYC & Onboarding</h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        {dash && (
          <div className="flex items-center gap-4 app-region-no-drag">
            <span className="text-[11px] text-white/40"><Users className="w-3 h-3 inline mr-1 text-white/25" /><span className="font-medium text-white/60">{dash.totalClients}</span> clients</span>
            {dash.checksPending > 0 && <span className="text-[11px] text-amber-400"><Clock className="w-3 h-3 inline mr-1" />{dash.checksPending} pending</span>}
            {dash.checksFailed > 0 && <span className="text-[11px] text-red-400"><AlertTriangle className="w-3 h-3 inline mr-1" />{dash.checksFailed} failed</span>}
          </div>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 app-region-no-drag">
          {view === 'detail' && <button onClick={() => setView('dashboard')} className="h-6 px-2.5 rounded-[5px] text-[11px] text-white/35 hover:text-white/60 hover:bg-white/[0.04]">← Back</button>}
          <button onClick={() => setShowAdd(true)} className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Client</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Dashboard View */}
        {view === 'dashboard' && dash && (
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-4 gap-3">
              {[
                { l: 'Total Clients', v: dash.totalClients, s: `${dash.byStatus.active || 0} active`, c: 'text-indigo-400', ic: Users },
                { l: 'Onboarding', v: dash.onboardingActive, s: `${dash.avgCompletion}% avg`, c: 'text-blue-400', ic: UserCheck },
                { l: 'Pending Checks', v: dash.checksPending, s: `${dash.checksTotal} total`, c: dash.checksPending > 0 ? 'text-amber-400' : 'text-emerald-400', ic: Clock },
                { l: 'High Risk', v: (dash.byRisk.high || 0) + (dash.byRisk.pep || 0), s: `${dash.byRisk.enhanced || 0} enhanced`, c: (dash.byRisk.high || 0) > 0 ? 'text-red-400' : 'text-emerald-400', ic: Shield },
              ].map(card => (
                <div key={card.l} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                  <div className="flex items-center justify-between mb-2"><span className="text-[10px] text-zinc-600 uppercase tracking-wider">{card.l}</span><card.ic className={cn('w-4 h-4', card.c)} /></div>
                  <div className={cn('text-[22px] font-semibold tabular-nums', card.c)}>{card.v}</div>
                  <span className="text-[11px] text-zinc-600">{card.s}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Clients by Risk</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={Object.entries(dash.byRisk).filter(([,v]) => v > 0).map(([k, v]) => ({ name: k, value: v }))} cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value" paddingAngle={3}>
                      {Object.entries(dash.byRisk).filter(([,v]) => v > 0).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Clients by Status</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={Object.entries(dash.byStatus).filter(([,v]) => v > 0).map(([k, v]) => ({ name: k, count: v }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Client List */}
            <div className="space-y-2">
              <h3 className="text-[12px] font-medium text-white/60">All Clients</h3>
              {clients.length === 0 ? (
                <div className="text-center py-16 rounded-xl border border-white/[0.04] bg-[#0a0a0a]">
                  <ScanSearch className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                  <p className="text-[13px] text-zinc-600">No clients yet. Add your first client to begin.</p>
                </div>
              ) : (
                clients.map(c => (
                  <div key={c.id} onClick={() => openClient(c)} className="group rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 hover:border-white/[0.1] transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-medium text-white/80 truncate">{c.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-zinc-500 capitalize">{c.entity_type === 'individual' ? <User className="w-3 h-3 inline mr-0.5" /> : <Building2 className="w-3 h-3 inline mr-0.5" />}{c.entity_type}</span>
                          <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', STATUS_BG[c.status])}>{c.status}</span>
                          <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', RISK_BG[c.risk_rating])}>{c.risk_rating}</span>
                          {c.pep_status && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-400">PEP</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {c.overall_risk_score != null && (
                          <span className={cn('text-[14px] font-semibold tabular-nums', c.overall_risk_score > 70 ? 'text-red-400' : c.overall_risk_score > 40 ? 'text-amber-400' : 'text-emerald-400')}>{c.overall_risk_score}</span>
                        )}
                        <button onClick={e => { e.stopPropagation(); deleteClient(c.id); }} className="p-1.5 rounded text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                        <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Detail View */}
        {view === 'detail' && selected && (
          <div className="p-5 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-white/90">{selected.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[12px] text-zinc-500 capitalize">{selected.entity_type}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded capitalize', STATUS_BG[selected.status])}>{selected.status}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded capitalize', RISK_BG[selected.risk_rating])}>{selected.risk_rating}</span>
                  {selected.email && <span className="text-[11px] text-zinc-600">{selected.email}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {selected.overall_risk_score != null && (
                  <div className="text-center">
                    <div className={cn('text-[28px] font-bold tabular-nums', selected.overall_risk_score > 70 ? 'text-red-400' : selected.overall_risk_score > 40 ? 'text-amber-400' : 'text-emerald-400')}>{selected.overall_risk_score}</div>
                    <span className="text-[10px] text-zinc-600">Risk Score</span>
                  </div>
                )}
                <button onClick={assessRisk} disabled={assessing} className="h-7 px-3 rounded-lg text-[11px] bg-indigo-600/80 text-white hover:bg-indigo-500 disabled:opacity-40 flex items-center gap-1.5">
                  {assessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Assess Risk
                </button>
              </div>
            </div>

            {/* Risk Result */}
            {riskResult && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 space-y-3">
                <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /><span className="text-[12px] font-medium text-white/70">AI Risk Assessment</span></div>
                <p className="text-[12px] text-zinc-400">{riskResult.summary}</p>
                {riskResult.factors?.length > 0 && (
                  <div>{riskResult.factors.map((f: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-zinc-400 py-1">
                      <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', f.impact === 'high' ? 'bg-red-500' : f.impact === 'medium' ? 'bg-amber-500' : 'bg-emerald-500')} />
                      <div><span className="text-white/60">{f.factor}</span> — {f.detail}</div>
                    </div>
                  ))}</div>
                )}
                {riskResult.missingChecks?.length > 0 && (
                  <div><h4 className="text-[11px] text-zinc-500 font-medium mb-1">Missing Checks</h4>
                    {riskResult.missingChecks.map((m: string, i: number) => <span key={i} className="text-[10px] text-amber-400/80 mr-2"><AlertTriangle className="w-3 h-3 inline mr-0.5" />{m.replace('_', ' ')}</span>)}
                  </div>
                )}
                {riskResult.recommendations?.length > 0 && (
                  <div><h4 className="text-[11px] text-zinc-500 font-medium mb-1">Recommendations</h4>
                    {riskResult.recommendations.map((r: string, i: number) => <div key={i} className="text-[11px] text-zinc-400 py-0.5"><span className="text-indigo-400 mr-1">•</span>{r}</div>)}
                  </div>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-white/[0.06] pb-px">
              {(['checks', 'docs', 'workflow'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={cn('px-3 py-1.5 text-[11px] font-medium rounded-t', tab === t ? 'text-white bg-white/[0.06]' : 'text-zinc-500 hover:text-zinc-300')}>
                  {t === 'checks' ? `Checks (${checks.length})` : t === 'docs' ? `Documents (${docs.length})` : `Workflow (${workflows.length})`}
                </button>
              ))}
            </div>

            {/* Checks Tab */}
            {tab === 'checks' && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {['identity', 'address', 'sanctions', 'pep', 'adverse_media', 'source_of_wealth', 'ubo'].map(t => (
                    <button key={t} onClick={() => addCheck(t)} className="h-6 px-2 rounded text-[10px] bg-white/[0.04] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] capitalize">{t.replace(/_/g, ' ')}</button>
                  ))}
                </div>
                {checks.length === 0 ? (
                  <p className="text-[12px] text-zinc-600 py-8 text-center">No KYC checks yet. Click a check type above to start.</p>
                ) : (
                  checks.map(ch => (
                    <div key={ch.id} className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {ch.status === 'passed' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : ch.status === 'failed' ? <XCircle className="w-3.5 h-3.5 text-red-400" /> : <Clock className="w-3.5 h-3.5 text-zinc-500" />}
                          <span className="text-[12px] text-white/70 capitalize">{ch.check_type.replace(/_/g, ' ')}</span>
                        </div>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded capitalize', CHECK_IC[ch.status])}>{ch.status.replace('_', ' ')}</span>
                      </div>
                      {ch.ai_assessment && <p className="text-[11px] text-zinc-500 mt-1">{ch.ai_assessment}</p>}
                      {ch.ai_risk_flags?.length > 0 && <div className="flex gap-1 mt-1">{ch.ai_risk_flags.map((f, i) => <span key={i} className="text-[9px] px-1 rounded bg-red-900/20 text-red-400">{f}</span>)}</div>}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Docs Tab */}
            {tab === 'docs' && (
              <div className="space-y-2">
                {docs.length === 0 ? (
                  <p className="text-[12px] text-zinc-600 py-8 text-center">No documents uploaded yet.</p>
                ) : (
                  docs.map(d => (
                    <div key={d.id} className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-zinc-500" />
                          <div>
                            <span className="text-[12px] text-white/70">{d.file_name}</span>
                            <span className="text-[10px] text-zinc-600 ml-2 capitalize">{d.document_type.replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded capitalize', d.status === 'verified' ? 'text-emerald-400' : d.status === 'rejected' ? 'text-red-400' : 'text-zinc-500')}>{d.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Workflow Tab */}
            {tab === 'workflow' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  {['standard', 'enhanced', 'corporate'].map(t => (
                    <button key={t} onClick={() => startWorkflow(t)} className="h-6 px-2.5 rounded text-[10px] bg-white/[0.04] text-zinc-500 hover:text-zinc-300 capitalize">{t}</button>
                  ))}
                </div>
                {workflows.map(wf => {
                  const steps = typeof wf.steps === 'string' ? JSON.parse(wf.steps) : (wf.steps || []);
                  return (
                    <div key={wf.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-white/70 capitalize">{wf.template} Onboarding</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500">{wf.completion_pct}%</span>
                          {wf.status === 'in_progress' && <button onClick={() => advanceWf(wf.id)} className="h-5 px-2 rounded text-[10px] bg-indigo-600/60 text-white hover:bg-indigo-500">Next Step</button>}
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${wf.completion_pct}%` }} />
                      </div>
                      <div className="space-y-1">
                        {steps.map((s: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-[11px]">
                            {i < wf.current_step ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : i === wf.current_step ? <div className="w-3 h-3 rounded-full border-2 border-indigo-500" /> : <div className="w-3 h-3 rounded-full border border-zinc-700" />}
                            <span className={cn(i < wf.current_step ? 'text-zinc-500 line-through' : i === wf.current_step ? 'text-white/70' : 'text-zinc-600')}>{s.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5 w-[420px] space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-[13px] font-medium text-white">Add Client</h3>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Client name…" className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
            <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none">
              <option value="individual">Individual</option>
              <option value="corporate">Corporate</option>
              <option value="trust">Trust</option>
              <option value="fund">Fund</option>
            </select>
            <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email (optional)…" className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="h-7 px-3 rounded-md text-[11px] text-zinc-500">Cancel</button>
              <button onClick={addClient} disabled={!newName.trim()} className="h-7 px-3 rounded-md text-[11px] font-medium bg-indigo-600 text-white disabled:opacity-30">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
