import { useState } from 'react';
import {
  ShieldAlert, Sparkles, AlertTriangle,
  Plus, Activity, Search,
  Bell, Zap, Trash2, X, CheckCircle2,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';
import ExportButton from '../components/ui/ExportButton';
import type { PDFReportOptions } from '../lib/pdfExport';
import AIExplainabilityPanel from '../components/ui/AIExplainabilityPanel';

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA — Fraud Detection & Transaction Monitoring (Jersey)
   ═══════════════════════════════════════════════════════════════════════════ */

interface Transaction { id: string; transaction_ref: string; type: string; amount: number; currency: string; counterparty: string; country_code: string; channel: string; status: string; risk_score?: number; flagged: boolean; timestamp: string }
interface Alert { id: string; alert_type: string; severity: string; status: string; title: string; description?: string; ai_confidence?: number; ai_reasoning?: string; ai_recommended_action?: string; transaction_ids?: string[]; created_at: string }
interface Investigation { id: string; case_number: string; status: string; priority: string; title: string; summary?: string; total_exposure: number; alert_ids?: string[]; created_at: string }
interface DashData { totalTransactions: number; flaggedTransactions: number; totalVolume: number; avgRiskScore: number; alertsOpen: number; alertsCritical: number; alertsBySeverity: Record<string, number>; alertsByType: Record<string, number>; investigationsOpen: number; totalExposure: number; byTxnType: Record<string, number> }
interface PatternItem { name: string; patternType: string; severity: string; description: string }
interface PatternResult { summary: string; trendAnalysis: string; patterns: PatternItem[] }

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'ft1', transaction_ref: 'TXN-20260301-JE001', type: 'wire', amount: 485000, currency: 'GBP', counterparty: 'Baltic Maritime Corp', country_code: 'LV', channel: 'swift', status: 'flagged', risk_score: 82, flagged: true, timestamp: '2026-03-01T09:15:00Z' },
  { id: 'ft2', transaction_ref: 'TXN-20260301-JE002', type: 'transfer', amount: 125000, currency: 'GBP', counterparty: 'Offshore Holdings BVI', country_code: 'VG', channel: 'online', status: 'flagged', risk_score: 76, flagged: true, timestamp: '2026-03-01T10:30:00Z' },
  { id: 'ft3', transaction_ref: 'TXN-20260228-JE003', type: 'transfer', amount: 45000, currency: 'GBP', counterparty: 'St Helier Capital Partners', country_code: 'JE', channel: 'online', status: 'cleared', risk_score: 8, flagged: false, timestamp: '2026-02-28T14:00:00Z' },
  { id: 'ft4', transaction_ref: 'TXN-20260228-JE004', type: 'deposit', amount: 9900, currency: 'GBP', counterparty: 'Cash Deposit — Gorey Branch', country_code: 'JE', channel: 'branch', status: 'flagged', risk_score: 74, flagged: true, timestamp: '2026-02-28T11:00:00Z' },
  { id: 'ft5', transaction_ref: 'TXN-20260227-JE005', type: 'deposit', amount: 9850, currency: 'GBP', counterparty: 'Cash Deposit — St Helier', country_code: 'JE', channel: 'branch', status: 'flagged', risk_score: 78, flagged: true, timestamp: '2026-02-27T10:30:00Z' },
  { id: 'ft6', transaction_ref: 'TXN-20260226-JE006', type: 'deposit', amount: 9950, currency: 'GBP', counterparty: 'Cash Deposit — St Brelade', country_code: 'JE', channel: 'branch', status: 'escalated', risk_score: 85, flagged: true, timestamp: '2026-02-26T15:45:00Z' },
  { id: 'ft7', transaction_ref: 'TXN-20260225-JE007', type: 'wire', amount: 750000, currency: 'USD', counterparty: 'Unknown Entity — Cyprus', country_code: 'CY', channel: 'swift', status: 'blocked', risk_score: 95, flagged: true, timestamp: '2026-02-25T08:00:00Z' },
  { id: 'ft8', transaction_ref: 'TXN-20260224-JE008', type: 'wire', amount: 220000, currency: 'EUR', counterparty: 'Normandy Trading SARL', country_code: 'FR', channel: 'swift', status: 'cleared', risk_score: 22, flagged: false, timestamp: '2026-02-24T13:20:00Z' },
  { id: 'ft9', transaction_ref: 'TXN-20260224-JE009', type: 'transfer', amount: 18500, currency: 'GBP', counterparty: 'JE Property Management', country_code: 'JE', channel: 'online', status: 'cleared', risk_score: 5, flagged: false, timestamp: '2026-02-24T09:00:00Z' },
  { id: 'ft10', transaction_ref: 'TXN-20260223-JE010', type: 'wire', amount: 340000, currency: 'AED', counterparty: 'Dubai Gold Trading LLC', country_code: 'AE', channel: 'swift', status: 'cleared', risk_score: 48, flagged: false, timestamp: '2026-02-23T07:30:00Z' },
  { id: 'ft11', transaction_ref: 'TXN-20260222-JE011', type: 'cash', amount: 14500, currency: 'GBP', counterparty: 'ATM Withdrawal — King St', country_code: 'JE', channel: 'atm', status: 'flagged', risk_score: 62, flagged: true, timestamp: '2026-02-22T16:00:00Z' },
  { id: 'ft12', transaction_ref: 'TXN-20260222-JE012', type: 'transfer', amount: 2800, currency: 'GBP', counterparty: 'Waitrose St Helier', country_code: 'JE', channel: 'card', status: 'cleared', risk_score: 2, flagged: false, timestamp: '2026-02-22T12:00:00Z' },
];

