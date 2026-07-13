import { useState } from 'react';
import {
  CheckCircle2, XCircle, AlertTriangle, Clock,
  Shield, ChevronRight, Search,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';
import ExportButton from '../components/ui/ExportButton';
import type { PDFReportOptions } from '../lib/pdfExport';

/* ═══════════════════════════════════════════════════════════════════════════
   Compliance Matrix Dashboard
   Cross-regulation compliance status tracking across all regulatory
   frameworks applicable to Jersey financial services.
   ═══════════════════════════════════════════════════════════════════════════ */

type ComplianceStatus = 'compliant' | 'partial' | 'non_compliant' | 'in_progress' | 'not_applicable';

interface Regulation {
  id: string;
  framework: string;
  shortName: string;
  category: string;
  description: string;
}

interface ComplianceItem {
  id: string;
  regulationId: string;
  requirement: string;
  section: string;
  status: ComplianceStatus;
  owner: string;
  lastAssessed: string;
  nextReview: string;
  evidence: string;
  notes?: string;
  riskIfNonCompliant: 'critical' | 'high' | 'medium' | 'low';
}

const REGULATIONS: Regulation[] = [
  { id: 'reg1', framework: 'JFSC AML/CFT Handbook', shortName: 'JFSC AML', category: 'AML/CFT', description: 'Jersey Financial Services Commission Anti-Money Laundering and Combatting the Financing of Terrorism Handbook' },
  { id: 'reg2', framework: 'Proceeds of Crime (Jersey) Law 1999', shortName: 'POCL', category: 'AML/CFT', description: 'Primary Jersey legislation criminalising money laundering and establishing reporting obligations' },
  { id: 'reg3', framework: 'EU AI Act', shortName: 'EU AI Act', category: 'AI Governance', description: 'European Union Artificial Intelligence Act — risk-based framework for AI systems' },
  { id: 'reg4', framework: 'UK AI White Paper', shortName: 'UK AI WP', category: 'AI Governance', description: 'UK Government pro-innovation approach to AI regulation — five principles framework' },
  { id: 'reg5', framework: 'GDPR / DPA 2018 (Jersey)', shortName: 'GDPR', category: 'Data Protection', description: 'Data Protection (Jersey) Law 2018 — substantively equivalent to EU GDPR' },
  { id: 'reg6', framework: 'TCFD Recommendations', shortName: 'TCFD', category: 'ESG', description: 'Task Force on Climate-related Financial Disclosures recommendations' },
  { id: 'reg7', framework: 'Jersey Companies Law', shortName: 'JCL', category: 'Corporate Governance', description: 'Companies (Jersey) Law 1991 — corporate governance and reporting requirements' },
  { id: 'reg8', framework: 'FATF Recommendations', shortName: 'FATF', category: 'AML/CFT', description: 'Financial Action Task Force 40 Recommendations on money laundering and terrorist financing' },
  { id: 'reg9', framework: 'Sanctions & Asset-Freezing (Jersey) Law 2019', shortName: 'Sanctions', category: 'Sanctions', description: 'Jersey domestic sanctions legislation implementing UN and EU sanctions regimes' },
  { id: 'reg10', framework: 'OECD AI Principles', shortName: 'OECD AI', category: 'AI Governance', description: 'OECD Recommendation on Artificial Intelligence — transparency, accountability, fairness' },
];

const MOCK_ITEMS: ComplianceItem[] = [
  // JFSC AML/CFT
  { id: 'c1', regulationId: 'reg1', requirement: 'Customer Due Diligence (CDD)', section: 'Chapter 3', status: 'compliant', owner: 'Sarah Mitchell (MLRO)', lastAssessed: '2026-02-15', nextReview: '2026-08-15', evidence: 'CDD procedures documented and tested. Automated KYC checks operational.', riskIfNonCompliant: 'critical' },
  { id: 'c2', regulationId: 'reg1', requirement: 'Suspicious Activity Reporting', section: 'Chapter 5', status: 'compliant', owner: 'Sarah Mitchell (MLRO)', lastAssessed: '2026-03-01', nextReview: '2026-09-01', evidence: 'SAR filing process tested. 3 SARs filed in current period.', riskIfNonCompliant: 'critical' },
  { id: 'c3', regulationId: 'reg1', requirement: 'Enhanced Due Diligence for Trust Structures', section: 'Chapter 3.7', status: 'partial', owner: 'James Clarke (Compliance Director)', lastAssessed: '2026-01-20', nextReview: '2026-04-20', evidence: 'Basic EDD in place. New JFSC 2026.02 amendment requires UBO look-through updates.', notes: 'JFSC Amendment 2026.02 effective April 2026 — update procedures required', riskIfNonCompliant: 'high' },
  { id: 'c4', regulationId: 'reg1', requirement: 'Record Keeping (5-year retention)', section: 'Chapter 6', status: 'compliant', owner: 'Data Management Team', lastAssessed: '2026-02-01', nextReview: '2026-08-01', evidence: 'AES-256 encrypted local storage with automated retention policies.', riskIfNonCompliant: 'high' },
  { id: 'c5', regulationId: 'reg1', requirement: 'Risk-Based Approach (jurisdiction scoring)', section: 'Chapter 4', status: 'compliant', owner: 'Risk Team', lastAssessed: '2026-02-28', nextReview: '2026-08-28', evidence: 'Geographic risk heatmap operational. 16 jurisdictions scored and monitored.', riskIfNonCompliant: 'critical' },

  // POCL
  { id: 'c6', regulationId: 'reg2', requirement: 'Mandatory Disclosure (tipping off prevention)', section: 'Article 34', status: 'compliant', owner: 'Sarah Mitchell (MLRO)', lastAssessed: '2026-02-15', nextReview: '2026-08-15', evidence: 'Staff training completed. Access controls prevent SAR information leakage.', riskIfNonCompliant: 'critical' },
  { id: 'c7', regulationId: 'reg2', requirement: 'Transaction Monitoring', section: 'Article 37', status: 'compliant', owner: 'Fraud Detection Team', lastAssessed: '2026-03-01', nextReview: '2026-09-01', evidence: 'Real-time monitoring operational. AI pattern detection with 94% confidence on structuring.', riskIfNonCompliant: 'critical' },

  // EU AI Act
  { id: 'c8', regulationId: 'reg3', requirement: 'High-Risk AI System Classification', section: 'Article 6', status: 'in_progress', owner: 'Chief Technology Officer', lastAssessed: '2026-02-20', nextReview: '2026-06-20', evidence: 'Fraud detection and AML modules assessed as high-risk. Conformity assessment underway.', notes: 'External AI auditor engagement required by Q2 2026', riskIfNonCompliant: 'high' },
  { id: 'c9', regulationId: 'reg3', requirement: 'Transparency Requirements', section: 'Article 13', status: 'compliant', owner: 'AI Governance Team', lastAssessed: '2026-03-01', nextReview: '2026-09-01', evidence: 'AI Explainability panels deployed across Fraud, AML, and KYC modules.', riskIfNonCompliant: 'high' },
  { id: 'c10', regulationId: 'reg3', requirement: 'Human Oversight Mechanisms', section: 'Article 14', status: 'compliant', owner: 'AI Governance Team', lastAssessed: '2026-02-28', nextReview: '2026-08-28', evidence: 'All AI decisions flagged for human review. MLRO sign-off required for SAR filing.', riskIfNonCompliant: 'high' },
  { id: 'c11', regulationId: 'reg3', requirement: 'AI Risk Management System', section: 'Article 9', status: 'partial', owner: 'Chief Technology Officer', lastAssessed: '2026-01-15', nextReview: '2026-07-15', evidence: 'Initial risk management framework in place. Bias testing and monitoring underway.', notes: 'Full Article 9 documentation needed before August 2026 deadline', riskIfNonCompliant: 'high' },

  // UK AI White Paper
  { id: 'c12', regulationId: 'reg4', requirement: 'Safety Principle', section: 'Principle 1', status: 'compliant', owner: 'AI Governance Team', lastAssessed: '2026-02-01', nextReview: '2026-08-01', evidence: 'AI systems have fallback mechanisms. Human override available on all decisions.', riskIfNonCompliant: 'medium' },
  { id: 'c13', regulationId: 'reg4', requirement: 'Transparency Principle', section: 'Principle 2', status: 'compliant', owner: 'AI Governance Team', lastAssessed: '2026-03-01', nextReview: '2026-09-01', evidence: 'Explainability panels provide "Why this decision?" rationale for all AI outputs.', riskIfNonCompliant: 'medium' },
  { id: 'c14', regulationId: 'reg4', requirement: 'Fairness Principle', section: 'Principle 3', status: 'in_progress', owner: 'AI Governance Team', lastAssessed: '2026-02-15', nextReview: '2026-08-15', evidence: 'Bias testing initiated. No discriminatory patterns detected in initial assessment.', notes: 'Ongoing — bias monitoring dashboard planned for Q3 2026', riskIfNonCompliant: 'medium' },
  { id: 'c15', regulationId: 'reg4', requirement: 'Accountability Principle', section: 'Principle 4', status: 'compliant', owner: 'Compliance Director', lastAssessed: '2026-02-28', nextReview: '2026-08-28', evidence: 'Clear accountability chain documented. MLRO retains final decision authority.', riskIfNonCompliant: 'high' },
  { id: 'c16', regulationId: 'reg4', requirement: 'Contestability Principle', section: 'Principle 5', status: 'partial', owner: 'AI Governance Team', lastAssessed: '2026-01-15', nextReview: '2026-07-15', evidence: 'Users can override AI decisions. Formal appeals process in development.', notes: 'Formal contestability process planned for Q2 2026', riskIfNonCompliant: 'medium' },

  // GDPR
  { id: 'c17', regulationId: 'reg5', requirement: 'Lawful Basis for Processing', section: 'Article 6', status: 'compliant', owner: 'DPO', lastAssessed: '2026-02-01', nextReview: '2026-08-01', evidence: 'Processing activities mapped. Lawful basis documented for all data processing.', riskIfNonCompliant: 'critical' },
  { id: 'c18', regulationId: 'reg5', requirement: 'Data Subject Rights', section: 'Articles 15-22', status: 'compliant', owner: 'DPO', lastAssessed: '2026-01-15', nextReview: '2026-07-15', evidence: 'DSAR process operational. Average response time: 12 days (within 30-day limit).', riskIfNonCompliant: 'high' },
  { id: 'c19', regulationId: 'reg5', requirement: 'Data Protection Impact Assessment', section: 'Article 35', status: 'compliant', owner: 'DPO', lastAssessed: '2026-02-20', nextReview: '2026-08-20', evidence: 'DPIA completed for all high-risk processing activities including AI-assisted decision making.', riskIfNonCompliant: 'high' },

  // TCFD
  { id: 'c20', regulationId: 'reg6', requirement: 'Climate Risk Governance', section: 'Governance', status: 'compliant', owner: 'ESG Team', lastAssessed: '2026-02-01', nextReview: '2026-08-01', evidence: 'Board-level climate risk oversight established. Quarterly ESG committee meetings.', riskIfNonCompliant: 'medium' },
  { id: 'c21', regulationId: 'reg6', requirement: 'Climate Scenario Analysis', section: 'Strategy', status: 'partial', owner: 'ESG Team', lastAssessed: '2026-01-20', nextReview: '2026-07-20', evidence: 'Initial scenario analysis completed. 1.5°C and 3°C pathways assessed.', notes: 'Extended scenario analysis for physical risk pending', riskIfNonCompliant: 'medium' },

  // FATF
  { id: 'c22', regulationId: 'reg8', requirement: 'Beneficial Ownership Transparency', section: 'Rec. 24', status: 'compliant', owner: 'KYC Team', lastAssessed: '2026-02-28', nextReview: '2026-08-28', evidence: 'UBO verification process operational. All corporate clients have UBO records.', riskIfNonCompliant: 'critical' },
  { id: 'c23', regulationId: 'reg8', requirement: 'Travel Rule Implementation', section: 'Rec. 16', status: 'in_progress', owner: 'CTO', lastAssessed: '2026-02-15', nextReview: '2026-06-15', evidence: 'Wire transfer information requirements implemented. VASP Travel Rule under development.', notes: 'Cryptocurrency Travel Rule implementation needed for VASP compliance', riskIfNonCompliant: 'high' },

  // Sanctions
  { id: 'c24', regulationId: 'reg9', requirement: 'Sanctions Screening', section: 'Section 8', status: 'compliant', owner: 'Compliance Team', lastAssessed: '2026-03-01', nextReview: '2026-09-01', evidence: 'Real-time screening against OFSI, EU, UN, and OFAC lists. Volkov International blocked.', riskIfNonCompliant: 'critical' },
  { id: 'c25', regulationId: 'reg9', requirement: 'Asset Freezing Procedures', section: 'Section 12', status: 'compliant', owner: 'Compliance Team', lastAssessed: '2026-02-25', nextReview: '2026-08-25', evidence: 'Automated asset freeze on sanctions-flagged accounts. 2 accounts currently frozen.', riskIfNonCompliant: 'critical' },

  // OECD AI
  { id: 'c26', regulationId: 'reg10', requirement: 'AI Transparency & Explainability', section: 'Principle 1.3', status: 'compliant', owner: 'AI Governance Team', lastAssessed: '2026-03-01', nextReview: '2026-09-01', evidence: 'AIExplainabilityPanel component deployed. "Why this decision?" panels on all AI modules.', riskIfNonCompliant: 'medium' },
  { id: 'c27', regulationId: 'reg10', requirement: 'AI Accountability', section: 'Principle 1.5', status: 'compliant', owner: 'Compliance Director', lastAssessed: '2026-02-28', nextReview: '2026-08-28', evidence: 'Clear accountability chain. Audit trail tracks all AI-assisted decisions.', riskIfNonCompliant: 'medium' },
];

const STATUS_ICON: Record<ComplianceStatus, React.ElementType> = {
  compliant: CheckCircle2,
  partial: AlertTriangle,
  non_compliant: XCircle,
  in_progress: Clock,
  not_applicable: Shield,
};
const STATUS_CLR: Record<ComplianceStatus, string> = {
  compliant: 'text-emerald-400',
  partial: 'text-amber-400',
  non_compliant: 'text-red-400',
  in_progress: 'text-blue-400',
  not_applicable: 'text-zinc-500',
};
const STATUS_BG: Record<ComplianceStatus, string> = {
  compliant: 'bg-emerald-900/20 text-emerald-400 border-emerald-500/15',
  partial: 'bg-amber-900/20 text-amber-400 border-amber-500/15',
  non_compliant: 'bg-red-900/20 text-red-400 border-red-500/15',
  in_progress: 'bg-blue-900/20 text-blue-400 border-blue-500/15',
  not_applicable: 'bg-zinc-800/20 text-zinc-500 border-zinc-500/15',
};
const RISK_CLR: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-amber-400',
  medium: 'text-blue-400',
  low: 'text-emerald-400',
};

