import { useState, useCallback } from 'react';
import {
  Workflow, Play, Pause, CheckCircle2, Clock, AlertTriangle,
  ChevronRight, ChevronDown, Settings, Zap, GitBranch,
  ArrowRight, RotateCcw, Eye,
} from 'lucide-react';
import { cn } from '../lib/utils';
import ExportButton from '../components/ui/ExportButton';
import type { PDFReportOptions } from '../lib/pdfExport';

/* ═══════════════════════════════════════════════════════════════════════════
   WORKFLOW AUTOMATION ENGINE
   Visual workflow management for compliance processes.
   JFSC-aligned workflows for SAR filing, KYC onboarding, periodic review,
   sanctions screening, and escalation procedures.
   ═══════════════════════════════════════════════════════════════════════════ */

type StepStatus = 'completed' | 'active' | 'pending' | 'failed' | 'skipped';
type WorkflowStatus = 'active' | 'paused' | 'completed' | 'failed' | 'draft';
type TriggerType = 'manual' | 'scheduled' | 'event' | 'threshold';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'decision' | 'notification' | 'approval' | 'integration';
  status: StepStatus;
  assignedTo?: string;
  duration?: string;
  description: string;
  automatable: boolean;
  slaHours?: number;
}

interface WorkflowDef {
  id: string;
  name: string;
  module: string;
  status: WorkflowStatus;
  trigger: TriggerType;
  triggerDetail: string;
  steps: WorkflowStep[];
  totalRuns: number;
  avgDuration: string;
  successRate: number;
  lastRun: string;
  nextRun?: string;
  compliance: string[];
  description: string;
}

const STEP_STATUS_CLR: Record<StepStatus, string> = {
  completed: 'bg-emerald-500',
  active: 'bg-indigo-500 animate-pulse',
  pending: 'bg-zinc-700',
  failed: 'bg-red-500',
  skipped: 'bg-zinc-600',
};

const STEP_ICON_CLR: Record<StepStatus, string> = {
  completed: 'text-emerald-400',
  active: 'text-indigo-400',
  pending: 'text-zinc-500',
  failed: 'text-red-400',
  skipped: 'text-zinc-600',
};

const WF_STATUS_CLR: Record<WorkflowStatus, string> = {
  active: 'text-emerald-400 bg-emerald-400/10',
  paused: 'text-amber-400 bg-amber-400/10',
  completed: 'text-blue-400 bg-blue-400/10',
  failed: 'text-red-400 bg-red-400/10',
  draft: 'text-zinc-400 bg-zinc-400/10',
};

const TRIGGER_ICON: Record<TriggerType, React.ElementType> = {
  manual: Play,
  scheduled: Clock,
  event: Zap,
  threshold: AlertTriangle,
};

