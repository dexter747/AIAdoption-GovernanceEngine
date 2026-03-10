import { useState } from 'react';
import {
  Scale, Plus, Sparkles, AlertTriangle, Trash2,
  ExternalLink, X, ChevronRight, Shield, Search,
  CircleDot,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA — Regulatory Intelligence (Jersey)
   ═══════════════════════════════════════════════════════════════════════════ */

interface Change {
  id: string; title: string; summary?: string; body?: string;
  change_type: string; jurisdiction: string; sector: string[];
  effective_date?: string; severity: string; status: string;
  ai_impact_summary?: string; ai_action_items?: string[];
  ai_risk_score?: number; tags: string[]; external_url?: string;
  created_at: string;
}
interface DashData {
  totalChanges: number; newChanges: number; underReview: number;
  criticalChanges: number; highChanges: number; avgRiskScore: number;
  pendingAssessments: number; activeSources: number;
  changesByType: Record<string, number>; recentChanges: Change[];
}

const SEVERITY_BADGE: Record<string, string> = {
  low: 'bg-blue-900/30 text-blue-400',
  medium: 'bg-amber-900/30 text-amber-400',
  high: 'bg-orange-900/30 text-orange-400',
  critical: 'bg-red-900/30 text-red-400',
};
const STATUS_BADGE: Record<string, string> = {
  new: 'bg-indigo-900/30 text-indigo-400',
  under_review: 'bg-amber-900/30 text-amber-400',
  assessed: 'bg-emerald-900/30 text-emerald-400',
  implemented: 'bg-zinc-800 text-zinc-400',
  dismissed: 'bg-zinc-800 text-zinc-600',
};

const MOCK_CHANGES: Change[] = [
  {
    id: 'rc1', title: 'JFSC AML/CFT Handbook — 10% BO Threshold',
    summary: 'JFSC amends AML/CFT Handbook to lower beneficial ownership identification threshold from 25% to 10% for higher-risk relationships.',
    body: 'The Jersey Financial Services Commission has published revised guidance under the AML/CFT Handbook requiring regulated entities to identify and verify beneficial owners holding 10% or more interest in higher-risk business relationships. This aligns Jersey with emerging FATF best practice and addresses MONEYVAL recommendations.',
    change_type: 'guidance', jurisdiction: 'Jersey', sector: ['banking', 'fund_services', 'trust_company'],
    effective_date: '2026-04-01', severity: 'critical', status: 'under_review',
    ai_impact_summary: 'Significant operational impact. All existing client files with BOs between 10-25% must be reviewed and verified. Estimated 340 client relationships affected across fund admin and trust company divisions.',
    ai_action_items: ['Identify all client relationships with BOs between 10-25%', 'Commission enhanced due diligence for affected relationships', 'Update onboarding procedures and forms', 'Train front-office staff on new thresholds', 'Notify existing clients of documentation requirements'],
    ai_risk_score: 82, tags: ['aml', 'jfsc', 'beneficial-ownership', 'handbook'], external_url: 'https://www.jerseyfsc.org/industry/guidance-and-policy/aml-cft-handbook/',
    created_at: '2026-02-15T09:00:00Z',
  },
  {
    id: 'rc2', title: 'MONEYVAL 5th Round Follow-Up — VASP Supervision',
    summary: 'MONEYVAL publishes follow-up report noting Jersey must demonstrate effective VASP supervision and BO register access improvements.',
    change_type: 'international_standard', jurisdiction: 'International', sector: ['virtual_assets', 'banking'],
    effective_date: '2026-06-01', severity: 'high', status: 'under_review',
    ai_impact_summary: 'Reputational risk if Jersey fails to demonstrate progress. VASP-related activities may face enhanced scrutiny. BO register access improvements expected to be mandated by year-end.',
    ai_action_items: ['Review VASP client exposure', 'Prepare for enhanced BO register access requirements', 'Monitor JFSC response and industry consultation'],
    ai_risk_score: 68, tags: ['moneyval', 'vasp', 'bo-register', 'fatf'],
    created_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'rc3', title: 'Economic Substance (Jersey) Law — Updated Guidance',
    summary: 'States of Jersey publish updated guidance on Economic Substance requirements for Jersey-resident entities, effective July 2026.',
    change_type: 'legislation', jurisdiction: 'Jersey', sector: ['fund_services', 'trust_company', 'holding_company'],
    effective_date: '2026-07-01', severity: 'high', status: 'new',
    ai_impact_summary: 'Affects all Jersey-resident managed entities. Updated guidance clarifies directed and managed test, CIGA requirements for holding companies, and outsourcing arrangements.',
    ai_action_items: ['Review all managed entity substance arrangements', 'Update board meeting schedules and management reporting', 'Document CIGA for holding company structures', 'Review outsourcing arrangements for substance compliance'],
    ai_risk_score: 62, tags: ['economic-substance', 'jersey-law', 'tax'], external_url: 'https://www.gov.je/TaxesMoney/IncomeTax/Companies/Pages/EconomicSubstance.aspx',
    created_at: '2026-03-01T08:00:00Z',
  },
  {
    id: 'rc4', title: 'JDPA Enforcement — First Penalty Notice',
    summary: 'Jersey Data Protection Authority issues first significant monetary penalty (£50,000) for GDPR-equivalent breach involving automated decision-making without DPIA.',
    change_type: 'enforcement', jurisdiction: 'Jersey', sector: ['all'],
    effective_date: '2026-02-20', severity: 'high', status: 'assessed',
    ai_impact_summary: 'Precedent-setting enforcement action. Any AI/ML processing without a completed DPIA is now at elevated risk. Creates hard dependency for Digital KYC Platform project.',
    ai_action_items: ['Audit all AI/ML processing activities', 'Prioritise DPIA completion for customer-facing AI systems', 'Review automated decision-making transparency obligations', 'Update privacy notices for AI-powered services'],
    ai_risk_score: 72, tags: ['jdpa', 'data-protection', 'enforcement', 'dpia', 'ai'],
    created_at: '2026-02-22T08:00:00Z',
  },
  {
    id: 'rc5', title: 'EU Equivalence Decision — Jersey AML Framework',
    summary: 'European Commission renews equivalence decision for Jersey AML/CFT framework, maintaining access to EU financial services passporting.',
    change_type: 'international_standard', jurisdiction: 'EU', sector: ['banking', 'fund_services'],
    effective_date: '2026-01-15', severity: 'medium', status: 'implemented',
    ai_impact_summary: 'Positive development. Maintains Jersey access to EU markets. No immediate action required, but ongoing compliance with EU-equivalent standards is essential.',
    ai_action_items: ['Document EU equivalence status for client communications', 'Maintain alignment with EU AML Directive updates'],
    ai_risk_score: 25, tags: ['eu', 'equivalence', 'aml', 'passporting'],
    created_at: '2026-01-18T10:00:00Z',
  },
  {
    id: 'rc6', title: 'FATF Grey List Risk — Monitoring',
    summary: 'FATF mutual evaluation cycle update. Jersey not currently listed but monitoring required given MONEYVAL follow-up findings.',
    change_type: 'risk_alert', jurisdiction: 'International', sector: ['all'],
    severity: 'medium', status: 'under_review',
    ai_impact_summary: 'Low probability but high impact. Grey-listing would significantly affect Jersey financial services reputation. Industry-wide response coordination recommended.',
    ai_action_items: ['Monitor FATF plenary outcomes', 'Support industry response to MONEYVAL findings', 'Review firm-level AML/CFT effectiveness measures'],
    ai_risk_score: 48, tags: ['fatf', 'grey-list', 'moneyval', 'risk'],
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'rc7', title: 'JFSC Guidance Note — Cyber Security for Regulated Firms',
    summary: 'Updated JFSC guidance on cyber security minimum standards for all Jersey-regulated financial services businesses.',
    change_type: 'guidance', jurisdiction: 'Jersey', sector: ['all'],
    effective_date: '2026-05-01', severity: 'medium', status: 'new',
    ai_impact_summary: 'Raises baseline cyber security expectations. New requirements include mandatory incident reporting within 72 hours, annual penetration testing, and board-level cyber risk reporting.',
    ai_action_items: ['Gap analysis against new guidance requirements', 'Implement 72-hour incident reporting procedure', 'Schedule annual penetration testing', 'Add cyber risk to board reporting pack'],
    ai_risk_score: 45, tags: ['cybersecurity', 'jfsc', 'guidance', 'regulated-firms'],
    created_at: '2026-03-05T08:00:00Z',
  },
  {
    id: 'rc8', title: 'Proceeds of Crime (Amendment No. 8) (Jersey) Law',
    summary: 'Amendment to Proceeds of Crime (Jersey) Law 1999 introducing new corporate criminal liability for failure to prevent money laundering.',
    change_type: 'legislation', jurisdiction: 'Jersey', sector: ['banking', 'fund_services', 'trust_company'],
    effective_date: '2026-09-01', severity: 'critical', status: 'new',
    ai_impact_summary: 'Major legislative change. Introduces corporate criminal liability for failure to prevent money laundering. Requires documented "reasonable procedures" defence. Board and senior management accountability significantly increased.',
    ai_action_items: ['Commission legal review of new liability provisions', 'Develop "reasonable procedures" framework', 'Update board and senior management accountability framework', 'Review AML training and awareness programme', 'Document existing AML controls for evidential purposes'],
    ai_risk_score: 88, tags: ['proceeds-of-crime', 'jersey-law', 'corporate-liability', 'aml'],
    created_at: '2026-03-10T09:00:00Z',
  },
];

const MOCK_DASHBOARD: DashData = {
  totalChanges: 8,
  newChanges: 3,
  underReview: 3,
  criticalChanges: 2,
  highChanges: 3,
  avgRiskScore: 61,
  pendingAssessments: 3,
  activeSources: 12,
  changesByType: { guidance: 2, legislation: 2, international_standard: 2, enforcement: 1, risk_alert: 1 },
  recentChanges: [],
};

export default function RegulatoryIntelPage() {
  const [view, setView] = useState<'dashboard' | 'detail'>('dashboard');
  const [changes, setChanges] = useState<Change[]>(MOCK_CHANGES);
  const [selected, setSelected] = useState<Change | null>(null);
  const [showScan, setShowScan] = useState(false);
  const [scanText, setScanText] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addType, setAddType] = useState('guidance');
  const [addSeverity, setAddSeverity] = useState('medium');
  const [addJurisdiction, setAddJurisdiction] = useState('Jersey');

  const dash = MOCK_DASHBOARD;

  const filteredChanges = filterSeverity
    ? changes.filter(c => c.severity === filterSeverity)
    : changes;

  const handleAddChange = () => {
    if (!addTitle.trim()) return;
    const id = `rc${Date.now()}`;
    setChanges(prev => [{
      id, title: addTitle.trim(), change_type: addType,
      jurisdiction: addJurisdiction, sector: ['all'], severity: addSeverity,
      status: 'new', tags: [], created_at: new Date().toISOString(),
    }, ...prev]);
    setShowAdd(false); setAddTitle(''); setAddType('guidance'); setAddSeverity('medium'); setAddJurisdiction('Jersey');
  };

  const handleDeleteChange = (id: string) => {
    setChanges(prev => prev.filter(c => c.id !== id));
    if (selected?.id === id) { setSelected(null); setView('dashboard'); }
  };

  const handleUpdateStatus = (id: string, status: string) => {
    setChanges(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : prev);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">
          Regulatory Intelligence
        </h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        {view === 'detail' && selected && (
          <button
            onClick={() => { setView('dashboard'); setSelected(null); }}
            className="text-[11px] text-zinc-400 hover:text-white app-region-no-drag"
          >
            ← Back
          </button>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-2 app-region-no-drag">
          {dash.criticalChanges > 0 && (
            <span className="text-[11px] text-red-400">
              <AlertTriangle className="w-3 h-3 inline mr-1" />{dash.criticalChanges} critical
            </span>
          )}
          <button
            onClick={() => setShowScan(true)}
            className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex items-center gap-1"
          >
            <Search className="w-3 h-3" /> Scan
          </button>
          <button onClick={() => setShowAdd(true)} className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add Change
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
                { l: 'Changes', v: dash.totalChanges, s: `${dash.newChanges} new`, c: 'text-indigo-400', ic: Scale },
                { l: 'Critical', v: dash.criticalChanges, s: `${dash.highChanges} high`, c: dash.criticalChanges > 0 ? 'text-red-400' : 'text-emerald-400', ic: AlertTriangle },
                { l: 'Avg Risk', v: dash.avgRiskScore, s: 'Risk score', c: dash.avgRiskScore > 60 ? 'text-amber-400' : 'text-emerald-400', ic: Shield },
                { l: 'Sources', v: dash.activeSources, s: `${dash.pendingAssessments} pending`, c: 'text-blue-400', ic: CircleDot },
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
              <h3 className="text-[12px] font-medium text-white/70 mb-3">Changes by Type</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={Object.entries(dash.changesByType).map(([k, v]) => ({ name: k.replace(/_/g, ' '), count: v }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-600">Filter:</span>
              {['', 'critical', 'high', 'medium', 'low'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded capitalize',
                    filterSeverity === sev ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300',
                  )}
                >
                  {sev || 'All'}
                </button>
              ))}
            </div>

            {/* Changes List */}
            <div className="space-y-2">
              <h3 className="text-[12px] font-medium text-white/70">
                Regulatory Changes ({filteredChanges.length})
              </h3>
              {filteredChanges.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelected(c); setView('detail'); }}
                  className="w-full text-left rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 hover:border-white/[0.1] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', SEVERITY_BADGE[c.severity])}>
                          {c.severity}
                        </span>
                        <span className="text-[13px] font-medium text-white/80">{c.title}</span>
                        <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', STATUS_BADGE[c.status] || STATUS_BADGE.new)}>
                          {c.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {c.summary && (
                        <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{c.summary}</p>
                      )}
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-zinc-600">{c.jurisdiction}</span>
                        <span className="text-[10px] text-zinc-700">{c.change_type.replace(/_/g, ' ')}</span>
                        {c.effective_date && (
                          <span className="text-[10px] text-zinc-700">Effective: {c.effective_date}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {c.ai_risk_score !== undefined && (
                        <div className="flex flex-col items-end">
                          <span className={cn(
                            'text-[16px] font-semibold tabular-nums',
                            c.ai_risk_score > 70 ? 'text-red-400' : c.ai_risk_score > 40 ? 'text-amber-400' : 'text-emerald-400',
                          )}>
                            {c.ai_risk_score}
                          </span>
                          <span className="text-[9px] text-zinc-600">risk</span>
                        </div>
                      )}
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
            {/* Header */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', SEVERITY_BADGE[selected.severity])}>
                      {selected.severity}
                    </span>
                    <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', STATUS_BADGE[selected.status] || STATUS_BADGE.new)}>
                      {selected.status.replace(/_/g, ' ')}
                    </span>
                    {selected.status !== 'assessed' && <button onClick={() => handleUpdateStatus(selected.id, 'assessed')} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50">Assess</button>}
                    {selected.status !== 'implemented' && <button onClick={() => handleUpdateStatus(selected.id, 'implemented')} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-400 hover:bg-blue-900/50">Implement</button>}
                    <button onClick={() => handleDeleteChange(selected.id)} className="p-1 hover:bg-red-900/20 rounded" title="Delete"><Trash2 className="w-3 h-3 text-red-400/50 hover:text-red-400" /></button>
                  </div>
                  <h2 className="text-[16px] font-semibold text-white/90 mt-1">{selected.title}</h2>
                  {selected.summary && <p className="text-[12px] text-zinc-400 mt-0.5">{selected.summary}</p>}
                </div>
                {selected.ai_risk_score !== undefined && (
                  <div className="flex flex-col items-end">
                    <span className={cn(
                      'text-[24px] font-bold tabular-nums',
                      selected.ai_risk_score > 70 ? 'text-red-400' : selected.ai_risk_score > 40 ? 'text-amber-400' : 'text-emerald-400',
                    )}>
                      {selected.ai_risk_score}
                    </span>
                    <span className="text-[9px] text-zinc-600">AI risk score</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { l: 'Jurisdiction', v: selected.jurisdiction },
                  { l: 'Type', v: selected.change_type.replace(/_/g, ' ') },
                  { l: 'Effective', v: selected.effective_date || 'TBC' },
                  { l: 'Sectors', v: selected.sector.join(', ').replace(/_/g, ' ') },
                ].map(f => (
                  <div key={f.l}>
                    <span className="text-[10px] text-zinc-600 uppercase">{f.l}</span>
                    <div className="text-[13px] text-white/70 capitalize">{f.v}</div>
                  </div>
                ))}
              </div>

              {selected.body && (
                <div>
                  <span className="text-[10px] text-zinc-600 uppercase">Full Details</span>
                  <p className="text-[12px] text-zinc-400 mt-1 leading-relaxed">{selected.body}</p>
                </div>
              )}

              {selected.external_url && (
                <a href={selected.external_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300">
                  <ExternalLink className="w-3 h-3" /> View source
                </a>
              )}

              {selected.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {selected.tags.map(t => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* AI Impact Analysis */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-[12px] font-medium text-white/70">AI Impact Analysis</span>
              </div>
              {selected.ai_impact_summary && (
                <p className="text-[12px] text-zinc-400">{selected.ai_impact_summary}</p>
              )}
              {selected.ai_action_items && selected.ai_action_items.length > 0 && (
                <div className="space-y-1 mt-2">
                  <h4 className="text-[11px] font-medium text-white/60">Action Items</h4>
                  {selected.ai_action_items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 py-0.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-900/40 text-indigo-400 text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-[11px] text-zinc-400">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Change Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}>
            <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5 w-[440px] space-y-3" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-medium text-white">Add Regulatory Change</h3>
                <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-white/[0.06] rounded"><X className="w-4 h-4 text-zinc-500" /></button>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Title</label>
                <input value={addTitle} onChange={e => setAddTitle(e.target.value)} placeholder="Regulatory change title..." className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Type</label>
                  <select value={addType} onChange={e => setAddType(e.target.value)} className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none">
                    <option value="guidance">Guidance</option>
                    <option value="legislation">Legislation</option>
                    <option value="international_standard">International Standard</option>
                    <option value="enforcement">Enforcement</option>
                    <option value="risk_alert">Risk Alert</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Severity</label>
                  <select value={addSeverity} onChange={e => setAddSeverity(e.target.value)} className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Jurisdiction</label>
                <input value={addJurisdiction} onChange={e => setAddJurisdiction(e.target.value)} placeholder="Jersey" className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setShowAdd(false)} className="h-7 px-3 rounded-md text-[11px] text-zinc-500 hover:text-white">Cancel</button>
                <button onClick={handleAddChange} disabled={!addTitle.trim()} className="h-7 px-4 rounded-md text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30">Add Change</button>
              </div>
            </div>
          </div>
        )}

        {/* Scan Modal */}
        {showScan && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowScan(false)}>
            <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-5 w-[480px] space-y-3" onClick={e => e.stopPropagation()}>
              <h3 className="text-[14px] font-medium text-white/80">Regulatory Scan</h3>
              <p className="text-[11px] text-zinc-500">Paste regulatory text to analyse for impact and compliance requirements.</p>
              <textarea
                value={scanText}
                onChange={e => setScanText(e.target.value)}
                className="w-full h-32 bg-zinc-900 border border-white/[0.06] rounded-lg p-3 text-[12px] text-zinc-300 resize-none focus:outline-none focus:border-indigo-500"
                placeholder="Paste regulatory text here..."
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowScan(false)} className="h-7 px-3 rounded text-[11px] text-zinc-400 hover:text-white">Cancel</button>
                <button
                  onClick={() => { setShowScan(false); setScanText(''); }}
                  className="h-7 px-3 rounded text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Analyse
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
