import { useState, useMemo } from 'react';
import {
  ClipboardList, Search, Eye, Download, Shield,
  AlertTriangle, CheckCircle2, Settings,
  X, ChevronRight, Activity, Fingerprint,
  Trash2, Plus, Edit3,
} from 'lucide-react';
import { cn } from '../lib/utils';
import ExportButton from '../components/ui/ExportButton';
import type { PDFReportOptions } from '../lib/pdfExport';

/* ═══════════════════════════════════════════════════════════════════════════
   COMPREHENSIVE MOCK DATA — Audit Trail & Activity Logging
   Complete immutable log of all user actions across every module.
   Aligned with JFSC record-keeping requirements (AML/CFT Handbook s.5.3)
   and Jersey Data Protection Authority accountability principle.
   ═══════════════════════════════════════════════════════════════════════════ */

interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  user_role: string;
  module: string;
  action: string;
  action_type: 'create' | 'read' | 'update' | 'delete' | 'export' | 'login' | 'config' | 'ai_action' | 'approval';
  entity_type: string;
  entity_id?: string;
  entity_name?: string;
  details: string;
  ip_address: string;
  session_id: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  compliance_relevant: boolean;
  changes?: { field: string; old_value: string; new_value: string }[];
}

const MOCK_EVENTS: AuditEvent[] = [
  { id: 'ae1', timestamp: '2026-03-22T09:15:32Z', user: 'Claire de la Haye', user_role: 'Head of Compliance', module: 'AML', action: 'Filed SAR with JFSC', action_type: 'approval', entity_type: 'SAR', entity_id: 'SAR-2026-0042', entity_name: 'Heinrich Müller Trust — Structuring', details: 'Suspicious Activity Report approved by MLRO and electronically filed with Jersey Financial Services Commission. Report reference: SAR-2026-0042. Filing acknowledged by JFSC (ACK-2026-1847).', ip_address: '10.0.1.15', session_id: 'ses_a1b2c3', risk_level: 'critical', compliance_relevant: true },
  { id: 'ae2', timestamp: '2026-03-22T09:12:18Z', user: 'Claire de la Haye', user_role: 'Head of Compliance', module: 'AML', action: 'Reviewed SAR narrative', action_type: 'update', entity_type: 'SAR', entity_id: 'SAR-2026-0042', details: 'MLRO reviewed AI-generated SAR narrative and approved with minor edits. Changed status from draft to approved.', ip_address: '10.0.1.15', session_id: 'ses_a1b2c3', risk_level: 'high', compliance_relevant: true, changes: [{ field: 'status', old_value: 'draft', new_value: 'approved' }, { field: 'narrative', old_value: '[AI draft]', new_value: '[MLRO reviewed]' }] },
  { id: 'ae3', timestamp: '2026-03-22T09:05:00Z', user: 'System — AI Engine', user_role: 'Automated', module: 'Fraud Detection', action: 'Pattern detection executed', action_type: 'ai_action', entity_type: 'Analysis', details: 'AI pattern detection completed. Identified 3 significant patterns across 1,842 Jersey-processed transactions. Critical: Multi-branch cash structuring, Sanctions circumvention corridor. Medium: Gulf corridor velocity spike.', ip_address: '127.0.0.1', session_id: 'sys_auto', risk_level: 'medium', compliance_relevant: false },
  { id: 'ae4', timestamp: '2026-03-22T08:58:44Z', user: 'David Le Cornu', user_role: 'CTO', module: 'Settings', action: 'Updated API key configuration', action_type: 'config', entity_type: 'System Config', details: 'Rotated OpenAI API key. Previous key deactivated. New key validated successfully. Model configuration: GPT-4 Turbo with 128k context.', ip_address: '10.0.1.22', session_id: 'ses_d4e5f6', risk_level: 'medium', compliance_relevant: false, changes: [{ field: 'openai_api_key', old_value: 'sk-...7x2f', new_value: 'sk-...9k4m' }] },
  { id: 'ae5', timestamp: '2026-03-22T08:45:11Z', user: 'James Ahier', user_role: 'KYC/CDD Analyst', module: 'KYC', action: 'Completed client risk assessment', action_type: 'ai_action', entity_type: 'Client', entity_id: 'c4', entity_name: 'Grouville Marine Trading Ltd', details: 'AI-assisted risk assessment completed for Grouville Marine Trading Ltd. Risk score: 55 (enhanced). Entity type: corporate, Jurisdiction: JE. Enhanced due diligence recommended due to maritime trade sector exposure.', ip_address: '10.0.1.30', session_id: 'ses_g7h8i9', risk_level: 'medium', compliance_relevant: true },
  { id: 'ae6', timestamp: '2026-03-22T08:30:00Z', user: 'Claire de la Haye', user_role: 'Head of Compliance', module: 'System', action: 'User login — MFA verified', action_type: 'login', entity_type: 'Session', details: 'Successful login via password + TOTP (Google Authenticator). Session duration: standard (8hr). IP verified against allowlist.', ip_address: '10.0.1.15', session_id: 'ses_a1b2c3', risk_level: 'low', compliance_relevant: false },
  { id: 'ae7', timestamp: '2026-03-22T08:28:15Z', user: 'David Le Cornu', user_role: 'CTO', module: 'System', action: 'User login — MFA verified', action_type: 'login', entity_type: 'Session', details: 'Successful login via password + hardware key (YubiKey). Session duration: standard (8hr).', ip_address: '10.0.1.22', session_id: 'ses_d4e5f6', risk_level: 'low', compliance_relevant: false },
  { id: 'ae8', timestamp: '2026-03-21T17:45:22Z', user: 'James Ahier', user_role: 'KYC/CDD Analyst', module: 'KYC', action: 'Exported client portfolio PDF', action_type: 'export', entity_type: 'Report', details: 'Generated and downloaded KYC & Client Onboarding Report. 12 clients included. Classification: OFFICIAL — SENSITIVE. Local storage only.', ip_address: '10.0.1.30', session_id: 'ses_j1k2l3', risk_level: 'low', compliance_relevant: true },
  { id: 'ae9', timestamp: '2026-03-21T16:30:00Z', user: 'Sophie Le Maistre', user_role: 'Software Engineer', module: 'Fraud Detection', action: 'Blocked suspicious wire transfer', action_type: 'update', entity_type: 'Transaction', entity_id: 'ft7', entity_name: 'TXN-20260225-JE007 — $750k to Cyprus', details: 'Wire transfer of $750,000 to unregistered Cyprus entity manually blocked. Originator has Russia-linked beneficial ownership. Alert FA2 escalated to MLRO.', ip_address: '10.0.1.35', session_id: 'ses_m4n5o6', risk_level: 'critical', compliance_relevant: true, changes: [{ field: 'status', old_value: 'flagged', new_value: 'blocked' }] },
  { id: 'ae10', timestamp: '2026-03-21T15:20:00Z', user: 'Claire de la Haye', user_role: 'Head of Compliance', module: 'Regulatory', action: 'Assessed regulatory change', action_type: 'update', entity_type: 'Regulatory Change', entity_id: 'rc1', entity_name: 'JFSC AML/CFT Handbook — 10% BO Threshold', details: 'Marked JFSC AML/CFT Handbook amendment as "under review". AI impact assessment: 340 client relationships affected. 5 action items generated.', ip_address: '10.0.1.15', session_id: 'ses_p7q8r9', risk_level: 'high', compliance_relevant: true, changes: [{ field: 'status', old_value: 'new', new_value: 'under_review' }] },
  { id: 'ae11', timestamp: '2026-03-21T14:10:33Z', user: 'Thomas Perchard', user_role: 'Senior Fund Administrator', module: 'Reporting', action: 'Published Q1 client performance report', action_type: 'approval', entity_type: 'Report', entity_id: 'r1', entity_name: 'Q1 2026 Client Performance — Apex Growth Fund', details: 'Published quarterly client performance report for Apex Capital Partners. 24 pages, 8 sections, 4 AI-generated sections. AUM: £342M.', ip_address: '10.0.1.40', session_id: 'ses_s1t2u3', risk_level: 'low', compliance_relevant: true },
  { id: 'ae12', timestamp: '2026-03-21T13:00:00Z', user: 'System — AI Engine', user_role: 'Automated', module: 'Fraud Detection', action: 'Generated structuring alert', action_type: 'ai_action', entity_type: 'Alert', entity_id: 'fa1', entity_name: 'Cash structuring — 3 deposits below £10k', details: 'AI engine detected potential cash structuring pattern. Three consecutive deposits across Jersey branches (£9,950 + £9,850 + £9,900) within 72 hours. Confidence: 94%. Auto-escalated to investigating status.', ip_address: '127.0.0.1', session_id: 'sys_auto', risk_level: 'critical', compliance_relevant: true },
  { id: 'ae13', timestamp: '2026-03-21T11:45:00Z', user: 'Rachel Le Marquand', user_role: 'Trust Administrator', module: 'KYC', action: 'Added new client', action_type: 'create', entity_type: 'Client', entity_id: 'c8', entity_name: 'Gorey Harbour Developments', details: 'New client onboarding initiated for Gorey Harbour Developments. Entity type: corporate, Jurisdiction: JE. Risk rating: low. Standard onboarding workflow assigned.', ip_address: '10.0.1.45', session_id: 'ses_v4w5x6', risk_level: 'low', compliance_relevant: true },
  { id: 'ae14', timestamp: '2026-03-21T10:30:00Z', user: 'Philippe Sinel', user_role: 'Senior Legal Counsel', module: 'Regulatory', action: 'Added regulatory change', action_type: 'create', entity_type: 'Regulatory Change', entity_id: 'rc8', entity_name: 'Proceeds of Crime (Amendment No. 8) — Corporate Liability', details: 'Logged new regulatory change: Proceeds of Crime (Amendment No. 8) (Jersey) Law. Introduces corporate criminal liability for failure to prevent money laundering. Severity: critical. Effective: 2026-09-01.', ip_address: '10.0.1.50', session_id: 'ses_y7z8a9', risk_level: 'high', compliance_relevant: true },
  { id: 'ae15', timestamp: '2026-03-21T09:15:00Z', user: 'Emma Journeaux', user_role: 'HR Business Partner', module: 'Resources', action: 'Updated team allocations', action_type: 'update', entity_type: 'Allocation', details: 'Updated resource allocations for Q2 planning. Redistributed 15 hours from Operations to Compliance for JFSC Handbook project.', ip_address: '10.0.1.55', session_id: 'ses_b1c2d3', risk_level: 'low', compliance_relevant: false },
  { id: 'ae16', timestamp: '2026-03-20T16:45:00Z', user: 'Mark Le Brocq', user_role: 'Finance Director', module: 'ESG', action: 'Approved ESG metrics batch', action_type: 'approval', entity_type: 'ESG Metric', details: 'Batch-approved 7 environmental metrics for Q4 2025 reporting period. Scope 1+2 emissions verified at 231 tCO2e. Renewable energy at 62%. All data quality ratings: measured or calculated.', ip_address: '10.0.1.60', session_id: 'ses_e4f5g6', risk_level: 'low', compliance_relevant: true },
  { id: 'ae17', timestamp: '2026-03-20T15:30:00Z', user: 'Claire de la Haye', user_role: 'Head of Compliance', module: 'AML', action: 'Updated monitoring rule', action_type: 'config', entity_type: 'AML Rule', entity_id: 'r1', entity_name: 'Cash Structuring Detection', details: 'Modified cash structuring rule: lowered threshold from CHF 10,000 to GBP/CHF 10,000 equivalent. Added cross-branch detection within 72-hour rolling window. Rule re-activated.', ip_address: '10.0.1.15', session_id: 'ses_h7i8j9', risk_level: 'medium', compliance_relevant: true, changes: [{ field: 'threshold', old_value: 'CHF 10,000', new_value: 'GBP/CHF 10,000 equiv' }, { field: 'cross_branch', old_value: 'disabled', new_value: 'enabled' }] },
  { id: 'ae18', timestamp: '2026-03-20T14:00:00Z', user: 'System — AI Engine', user_role: 'Automated', module: 'KYC', action: 'Document verification — REJECTED', action_type: 'ai_action', entity_type: 'Document', entity_id: 'd4', entity_name: 'petrov_tax_declaration.pdf', details: 'AI document verification rejected Viktor Petrov tax declaration. Reason: metadata inconsistencies detected — document appears altered. Confidence: 89%. Flagged for manual review.', ip_address: '127.0.0.1', session_id: 'sys_auto', risk_level: 'high', compliance_relevant: true },
  { id: 'ae19', timestamp: '2026-03-20T11:00:00Z', user: 'David Le Cornu', user_role: 'CTO', module: 'Project Intel', action: 'Created project', action_type: 'create', entity_type: 'Project', entity_id: 'pp8', entity_name: 'Data Protection Impact Assessment', details: 'New project created: DPIA for all AI/ML processing activities following JDPA enforcement precedent. Budget: £35,000. Priority: high. Target: 2026-06-15.', ip_address: '10.0.1.22', session_id: 'ses_k1l2m3', risk_level: 'low', compliance_relevant: true },
  { id: 'ae20', timestamp: '2026-03-20T09:45:00Z', user: 'Sarah Nicolle', user_role: 'Operations Manager', module: 'Procurement', action: 'Exported contract portfolio PDF', action_type: 'export', entity_type: 'Report', details: 'Generated Procurement & Contract Intelligence Report. 10 contracts included, total value £1.38M. Classification: OFFICIAL.', ip_address: '10.0.1.65', session_id: 'ses_n4o5p6', risk_level: 'low', compliance_relevant: false },
  { id: 'ae21', timestamp: '2026-03-19T16:20:00Z', user: 'System — Scheduler', user_role: 'Automated', module: 'Reporting', action: 'Auto-generated Monthly NAV Report', action_type: 'ai_action', entity_type: 'Report', entity_id: 'r3', entity_name: 'Feb 2026 NAV Report — Meridian Global Fund', details: 'Scheduled report generation completed. 12 pages, 5 sections. Compliance check section AI-generated. Sent to review queue.', ip_address: '127.0.0.1', session_id: 'sys_sched', risk_level: 'low', compliance_relevant: true },
  { id: 'ae22', timestamp: '2026-03-19T14:30:00Z', user: 'Unknown', user_role: 'Unknown', module: 'System', action: 'Failed login — account locked', action_type: 'login', entity_type: 'Session', details: 'Failed login attempt — 5 consecutive failures using email admin@firm.je. Account temporarily locked for 30 minutes. IP not on allowlist. Possible brute-force attempt.', ip_address: '185.234.72.19', session_id: 'ses_failed', risk_level: 'critical', compliance_relevant: true },
  { id: 'ae23', timestamp: '2026-03-19T11:00:00Z', user: 'Natalie Bree', user_role: 'Client Relationship Manager', module: 'KYC', action: 'Deleted duplicate client record', action_type: 'delete', entity_type: 'Client', entity_name: 'Duplicate — Le Masurier Holdings (copy)', details: 'Removed duplicate client record created during data migration. Original record (c1) retained. Deletion approved by Head of Compliance.', ip_address: '10.0.1.70', session_id: 'ses_q7r8s9', risk_level: 'medium', compliance_relevant: true },
  { id: 'ae24', timestamp: '2026-03-19T09:00:00Z', user: 'Peter Coutanche', user_role: 'Data Analyst', module: 'Business Intel', action: 'Generated BI dashboard export', action_type: 'export', entity_type: 'Report', details: 'Exported Business Intelligence dashboard data. Revenue trends, client acquisition metrics, and operational KPIs for Q1 2026. 6 charts captured.', ip_address: '10.0.1.75', session_id: 'ses_t1u2v3', risk_level: 'low', compliance_relevant: false },
];