const PIE_COLORS: Record<ComplianceStatus, string> = {
  compliant: '#10b981',
  partial: '#f59e0b',
  non_compliant: '#ef4444',
  in_progress: '#3b82f6',
  not_applicable: '#52525b',
};

type CategoryFilter = 'all' | string;

export default function ComplianceMatrixPage() {
  const [selectedReg, setSelectedReg] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);

  const categories = [...new Set(REGULATIONS.map(r => r.category))];

  const filteredRegs = REGULATIONS.filter(r =>
    (categoryFilter === 'all' || r.category === categoryFilter) &&
    (searchQuery === '' || r.framework.toLowerCase().includes(searchQuery.toLowerCase()) || r.shortName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRegItems = (regId: string) => MOCK_ITEMS.filter(i => i.regulationId === regId);

  const getFilteredItems = (regId: string) => {
    const items = getRegItems(regId);
    return statusFilter === 'all' ? items : items.filter(i => i.status === statusFilter);
  };

  const allItems = MOCK_ITEMS;
  const statusCounts = {
    compliant: allItems.filter(i => i.status === 'compliant').length,
    partial: allItems.filter(i => i.status === 'partial').length,
    non_compliant: allItems.filter(i => i.status === 'non_compliant').length,
    in_progress: allItems.filter(i => i.status === 'in_progress').length,
    not_applicable: allItems.filter(i => i.status === 'not_applicable').length,
  };

  const complianceRate = Math.round((statusCounts.compliant / allItems.length) * 100);

  const pieData = Object.entries(statusCounts)
    .filter(([, v]) => v > 0)
    .map(([status, count]) => ({ name: status.replace('_', ' '), value: count, color: PIE_COLORS[status as ComplianceStatus] }));

  const buildPDFConfig = (): PDFReportOptions => ({
    title: 'Compliance Matrix Report',
    subtitle: `${allItems.length} requirements across ${REGULATIONS.length} frameworks — ${complianceRate}% compliant`,
    module: 'Compliance Matrix',
    jurisdiction: 'Jersey (JFSC)',
    classification: 'CONFIDENTIAL',
    includeComplianceBadges: true,
    sections: [
      { type: 'stats', stats: [
        { label: 'Total Requirements', value: String(allItems.length) },
        { label: 'Compliant', value: String(statusCounts.compliant) },
        { label: 'Partial', value: String(statusCounts.partial) },
        { label: 'In Progress', value: String(statusCounts.in_progress) },
        { label: 'Compliance Rate', value: `${complianceRate}%` },
      ] },
      ...REGULATIONS.map(reg => ({
        type: 'table' as const,
        title: reg.framework,
        columns: ['Requirement', 'Section', 'Status', 'Owner', 'Next Review', 'Risk'],
        rows: getRegItems(reg.id).map(i => [i.requirement, i.section, i.status.replace('_', ' '), i.owner, i.nextReview, i.riskIfNonCompliant]),
      })),
    ],
  });

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#030303]">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <div className="flex items-center gap-2 flex-1">
          <Shield className="w-4 h-4 text-indigo-400" />
          <h1 className="text-[13px] font-semibold text-white/80">Compliance Matrix</h1>
          <span className={cn('text-[11px] font-semibold', complianceRate >= 90 ? 'text-emerald-400' : complianceRate >= 70 ? 'text-amber-400' : 'text-red-400')}>{complianceRate}%</span>
        </div>
        <div className="flex items-center gap-1.5 app-region-no-drag">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search frameworks…"
              className="h-7 pl-7 pr-3 rounded-lg text-[11px] bg-white/[0.04] border border-white/[0.06] text-white/70 placeholder-zinc-600 w-44 focus:outline-none focus:border-indigo-500/30"
            />
          </div>
          <ExportButton getReportConfig={buildPDFConfig} compact />
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-6 px-5 py-3 border-b border-white/[0.04]">
        <div className="w-16 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={18} outerRadius={28} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4">
          {(['compliant', 'partial', 'in_progress', 'non_compliant'] as ComplianceStatus[]).map(s => {
            const Icon = STATUS_ICON[s];
            return (
              <button key={s} onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
                className={cn('flex items-center gap-1.5 px-2 py-1 rounded transition-colors', statusFilter === s ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]')}>
                <Icon className={cn('w-3 h-3', STATUS_CLR[s])} />
                <span className={cn('text-[11px] capitalize', STATUS_CLR[s])}>{s.replace('_', ' ')}</span>
                <span className="text-[10px] text-zinc-600">{statusCounts[s]}</span>
              </button>
            );
          })}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-600">Category:</span>
          {['all', ...categories].map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)}
              className={cn('text-[10px] px-2 py-0.5 rounded capitalize', categoryFilter === c ? 'bg-indigo-600/20 text-indigo-400' : 'text-zinc-500 hover:text-zinc-300')}>
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Regulation list */}
        <div className="w-[280px] border-r border-white/[0.04] overflow-y-auto">
          {filteredRegs.map(reg => {
            const items = getRegItems(reg.id);
            const compliant = items.filter(i => i.status === 'compliant').length;
            const total = items.length;
            const pct = Math.round((compliant / total) * 100);
            return (
              <button key={reg.id} onClick={() => { setSelectedReg(reg.id); setSelectedItem(null); }}
                className={cn('w-full text-left px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors', selectedReg === reg.id && 'bg-white/[0.03]')}>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-white/70 font-medium">{reg.shortName}</span>
                  <span className={cn('text-[11px] font-semibold tabular-nums', pct === 100 ? 'text-emerald-400' : pct >= 70 ? 'text-amber-400' : 'text-red-400')}>{pct}%</span>
                </div>
                <div className="text-[10px] text-zinc-600 mt-0.5">{reg.category} · {total} requirements</div>
                <div className="mt-1.5 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct === 100 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444' }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Requirements detail */}
        <div className="flex-1 overflow-y-auto">
          {selectedReg ? (
            <div className="p-5 space-y-3">
              {(() => {
                const reg = REGULATIONS.find(r => r.id === selectedReg)!;
                const items = getFilteredItems(selectedReg);
                return (
                  <>
                    <div className="mb-4">
                      <h2 className="text-[14px] font-medium text-white/90">{reg.framework}</h2>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{reg.description}</p>
                    </div>
                    {items.map(item => {
                      const Icon = STATUS_ICON[item.status];
                      return (
                        <button key={item.id} onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                          className={cn('w-full text-left rounded-xl border bg-[#0a0a0a] p-4 transition-colors hover:border-white/[0.08]',
                            selectedItem?.id === item.id ? 'border-indigo-500/20' : 'border-white/[0.06]')}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className={cn('w-4 h-4', STATUS_CLR[item.status])} />
                              <span className="text-[12px] text-white/80">{item.requirement}</span>
                              <span className="text-[10px] text-zinc-600">{item.section}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn('text-[10px] px-1.5 py-0.5 rounded border capitalize', STATUS_BG[item.status])}>{item.status.replace('_', ' ')}</span>
                              <ChevronRight className={cn('w-3 h-3 text-zinc-700 transition-transform', selectedItem?.id === item.id && 'rotate-90')} />
                            </div>
                          </div>

                          {selectedItem?.id === item.id && (
                            <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-3" onClick={e => e.stopPropagation()}>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <div className="text-[10px] text-zinc-600 uppercase mb-0.5">Owner</div>
                                  <div className="text-[11px] text-zinc-400">{item.owner}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] text-zinc-600 uppercase mb-0.5">Last Assessed</div>
                                  <div className="text-[11px] text-zinc-400">{item.lastAssessed}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] text-zinc-600 uppercase mb-0.5">Next Review</div>
                                  <div className="text-[11px] text-zinc-400">{item.nextReview}</div>
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] text-zinc-600 uppercase mb-0.5">Evidence</div>
                                <p className="text-[11px] text-zinc-400 leading-relaxed">{item.evidence}</p>
                              </div>
                              {item.notes && (
                                <div className="p-2 rounded bg-amber-900/10 border border-amber-500/10">
                                  <p className="text-[11px] text-amber-400"><AlertTriangle className="w-3 h-3 inline mr-1" />{item.notes}</p>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-600">Non-compliance risk:</span>
                                <span className={cn('text-[10px] font-medium capitalize', RISK_CLR[item.riskIfNonCompliant])}>{item.riskIfNonCompliant}</span>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                    {items.length === 0 && (
                      <div className="text-center py-12 text-[12px] text-zinc-600">No requirements match the current filter</div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <Shield className="w-8 h-8 text-zinc-800 mx-auto" />
                <p className="text-[12px] text-zinc-600">Select a regulatory framework from the left panel</p>
                <p className="text-[10px] text-zinc-700">{REGULATIONS.length} frameworks · {allItems.length} requirements tracked</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