const MOCK_ALERTS: Alert[] = [
  { id: 'fa1', alert_type: 'structuring', severity: 'critical', status: 'investigating', title: 'Cash structuring detected — 3 deposits below £10k threshold', description: 'Three consecutive cash deposits across Jersey branches (£9,950 + £9,850 + £9,900) within 72 hours. Classic structuring pattern to evade Jersey mandatory reporting threshold.', ai_confidence: 94, ai_reasoning: 'Sequential branch deposits in 3-day window, each within 2% of £10,000 reporting threshold. Statistical probability of coincidence: <0.2%.', ai_recommended_action: 'File SAR with JFSC immediately. Place transaction hold on account pending MLRO review.', created_at: '2026-02-28T16:00:00Z' },
  { id: 'fa2', alert_type: 'sanctions_evasion', severity: 'critical', status: 'escalated', title: 'Blocked wire to unregistered Cyprus entity — $750k', description: 'Wire transfer of $750,000 to unregistered entity in Cyprus. Originator has Russia-linked beneficial ownership.', ai_confidence: 97, ai_reasoning: 'Destination entity has no verifiable registration. Beneficial owner chains lead to Russian-domiciled individuals.', ai_recommended_action: 'Maintain block. File STR with JFSC. Notify FIU. Consider account closure per Proceeds of Crime (Jersey) Law.', created_at: '2026-02-25T08:05:00Z' },
  { id: 'fa3', alert_type: 'unusual_transfer', severity: 'high', status: 'open', title: 'Large outbound wire to Latvia — £485k', description: 'Significant wire transfer to Baltic Maritime Corp in Latvia. Sender account has prior adverse media flags.', ai_confidence: 72, ai_reasoning: 'Large value + adverse media on sender + high-risk receiving jurisdiction.', ai_recommended_action: 'Request supporting trade documents (invoice, bill of lading). Verify counterparty via company registry.', created_at: '2026-03-01T09:20:00Z' },
  { id: 'fa4', alert_type: 'account_takeover', severity: 'high', status: 'open', title: 'Unusual login pattern — Channel Islands Wealth Mgmt', description: 'Multiple failed login attempts followed by successful access from Tor exit node. £125k transfer initiated to BVI entity within 4 minutes of login.', ai_confidence: 88, ai_reasoning: 'Brute-force login pattern + Tor network + immediate high-value transfer to offshore jurisdiction.', ai_recommended_action: 'Freeze account. Contact account holder via verified phone. Reverse pending transfer if possible.', created_at: '2026-03-01T10:35:00Z' },
  { id: 'fa5', alert_type: 'velocity_anomaly', severity: 'medium', status: 'open', title: 'Transaction velocity spike — Gulf Investment Holdings', description: 'Transaction frequency increased 280% month-over-month. 6 wire transfers totalling AED 2.1M in February vs typical 2 per month.', ai_confidence: 64, ai_reasoning: 'Significant deviation from established pattern. Could be legitimate business expansion or layering activity.', ai_recommended_action: 'Review latest business profile. Request updated financial statements.', created_at: '2026-02-28T12:00:00Z' },
  { id: 'fa6', alert_type: 'behavioral_anomaly', severity: 'low', status: 'resolved', title: 'New counterparty — Normandy Trading SARL', description: 'First-time €220k wire to French entity. Within normal parameters for cross-Channel trade.', ai_confidence: 28, ai_reasoning: 'Low risk. Jersey-France trade corridor is well-established. Amount consistent with declared business activity.', ai_recommended_action: 'No action required. Update counterparty whitelist.', created_at: '2026-02-24T14:00:00Z' },
];

