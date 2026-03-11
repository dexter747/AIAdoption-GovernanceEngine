import { useState } from 'react';
import {
  FileText, Sparkles, RefreshCw, Clock,
  Shield, AlertTriangle, TrendingUp, CheckCircle2,
  Scale, Banknote, ScanSearch, ShieldAlert,
  Leaf, Users2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import ExportButton from '../components/ui/ExportButton';
import type { PDFReportOptions } from '../lib/pdfExport';

/* ═══════════════════════════════════════════════════════════════════════════
   Executive Summary Generator
   One-click AI narrative generation that synthesises data from ALL Velanova
   modules into a board-ready executive briefing.
   Aligned with JFSC governance reports, UK AI White Paper transparency,
   and OECD AI Principles.
   ═══════════════════════════════════════════════════════════════════════════ */

interface SummarySection {
  module: string;
  icon: React.ElementType;
  status: 'healthy' | 'warning' | 'critical';
  headline: string;
  keyMetrics: { label: string; value: string; trend?: 'up' | 'down' | 'stable' }[];
  narrative: string;
  recommendations: string[];
}

const GENERATED_SUMMARY: SummarySection[] = [
  {
    module: 'Fraud Detection',
    icon: ShieldAlert,
    status: 'warning',
    headline: '4 open alerts, 2 critical — £1.39M total exposure',
    keyMetrics: [
      { label: 'Open Alerts', value: '4', trend: 'up' },
      { label: 'Critical', value: '2' },
      { label: 'Investigations', value: '3' },
      { label: 'Total Exposure', value: '£1.39M', trend: 'up' },
    ],
    narrative: 'Fraud detection systems flagged a 15% increase in suspicious activity month-over-month. Two critical alerts remain under active investigation: a cash structuring pattern across Jersey branches (£29,700 across 3 deposits below £10k threshold) and a blocked $750k wire transfer to an unregistered Cyprus entity with Russian beneficial ownership. The AI detection engine maintained 94% confidence on the structuring pattern, which has been corroborated by manual MLRO review.',
    recommendations: [
      'Expedite SAR filing for cash structuring case (INV-2026-0018) — JFSC 72-hour deadline approaching',
      'Complete enhanced due diligence on Latvia-corridor wire transfer (£485k to Baltic Maritime Corp)',
      'Review account takeover incident — confirm with account holder and reverse BVI transfer if possible',
    ],
  },
  {
    module: 'AML / SAR',
    icon: Banknote,
    status: 'critical',
    headline: '2 pending SARs, 1 filed with JFSC — critical sanctions exposure',
    keyMetrics: [
      { label: 'Open Alerts', value: '4', trend: 'up' },
      { label: 'Pending SARs', value: '2' },
      { label: 'Filed SARs', value: '1' },
      { label: 'Flagged Txns', value: '42', trend: 'up' },
    ],
    narrative: 'AML monitoring identified 42 flagged transactions in the current period, a 17% increase from the prior month. The Volkov International LLC STR (SAR-2026-0041) has been filed with JFSC and acknowledged (ref: JFSC-ACK-2026-1847). The Heinrich Müller Trust SAR remains in MLRO review — three structured CHF deposits totalling CHF 29,650 display a high-confidence (92%) structuring pattern. PEP monitoring flagged Sir Richard Pemberton\'s £165,000 movement, requiring source of funds verification.',
    recommendations: [
      'Complete MLRO review of Heinrich Müller Trust SAR — target submission within 48 hours',
      'Initiate draft SAR for Sir Richard Pemberton PEP transactions (£165,000)',
      'Review velocity anomaly on Gulf Maritime Trading — 340% month-over-month increase in transaction frequency',
    ],
  },
  {
    module: 'KYC / Onboarding',
    icon: ScanSearch,
    status: 'warning',
    headline: '2 high-risk clients require enhanced due diligence',
    keyMetrics: [
      { label: 'Active Clients', value: '18' },
      { label: 'High Risk', value: '2', trend: 'stable' },
      { label: 'Onboarding', value: '3' },
      { label: 'Overdue Reviews', value: '1', trend: 'up' },
    ],
    narrative: 'Client portfolio comprises 18 active relationships across 6 jurisdictions. Two clients maintain high-risk ratings: Atlantic Wealth Trust (complex trust structure with PEP-linked beneficiaries, risk score 68) and a Russian-jurisdiction entity (Volkov International LLC, blocked and under sanctions review). Three new onboarding processes are in progress. One periodic review (Channel Islands Property Trust) is overdue by 12 days — JFSC compliance requires remediation within 30 days.',
    recommendations: [
      'Complete overdue periodic review for Channel Islands Property Trust',
      'Schedule enhanced due diligence refresh for Atlantic Wealth Trust — PEP re-screening due Q2 2026',
      'Verify source of wealth documentation for 3 new onboarding clients via Jersey Comptroller records',
    ],
  },
  {
    module: 'Regulatory Intelligence',
    icon: Scale,
    status: 'warning',
    headline: '3 upcoming regulatory changes require action',
    keyMetrics: [
      { label: 'Active Changes', value: '8' },
      { label: 'Critical', value: '1' },
      { label: 'Action Required', value: '3', trend: 'up' },
      { label: 'Compliance Rate', value: '94%' },
    ],
    narrative: 'Three regulatory changes require board attention: (1) JFSC AML/CFT Handbook Amendment 2026.02 — new enhanced due diligence requirements for trust structures effective April 2026, (2) EU AI Act Article 6 designation — Velanova\'s fraud detection module classified as "high-risk AI system" under EU AI Act, requiring conformity assessment by August 2026, and (3) Updated FATF Travel Rule implementation for Jersey-based virtual asset service providers. Current overall compliance rate stands at 94%.',
    recommendations: [
      'Begin EU AI Act conformity assessment process — engage external AI auditor by Q2 2026',
      'Update trust CDD procedures per JFSC AML/CFT Handbook Amendment 2026.02',
      'Implement FATF Travel Rule changes for cryptocurrency transaction monitoring',
    ],
  },
  {
    module: 'ESG Reporting',
    icon: Leaf,
    status: 'healthy',
    headline: 'On track for TCFD and GRI annual submission',
    keyMetrics: [
      { label: 'Frameworks', value: '4' },
      { label: 'Targets Met', value: '6/8' },
      { label: 'Carbon Offset', value: '78%', trend: 'up' },
      { label: 'Next Report', value: '15 Apr' },
    ],
    narrative: 'ESG reporting programme is on track. Six of eight sustainability targets are met or ahead of schedule. Carbon offset programme has achieved 78% of the annual target, with renewable energy procurement contributing 45% of total energy consumption. TCFD climate risk disclosure and GRI sustainability report are in final preparation for the April board meeting. Jersey Green Finance initiative participation remains active.',
    recommendations: [
      'Finalise TCFD climate risk disclosure for April board meeting',
      'Address two lagging sustainability targets (water usage and supply chain audit)',
      'Prepare updated ESG materiality matrix for stakeholder consultation',
    ],
  },
  {
    module: 'Resource Planning',
    icon: Users2,
    status: 'healthy',
    headline: '87% average utilisation — compliance team at capacity',
    keyMetrics: [
      { label: 'Avg Utilisation', value: '87%' },
      { label: 'Team Size', value: '24' },
      { label: 'Over-capacity', value: '2 teams' },
      { label: 'Hiring Pipeline', value: '3' },
    ],
    narrative: 'Overall resource utilisation is at 87%, within the 80–90% optimal range. However, the Compliance team is operating at 105% capacity due to increased SAR filing and regulatory change volumes. Risk & AML team is at 98% — approaching burnout thresholds. Three positions are in the hiring pipeline (2 compliance analysts, 1 senior risk manager) with Q2 start dates. AI-driven workload optimisation has reduced manual screening time by 23% since deployment.',
    recommendations: [
      'Expedite compliance analyst hiring — team operating above 100% capacity',
      'Redistribute non-critical compliance tasks to less utilised teams',
      'Review AI workload optimisation effectiveness — schedule Q2 impact assessment',
    ],
  },
];

type GenerationState = 'idle' | 'generating' | 'complete';

const STATUS_CLR: Record<string, string> = {
  healthy: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-900/30 text-amber-400 border-amber-500/20',
  critical: 'bg-red-900/30 text-red-400 border-red-500/20',
};

export default function ExecutiveSummaryPage() {
  const [state, setState] = useState<GenerationState>('idle');
  const [sections, setSections] = useState<SummarySection[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string>('');

  const generate = () => {
    setState('generating');
    // Simulate AI generation delay (in production, this would call BYOK model)
    setTimeout(() => {
      setSections(GENERATED_SUMMARY);
      setGeneratedAt(new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }));
      setState('complete');
    }, 2800);
  };

  const overall = sections.length > 0 ? (
    sections.some(s => s.status === 'critical') ? 'critical' :
    sections.some(s => s.status === 'warning') ? 'warning' : 'healthy'
  ) : null;

  const buildPDFConfig = (): PDFReportOptions => ({
    title: 'Executive Summary — Board Briefing',
    subtitle: `Generated ${generatedAt} · ${sections.length} modules analysed`,
    module: 'Executive Summary',
    jurisdiction: 'Jersey (JFSC)',
    classification: 'BOARD CONFIDENTIAL',
    includeComplianceBadges: true,
    sections: [
      ...(overall ? [{ type: 'text' as const, title: 'Overall Status', content: `Overall governance status: ${overall.toUpperCase()}. ${sections.filter(s => s.status === 'critical').length} critical, ${sections.filter(s => s.status === 'warning').length} warning, ${sections.filter(s => s.status === 'healthy').length} healthy modules.` }] : []),
      ...sections.flatMap(s => [
        { type: 'heading' as const, title: `${s.module} — ${s.headline}` },
        { type: 'stats' as const, stats: s.keyMetrics.map(m => ({ label: m.label, value: m.value })) },
        { type: 'text' as const, content: s.narrative },
        { type: 'text' as const, title: 'Recommendations', content: s.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n') },
        { type: 'divider' as const },
      ]),
    ],
  });

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#030303]">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <div className="flex items-center gap-2 flex-1">
          <FileText className="w-4 h-4 text-indigo-400" />
          <h1 className="text-[13px] font-semibold text-white/80">Executive Summary</h1>
          {generatedAt && <span className="text-[10px] text-zinc-600"><Clock className="w-3 h-3 inline mr-0.5" />{generatedAt}</span>}
        </div>
        <div className="flex items-center gap-1.5 app-region-no-drag">
          {state === 'complete' && (
            <>
              <button onClick={generate} className="h-7 px-3 rounded-lg text-[11px] text-zinc-400 hover:text-white hover:bg-white/[0.04] flex items-center gap-1.5 transition-colors">
                <RefreshCw className="w-3 h-3" /> Regenerate
              </button>
              <ExportButton getReportConfig={buildPDFConfig} compact />
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {state === 'idle' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-900/20 border border-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-indigo-400" />
              </div>
              <h2 className="text-[18px] font-semibold text-white/90">Generate Executive Summary</h2>
              <p className="text-[13px] text-zinc-500 leading-relaxed">
                AI will analyse data from all Velanova modules — Fraud Detection, AML, KYC,
                Regulatory Intelligence, ESG, and Resource Planning — to produce a board-ready
                executive briefing with key metrics, risk narratives, and actionable recommendations.
              </p>
              <button
                onClick={generate}
                className="h-10 px-6 rounded-xl text-[13px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Generate Summary
              </button>
              <p className="text-[10px] text-zinc-700">
                Uses locally-processed AI model via BYOK configuration · No data leaves your device
              </p>
            </div>
          </div>
        )}

        {state === 'generating' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6 max-w-sm">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-900/20 border border-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-[16px] font-medium text-white/80">Analysing all modules…</h2>
                <div className="space-y-1.5">
                  {['Fraud Detection & Transaction Monitoring', 'AML & Suspicious Activity Reports', 'KYC & Client Onboarding', 'Regulatory Intelligence', 'ESG Reporting', 'Resource Planning'].map((m, i) => (
                    <div key={i} className="flex items-center gap-2 justify-center text-[11px] text-zinc-500 animate-pulse" style={{ animationDelay: `${i * 200}ms` }}>
                      <div className="w-1 h-1 rounded-full bg-indigo-400" />
                      {m}
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-48 h-1 bg-white/[0.06] rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        )}

        {state === 'complete' && (
          <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Overall status banner */}
            {overall && (
              <div className={cn('p-4 rounded-xl border flex items-center gap-3', STATUS_CLR[overall])}>
                {overall === 'critical' ? <AlertTriangle className="w-5 h-5" /> : overall === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                <div>
                  <div className="text-[13px] font-medium">
                    Overall Governance Status: <span className="uppercase">{overall}</span>
                  </div>
                  <div className="text-[11px] opacity-70 mt-0.5">
                    {sections.filter(s => s.status === 'critical').length} critical · {sections.filter(s => s.status === 'warning').length} warning · {sections.filter(s => s.status === 'healthy').length} healthy across {sections.length} modules
                  </div>
                </div>
              </div>
            )}

            {/* Module sections */}
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <div key={idx} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] overflow-hidden">
                  {/* Section header */}
                  <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.04]">
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span className="text-[13px] font-medium text-white/80">{section.module}</span>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full border capitalize', STATUS_CLR[section.status])}>{section.status}</span>
                    <div className="flex-1" />
                    <span className="text-[11px] text-zinc-500">{section.headline}</span>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Key metrics */}
                    <div className="grid grid-cols-4 gap-3">
                      {section.keyMetrics.map((m, i) => (
                        <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <div className="text-[10px] text-zinc-600 mb-1">{m.label}</div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[16px] font-semibold text-white/80">{m.value}</span>
                            {m.trend === 'up' && <TrendingUp className="w-3 h-3 text-red-400" />}
                            {m.trend === 'down' && <TrendingUp className="w-3 h-3 text-emerald-400 rotate-180" />}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AI-generated narrative */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-medium">AI-Generated Narrative</span>
                      </div>
                      <p className="text-[12px] text-zinc-300 leading-relaxed">{section.narrative}</p>
                    </div>

                    {/* Recommendations */}
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Recommended Actions</div>
                      <div className="space-y-1.5">
                        {section.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px]">
                            <span className="text-indigo-400 font-medium mt-0.5">{i + 1}.</span>
                            <span className="text-zinc-400 leading-relaxed">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Footer compliance notice */}
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.03]">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0" />
                <div className="text-[10px] text-zinc-500 leading-relaxed">
                  <span className="text-zinc-400 font-medium">Board Confidential</span> — This executive summary was generated by Velanova AI using locally-processed data.
                  No client data, SAR content, or confidential compliance information has been transmitted externally.
                  All AI assessments are advisory and require board-level review per JFSC Corporate Governance requirements.
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.04]">GDPR Compliant</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.04]">AES-256 Encrypted</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.04]">Local Storage Only</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.04]">JFSC Governance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
