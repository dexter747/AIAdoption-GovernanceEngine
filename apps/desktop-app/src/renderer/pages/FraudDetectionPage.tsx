import { useState, useEffect } from 'react';
import {
  ShieldAlert, Sparkles, Loader2, AlertTriangle, Clock,
  Plus, Trash2, ChevronRight, Shield, Activity, Eye,
  Search, Filter, Bell, TrendingUp, Zap, ArrowLeft,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { cn } from '../lib/utils';

interface Transaction { id: string; transaction_ref: string; type: string; amount: number; currency: string; counterparty?: string; country_code: string; channel: string; status: string; risk_score?: number; flagged: boolean; timestamp: string }
interface Alert { id: string; alert_type: string; severity: string; status: string; title: string; description?: string; ai_confidence?: number; ai_reasoning?: string; ai_recommended_action?: string; transactions?: any; created_at: string }
interface Investigation { id: string; case_number: string; status: string; priority: string; title: string; summary?: string; total_exposure: number; fraud_alerts?: any; created_at: string }
interface DashData { totalTransactions: number; flaggedTransactions: number; totalVolume: number; avgRiskScore: number; alertsOpen: number; alertsCritical: number; alertsBySeverity: Record<string, number>; alertsByType: Record<string, number>; investigationsOpen: number; totalExposure: number; byTxnType: Record<string, number> }

type Tab = 'overview' | 'transactions' | 'alerts' | 'investigations';

const SEV_CLR: Record<string, string> = { low: 'bg-zinc-800 text-zinc-400', medium: 'bg-blue-900/30 text-blue-400', high: 'bg-amber-900/30 text-amber-400', critical: 'bg-red-900/30 text-red-400' };
const STATUS_CLR: Record<string, string> = { open: 'text-amber-400', investigating: 'text-blue-400', confirmed_fraud: 'text-red-400', false_positive: 'text-zinc-500', escalated: 'text-purple-400', resolved: 'text-emerald-400' };
const COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

const api = async (path: string, opts?: RequestInit) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/fraud${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts?.headers } });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed');
  return json.data;
};

