import { useState } from 'react';
import {
  ShoppingCart, Plus, Sparkles, AlertTriangle, Clock,
  ChevronRight, DollarSign, Trash2, X,
  Building2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';
import ExportButton from '../components/ui/ExportButton';
import type { PDFReportOptions } from '../lib/pdfExport';

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA — Procurement & Contract Intelligence (Jersey)
   ═══════════════════════════════════════════════════════════════════════════ */

interface Contract {
  id: string; title: string; vendor: string; contract_type: string;
  value?: number; currency: string; start_date?: string; end_date?: string;
  renewal_date?: string; auto_renew: boolean; status: string;
  risk_score?: number; department?: string; owner?: string;
  tags: string[]; created_at: string;
}
interface DashData {
  totalContracts: number; activeContracts: number; expiringContracts: number;
  expiredContracts: number; totalValue: number; avgRiskScore: number;
  highRiskContracts: number; pendingReviews: number;
  byType: Record<string, number>; recentContracts: Contract[];
}
interface AnalysisResult { riskAssessment: string; vendorAnalysis: string; costAnalysis: string; recommendations: string[] }

const RISK_COLOR = (s: number) => s > 70 ? 'text-red-400' : s > 40 ? 'text-amber-400' : 'text-emerald-400';
const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-zinc-800 text-zinc-400',
  review: 'bg-blue-900/30 text-blue-400',
  active: 'bg-emerald-900/30 text-emerald-400',
  expiring: 'bg-amber-900/30 text-amber-400',
  expired: 'bg-red-900/30 text-red-400',
  terminated: 'bg-zinc-800 text-zinc-600',
};

const MOCK_CONTRACTS: Contract[] = [
  { id: 'pc1', title: 'Core Banking Platform Licence', vendor: 'Temenos AG', contract_type: 'software_licence', value: 285000, currency: 'GBP', start_date: '2025-04-01', end_date: '2028-03-31', renewal_date: '2027-12-01', auto_renew: true, status: 'active', risk_score: 22, department: 'Technology', owner: 'David Le Cornu', tags: ['banking', 'core-system', 'critical'], created_at: '2025-03-15T10:00:00Z' },
  { id: 'pc2', title: 'Sanctions Screening API', vendor: 'Refinitiv World-Check', contract_type: 'saas', value: 48000, currency: 'GBP', start_date: '2026-01-01', end_date: '2026-12-31', renewal_date: '2026-10-01', auto_renew: true, status: 'active', risk_score: 15, department: 'Compliance', owner: 'Claire de la Haye', tags: ['sanctions', 'aml', 'api'], created_at: '2025-11-20T10:00:00Z' },
  { id: 'pc3', title: 'Royal Square Office Lease', vendor: 'Le Masurier Commercial', contract_type: 'lease', value: 420000, currency: 'GBP', start_date: '2026-03-01', end_date: '2031-02-28', renewal_date: '2030-09-01', auto_renew: false, status: 'active', risk_score: 18, department: 'Operations', owner: 'Rachel Du Feu', tags: ['office', 'st-helier', 'property'], created_at: '2026-01-15T10:00:00Z' },
  { id: 'pc4', title: 'IT Managed Services', vendor: 'C5 Alliance Group', contract_type: 'managed_service', value: 156000, currency: 'GBP', start_date: '2025-06-01', end_date: '2027-05-31', renewal_date: '2027-02-01', auto_renew: true, status: 'active', risk_score: 28, department: 'Technology', owner: 'David Le Cornu', tags: ['it', 'managed-services', 'jersey'], created_at: '2025-05-01T10:00:00Z' },
  { id: 'pc5', title: 'Annual Audit — Statutory', vendor: 'PwC Channel Islands', contract_type: 'professional_service', value: 95000, currency: 'GBP', start_date: '2026-01-01', end_date: '2026-12-31', renewal_date: '2026-09-01', auto_renew: false, status: 'active', risk_score: 12, department: 'Finance', owner: 'Philippe Le Rossignol', tags: ['audit', 'statutory', 'pwc'], created_at: '2025-10-15T10:00:00Z' },
  { id: 'pc6', title: 'Connectivity & WAN', vendor: 'JT Group', contract_type: 'telecoms', value: 72000, currency: 'GBP', start_date: '2025-09-01', end_date: '2027-08-31', renewal_date: '2027-05-01', auto_renew: true, status: 'active', risk_score: 20, department: 'Technology', owner: 'David Le Cornu', tags: ['telecoms', 'network', 'jt'], created_at: '2025-08-15T10:00:00Z' },
  { id: 'pc7', title: 'Legal Advisory — Regulatory', vendor: 'Ogier LLP', contract_type: 'professional_service', value: 180000, currency: 'GBP', start_date: '2025-01-01', end_date: '2025-12-31', renewal_date: '2025-10-01', auto_renew: false, status: 'expired', risk_score: 45, department: 'Legal', owner: 'Claire de la Haye', tags: ['legal', 'regulatory', 'ogier'], created_at: '2024-11-20T10:00:00Z' },
  { id: 'pc8', title: 'Document Verification AI', vendor: 'Onfido Ltd', contract_type: 'saas', value: 36000, currency: 'GBP', start_date: '2026-02-01', end_date: '2027-01-31', renewal_date: '2026-11-01', auto_renew: true, status: 'active', risk_score: 30, department: 'Compliance', owner: 'James Ahier', tags: ['kyc', 'ai', 'verification'], created_at: '2026-01-10T10:00:00Z' },
  { id: 'pc9', title: 'Cyber Insurance Policy', vendor: 'AIG Europe', contract_type: 'insurance', value: 65000, currency: 'GBP', start_date: '2026-01-01', end_date: '2026-12-31', renewal_date: '2026-10-15', auto_renew: false, status: 'active', risk_score: 8, department: 'Risk', owner: 'Philippe Le Rossignol', tags: ['insurance', 'cyber', 'risk'], created_at: '2025-11-01T10:00:00Z' },
  { id: 'pc10', title: 'JFSC Regulatory Filing System', vendor: 'Jersey Financial Services Commission', contract_type: 'regulatory', value: 24000, currency: 'GBP', start_date: '2026-01-01', end_date: '2026-12-31', renewal_date: '2026-11-01', auto_renew: true, status: 'expiring', risk_score: 35, department: 'Compliance', owner: 'Claire de la Haye', tags: ['jfsc', 'regulatory', 'filing'], created_at: '2025-12-01T10:00:00Z' },
];