const MOCK_INVESTIGATIONS: Investigation[] = [
  { id: 'fi1', case_number: 'INV-2026-0018', status: 'active', priority: 'urgent', title: 'Cash Structuring — Multiple Jersey Branch Deposits', summary: 'Investigation into systematic cash deposits across 3 Jersey branches over 72 hours. Total value £29,700. Pattern consistent with deliberate evasion of £10k reporting threshold under Proceeds of Crime (Jersey) Law 1999.', total_exposure: 29700, created_at: '2026-02-28T17:00:00Z' },
  { id: 'fi2', case_number: 'INV-2026-0017', status: 'active', priority: 'urgent', title: 'Suspected Sanctions Evasion — Russia-Cyprus Corridor', summary: 'Investigation into attempted $750k wire transfer to unregistered Cyprus entity with Russian beneficial ownership. STR filed with JFSC on 26 Feb 2026.', total_exposure: 750000, created_at: '2026-02-26T09:00:00Z' },
  { id: 'fi3', case_number: 'INV-2026-0015', status: 'active', priority: 'high', title: 'Potential Account Takeover — BVI Transfer', summary: 'Investigating unauthorised access and attempted £125k transfer to British Virgin Islands entity. Account holder confirmed they did not initiate the transaction.', total_exposure: 125000, created_at: '2026-03-01T11:00:00Z' },
  { id: 'fi4', case_number: 'INV-2026-0012', status: 'closed', priority: 'medium', title: 'Trade-Based ML Screening — Baltic Maritime', summary: 'Review of large-value wire transfers to Latvia-based shipping company. Trade documentation verified. Case closed — legitimate commodity trading.', total_exposure: 485000, created_at: '2026-02-20T10:00:00Z' },
];

const MOCK_DASHBOARD: DashData = {
  totalTransactions: 1842,
  flaggedTransactions: 67,
  totalVolume: 24650000,
  avgRiskScore: 31,
  alertsOpen: 4,
  alertsCritical: 2,
  alertsBySeverity: { low: 1, medium: 1, high: 2, critical: 2 },
  alertsByType: { structuring: 1, sanctions_evasion: 1, unusual_transfer: 1, account_takeover: 1, velocity_anomaly: 1, behavioral_anomaly: 1 },
  investigationsOpen: 3,
  totalExposure: 1389700,
  byTxnType: { wire: 520, transfer: 680, deposit: 312, cash: 180, card: 150 },
};

type Tab = 'overview' | 'transactions' | 'alerts' | 'investigations';