const MODULES = ['All', 'AML', 'Fraud Detection', 'KYC', 'Regulatory', 'Reporting', 'ESG', 'Procurement', 'Resources', 'Project Intel', 'Business Intel', 'Settings', 'System'];
const ACTION_TYPES = ['All', 'create', 'read', 'update', 'delete', 'export', 'login', 'config', 'ai_action', 'approval'];
const RISK_LEVELS = ['All', 'low', 'medium', 'high', 'critical'];

const RISK_BADGE: Record<string, string> = {
  low: 'bg-zinc-800 text-zinc-400',
  medium: 'bg-blue-900/30 text-blue-400',
  high: 'bg-amber-900/30 text-amber-400',
  critical: 'bg-red-900/30 text-red-400',
};
const ACTION_ICON: Record<string, React.ElementType> = {
  create: Plus,
  read: Eye,
  update: Edit3,
  delete: Trash2,
  export: Download,
  login: Fingerprint,
  config: Settings,
  ai_action: Activity,
  approval: CheckCircle2,
};
const ACTION_CLR: Record<string, string> = {
  create: 'text-emerald-400',
  read: 'text-zinc-400',
  update: 'text-blue-400',
  delete: 'text-red-400',
  export: 'text-indigo-400',
  login: 'text-zinc-500',
  config: 'text-amber-400',
  ai_action: 'text-purple-400',
  approval: 'text-emerald-400',
};

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function AuditTrailPage() {
  const [events] = useState<AuditEvent[]>(MOCK_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('All');
  const [filterAction, setFilterAction] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [filterCompliance, setFilterCompliance] = useState(false);

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (filterModule !== 'All' && e.module !== filterModule) return false;
      if (filterAction !== 'All' && e.action_type !== filterAction) return false;
      if (filterRisk !== 'All' && e.risk_level !== filterRisk) return false;
      if (filterCompliance && !e.compliance_relevant) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return e.user.toLowerCase().includes(q) ||
               e.action.toLowerCase().includes(q) ||
               e.details.toLowerCase().includes(q) ||
               (e.entity_name || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [events, filterModule, filterAction, filterRisk, filterCompliance, searchQuery]);

  const stats = useMemo(() => ({
    total: events.length,
    critical: events.filter(e => e.risk_level === 'critical').length,
    complianceRelevant: events.filter(e => e.compliance_relevant).length,
    aiActions: events.filter(e => e.action_type === 'ai_action').length,
    uniqueUsers: new Set(events.map(e => e.user)).size,
    modules: new Set(events.map(e => e.module)).size,
  }), [events]);

  const buildPDFConfig = (): PDFReportOptions => ({
    title: 'Audit Trail & Activity Log',
    subtitle: `Export — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    module: 'Audit Trail',
    jurisdiction: 'Jersey, Channel Islands',
    classification: 'OFFICIAL — SENSITIVE',
    sections: [
      { type: 'stats', stats: [
        { label: 'Total Events', value: String(stats.total) },
        { label: 'Critical', value: String(stats.critical) },
        { label: 'Compliance Relevant', value: String(stats.complianceRelevant) },
        { label: 'AI Actions', value: String(stats.aiActions) },
      ] },
      { type: 'heading', title: `Audit Events (${filtered.length} matching current filters)` },
      { type: 'table', columns: ['Timestamp', 'User', 'Module', 'Action', 'Entity', 'Risk', 'Compliance'],
        rows: filtered.map(e => [
          new Date(e.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
          e.user, e.module, e.action, e.entity_name || e.entity_type,
          e.risk_level, e.compliance_relevant ? 'Yes' : '-',
        ]),
      },
      { type: 'heading', title: 'Critical Events Detail' },
      ...events.filter(e => e.risk_level === 'critical').map(e => ({
        type: 'text' as const,
        content: `[${new Date(e.timestamp).toLocaleString('en-GB')}] ${e.user} — ${e.action}\n${e.details}`,
      })),
    ],
  });

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    // Future dates — show actual date instead of negative relative time
    if (diff < 0) return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">Audit Trail</h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        <div className="flex items-center gap-4 app-region-no-drag">
          <span className="text-[11px] text-zinc-400"><ClipboardList className="w-3 h-3 inline mr-1 text-white/25" /><span className="font-medium text-white/60">{stats.total}</span> events</span>
          {stats.critical > 0 && <span className="text-[11px] text-red-400"><AlertTriangle className="w-3 h-3 inline mr-1" />{stats.critical} critical</span>}
          <span className="text-[11px] text-white/40"><Shield className="w-3 h-3 inline mr-1 text-white/25" />{stats.complianceRelevant} compliance</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 app-region-no-drag">
          <ExportButton getReportConfig={buildPDFConfig} label="Export PDF" compact />
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 px-5 pt-3 pb-2 border-b border-white/[0.04]">
        <div className="relative flex-1 max-w-[280px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search events, users, entities…"
            className="w-full h-7 pl-8 pr-3 rounded-[5px] bg-white/[0.04] border border-white/[0.06] text-[11px] text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/40"
          />
        </div>
        <select value={filterModule} onChange={e => setFilterModule(e.target.value)} className="h-7 px-2 rounded-[5px] bg-white/[0.04] border border-white/[0.06] text-[11px] text-zinc-300 focus:outline-none">
          {MODULES.map(m => <option key={m} value={m}>{m === 'All' ? '🏷 All Modules' : m}</option>)}
        </select>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="h-7 px-2 rounded-[5px] bg-white/[0.04] border border-white/[0.06] text-[11px] text-zinc-300 focus:outline-none">
          {ACTION_TYPES.map(a => <option key={a} value={a}>{a === 'All' ? '⚡ All Actions' : a.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="h-7 px-2 rounded-[5px] bg-white/[0.04] border border-white/[0.06] text-[11px] text-zinc-300 focus:outline-none">
          {RISK_LEVELS.map(r => <option key={r} value={r}>{r === 'All' ? '🔴 All Risk Levels' : r}</option>)}
        </select>
        <button
          onClick={() => setFilterCompliance(!filterCompliance)}
          className={cn('h-7 px-2.5 rounded-[5px] text-[11px] flex items-center gap-1 border transition-colors', filterCompliance ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400' : 'bg-white/[0.04] border-white/[0.06] text-zinc-500 hover:text-zinc-300')}
        >
          <Shield className="w-3 h-3" /> Compliance Only
        </button>
        {(filterModule !== 'All' || filterAction !== 'All' || filterRisk !== 'All' || filterCompliance || searchQuery) && (
          <button onClick={() => { setFilterModule('All'); setFilterAction('All'); setFilterRisk('All'); setFilterCompliance(false); setSearchQuery(''); }} className="h-7 px-2 rounded-[5px] text-[11px] text-zinc-500 hover:text-white flex items-center gap-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
        <span className="text-[11px] text-zinc-600 ml-auto">{filtered.length} events</span>
      </div>

      {/* Main content: event list + detail panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Event list */}
        <div className={cn('flex-1 overflow-auto', selectedEvent && 'max-w-[55%]')}>
          <div className="divide-y divide-white/[0.03]">
            {filtered.map(event => {
              const ActionIcon = ACTION_ICON[event.action_type] || Activity;
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={cn(
                    'w-full flex items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-white/[0.02]',
                    selectedEvent?.id === event.id && 'bg-white/[0.04]'
                  )}
                >
                  {/* Icon */}
                  <div className={cn('mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0', event.risk_level === 'critical' ? 'bg-red-900/30' : event.risk_level === 'high' ? 'bg-amber-900/20' : 'bg-white/[0.04]')}>
                    <ActionIcon className={cn('w-3 h-3', ACTION_CLR[event.action_type])} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-white/80 truncate">{event.action}</span>
                      {event.compliance_relevant && <Shield className="w-3 h-3 text-indigo-400 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-zinc-500">{event.user}</span>
                      <span className="text-[11px] text-zinc-700">·</span>
                      <span className="text-[11px] text-zinc-600">{event.module}</span>
                      {event.entity_name && (
                        <>
                          <span className="text-[11px] text-zinc-700">·</span>
                          <span className="text-[11px] text-zinc-500 truncate">{event.entity_name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] text-zinc-600">{fmtTime(event.timestamp)}</span>
                    <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full', RISK_BADGE[event.risk_level])}>{event.risk_level}</span>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-5 py-12 text-center">
                <ClipboardList className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-[12px] text-zinc-500">No events match your filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selectedEvent && (
          <div className="w-[45%] border-l border-white/[0.06] overflow-auto bg-white/[0.01]">
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[14px] font-medium text-white">{selectedEvent.action}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', RISK_BADGE[selectedEvent.risk_level])}>{selectedEvent.risk_level}</span>
                    <span className="text-[10px] text-zinc-600">{selectedEvent.action_type.replace(/_/g, ' ')}</span>
                    {selectedEvent.compliance_relevant && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-900/30 text-indigo-400">Compliance</span>}
                  </div>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="p-1 rounded hover:bg-white/[0.04]">
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  <p className="text-[10px] text-zinc-600 mb-0.5">User</p>
                  <p className="text-[12px] text-white/80">{selectedEvent.user}</p>
                  <p className="text-[10px] text-zinc-500">{selectedEvent.user_role}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  <p className="text-[10px] text-zinc-600 mb-0.5">Timestamp</p>
                  <p className="text-[12px] text-white/80">{new Date(selectedEvent.timestamp).toLocaleString('en-GB')}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  <p className="text-[10px] text-zinc-600 mb-0.5">Module</p>
                  <p className="text-[12px] text-white/80">{selectedEvent.module}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  <p className="text-[10px] text-zinc-600 mb-0.5">Entity</p>
                  <p className="text-[12px] text-white/80">{selectedEvent.entity_name || selectedEvent.entity_type}</p>
                  {selectedEvent.entity_id && <p className="text-[10px] text-zinc-500">ID: {selectedEvent.entity_id}</p>}
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  <p className="text-[10px] text-zinc-600 mb-0.5">IP Address</p>
                  <p className="text-[12px] text-white/80 font-mono">{selectedEvent.ip_address}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  <p className="text-[10px] text-zinc-600 mb-0.5">Session</p>
                  <p className="text-[12px] text-white/80 font-mono">{selectedEvent.session_id}</p>
                </div>
              </div>

              {/* Details */}
              <div className="mb-5">
                <h4 className="text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-wider">Event Details</h4>
                <p className="text-[12px] text-zinc-300 leading-relaxed bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                  {selectedEvent.details}
                </p>
              </div>

              {/* Changes */}
              {selectedEvent.changes && selectedEvent.changes.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-wider">Field Changes</h4>
                  <div className="space-y-1.5">
                    {selectedEvent.changes.map((ch, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[11px] text-zinc-500 w-24 flex-shrink-0">{ch.field}</span>
                        <span className="text-[11px] text-red-400/70 line-through truncate">{ch.old_value}</span>
                        <ChevronRight className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                        <span className="text-[11px] text-emerald-400 truncate">{ch.new_value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance note */}
              {selectedEvent.compliance_relevant && (
                <div className="p-3 rounded-lg bg-indigo-900/10 border border-indigo-500/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[11px] font-medium text-indigo-400">Compliance Relevant</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    This event is retained per JFSC AML/CFT Handbook s.5.3 record-keeping requirements.
                    Minimum retention: 5 years post-business relationship. This record is immutable and tamper-evident.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