const MOCK_DASHBOARD: DashData = {
  totalContracts: 10,
  activeContracts: 8,
  expiringContracts: 1,
  expiredContracts: 1,
  totalValue: 1381000,
  avgRiskScore: 23,
  highRiskContracts: 1,
  pendingReviews: 2,
  byType: { software_licence: 1, saas: 2, lease: 1, managed_service: 1, professional_service: 2, telecoms: 1, insurance: 1, regulatory: 1 },
  recentContracts: [],
};

export default function ProcurementPage() {
  const [view, setView] = useState<'dashboard' | 'detail'>('dashboard');
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS);
  const [selected, setSelected] = useState<Contract | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addVendor, setAddVendor] = useState('');
  const [addValue, setAddValue] = useState('');
  const [addType, setAddType] = useState('saas');

  const dash = MOCK_DASHBOARD;

  const runAnalysis = (contract: Contract) => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalysis({
        riskAssessment: `Contract "${contract.title}" risk score: ${contract.risk_score}/100. ${(contract.risk_score || 0) > 50 ? 'Elevated risk — review required.' : 'Within acceptable parameters.'}`,
        vendorAnalysis: `Vendor: ${contract.vendor}. ${contract.auto_renew ? 'Auto-renewal enabled — review terms before renewal date.' : 'Manual renewal required.'}`,
        costAnalysis: `Value: £${(contract.value || 0).toLocaleString()} (${contract.currency}). ${contract.contract_type === 'lease' ? 'Property lease — consider break clause review.' : 'Standard commercial terms.'}`,
        recommendations: [
          contract.status === 'expiring' ? 'Initiate renewal negotiations immediately' : 'Schedule pre-renewal review 3 months before expiry',
          'Verify vendor JFSC registration status and compliance certifications',
          'Cross-reference with Jersey Data Protection Authority requirements',
          'Benchmark pricing against Channel Islands market rates',
        ],
      });
      setAnalyzing(false);
    }, 800);
  };

  const handleAddContract = () => {
    if (!addTitle.trim()) return;
    const id = `pc${Date.now()}`;
    setContracts(prev => [{
      id, title: addTitle.trim(), vendor: addVendor || 'TBC', contract_type: addType,
      value: parseFloat(addValue) || 0, currency: 'GBP', start_date: new Date().toISOString().slice(0, 10),
      auto_renew: false, status: 'draft', risk_score: 0, department: 'General', owner: 'Unassigned',
      tags: [], created_at: new Date().toISOString(),
    }, ...prev]);
    setShowAdd(false); setAddTitle(''); setAddVendor(''); setAddValue(''); setAddType('saas');
  };

  const handleDeleteContract = (id: string) => {
    setContracts(prev => prev.filter(c => c.id !== id));
    if (selected?.id === id) { setSelected(null); setView('dashboard'); setAnalysis(null); }
  };

  const buildPDFConfig = (): PDFReportOptions => ({
    title: 'Procurement & Contract Intelligence Report',
    subtitle: `Dashboard export — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    module: 'Procurement Intelligence',
    jurisdiction: 'Jersey, Channel Islands',
    classification: 'OFFICIAL',
    sections: [
      { type: 'stats', stats: [
        { label: 'Total Contracts', value: String(dash.totalContracts) },
        { label: 'Active', value: String(dash.activeContracts) },
        { label: 'Total Value', value: '£' + (dash.totalValue / 1000).toFixed(0) + 'k' },
        { label: 'Avg Risk Score', value: String(dash.avgRiskScore), change: dash.highRiskContracts + ' high-risk' },
      ] },
      { type: 'heading', title: 'Contract Portfolio' },
      { type: 'table', columns: ['Title', 'Vendor', 'Type', 'Value', 'Status', 'Risk', 'End Date'],
        rows: contracts.map(c => [c.title, c.vendor, c.contract_type.replace(/_/g, ' '), c.value ? '£' + c.value.toLocaleString() : '-', c.status, String(c.risk_score || '-'), c.end_date || '-']),
      },
      ...(analysis ? [
        { type: 'heading' as const, title: 'AI Contract Analysis' },
        { type: 'text' as const, content: analysis.riskAssessment + '\n\n' + analysis.vendorAnalysis + '\n\n' + analysis.costAnalysis },
        { type: 'heading' as const, title: 'Recommendations' },
        { type: 'text' as const, content: analysis.recommendations.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n') },
      ] : []),
    ],
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">
          Procurement Intelligence
        </h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        {view === 'detail' && selected && (
          <button
            onClick={() => { setView('dashboard'); setSelected(null); setAnalysis(null); }}
            className="text-[11px] text-zinc-400 hover:text-white app-region-no-drag"
          >
            ← Back
          </button>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-2 app-region-no-drag">
          {dash.expiringContracts > 0 && (
            <span className="text-[11px] text-amber-400">
              <Clock className="w-3 h-3 inline mr-1" />{dash.expiringContracts} expiring
            </span>
          )}
          <ExportButton getReportConfig={buildPDFConfig} label="Export PDF" compact />
          <button onClick={() => setShowAdd(true)} className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1">
            <Plus className="w-3 h-3" /> New Contract
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* ──── Dashboard View ──── */}
        {view === 'dashboard' && (
          <div className="p-5 space-y-5">
            {/* Stat Cards */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { l: 'Contracts', v: dash.totalContracts, s: `${dash.activeContracts} active`, c: 'text-indigo-400', ic: ShoppingCart },
                { l: 'Total Value', v: `£${(dash.totalValue / 1000).toFixed(0)}k`, s: `${dash.avgRiskScore} avg risk`, c: 'text-emerald-400', ic: DollarSign },
                { l: 'Expiring', v: dash.expiringContracts, s: 'Needs renewal', c: dash.expiringContracts > 0 ? 'text-amber-400' : 'text-emerald-400', ic: Clock },
                { l: 'High Risk', v: dash.highRiskContracts, s: `${dash.pendingReviews} pending review`, c: dash.highRiskContracts > 0 ? 'text-red-400' : 'text-emerald-400', ic: AlertTriangle },
              ].map(card => (
                <div key={card.l} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{card.l}</span>
                    <card.ic className={cn('w-4 h-4', card.c)} />
                  </div>
                  <div className={cn('text-[22px] font-semibold tabular-nums', card.c)}>{card.v}</div>
                  <span className="text-[11px] text-zinc-600">{card.s}</span>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
              <h3 className="text-[12px] font-medium text-white/70 mb-3">Contracts by Type</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={Object.entries(dash.byType).map(([k, v]) => ({ name: k.replace(/_/g, ' '), count: v }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Contract List */}
            <div className="space-y-2">
              <h3 className="text-[12px] font-medium text-white/70">All Contracts</h3>
              {contracts.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelected(c); setView('detail'); setAnalysis(null); }}
                  className="w-full text-left rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 hover:border-white/[0.1] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-white/80">{c.title}</span>
                        <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', STATUS_BADGE[c.status] || STATUS_BADGE.active)}>
                          {c.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Building2 className="w-3 h-3 text-zinc-600" />
                        <span className="text-[11px] text-zinc-500">{c.vendor}</span>
                        <span className="text-[10px] text-zinc-700">{c.department}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-zinc-600">£{(c.value || 0).toLocaleString()}</span>
                        <span className="text-[10px] text-zinc-700">{c.start_date} → {c.end_date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className={cn('text-[16px] font-semibold tabular-nums', RISK_COLOR(c.risk_score || 0))}>
                          {c.risk_score || 0}
                        </span>
                        <span className="text-[9px] text-zinc-600">risk</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-700" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ──── Detail View ──── */}
        {view === 'detail' && selected && (
          <div className="p-5 space-y-4">
            {/* Header Card */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-semibold text-white/90">{selected.title}</h2>
                    <button onClick={() => handleDeleteContract(selected.id)} className="p-1 hover:bg-red-900/20 rounded" title="Delete contract"><Trash2 className="w-3.5 h-3.5 text-red-400/50 hover:text-red-400" /></button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-[12px] text-zinc-400">{selected.vendor}</span>
                    <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', STATUS_BADGE[selected.status])}>
                      {selected.status}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={cn('text-[24px] font-bold tabular-nums', RISK_COLOR(selected.risk_score || 0))}>
                    {selected.risk_score || 0}
                  </span>
                  <span className="text-[9px] text-zinc-600">risk score</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { l: 'Value', v: `£${(selected.value || 0).toLocaleString()}` },
                  { l: 'Type', v: selected.contract_type.replace(/_/g, ' ') },
                  { l: 'Start', v: selected.start_date || '—' },
                  { l: 'End', v: selected.end_date || '—' },
                ].map(f => (
                  <div key={f.l}>
                    <span className="text-[10px] text-zinc-600 uppercase">{f.l}</span>
                    <div className="text-[13px] text-white/70 capitalize">{f.v}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { l: 'Department', v: selected.department || '—' },
                  { l: 'Owner', v: selected.owner || '—' },
                  { l: 'Auto-Renew', v: selected.auto_renew ? 'Yes' : 'No' },
                ].map(f => (
                  <div key={f.l}>
                    <span className="text-[10px] text-zinc-600 uppercase">{f.l}</span>
                    <div className="text-[13px] text-white/70">{f.v}</div>
                  </div>
                ))}
              </div>

              {selected.renewal_date && (
                <div className="flex items-center gap-2 text-[11px] text-amber-400/80">
                  <Clock className="w-3.5 h-3.5" />
                  Renewal date: {selected.renewal_date}
                </div>
              )}

              {selected.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {selected.tags.map(t => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* AI Analysis */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-[12px] font-medium text-white/70">AI Contract Analysis</span>
                </div>
                <button
                  onClick={() => runAnalysis(selected)}
                  disabled={analyzing}
                  className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 flex items-center gap-1"
                >
                  {analyzing ? 'Analysing…' : 'Run Analysis'}
                </button>
              </div>
              {analysis && (
                <div className="space-y-2">
                  <p className="text-[12px] text-zinc-400">{analysis.riskAssessment}</p>
                  <p className="text-[11px] text-zinc-500">{analysis.vendorAnalysis}</p>
                  <p className="text-[11px] text-zinc-500">{analysis.costAnalysis}</p>
                  {analysis.recommendations && (
                    <div className="space-y-1 mt-2">
                      <h4 className="text-[11px] font-medium text-white/60">Recommendations</h4>
                      {analysis.recommendations.map((r: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 py-0.5">
                          <span className="w-4 h-4 rounded-full bg-indigo-900/40 text-indigo-400 text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-[11px] text-zinc-400">{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Contract Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5 w-[440px] space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-medium text-white">New Contract</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-white/[0.06] rounded"><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Title</label>
              <input value={addTitle} onChange={e => setAddTitle(e.target.value)} placeholder="Contract title..." className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Vendor</label>
              <input value={addVendor} onChange={e => setAddVendor(e.target.value)} placeholder="Vendor name..." className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Value (GBP)</label>
                <input value={addValue} onChange={e => setAddValue(e.target.value)} placeholder="0" type="number" className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Type</label>
                <select value={addType} onChange={e => setAddType(e.target.value)} className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none">
                  <option value="saas">SaaS</option>
                  <option value="software_licence">Software Licence</option>
                  <option value="professional_service">Professional Service</option>
                  <option value="managed_service">Managed Service</option>
                  <option value="lease">Lease</option>
                  <option value="telecoms">Telecoms</option>
                  <option value="insurance">Insurance</option>
                  <option value="regulatory">Regulatory</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowAdd(false)} className="h-7 px-3 rounded-md text-[11px] text-zinc-500 hover:text-white">Cancel</button>
              <button onClick={handleAddContract} disabled={!addTitle.trim()} className="h-7 px-4 rounded-md text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30">Add Contract</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