const SEV_CLR: Record<string, string> = { low: 'bg-zinc-800 text-zinc-400', medium: 'bg-blue-900/30 text-blue-400', high: 'bg-amber-900/30 text-amber-400', critical: 'bg-red-900/30 text-red-400' };
const STATUS_CLR: Record<string, string> = { open: 'text-amber-400', investigating: 'text-blue-400', confirmed_fraud: 'text-red-400', false_positive: 'text-zinc-500', escalated: 'text-purple-400', resolved: 'text-emerald-400', active: 'text-blue-400', closed: 'text-zinc-500' };
const COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

export default function FraudDetectionPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [investigations, setInvestigations] = useState<Investigation[]>(MOCK_INVESTIGATIONS);
  const [patternResult, setPatternResult] = useState<PatternResult | null>(null);
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [addType, setAddType] = useState('wire');
  const [addAmount, setAddAmount] = useState('');
  const [addCurrency, setAddCurrency] = useState('GBP');
  const [addCounterparty, setAddCounterparty] = useState('');
  const [addCountry, setAddCountry] = useState('JE');
  const [addChannel, setAddChannel] = useState('swift');

  const dash: DashData = {
    ...MOCK_DASHBOARD,
    totalTransactions: transactions.length,
    flaggedTransactions: transactions.filter(t => t.flagged).length,
    alertsOpen: alerts.filter(a => !['resolved', 'false_positive'].includes(a.status)).length,
    alertsCritical: alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length,
    investigationsOpen: investigations.filter(i => i.status === 'active').length,
  };

  const handleAddTxn = () => {
    const id = `ft${Date.now()}`;
    const ref = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-JE${String(transactions.length + 1).padStart(3, '0')}`;
    setTransactions(prev => [{
      id, transaction_ref: ref, type: addType,
      amount: parseFloat(addAmount) || 0, currency: addCurrency,
      counterparty: addCounterparty || 'New Counterparty',
      country_code: addCountry, channel: addChannel,
      status: 'pending', risk_score: 0, flagged: false,
      timestamp: new Date().toISOString(),
    }, ...prev]);
    setShowAddTxn(false);
    setAddType('wire'); setAddAmount(''); setAddCurrency('GBP');
    setAddCounterparty(''); setAddCountry('JE'); setAddChannel('swift');
  };

  const handleDeleteTxn = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));
  const handleResolveAlert = (id: string) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
  const handleDeleteAlert = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));
  const handleCloseInv = (id: string) => setInvestigations(prev => prev.map(i => i.id === id ? { ...i, status: 'closed' } : i));
  const handleDeleteInv = (id: string) => setInvestigations(prev => prev.filter(i => i.id !== id));

  const buildPDFConfig = (): PDFReportOptions => ({
    title: 'Fraud Detection & Transaction Monitoring Report',
    subtitle: `Dashboard export — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    module: 'Fraud Detection',
    jurisdiction: 'Jersey, Channel Islands',
    classification: 'OFFICIAL — SENSITIVE',
    sections: [
      { type: 'stats', stats: [
        { label: 'Total Transactions', value: dash.totalTransactions.toLocaleString() },
        { label: 'Flagged', value: String(dash.flaggedTransactions) },
        { label: 'Open Alerts', value: String(dash.alertsOpen), change: dash.alertsCritical + ' critical' },
        { label: 'Investigations', value: String(dash.investigationsOpen), change: '£' + (dash.totalExposure / 1000).toFixed(0) + 'k exposure' },
      ] },
      { type: 'heading', title: 'Flagged Transactions' },
      { type: 'table', columns: ['Ref', 'Type', 'Amount', 'Counterparty', 'Country', 'Risk', 'Status'],
        rows: transactions.filter(t => t.flagged).map(t => [t.transaction_ref, t.type, `${t.currency} ${t.amount.toLocaleString()}`, t.counterparty, t.country_code, String(t.risk_score ?? '-'), t.status]),
      },
      { type: 'heading', title: 'Open Alerts' },
      { type: 'table', columns: ['Type', 'Severity', 'Title', 'AI Confidence', 'Status'],
        rows: alerts.filter(a => a.status !== 'resolved').map(a => [a.alert_type.replace(/_/g, ' '), a.severity, a.title, a.ai_confidence ? a.ai_confidence + '%' : '-', a.status]),
      },
      { type: 'heading', title: 'Active Investigations' },
      { type: 'table', columns: ['Case #', 'Priority', 'Title', 'Exposure', 'Status'],
        rows: investigations.filter(i => i.status === 'active').map(i => [i.case_number, i.priority, i.title, '£' + i.total_exposure.toLocaleString(), i.status]),
      },
      ...(patternResult ? [
        { type: 'heading' as const, title: 'AI Pattern Detection' },
        { type: 'text' as const, content: patternResult.summary + '\n\n' + patternResult.trendAnalysis },
        { type: 'table' as const, columns: ['Pattern', 'Type', 'Severity', 'Description'],
          rows: patternResult.patterns.map(p => [p.name, p.patternType, p.severity, p.description]),
        },
      ] : []),
    ],
  });

  const detectPatterns = () => {
    setPatternResult({
      summary: 'AI pattern detection identified 3 significant patterns across 1,842 Jersey-processed transactions in the current period.',
      trendAnalysis: 'Flagged transaction rate increased from 2.8% to 3.6% month-over-month. Cash deposit structuring accounts for 42% of all flags.',
      patterns: [
        { name: 'Multi-Branch Cash Structuring', patternType: 'structuring', severity: 'critical', description: 'Coordinated cash deposits across Gorey, St Helier, and St Brelade branches. Each deposit below £10,000 JFSC reporting threshold.' },
        { name: 'Sanctions Circumvention Corridor', patternType: 'sanctions', severity: 'critical', description: 'Wire transfers routed through Cyprus shell entities with opaque Russian beneficial ownership. 3 attempts blocked in 30 days.' },
        { name: 'Velocity Spike — Gulf Corridor', patternType: 'velocity', severity: 'medium', description: 'AED-denominated transfers to UAE entities increased 280%. May indicate legitimate business growth or layering activity.' },
      ],
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">Fraud Detection</h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        <div className="flex items-center gap-4 app-region-no-drag">
          {dash.alertsOpen > 0 && <span className="text-[11px] text-amber-400"><Bell className="w-3 h-3 inline mr-1" />{dash.alertsOpen} open alerts</span>}
          {dash.alertsCritical > 0 && <span className="text-[11px] text-red-400"><AlertTriangle className="w-3 h-3 inline mr-1" />{dash.alertsCritical} critical</span>}
          {dash.flaggedTransactions > 0 && <span className="text-[11px] text-red-400/60"><ShieldAlert className="w-3 h-3 inline mr-1" />{dash.flaggedTransactions} flagged</span>}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 app-region-no-drag">
          <button onClick={detectPatterns} className="h-6 px-2.5 rounded-[5px] text-[11px] text-white/40 hover:text-white/60 hover:bg-white/[0.04] flex items-center gap-1"><Zap className="w-3 h-3" /> Detect Patterns</button>
          <ExportButton getReportConfig={buildPDFConfig} label="Export PDF" compact />
          <button onClick={() => setShowAddTxn(true)} className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Txn</button>
        </div>
      </div>

      <div className="flex items-center gap-1 px-5 pt-3 pb-0">
        {(['overview', 'transactions', 'alerts', 'investigations'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-3 py-1.5 text-[11px] font-medium rounded-t capitalize', tab === t ? 'text-white bg-white/[0.06]' : 'text-zinc-500 hover:text-zinc-300')}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === 'overview' && (
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-4 gap-3">
              {[
                { l: 'Transactions', v: dash.totalTransactions.toLocaleString(), s: '\u00a3' + (dash.totalVolume / 1000000).toFixed(1) + 'M volume', c: 'text-indigo-400', ic: Activity },
                { l: 'Flagged', v: dash.flaggedTransactions, s: 'Avg risk: ' + dash.avgRiskScore, c: dash.flaggedTransactions > 0 ? 'text-red-400' : 'text-emerald-400', ic: ShieldAlert },
                { l: 'Open Alerts', v: dash.alertsOpen, s: dash.alertsCritical + ' critical', c: dash.alertsOpen > 0 ? 'text-amber-400' : 'text-emerald-400', ic: Bell },
                { l: 'Investigations', v: dash.investigationsOpen, s: '\u00a3' + (dash.totalExposure / 1000).toFixed(0) + 'k exposure', c: dash.investigationsOpen > 0 ? 'text-purple-400' : 'text-emerald-400', ic: Search },
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
                  <BarChart data={Object.entries(dash.alertsByType).map(([k, v]) => ({ name: k.replace(/_/g, ' '), count: v }))}>
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
                {patternResult.patterns?.map((p: PatternItem, i: number) => (
                  <div key={i} className="flex items-start gap-2 py-1">
                    <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', p.severity === 'critical' ? 'bg-red-500' : p.severity === 'high' ? 'bg-amber-500' : 'bg-blue-500')} />
                    <div><span className="text-[12px] text-white/60">{p.name}</span><span className="text-[10px] text-zinc-600 ml-2 capitalize">{p.patternType}</span><p className="text-[11px] text-zinc-500">{p.description}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'transactions' && (
          <div className="p-5 space-y-2">
            {transactions.map(txn => (
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
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {txn.risk_score != null && (
                      <span className={cn('text-[14px] font-semibold tabular-nums', txn.risk_score > 70 ? 'text-red-400' : txn.risk_score > 40 ? 'text-amber-400' : 'text-emerald-400')}>{txn.risk_score}</span>
                    )}
                    <button onClick={() => handleDeleteTxn(txn.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-900/20 rounded transition-all" title="Delete"><Trash2 className="w-3 h-3 text-red-400/60 hover:text-red-400" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'alerts' && (
          <div className="p-5 space-y-2">
            {alerts.map(a => (
              <div key={a.id} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn('w-4 h-4', a.severity === 'critical' ? 'text-red-400' : a.severity === 'high' ? 'text-amber-400' : 'text-blue-400')} />
                    <span className="text-[13px] font-medium text-white/80">{a.title}</span>
                    <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', SEV_CLR[a.severity])}>{a.severity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[10px] capitalize', STATUS_CLR[a.status])}>{a.status.replace('_', ' ')}</span>
                    {a.status !== 'resolved' && (
                      <button onClick={() => handleResolveAlert(a.id)} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />Resolve
                      </button>
                    )}
                    <button onClick={() => handleDeleteAlert(a.id)} className="p-1 hover:bg-red-900/20 rounded" title="Delete"><Trash2 className="w-3 h-3 text-red-400/60 hover:text-red-400" /></button>
                  </div>
                </div>
                {a.description && <p className="text-[11px] text-zinc-500">{a.description}</p>}
                {a.ai_confidence != null && (
                  <AIExplainabilityPanel
                    confidence={a.ai_confidence}
                    reasoning={a.ai_reasoning || 'No reasoning available'}
                    recommendedAction={a.ai_recommended_action}
                    factors={[
                      ...(a.alert_type === 'structuring' ? [
                        { factor: 'Sub-threshold Deposits', weight: 'high' as const, detail: 'Multiple deposits within 2% of £10k reporting threshold' },
                        { factor: 'Temporal Clustering', weight: 'high' as const, detail: 'All deposits made within 72-hour rolling window' },
                        { factor: 'Branch Distribution', weight: 'medium' as const, detail: 'Deposits spread across multiple Jersey branches' },
                      ] : a.alert_type === 'sanctions_evasion' ? [
                        { factor: 'Sanctions Nexus', weight: 'high' as const, detail: 'Beneficial ownership linked to sanctioned jurisdiction' },
                        { factor: 'Unregistered Entity', weight: 'high' as const, detail: 'Destination entity has no verifiable registration' },
                        { factor: 'Transfer Value', weight: 'medium' as const, detail: 'High-value transfer — above enhanced due diligence threshold' },
                      ] : a.alert_type === 'account_takeover' ? [
                        { factor: 'Anomalous Login', weight: 'high' as const, detail: 'Tor exit node + brute-force login pattern detected' },
                        { factor: 'Immediate Transfer', weight: 'high' as const, detail: 'High-value transfer initiated within minutes of access' },
                        { factor: 'Offshore Destination', weight: 'medium' as const, detail: 'Funds directed to BVI — common shell company jurisdiction' },
                      ] : [
                        { factor: 'Pattern Match', weight: 'medium' as const, detail: 'Transaction pattern deviates from established baseline' },
                        { factor: 'Risk Jurisdiction', weight: a.severity === 'high' || a.severity === 'critical' ? 'high' as const : 'low' as const, detail: 'Counterparty jurisdiction risk assessment' },
                      ]),
                    ]}
                    dataSources={['Transaction Monitoring System', 'Sanctions Lists (OFSI/EU/UN)', 'Jersey Company Registry', 'Adverse Media Database']}
                    modelInfo={{ name: 'Velanova Fraud Detection Engine', version: '3.2.1', type: 'Ensemble (XGBoost + Rule-based)' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'investigations' && (
          <div className="p-5 space-y-2">
            {investigations.map(inv => (
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
                      <span className={cn('text-[10px] capitalize', STATUS_CLR[inv.status])}>{inv.status}</span>
                      {inv.total_exposure > 0 && <span className="text-[10px] text-red-400/60">{'\u00a3'}{inv.total_exposure.toLocaleString()} exposure</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {inv.status === 'active' && (
                      <button onClick={() => handleCloseInv(inv.id)} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700">Close</button>
                    )}
                    <button onClick={() => handleDeleteInv(inv.id)} className="p-1 hover:bg-red-900/20 rounded" title="Delete"><Trash2 className="w-3 h-3 text-red-400/60 hover:text-red-400" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddTxn && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowAddTxn(false)}>
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5 w-[440px] space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-medium text-white">Add Transaction</h3>
              <button onClick={() => setShowAddTxn(false)} className="p-1 hover:bg-white/[0.06] rounded"><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Type</label>
                <select value={addType} onChange={e => setAddType(e.target.value)} className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none">
                  <option value="wire">Wire</option>
                  <option value="transfer">Transfer</option>
                  <option value="deposit">Deposit</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Channel</label>
                <select value={addChannel} onChange={e => setAddChannel(e.target.value)} className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none">
                  <option value="swift">SWIFT</option>
                  <option value="online">Online</option>
                  <option value="branch">Branch</option>
                  <option value="atm">ATM</option>
                  <option value="card">Card</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Amount</label>
                <input value={addAmount} onChange={e => setAddAmount(e.target.value)} placeholder="0.00" type="number" className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Currency</label>
                <select value={addCurrency} onChange={e => setAddCurrency(e.target.value)} className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none">
                  <option value="GBP">GBP</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="AED">AED</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Counterparty</label>
              <input value={addCounterparty} onChange={e => setAddCounterparty(e.target.value)} placeholder="Entity name..." className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Country Code</label>
              <input value={addCountry} onChange={e => setAddCountry(e.target.value)} placeholder="JE" maxLength={2} className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none uppercase" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowAddTxn(false)} className="h-7 px-3 rounded-md text-[11px] text-zinc-500 hover:text-white">Cancel</button>
              <button onClick={handleAddTxn} disabled={!addAmount} className="h-7 px-4 rounded-md text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30">Add Transaction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
