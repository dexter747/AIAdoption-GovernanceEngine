import { useState } from 'react';
import {
  Scale, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp,
  ChevronDown, ChevronRight, Eye, BarChart2, Users, Shield,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { cn } from '../lib/utils';
import ExportButton from '../components/ui/ExportButton';
import type { PDFReportOptions } from '../lib/pdfExport';

/* ═══════════════════════════════════════════════════════════════════════════
   AI BIAS & FAIRNESS MONITORING DASHBOARD
   Continuous monitoring of AI model outputs for demographic bias, geographic
   disparities, and fairness metrics. Aligned with EU AI Act Art. 10(2)(f),
   UK AI White Paper fairness principles, OECD AI Principle 1.3,
   and Equality Act 2010 / Jersey Discrimination Law 2013.
   ═══════════════════════════════════════════════════════════════════════════ */

type BiasLevel = 'low' | 'moderate' | 'significant' | 'critical';
type FairnessMetric = 'demographic_parity' | 'equalized_odds' | 'predictive_parity' | 'disparate_impact';

interface BiasReport {
  id: string;
  model: string;
  module: string;
  dimension: string;
  metric: FairnessMetric;
  biasLevel: BiasLevel;
  disparateImpactRatio: number;
  details: string;
  recommendation: string;
  lastAudit: string;
  trend: 'improving' | 'stable' | 'worsening';
  groups: { name: string; rate: number }[];
}

interface HistoricalPoint {
  month: string;
  fraudDI: number;
  amlDI: number;
  kycDI: number;
  threshold: number;
}

const BIAS_CLR: Record<BiasLevel, string> = {
  low: 'text-emerald-400 bg-emerald-400/10',
  moderate: 'text-amber-400 bg-amber-400/10',
  significant: 'text-orange-400 bg-orange-400/10',
  critical: 'text-red-400 bg-red-400/10',
};

const METRIC_LABEL: Record<FairnessMetric, string> = {
  demographic_parity: 'Demographic Parity',
  equalized_odds: 'Equalized Odds',
  predictive_parity: 'Predictive Parity',
  disparate_impact: 'Disparate Impact',
};

const MOCK_REPORTS: BiasReport[] = [
  {
    id: 'b1', model: 'Fraud Detection Engine v3.2.1', module: 'Fraud Detection', dimension: 'Geographic Origin',
    metric: 'disparate_impact', biasLevel: 'moderate', disparateImpactRatio: 0.83,
    details: 'Transactions originating from Middle Eastern jurisdictions flagged at 1.2x the rate of European transactions, after controlling for risk factors. The model shows moderate geographic bias in structuring detection.',
    recommendation: 'Retrain with balanced geographic samples. Apply geographic calibration layer. Monitor monthly.',
    lastAudit: '2026-02-20', trend: 'improving',
    groups: [
      { name: 'Europe', rate: 4.2 }, { name: 'North America', rate: 3.8 },
      { name: 'Middle East', rate: 5.1 }, { name: 'Asia-Pacific', rate: 4.5 },
      { name: 'Africa', rate: 5.4 }, { name: 'Latin America', rate: 4.7 },
    ],
  },
  {
    id: 'b2', model: 'Fraud Detection Engine v3.2.1', module: 'Fraud Detection', dimension: 'Entity Type',
    metric: 'demographic_parity', biasLevel: 'low', disparateImpactRatio: 0.92,
    details: 'Corporate entities flagged at slightly higher rates than individuals, which is expected given higher transaction volumes and complexity. Within acceptable tolerance.',
    recommendation: 'Continue monitoring. Current disparity within 4/5ths rule threshold.',
    lastAudit: '2026-02-20', trend: 'stable',
    groups: [
      { name: 'Individual', rate: 2.8 }, { name: 'Corporate', rate: 3.1 },
      { name: 'Trust', rate: 3.4 }, { name: 'Fund', rate: 2.9 },
    ],
  },
  {
    id: 'b3', model: 'AML Detection Engine v4.1.0', module: 'AML', dimension: 'Client Nationality',
    metric: 'equalized_odds', biasLevel: 'significant', disparateImpactRatio: 0.72,
    details: 'Russian-linked clients receive AML alerts at 2.3x the base rate. While partially justified by elevated FATF risk, the model over-weights nationality relative to actual transaction patterns.',
    recommendation: 'Apply nationality-aware fairness constraints during retraining. Separate geopolitical risk assessment from behavioural analysis. Scheduled for Q2 2026 model update.',
    lastAudit: '2026-01-25', trend: 'stable',
    groups: [
      { name: 'Jersey', rate: 1.2 }, { name: 'UK', rate: 1.8 },
      { name: 'France', rate: 1.5 }, { name: 'Switzerland', rate: 2.1 },
      { name: 'Russia', rate: 4.3 }, { name: 'UAE', rate: 3.2 },
      { name: 'Cyprus', rate: 3.8 },
    ],
  },
  {
    id: 'b4', model: 'AML Detection Engine v4.1.0', module: 'AML', dimension: 'Transaction Currency',
    metric: 'predictive_parity', biasLevel: 'low', disparateImpactRatio: 0.91,
    details: 'Minor disparity in alert rates across currencies. USD and RUB transactions flagged slightly more frequently, consistent with volume-adjusted risk expectations.',
    recommendation: 'No action required. Within acceptable parameters.',
    lastAudit: '2026-02-20', trend: 'improving',
    groups: [
      { name: 'GBP', rate: 2.1 }, { name: 'USD', rate: 2.8 },
      { name: 'EUR', rate: 2.3 }, { name: 'CHF', rate: 1.9 },
      { name: 'RUB', rate: 3.1 },
    ],
  },
  {
    id: 'b5', model: 'KYC Risk Engine v2.8.0', module: 'KYC', dimension: 'Client Industry',
    metric: 'disparate_impact', biasLevel: 'moderate', disparateImpactRatio: 0.78,
    details: 'Maritime and shipping industry clients receive disproportionately higher risk scores. While maritime carries inherent risk, the model appears to double-count industry risk when combined with geographic factors.',
    recommendation: 'Implement interaction term controls between industry and geography risk factors. Target Q2 2026.',
    lastAudit: '2026-02-10', trend: 'worsening',
    groups: [
      { name: 'Finance', rate: 32 }, { name: 'Real Estate', rate: 38 },
      { name: 'Legal', rate: 35 }, { name: 'Maritime', rate: 52 },
      { name: 'Technology', rate: 28 }, { name: 'Government', rate: 22 },
    ],
  },
  {
    id: 'b6', model: 'KYC Risk Engine v2.8.0', module: 'KYC', dimension: 'Client Age (Years as Client)',
    metric: 'demographic_parity', biasLevel: 'low', disparateImpactRatio: 0.94,
    details: 'New clients (< 1 year) receive slightly elevated risk scores compared to long-standing clients. This is expected and aligns with JFSC guidance on higher initial scrutiny.',
    recommendation: 'No remediation needed. Disparity aligns with regulatory expectations for new client vigilance.',
    lastAudit: '2026-02-10', trend: 'stable',
    groups: [
      { name: '< 1 year', rate: 42 }, { name: '1-3 years', rate: 35 },
      { name: '3-5 years', rate: 30 }, { name: '5+ years', rate: 26 },
    ],
  },
];

const MOCK_HISTORY: HistoricalPoint[] = [
  { month: 'Sep', fraudDI: 0.78, amlDI: 0.68, kycDI: 0.82, threshold: 0.80 },
  { month: 'Oct', fraudDI: 0.79, amlDI: 0.70, kycDI: 0.81, threshold: 0.80 },
  { month: 'Nov', fraudDI: 0.80, amlDI: 0.71, kycDI: 0.80, threshold: 0.80 },
  { month: 'Dec', fraudDI: 0.81, amlDI: 0.71, kycDI: 0.79, threshold: 0.80 },
  { month: 'Jan', fraudDI: 0.82, amlDI: 0.72, kycDI: 0.78, threshold: 0.80 },
  { month: 'Feb', fraudDI: 0.83, amlDI: 0.72, kycDI: 0.78, threshold: 0.80 },
];

export default function BiasMonitoringPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [filterModule, setFilterModule] = useState<'all' | string>('all');
  const [filterLevel, setFilterLevel] = useState<'all' | BiasLevel>('all');

  const filtered = MOCK_REPORTS.filter(r => {
    if (filterModule !== 'all' && r.module !== filterModule) return false;
    if (filterLevel !== 'all' && r.biasLevel !== filterLevel) return false;
    return true;
  });

  // Aggregate stats
  const criticalCount = MOCK_REPORTS.filter(r => r.biasLevel === 'critical' || r.biasLevel === 'significant').length;
  const avgDI = (MOCK_REPORTS.reduce((s, r) => s + r.disparateImpactRatio, 0) / MOCK_REPORTS.length).toFixed(2);
  const improvingCount = MOCK_REPORTS.filter(r => r.trend === 'improving').length;
  const modules = [...new Set(MOCK_REPORTS.map(r => r.module))];

  function buildPDFConfig(): PDFReportOptions {
    return {
      title: 'AI Bias & Fairness Monitoring Report',
      subtitle: 'Fairness metrics, disparate impact analysis, and remediation status',
      module: 'Bias Monitoring',
      jurisdiction: 'Jersey',
      classification: 'CONFIDENTIAL',
      generatedBy: 'Velanova AI Governance Engine',
      sections: [
        { type: 'stats', stats: [
          { label: 'Bias Reports', value: String(MOCK_REPORTS.length) },
          { label: 'Significant/Critical', value: String(criticalCount) },
          { label: 'Avg DI Ratio', value: avgDI },
          { label: 'Improving', value: String(improvingCount) },
        ]},
        { type: 'heading', content: 'Bias Analysis Details' },
        { type: 'table', columns: ['Model', 'Dimension', 'Metric', 'DI Ratio', 'Level', 'Trend'], rows: MOCK_REPORTS.map(r => [r.model, r.dimension, METRIC_LABEL[r.metric], String(r.disparateImpactRatio), r.biasLevel, r.trend]) },
        { type: 'heading', content: 'Recommendations' },
        ...MOCK_REPORTS.filter(r => r.biasLevel !== 'low').map(r => ({ type: 'text' as const, content: `${r.model} (${r.dimension}): ${r.recommendation}` })),
      ],
    };
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#030303] text-white overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-400" />
          <h1 className="text-[14px] font-semibold tracking-tight">Bias & Fairness Monitoring</h1>
          {criticalCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {criticalCount} issues
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 app-region-no-drag">
          <ExportButton getReportConfig={buildPDFConfig} compact />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Bias Reports', value: String(MOCK_REPORTS.length), icon: BarChart2, color: 'text-indigo-400' },
            { label: 'Significant/Critical', value: String(criticalCount), icon: AlertTriangle, color: criticalCount > 0 ? 'text-red-400' : 'text-emerald-400' },
            { label: 'Avg Disparate Impact', value: avgDI, icon: Scale, color: parseFloat(avgDI) >= 0.80 ? 'text-emerald-400' : 'text-amber-400' },
            { label: 'Trends Improving', value: `${improvingCount}/${MOCK_REPORTS.length}`, icon: TrendingUp, color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{s.label}</span>
                <s.icon className={cn('w-4 h-4', s.color)} />
              </div>
              <div className="text-[22px] font-bold tabular-nums text-white/90">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Disparate Impact Trend Chart */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-zinc-400 font-medium">Disparate Impact Ratio Trend (6-month)</span>
            <span className="text-[9px] text-zinc-600">4/5ths Rule Threshold = 0.80</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MOCK_HISTORY} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0.6, 1.0]} tick={{ fill: '#52525b', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="fraudDI" name="Fraud" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="amlDI" name="AML" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="kycDI" name="KYC" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="threshold" name="Threshold" stroke="#10b981" strokeWidth={1} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-zinc-500">Module:</span>
            {['all', ...modules].map(m => (
              <button key={m} onClick={() => setFilterModule(m)} className={cn('h-6 px-2 rounded text-[10px] capitalize', filterModule === m ? 'bg-white/[0.08] text-white' : 'text-zinc-500 hover:text-zinc-300')}>
                {m}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-zinc-500">Level:</span>
            {(['all', 'low', 'moderate', 'significant', 'critical'] as const).map(l => (
              <button key={l} onClick={() => setFilterLevel(l)} className={cn('h-6 px-2 rounded text-[10px] capitalize', filterLevel === l ? 'bg-white/[0.08] text-white' : 'text-zinc-500 hover:text-zinc-300')}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Bias Report Cards */}
        <div className="space-y-3">
          {filtered.map(report => (
            <div
              key={report.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
            >
              <div
                onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {report.biasLevel === 'low' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : report.biasLevel === 'significant' || report.biasLevel === 'critical' ? <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-white/80">{report.dimension}</span>
                      <span className="text-[10px] text-zinc-500">— {report.model}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">{METRIC_LABEL[report.metric]}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className={cn('text-[14px] font-bold tabular-nums', report.disparateImpactRatio >= 0.80 ? 'text-emerald-400' : report.disparateImpactRatio >= 0.70 ? 'text-amber-400' : 'text-red-400')}>
                      {report.disparateImpactRatio.toFixed(2)}
                    </div>
                    <span className="text-[8px] text-zinc-600">DI Ratio</span>
                  </div>
                  <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', BIAS_CLR[report.biasLevel])}>
                    {report.biasLevel}
                  </span>
                  <div className="flex items-center gap-1">
                    {report.trend === 'improving' ? <TrendingDown className="w-3 h-3 text-emerald-400" /> : report.trend === 'worsening' ? <TrendingUp className="w-3 h-3 text-red-400" /> : <span className="w-3 h-3 text-zinc-600">—</span>}
                  </div>
                  {selectedReport === report.id ? <ChevronDown className="w-3.5 h-3.5 text-zinc-600" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />}
                </div>
              </div>

              {selectedReport === report.id && (
                <div className="px-4 pb-4 border-t border-white/[0.04] space-y-4">
                  {/* Analysis */}
                  <div className="pt-3">
                    <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Analysis</span>
                    <p className="text-[10px] text-zinc-400 leading-relaxed mt-1">{report.details}</p>
                  </div>

                  {/* Group Comparison Chart */}
                  <div>
                    <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Group Comparison</span>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={report.groups} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
                        <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#52525b', fontSize: 9 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 11 }} />
                        <Bar dataKey="rate" fill="#6366f1" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Recommendation */}
                  <div className={cn('rounded-lg border p-3', report.biasLevel !== 'low' ? 'border-amber-500/10 bg-amber-900/5' : 'border-emerald-500/10 bg-emerald-900/5')}>
                    <div className="flex items-center gap-1.5 mb-1">
                      {report.biasLevel !== 'low' ? <AlertTriangle className="w-3 h-3 text-amber-400" /> : <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      <span className="text-[10px] font-medium" style={{ color: report.biasLevel !== 'low' ? '#fbbf24' : '#34d399' }}>Recommendation</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">{report.recommendation}</p>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-[9px] text-zinc-600">
                    <span>Last audit: {report.lastAudit}</span>
                    <span className="flex items-center gap-1">
                      Trend: {report.trend === 'improving' ? <TrendingDown className="w-3 h-3 text-emerald-400" /> : report.trend === 'worsening' ? <TrendingUp className="w-3 h-3 text-red-400" /> : '—'}
                      <span className={cn(report.trend === 'improving' ? 'text-emerald-400' : report.trend === 'worsening' ? 'text-red-400' : '')}>{report.trend}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 4/5ths Rule Explanation */}
        <div className="rounded-xl border border-indigo-500/10 bg-indigo-900/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="text-[11px] font-medium text-indigo-400">Disparate Impact (4/5ths Rule)</span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed">
            The 4/5ths (80%) rule states that a selection rate for any protected group should be at least 80% of 
            the rate for the group with the highest selection rate. A Disparate Impact ratio below 0.80 indicates 
            potential adverse impact requiring investigation and remediation.
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {['EU AI Act Art. 10(2)(f)', 'UK Equality Act 2010', 'Jersey Discrimination Law 2013', 'OECD AI Principle 1.3', 'ECHR Art. 14'].map(r => (
              <span key={r} className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> {r}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 flex items-start gap-2">
          <Eye className="w-3.5 h-3.5 text-zinc-600 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-zinc-600 leading-relaxed">
            Bias monitoring runs continuously against production model outputs. Audits conducted quarterly by 
            independent AI ethics review. Reports generated per EU AI Act Art. 10(2)(f) requirements. 
            Next comprehensive audit scheduled: April 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