const MOCK_WORKFLOWS: WorkflowDef[] = [
  {
    id: 'wf1', name: 'SAR Filing Pipeline', module: 'AML', status: 'active', trigger: 'event', triggerDetail: 'Triggered when AI flags suspicious activity (confidence ≥ 85%)',
    description: 'Automated suspicious activity report workflow per JFSC AML/CFT Handbook. Includes MLRO review, JFSC portal submission, and evidence archival.',
    totalRuns: 47, avgDuration: '18 hours', successRate: 96, lastRun: '2026-03-14T09:30:00Z', nextRun: 'Event-driven',
    compliance: ['POCL 1999 §15', 'JFSC AML/CFT Handbook', 'FATF Rec. 20'],
    steps: [
      { id: 's1', name: 'AI Alert Triage', type: 'action', status: 'completed', description: 'AI classifies alert and assigns priority score', automatable: true, duration: '< 1 min' },
      { id: 's2', name: 'Analyst Review', type: 'action', status: 'completed', assignedTo: 'Compliance Analyst', description: 'Human analyst reviews AI findings and transaction evidence', automatable: false, slaHours: 4 },
      { id: 's3', name: 'Escalation Decision', type: 'decision', status: 'completed', description: 'Determine if SAR filing required based on evidence', automatable: false, duration: '~30 min' },
      { id: 's4', name: 'MLRO Approval', type: 'approval', status: 'active', assignedTo: 'MLRO', description: 'Money Laundering Reporting Officer reviews and approves SAR', automatable: false, slaHours: 24 },
      { id: 's5', name: 'JFSC Portal Submission', type: 'integration', status: 'pending', description: 'Auto-submit SAR to JFSC goAML portal', automatable: true },
      { id: 's6', name: 'Evidence Archival', type: 'action', status: 'pending', description: 'Archive all supporting evidence with tamper-proof hashing', automatable: true },
      { id: 's7', name: 'Acknowledgement Tracking', type: 'notification', status: 'pending', description: 'Monitor JFSC acknowledgement and track case reference', automatable: true },
    ],
  },
  {
    id: 'wf2', name: 'KYC Client Onboarding', module: 'KYC', status: 'active', trigger: 'manual', triggerDetail: 'Initiated by relationship manager when new client request received',
    description: 'Full KYC onboarding workflow per JFSC Code of Practice for AML/CFT. Includes identity verification, sanctions screening, PEP checks, and risk assessment.',
    totalRuns: 128, avgDuration: '3.2 days', successRate: 89, lastRun: '2026-03-13T14:00:00Z',
    compliance: ['JFSC AML/CFT Code', 'JFSC Trust Company Business Code', 'Money Laundering Order'],
    steps: [
      { id: 's1', name: 'Client Information Collection', type: 'action', status: 'completed', description: 'Gather client details, ID documents, source of wealth declaration', automatable: false, slaHours: 48 },
      { id: 's2', name: 'Identity Verification', type: 'integration', status: 'completed', description: 'Automated ID verification via document scanning and database checks', automatable: true, duration: '< 5 min' },
      { id: 's3', name: 'Sanctions Screening', type: 'integration', status: 'completed', description: 'Screen against OFSI, EU, UN, OFAC sanctions lists', automatable: true, duration: '< 2 min' },
      { id: 's4', name: 'PEP & Adverse Media Check', type: 'integration', status: 'completed', description: 'Check PEP databases and adverse media feeds', automatable: true, duration: '< 3 min' },
      { id: 's5', name: 'AI Risk Assessment', type: 'action', status: 'active', description: 'AI evaluates overall risk based on all check results', automatable: true, duration: '< 1 min' },
      { id: 's6', name: 'EDD Decision', type: 'decision', status: 'pending', description: 'Determine if Enhanced Due Diligence required', automatable: false },
      { id: 's7', name: 'Compliance Officer Approval', type: 'approval', status: 'pending', assignedTo: 'Compliance Officer', description: 'Final approval for client onboarding', automatable: false, slaHours: 24 },
      { id: 's8', name: 'Client Account Activation', type: 'action', status: 'pending', description: 'Activate client account and set monitoring parameters', automatable: true },
    ],
  },
  {
    id: 'wf3', name: 'Periodic KYC Review', module: 'KYC', status: 'active', trigger: 'scheduled', triggerDetail: 'Auto-triggers based on client risk rating: High=6mo, Enhanced=12mo, Standard=36mo',
    description: 'Automated periodic review scheduling and execution. Ensures all clients are reviewed within JFSC-mandated timeframes.',
    totalRuns: 312, avgDuration: '5.1 days', successRate: 94, lastRun: '2026-03-14T06:00:00Z', nextRun: '2026-03-15T06:00:00Z',
    compliance: ['JFSC AML/CFT Code §4.8', 'JFSC Guidance Note — Ongoing Monitoring'],
    steps: [
      { id: 's1', name: 'Review Trigger', type: 'action', status: 'completed', description: 'System identifies clients due for periodic review', automatable: true },
      { id: 's2', name: 'Automated Re-screening', type: 'integration', status: 'completed', description: 'Re-run sanctions, PEP, and adverse media checks', automatable: true, duration: '< 5 min' },
      { id: 's3', name: 'Change Detection', type: 'action', status: 'active', description: 'AI identifies material changes in client profile', automatable: true },
      { id: 's4', name: 'Analyst Review', type: 'action', status: 'pending', assignedTo: 'KYC Analyst', description: 'Review changes and update risk assessment', automatable: false, slaHours: 72 },
      { id: 's5', name: 'Risk Re-rating', type: 'decision', status: 'pending', description: 'Update client risk rating based on review findings', automatable: false },
      { id: 's6', name: 'Records Update', type: 'action', status: 'pending', description: 'Update KYC records and next review date', automatable: true },
    ],
  },
  {
    id: 'wf4', name: 'Sanctions Alert Triage', module: 'Fraud Detection', status: 'active', trigger: 'event', triggerDetail: 'Real-time trigger on sanctions list match (any confidence level)',
    description: 'Immediate triage workflow for sanctions matches. Includes automatic transaction freezing, escalation, and JFSC notification.',
    totalRuns: 23, avgDuration: '4.2 hours', successRate: 100, lastRun: '2026-03-12T11:15:00Z', nextRun: 'Event-driven',
    compliance: ['Sanctions & AML (Jersey) Law', 'JFSC Sanctions Guidance', 'OFSI Compliance'],
    steps: [
      { id: 's1', name: 'Auto-Freeze Transaction', type: 'action', status: 'completed', description: 'Immediately freeze flagged transaction', automatable: true, duration: '< 10 sec' },
      { id: 's2', name: 'AI Confidence Assessment', type: 'action', status: 'completed', description: 'Assess match quality and false-positive probability', automatable: true, duration: '< 30 sec' },
      { id: 's3', name: 'Analyst Verification', type: 'action', status: 'completed', assignedTo: 'Sanctions Analyst', description: 'Verify match against primary sources', automatable: false, slaHours: 2 },
      { id: 's4', name: 'Escalation Decision', type: 'decision', status: 'active', description: 'True match → MLRO. False positive → release.', automatable: false },
      { id: 's5', name: 'MLRO Notification', type: 'notification', status: 'pending', description: 'Alert MLRO with full case file', automatable: true },
      { id: 's6', name: 'Regulatory Reporting', type: 'integration', status: 'pending', description: 'File STR with JFSC if confirmed match', automatable: true },
    ],
  },
  {
    id: 'wf5', name: 'ESG Incident Response', module: 'ESG', status: 'draft', trigger: 'event', triggerDetail: 'Triggered by ESG incident detection or external report',
    description: 'Response workflow for ESG-related incidents including environmental breaches, governance failures, and social impact events.',
    totalRuns: 3, avgDuration: '12 days', successRate: 67, lastRun: '2026-01-20T08:00:00Z',
    compliance: ['TCFD Framework', 'Jersey Sustainable Finance Framework'],
    steps: [
      { id: 's1', name: 'Incident Classification', type: 'action', status: 'completed', description: 'Classify incident by ESG category and severity', automatable: true },
      { id: 's2', name: 'Impact Assessment', type: 'action', status: 'completed', assignedTo: 'ESG Analyst', description: 'Assess financial and reputational impact', automatable: false, slaHours: 24 },
      { id: 's3', name: 'Stakeholder Communication', type: 'notification', status: 'failed', description: 'Notify relevant stakeholders and board', automatable: true },
      { id: 's4', name: 'Remediation Plan', type: 'action', status: 'pending', description: 'Develop and assign remediation actions', automatable: false },
      { id: 's5', name: 'Regulatory Disclosure', type: 'decision', status: 'pending', description: 'Determine if regulatory disclosure required', automatable: false },
    ],
  },
  {
    id: 'wf6', name: 'Regulatory Change Management', module: 'Regulatory', status: 'paused', trigger: 'event', triggerDetail: 'Triggered by regulatory intelligence feed detecting new/amended regulation',
    description: 'Workflow to assess impact of regulatory changes, update policies, and ensure compliance before effective dates.',
    totalRuns: 18, avgDuration: '21 days', successRate: 88, lastRun: '2026-02-28T10:00:00Z',
    compliance: ['JFSC Supervision Framework', 'UK FCA Change Management'],
    steps: [
      { id: 's1', name: 'Change Detection', type: 'integration', status: 'completed', description: 'AI monitors regulatory feeds for changes', automatable: true },
      { id: 's2', name: 'Impact Analysis', type: 'action', status: 'completed', assignedTo: 'Regulatory Analyst', description: 'Assess impact on current policies and procedures', automatable: false, slaHours: 48 },
      { id: 's3', name: 'Gap Assessment', type: 'action', status: 'active', description: 'Identify gaps between current state and new requirements', automatable: true },
      { id: 's4', name: 'Policy Update', type: 'action', status: 'pending', assignedTo: 'Policy Team', description: 'Draft and review policy amendments', automatable: false },
      { id: 's5', name: 'Board Approval', type: 'approval', status: 'pending', assignedTo: 'Board', description: 'Board sign-off on material changes', automatable: false },
      { id: 's6', name: 'Staff Training', type: 'action', status: 'pending', description: 'Schedule and deliver training on changes', automatable: true },
      { id: 's7', name: 'Implementation Verification', type: 'action', status: 'pending', description: 'Verify changes are implemented before effective date', automatable: false },
    ],
  },
];