export default function FraudDetectionPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [dash, setDash] = useState<DashData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [patternResult, setPatternResult] = useState<any>(null);
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [txnRef, setTxnRef] = useState('');
  const [txnAmount, setTxnAmount] = useState('');
  const [txnCounterparty, setTxnCounterparty] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [d, t, a, inv] = await Promise.all([api('/dashboard'), api('/transactions'), api('/alerts'), api('/investigations')]);
      setDash(d); setTransactions(t.transactions || t); setAlerts(a); setInvestigations(inv);
    } catch { /* */ } finally { setLoading(false); }
  };

  const addTransaction = async () => {
    if (!txnRef.trim() || !txnAmount) return;
    try {
      const t = await api('/transactions', { method: 'POST', body: JSON.stringify({ transaction_ref: txnRef, amount: Number(txnAmount), counterparty: txnCounterparty || undefined }) });
      setTransactions(prev => [t, ...prev]); setTxnRef(''); setTxnAmount(''); setTxnCounterparty(''); setShowAddTxn(false);
    } catch { /* */ }
  };

  const analyzeTxn = async (id: string) => {
    setAnalyzing(id);
    try {
      const result = await api(`/transactions/${id}/analyze`, { method: 'POST' });
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, risk_score: result.riskScore, flagged: result.riskScore > 60 } : t));
      // Reload alerts
      setAlerts(await api('/alerts'));
    } catch { /* */ }
    setAnalyzing(null);
  };

  const detectPatterns = async () => {
    setDetecting(true);
    try { setPatternResult(await api('/detect-patterns', { method: 'POST' })); } catch { /* */ }
    setDetecting(false);
  };

  const updateAlertStatus = async (id: string, status: string) => {
    try { const a = await api(`/alerts/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); setAlerts(prev => prev.map(x => x.id === id ? a : x)); } catch { /* */ }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-zinc-600" /></div>;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">Fraud Detection</h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        {dash && (
          <div className="flex items-center gap-4 app-region-no-drag">
            {dash.alertsOpen > 0 && <span className="text-[11px] text-amber-400"><Bell className="w-3 h-3 inline mr-1" />{dash.alertsOpen} open alerts</span>}
            {dash.alertsCritical > 0 && <span className="text-[11px] text-red-400"><AlertTriangle className="w-3 h-3 inline mr-1" />{dash.alertsCritical} critical</span>}
            {dash.flaggedTransactions > 0 && <span className="text-[11px] text-red-400/60"><ShieldAlert className="w-3 h-3 inline mr-1" />{dash.flaggedTransactions} flagged</span>}
          </div>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 app-region-no-drag">
          <button onClick={detectPatterns} disabled={detecting} className="h-6 px-2.5 rounded-[5px] text-[11px] text-white/40 hover:text-white/60 hover:bg-white/[0.04] flex items-center gap-1">{detecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} Detect Patterns</button>
          <button onClick={() => setShowAddTxn(true)} className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Txn</button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 px-5 pt-3 pb-0">
        {(['overview', 'transactions', 'alerts', 'investigations'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-3 py-1.5 text-[11px] font-medium rounded-t capitalize', tab === t ? 'text-white bg-white/[0.06]' : 'text-zinc-500 hover:text-zinc-300')}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {/* Overview */}
        {tab === 'overview' && dash && (
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-4 gap-3">
              {[
                { l: 'Transactions', v: dash.totalTransactions, s: `£${(dash.totalVolume / 1000).toFixed(0)}k volume`, c: 'text-indigo-400', ic: Activity },
                { l: 'Flagged', v: dash.flaggedTransactions, s: `Avg risk: ${dash.avgRiskScore}`, c: dash.flaggedTransactions > 0 ? 'text-red-400' : 'text-emerald-400', ic: ShieldAlert },
                { l: 'Open Alerts', v: dash.alertsOpen, s: `${dash.alertsCritical} critical`, c: dash.alertsOpen > 0 ? 'text-amber-400' : 'text-emerald-400', ic: Bell },
                { l: 'Investigations', v: dash.investigationsOpen, s: `£${(dash.totalExposure / 1000).toFixed(0)}k exposure`, c: dash.investigationsOpen > 0 ? 'text-purple-400' : 'text-emerald-400', ic: Search },
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
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Alerts by Severity</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={Object.entries(dash.alertsBySeverity).filter(([,v]) => v > 0).map(([k, v]) => ({ name: k, value: v }))} cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value" paddingAngle={3}>
                      {Object.entries(dash.alertsBySeverity).filter(([,v]) => v > 0).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Alerts by Type</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={Object.entries(dash.alertsByType).map(([k, v]) => ({ name: k, count: v }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 9 }} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {patternResult && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 space-y-3">
                <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /><span className="text-[12px] font-medium text-white/70">AI Pattern Detection</span></div>
                <p className="text-[12px] text-zinc-400">{patternResult.summary}</p>
                {patternResult.trendAnalysis && <p className="text-[11px] text-zinc-500">{patternResult.trendAnalysis}</p>}
                {patternResult.patterns?.map((p: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 py-1">
                    <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', p.severity === 'critical' ? 'bg-red-500' : p.severity === 'high' ? 'bg-amber-500' : 'bg-blue-500')} />
                    <div><span className="text-[12px] text-white/60">{p.name}</span><span className="text-[10px] text-zinc-600 ml-2 capitalize">{p.patternType}</span><p className="text-[11px] text-zinc-500">{p.description}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transactions */}
        {tab === 'transactions' && (
          <div className="p-5 space-y-2">
            {transactions.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-white/[0.04] bg-[#0a0a0a]">
                <Activity className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                <p className="text-[13px] text-zinc-600">No transactions recorded</p>
              </div>
            ) : (
              transactions.map(txn => (
                <div key={txn.id} className="group rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 hover:border-white/[0.1] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-mono text-white/70">{txn.transaction_ref}</span>
                        {txn.flagged && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-900/30 text-red-400">FLAGGED</span>}
                        <span className="text-[10px] text-zinc-600 capitalize">{txn.type}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[12px] font-medium text-white/60">{txn.currency} {txn.amount.toLocaleString()}</span>
                        {txn.counterparty && <span className="text-[11px] text-zinc-500">{txn.counterparty}</span>}
                        <span className="text-[10px] text-zinc-700">{txn.channel} · {txn.country_code}</span>
                        <span className="text-[10px] text-zinc-700">{new Date(txn.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {txn.risk_score != null && (
                        <span className={cn('text-[14px] font-semibold tabular-nums', txn.risk_score > 70 ? 'text-red-400' : txn.risk_score > 40 ? 'text-amber-400' : 'text-emerald-400')}>{txn.risk_score}</span>
                      )}
                      <button onClick={() => analyzeTxn(txn.id)} disabled={analyzing === txn.id} className="h-6 px-2 rounded text-[10px] bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        {analyzing === txn.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Analyze
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Alerts */}
        {tab === 'alerts' && (
          <div className="p-5 space-y-2">
            {alerts.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-white/[0.04] bg-[#0a0a0a]">
                <Bell className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                <p className="text-[13px] text-zinc-600">No fraud alerts</p>
              </div>
            ) : (
              alerts.map(a => (
                <div key={a.id} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn('w-4 h-4', a.severity === 'critical' ? 'text-red-400' : a.severity === 'high' ? 'text-amber-400' : 'text-blue-400')} />
                      <span className="text-[13px] font-medium text-white/80">{a.title}</span>
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', SEV_CLR[a.severity])}>{a.severity}</span>
                      <span className="text-[10px] text-zinc-600 capitalize">{a.alert_type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[10px] capitalize', STATUS_CLR[a.status])}>{a.status.replace('_', ' ')}</span>
                      {a.status === 'open' && (
                        <select onChange={e => updateAlertStatus(a.id, e.target.value)} defaultValue="" className="h-5 px-1 rounded text-[10px] bg-white/[0.04] text-zinc-400 border-none">
                          <option value="" disabled>Action…</option>
                          <option value="investigating">Investigate</option>
                          <option value="false_positive">False Positive</option>
                          <option value="confirmed_fraud">Confirm Fraud</option>
                          <option value="escalated">Escalate</option>
                        </select>
                      )}
                    </div>
                  </div>
                  {a.description && <p className="text-[11px] text-zinc-500">{a.description}</p>}
                  {a.ai_reasoning && <p className="text-[11px] text-zinc-400"><Sparkles className="w-3 h-3 inline mr-1 text-indigo-400" />{a.ai_reasoning}</p>}
                  {a.ai_recommended_action && <span className="text-[10px] text-indigo-400">Recommended: {a.ai_recommended_action}</span>}
                  {a.ai_confidence != null && <span className="text-[10px] text-zinc-600 ml-3">Confidence: {(a.ai_confidence * 100).toFixed(0)}%</span>}
                </div>
              ))
            )}
          </div>
        )}

        {/* Investigations */}
        {tab === 'investigations' && (
          <div className="p-5 space-y-2">
            {investigations.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-white/[0.04] bg-[#0a0a0a]">
                <Search className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                <p className="text-[13px] text-zinc-600">No investigations</p>
              </div>
            ) : (
              investigations.map(inv => (
                <div key={inv.id} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-zinc-500">{inv.case_number}</span>
                        <span className="text-[13px] font-medium text-white/80">{inv.title}</span>
                        <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', inv.priority === 'urgent' ? 'bg-red-900/30 text-red-400' : inv.priority === 'high' ? 'bg-amber-900/30 text-amber-400' : 'bg-zinc-800 text-zinc-400')}>{inv.priority}</span>
                      </div>
                      {inv.summary && <p className="text-[11px] text-zinc-500 mt-0.5">{inv.summary}</p>}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-zinc-600 capitalize">{inv.status.replace('_', ' ')}</span>
                        {inv.total_exposure > 0 && <span className="text-[10px] text-red-400/60">£{inv.total_exposure.toLocaleString()} exposure</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddTxn && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowAddTxn(false)}>
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5 w-[420px] space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-[13px] font-medium text-white">Add Transaction</h3>
            <input value={txnRef} onChange={e => setTxnRef(e.target.value)} placeholder="Transaction reference…" className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
            <input value={txnAmount} onChange={e => setTxnAmount(e.target.value)} placeholder="Amount…" type="number" className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
            <input value={txnCounterparty} onChange={e => setTxnCounterparty(e.target.value)} placeholder="Counterparty (optional)…" className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddTxn(false)} className="h-7 px-3 rounded-md text-[11px] text-zinc-500">Cancel</button>
              <button onClick={addTransaction} disabled={!txnRef.trim() || !txnAmount} className="h-7 px-3 rounded-md text-[11px] font-medium bg-indigo-600 text-white disabled:opacity-30">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