export default function WorkflowAutomationPage() {
  const [workflows, setWorkflows] = useState(MOCK_WORKFLOWS);
  const [selectedWf, setSelectedWf] = useState<string | null>('wf1');
  const [filter, setFilter] = useState<'all' | WorkflowStatus>('all');
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const filtered = workflows.filter(wf => filter === 'all' || wf.status === filter);
  const activeWf = workflows.find(wf => wf.id === selectedWf);

  const toggleWorkflowStatus = useCallback((id: string) => {
    setWorkflows(prev => prev.map(wf => {
      if (wf.id !== id) return wf;
      const newStatus: WorkflowStatus = wf.status === 'active' ? 'paused' : wf.status === 'paused' ? 'active' : wf.status;
      return { ...wf, status: newStatus };
    }));
  }, []);

  function buildPDFConfig(): PDFReportOptions {
    return {
      title: 'Workflow Automation Report',
      subtitle: 'Compliance workflow status and performance metrics',
      module: 'Workflow Automation',
      jurisdiction: 'Jersey',
      classification: 'INTERNAL',
      generatedBy: 'Velanova AI Governance Engine',
      sections: [
        { type: 'stats', stats: [
          { label: 'Total Workflows', value: String(workflows.length) },
          { label: 'Active', value: String(workflows.filter(w => w.status === 'active').length) },
          { label: 'Avg Success Rate', value: Math.round(workflows.reduce((s, w) => s + w.successRate, 0) / workflows.length) + '%' },
          { label: 'Total Runs', value: String(workflows.reduce((s, w) => s + w.totalRuns, 0)) },
        ]},
        { type: 'heading', content: 'Workflow Inventory' },
        { type: 'table', columns: ['Workflow', 'Module', 'Status', 'Trigger', 'Success Rate', 'Total Runs'], rows: workflows.map(w => [w.name, w.module, w.status, w.trigger, w.successRate + '%', String(w.totalRuns)]) },
        { type: 'heading', content: 'Compliance Mappings' },
        ...workflows.map(w => ({ type: 'text' as const, content: `${w.name}: ${w.compliance.join(', ')}` })),
      ],
    };
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#030303] text-white overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-indigo-400" />
          <h1 className="text-[14px] font-semibold tracking-tight">Workflow Automation</h1>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">
            {workflows.filter(w => w.status === 'active').length} Active
          </span>
        </div>
        <div className="flex items-center gap-1.5 app-region-no-drag">
          <ExportButton getReportConfig={buildPDFConfig} compact />
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Workflow List Panel */}
        <div className="w-[320px] border-r border-white/[0.06] flex flex-col min-h-0">
          {/* Filters */}
          <div className="p-3 border-b border-white/[0.06] flex items-center gap-1 flex-wrap">
            {(['all', 'active', 'paused', 'completed', 'draft'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={cn('h-6 px-2 rounded text-[10px] capitalize', filter === f ? 'bg-white/[0.08] text-white' : 'text-zinc-500 hover:text-zinc-300')}>
                {f} {f !== 'all' && `(${workflows.filter(w => w.status === f).length})`}
              </button>
            ))}
          </div>

          {/* Workflow Cards */}
          <div className="flex-1 overflow-auto p-2 space-y-1.5">
            {filtered.map(wf => {
              const completedSteps = wf.steps.filter(s => s.status === 'completed').length;
              const TrigIcon = TRIGGER_ICON[wf.trigger];
              return (
                <div
                  key={wf.id}
                  onClick={() => setSelectedWf(wf.id)}
                  className={cn(
                    'rounded-xl border p-3 cursor-pointer transition-all',
                    selectedWf === wf.id ? 'border-indigo-500/30 bg-white/[0.03]' : 'border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.02]'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] font-medium text-white/80 block truncate">{wf.name}</span>
                      <span className="text-[10px] text-zinc-500">{wf.module}</span>
                    </div>
                    <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize flex-shrink-0', WF_STATUS_CLR[wf.status])}>
                      {wf.status}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex-1 h-1 rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: (completedSteps / wf.steps.length * 100) + '%' }} />
                    </div>
                    <span className="text-[9px] text-zinc-500">{completedSteps}/{wf.steps.length}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[9px] text-zinc-600">
                    <span className="flex items-center gap-1"><TrigIcon className="w-3 h-3" />{wf.trigger}</span>
                    <span>{wf.successRate}% success</span>
                    <span>{wf.totalRuns} runs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {activeWf ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold text-white/90">{activeWf.name}</h2>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed max-w-2xl">{activeWf.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {(activeWf.status === 'active' || activeWf.status === 'paused') && (
                    <button onClick={() => toggleWorkflowStatus(activeWf.id)} className={cn('h-7 px-3 rounded-lg text-[11px] flex items-center gap-1.5', activeWf.status === 'active' ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20')}>
                      {activeWf.status === 'active' ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Resume</>}
                    </button>
                  )}
                  <button className="h-7 px-3 rounded-lg text-[11px] bg-white/[0.04] text-zinc-400 hover:text-zinc-300 flex items-center gap-1.5">
                    <Settings className="w-3 h-3" /> Configure
                  </button>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Total Runs', value: String(activeWf.totalRuns) },
                  { label: 'Avg Duration', value: activeWf.avgDuration },
                  { label: 'Success Rate', value: activeWf.successRate + '%' },
                  { label: 'Last Run', value: new Date(activeWf.lastRun).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) },
                ].map(m => (
                  <div key={m.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                    <div className="text-[16px] font-bold text-white/80 tabular-nums">{m.value}</div>
                    <span className="text-[9px] text-zinc-600 uppercase tracking-wider">{m.label}</span>
                  </div>
                ))}
              </div>

              {/* Trigger & Compliance */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Trigger</span>
                  </div>
                  <span className="text-[11px] text-white/70 capitalize">{activeWf.trigger}</span>
                  <p className="text-[10px] text-zinc-400">{activeWf.triggerDetail}</p>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <GitBranch className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Compliance Mapped</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activeWf.compliance.map(c => (
                      <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">{c}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workflow Steps — Visual Pipeline */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowRight className="w-4 h-4 text-zinc-500" />
                  <span className="text-[11px] font-medium text-white/70">Workflow Steps</span>
                  <span className="text-[10px] text-zinc-600">({activeWf.steps.filter(s => s.status === 'completed').length}/{activeWf.steps.length} completed)</span>
                </div>

                {activeWf.steps.map((step, idx) => (
                  <div key={step.id}>
                    {/* Connector line */}
                    {idx > 0 && (
                      <div className="flex items-center pl-[18px] h-4">
                        <div className="w-px h-full bg-white/[0.08]" />
                      </div>
                    )}
                    <div
                      onClick={() => setExpandedStep(expandedStep === `${activeWf.id}-${step.id}` ? null : `${activeWf.id}-${step.id}`)}
                      className={cn(
                        'rounded-xl border p-3 cursor-pointer transition-all',
                        step.status === 'active' ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.03]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Status dot */}
                        <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', STEP_STATUS_CLR[step.status])} />

                        {/* Step info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn('text-[12px] font-medium', step.status === 'completed' ? 'text-zinc-500 line-through' : step.status === 'active' ? 'text-white/90' : 'text-zinc-400')}>{step.name}</span>
                            <span className="text-[8px] px-1 py-0.5 rounded bg-white/[0.04] text-zinc-600 capitalize">{step.type}</span>
                            {step.automatable && <Zap className="w-3 h-3 text-amber-500" />}
                          </div>
                          {step.assignedTo && <span className="text-[9px] text-zinc-600 mt-0.5 block">→ {step.assignedTo}</span>}
                        </div>

                        {/* Duration / SLA */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {step.duration && <span className="text-[9px] text-zinc-600">{step.duration}</span>}
                          {step.slaHours && <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/10 text-amber-400">SLA: {step.slaHours}h</span>}
                          {step.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : step.status === 'failed' ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> : null}
                          {expandedStep === `${activeWf.id}-${step.id}` ? <ChevronDown className="w-3 h-3 text-zinc-600" /> : <ChevronRight className="w-3 h-3 text-zinc-600" />}
                        </div>
                      </div>

                      {/* Expanded description */}
                      {expandedStep === `${activeWf.id}-${step.id}` && (
                        <div className="mt-2 pt-2 border-t border-white/[0.04]">
                          <p className="text-[10px] text-zinc-400 leading-relaxed">{step.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={cn('text-[9px] flex items-center gap-1', STEP_ICON_CLR[step.status])}>
                              {step.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : step.status === 'active' ? <RotateCcw className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
                              {step.status}
                            </span>
                            {step.automatable && <span className="text-[9px] text-amber-400 flex items-center gap-1"><Zap className="w-3 h-3" /> Automatable</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Automation Score */}
              {(() => {
                const autoSteps = activeWf.steps.filter(s => s.automatable).length;
                const autoPct = Math.round((autoSteps / activeWf.steps.length) * 100);
                return (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-zinc-400 font-medium">Automation Potential</span>
                      <span className="text-[12px] font-bold text-indigo-400">{autoPct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: autoPct + '%' }} />
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-2">
                      {autoSteps} of {activeWf.steps.length} steps can be fully automated. 
                      {activeWf.steps.filter(s => !s.automatable).length} steps require human review per JFSC compliance requirements.
                    </p>
                  </div>
                );
              })()}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Workflow className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-[12px] text-zinc-600">Select a workflow to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/[0.06]">
        <div className="flex items-start gap-2">
          <Eye className="w-3 h-3 text-zinc-600 mt-0.5 flex-shrink-0" />
          <p className="text-[9px] text-zinc-600">
            Workflow definitions aligned with JFSC AML/CFT Handbook, Jersey Sanctions & Proliferation Financing Framework, 
            and FATF Recommendations. Human-in-the-loop steps cannot be automated per regulatory requirement.
          </p>
        </div>
      </div>
    </div>
  );
}
