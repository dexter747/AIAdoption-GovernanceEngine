import { useState } from 'react';
import {
  Leaf, BarChart3, Plus, FileText, Target, AlertTriangle,
  ArrowLeft, ChevronRight, Globe, Users,
  Zap, Download, Shield, Activity,
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, AreaChart, Area, Legend,
} from 'recharts';
import { cn } from '../lib/utils';
import ExportButton from '../components/ui/ExportButton';
import type { PDFReportOptions } from '../lib/pdfExport';

/* ═══════════════════════════════════════════════════════════════════════════
   COMPREHENSIVE MOCK DATA — ESG & Sustainability
   Data modelled on TCFD / SFDR / GRI / CSRD-style reporting for
   Jersey-based financial services / fund admin firm.
   ═══════════════════════════════════════════════════════════════════════════ */

const MOCK_FRAMEWORKS = [
  { id: 'f1', name: 'Task Force on Climate-Related Financial Disclosures', code: 'TCFD', version: '2024', framework_type: 'reporting', jurisdiction: 'global', status: 'active', compliance_deadline: '2026-06-30' },
  { id: 'f2', name: 'Sustainable Finance Disclosure Regulation', code: 'SFDR', version: 'Level 2', framework_type: 'regulation', jurisdiction: 'EU', status: 'active', compliance_deadline: '2026-03-31' },
  { id: 'f3', name: 'Global Reporting Initiative Standards', code: 'GRI', version: '2021', framework_type: 'standard', jurisdiction: 'global', status: 'active' },
  { id: 'f4', name: 'Corporate Sustainability Reporting Directive', code: 'CSRD', version: '2024', framework_type: 'regulation', jurisdiction: 'EU', status: 'pending', compliance_deadline: '2027-01-01' },
  { id: 'f5', name: 'UN Sustainable Development Goals', code: 'UN SDGs', version: '2030 Agenda', framework_type: 'benchmark', jurisdiction: 'global', status: 'active' },
];

const MOCK_METRICS = [
  // Environmental
  { id: 'm1', metric_name: 'Scope 1 GHG Emissions', category: 'environmental', subcategory: 'Climate', unit: 'tCO2e', value: 142, target_value: 120, previous_value: 168, reporting_year: 2025, data_quality: 'measured', framework_ref: 'TCFD-M1', status: 'approved' },
  { id: 'm2', metric_name: 'Scope 2 GHG Emissions', category: 'environmental', subcategory: 'Climate', unit: 'tCO2e', value: 89, target_value: 75, previous_value: 112, reporting_year: 2025, data_quality: 'calculated', framework_ref: 'TCFD-M2', status: 'approved' },
  { id: 'm3', metric_name: 'Scope 3 GHG Emissions (Financed)', category: 'environmental', subcategory: 'Climate', unit: 'tCO2e', value: 24500, target_value: 20000, previous_value: 28200, data_quality: 'estimated', reporting_year: 2025, framework_ref: 'TCFD-M3', status: 'reviewed' },
  { id: 'm4', metric_name: 'Renewable Energy Usage', category: 'environmental', subcategory: 'Energy', unit: '%', value: 62, target_value: 80, previous_value: 48, reporting_year: 2025, data_quality: 'measured', status: 'approved' },
  { id: 'm5', metric_name: 'Water Consumption', category: 'environmental', subcategory: 'Water', unit: 'm³', value: 1850, target_value: 1500, previous_value: 2100, reporting_year: 2025, data_quality: 'measured', status: 'draft' },
  { id: 'm6', metric_name: 'Waste Diverted from Landfill', category: 'environmental', subcategory: 'Waste', unit: '%', value: 78, target_value: 90, previous_value: 65, reporting_year: 2025, data_quality: 'measured', status: 'approved' },
  { id: 'm7', metric_name: 'Paper Consumption', category: 'environmental', subcategory: 'Resources', unit: 'kg', value: 2400, target_value: 1800, previous_value: 3200, reporting_year: 2025, data_quality: 'measured', status: 'reviewed' },
  // Social
  { id: 'm8', metric_name: 'Gender Pay Gap', category: 'social', subcategory: 'Diversity', unit: '%', value: 8.2, target_value: 5, previous_value: 11.5, reporting_year: 2025, data_quality: 'measured', status: 'approved' },
  { id: 'm9', metric_name: 'Women in Senior Leadership', category: 'social', subcategory: 'Diversity', unit: '%', value: 38, target_value: 45, previous_value: 32, reporting_year: 2025, data_quality: 'measured', status: 'approved' },
  { id: 'm10', metric_name: 'Employee Training Hours', category: 'social', subcategory: 'Development', unit: 'hrs/employee', value: 42, target_value: 50, previous_value: 35, reporting_year: 2025, data_quality: 'measured', status: 'approved' },
  { id: 'm11', metric_name: 'Employee Satisfaction Score', category: 'social', subcategory: 'Wellbeing', unit: '/10', value: 7.8, target_value: 8.5, previous_value: 7.2, reporting_year: 2025, data_quality: 'third_party_verified', status: 'approved' },
  { id: 'm12', metric_name: 'Voluntary Turnover Rate', category: 'social', subcategory: 'Retention', unit: '%', value: 9.2, target_value: 8, previous_value: 12.4, reporting_year: 2025, data_quality: 'measured', status: 'reviewed' },
  { id: 'm13', metric_name: 'Community Investment', category: 'social', subcategory: 'Community', unit: '£k', value: 245, target_value: 300, previous_value: 180, reporting_year: 2025, data_quality: 'measured', status: 'approved' },
  // Governance
  { id: 'm14', metric_name: 'Board Independence', category: 'governance', subcategory: 'Board', unit: '%', value: 67, target_value: 75, previous_value: 60, reporting_year: 2025, data_quality: 'measured', status: 'approved' },
  { id: 'm15', metric_name: 'ESG Committee Meetings', category: 'governance', subcategory: 'Oversight', unit: 'per year', value: 8, target_value: 10, previous_value: 6, reporting_year: 2025, data_quality: 'measured', status: 'approved' },
  { id: 'm16', metric_name: 'Whistleblower Cases Resolved', category: 'governance', subcategory: 'Ethics', unit: 'cases', value: 3, target_value: 0, previous_value: 5, reporting_year: 2025, data_quality: 'measured', status: 'reviewed' },
  { id: 'm17', metric_name: 'Anti-Corruption Training', category: 'governance', subcategory: 'Ethics', unit: '% coverage', value: 94, target_value: 100, previous_value: 87, reporting_year: 2025, data_quality: 'measured', status: 'approved' },
  { id: 'm18', metric_name: 'Data Privacy Incidents', category: 'governance', subcategory: 'Data', unit: 'incidents', value: 1, target_value: 0, previous_value: 4, reporting_year: 2025, data_quality: 'measured', status: 'approved' },
];

const MOCK_TARGETS = [
  { id: 'tg1', target_name: 'Net Zero — Scope 1 & 2', category: 'environmental', metric_name: 'GHG Emissions (1+2)', baseline_value: 320, baseline_year: 2020, target_value: 0, target_year: 2035, current_value: 231, progress_pct: 28, status: 'on_track', science_based: true },
  { id: 'tg2', target_name: '100% Renewable Energy', category: 'environmental', metric_name: 'Renewable Energy Usage', baseline_value: 22, baseline_year: 2020, target_value: 100, target_year: 2028, current_value: 62, progress_pct: 51, status: 'on_track', science_based: true },
  { id: 'tg3', target_name: 'Gender Parity in Leadership', category: 'social', metric_name: 'Women in Senior Leadership', baseline_value: 24, baseline_year: 2020, target_value: 50, target_year: 2028, current_value: 38, progress_pct: 54, status: 'on_track', science_based: false },
  { id: 'tg4', target_name: 'Zero Gender Pay Gap', category: 'social', metric_name: 'Gender Pay Gap', baseline_value: 18, baseline_year: 2020, target_value: 0, target_year: 2030, current_value: 8.2, progress_pct: 54, status: 'on_track', science_based: false },
  { id: 'tg5', target_name: 'Zero Waste to Landfill', category: 'environmental', metric_name: 'Waste Diverted from Landfill', baseline_value: 45, baseline_year: 2020, target_value: 100, target_year: 2030, current_value: 78, progress_pct: 60, status: 'at_risk', science_based: false },
  { id: 'tg6', target_name: 'Reduce Financed Emissions 50%', category: 'environmental', metric_name: 'Scope 3 Financed', baseline_value: 42000, baseline_year: 2020, target_value: 21000, target_year: 2030, current_value: 24500, progress_pct: 83, status: 'on_track', science_based: true },
  { id: 'tg7', target_name: '75% Board Independence', category: 'governance', metric_name: 'Board Independence', baseline_value: 50, baseline_year: 2022, target_value: 75, target_year: 2026, current_value: 67, progress_pct: 68, status: 'at_risk', science_based: false },
];

const MOCK_REPORTS = [
  { id: 'rp1', title: 'Annual ESG Report 2025', report_type: 'annual', framework: 'TCFD', reporting_year: 2025, status: 'in_review', overall_score: 72, environmental_score: 68, social_score: 74, governance_score: 77, ai_executive_summary: 'Velanova demonstrated meaningful progress across all three ESG pillars in 2025. Scope 1+2 emissions declined 15.5% year-over-year, driven primarily by the Jersey office renewable energy transition reaching 62% completion. Social metrics improved, with the gender pay gap narrowing from 11.5% to 8.2% and gender representation in leadership rising 6 points. Governance strengthened through enhanced board independence and expanded anti-corruption training coverage. Key risks include Scope 3 financed emissions intensity and the pace of waste diversion, both requiring accelerated action in 2026.', created_at: '2026-01-15' },
  { id: 'rp2', title: 'Q4 2025 ESG Board Pack', report_type: 'board_pack', framework: 'GRI', reporting_year: 2025, status: 'published', overall_score: 70, environmental_score: 65, social_score: 72, governance_score: 75, created_at: '2026-01-02' },
  { id: 'rp3', title: 'SFDR PAI Statement 2025', report_type: 'regulatory_filing', framework: 'SFDR', reporting_year: 2025, status: 'draft', overall_score: null, created_at: '2026-02-20' },
  { id: 'rp4', title: 'Investor ESG Update H2 2025', report_type: 'investor_update', framework: 'TCFD', reporting_year: 2025, status: 'published', overall_score: 71, environmental_score: 67, social_score: 73, governance_score: 76, created_at: '2025-12-15' },
];

const MOCK_DATA_SOURCES = [
  { id: 'ds1', source_name: 'Jersey Electricity Provider', source_type: 'utility_provider', category: 'environmental', status: 'active', metrics_count: 3, last_sync_at: '2026-03-01', sync_frequency: 'monthly' },
  { id: 'ds2', source_name: 'HR Information System (BambooHR)', source_type: 'api', category: 'social', status: 'active', metrics_count: 5, last_sync_at: '2026-03-01', sync_frequency: 'monthly' },
  { id: 'ds3', source_name: 'Facilities Management System', source_type: 'manual', category: 'environmental', status: 'active', metrics_count: 4, last_sync_at: '2026-02-15', sync_frequency: 'monthly' },
  { id: 'ds4', source_name: 'Board Governance Records', source_type: 'manual', category: 'governance', status: 'active', metrics_count: 5, last_sync_at: '2026-01-31', sync_frequency: 'quarterly' },
  { id: 'ds5', source_name: 'MSCI ESG Ratings', source_type: 'api', category: 'mixed', status: 'active', metrics_count: 12, last_sync_at: '2026-02-28', sync_frequency: 'quarterly' },
  { id: 'ds6', source_name: 'Employee Satisfaction Survey (Gallup)', source_type: 'survey', category: 'social', status: 'active', metrics_count: 2, last_sync_at: '2025-12-01', sync_frequency: 'annually' },
];

const DASHBOARD = {
  totalFrameworks: 5, totalMetrics: 18, environmentalMetrics: 7, socialMetrics: 6,
  governanceMetrics: 5, dataSources: 6, activeDataSources: 6, totalReports: 4,
  publishedReports: 2, draftReports: 1, totalTargets: 7, targetsOnTrack: 5,
  targetsAtRisk: 2, targetsBehind: 0,
};

const ESG_SCORES_OVER_TIME = [
  { period: 'Q1 24', environmental: 52, social: 58, governance: 62, overall: 57 },
  { period: 'Q2 24', environmental: 55, social: 60, governance: 64, overall: 60 },
  { period: 'Q3 24', environmental: 58, social: 63, governance: 68, overall: 63 },
  { period: 'Q4 24', environmental: 62, social: 67, governance: 72, overall: 67 },
  { period: 'Q1 25', environmental: 65, social: 70, governance: 74, overall: 70 },
  { period: 'Q2 25', environmental: 66, social: 72, governance: 75, overall: 71 },
  { period: 'Q3 25', environmental: 67, social: 73, governance: 76, overall: 72 },
  { period: 'Q4 25', environmental: 68, social: 74, governance: 77, overall: 72 },
];

const RADAR_DATA = [
  { subject: 'Climate', score: 72, fullMark: 100 },
  { subject: 'Energy', score: 62, fullMark: 100 },
  { subject: 'Waste', score: 78, fullMark: 100 },
  { subject: 'Diversity', score: 74, fullMark: 100 },
  { subject: 'Wellbeing', score: 78, fullMark: 100 },
  { subject: 'Ethics', score: 77, fullMark: 100 },
  { subject: 'Board', score: 67, fullMark: 100 },
];

/* ═══════════════════════════════════════════════════════════════════════════ */

type Tab = 'overview' | 'metrics' | 'targets' | 'reports' | 'frameworks' | 'sources';

const CAT_CLR: Record<string, string> = { environmental: 'text-emerald-400', social: 'text-blue-400', governance: 'text-purple-400' };
const CAT_ICON: Record<string, React.ElementType> = { environmental: Leaf, social: Users, governance: Shield };
const STATUS_CLR: Record<string, string> = { draft: 'text-zinc-400', reviewed: 'text-amber-400', approved: 'text-blue-400', published: 'text-emerald-400', in_review: 'text-amber-400', on_track: 'text-emerald-400', at_risk: 'text-amber-400', behind: 'text-red-400', achieved: 'text-indigo-400', not_started: 'text-zinc-600', active: 'text-emerald-400', pending: 'text-amber-400' };

export default function ESGReportingPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [selectedReport, setSelectedReport] = useState<typeof MOCK_REPORTS[0] | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');

  const dash = DASHBOARD;
  const filteredMetrics = filterCategory ? MOCK_METRICS.filter(m => m.category === filterCategory) : MOCK_METRICS;

  const scoreColor = (s: number) => s >= 70 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400';

  const buildPDFConfig = (): PDFReportOptions => ({
    title: 'ESG & Sustainability Report',
    subtitle: `Dashboard export — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    module: 'ESG & Sustainability',
    jurisdiction: 'Jersey, Channel Islands',
    classification: 'OFFICIAL',
    sections: [
      { type: 'stats', stats: [
        { label: 'Total Metrics', value: String(dash.totalMetrics) },
        { label: 'Frameworks', value: String(dash.totalFrameworks) },
        { label: 'Targets On Track', value: `${dash.targetsOnTrack}/${dash.totalTargets}` },
        { label: 'At Risk', value: String(dash.targetsAtRisk) },
      ] },
      { type: 'heading', title: 'ESG Metrics Summary' },
      { type: 'table', columns: ['Metric', 'Category', 'Value', 'Target', 'Previous', 'Status'],
        rows: MOCK_METRICS.map(m => [m.metric_name, m.category, `${m.value} ${m.unit}`, m.target_value ? `${m.target_value} ${m.unit}` : '-', m.previous_value ? `${m.previous_value} ${m.unit}` : '-', m.status]),
      },
      { type: 'heading', title: 'Sustainability Targets' },
      { type: 'table', columns: ['Target', 'Category', 'Baseline', 'Current', 'Goal', 'Progress', 'Status'],
        rows: MOCK_TARGETS.map(t => [t.target_name, t.category, String(t.baseline_value), String(t.current_value), String(t.target_value), t.progress_pct + '%', t.status.replace(/_/g, ' ')]),
      },
      { type: 'heading', title: 'Reports' },
      { type: 'table', columns: ['Title', 'Type', 'Framework', 'Year', 'Score', 'Status'],
        rows: MOCK_REPORTS.map(r => [r.title, r.report_type.replace(/_/g, ' '), r.framework, String(r.reporting_year), r.overall_score ? String(r.overall_score) : '-', r.status.replace(/_/g, ' ')]),
      },
      { type: 'heading', title: 'Active Frameworks' },
      { type: 'table', columns: ['Framework', 'Code', 'Type', 'Jurisdiction', 'Status'],
        rows: MOCK_FRAMEWORKS.map(f => [f.name, f.code, f.framework_type, f.jurisdiction, f.status]),
      },
    ],
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">ESG & Sustainability</h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        <div className="flex items-center gap-4 app-region-no-drag">
          <span className="text-[11px] text-emerald-400"><Leaf className="w-3 h-3 inline mr-1" />{dash.totalMetrics} metrics</span>
          <span className="text-[11px] text-white/40"><Target className="w-3 h-3 inline mr-1 text-white/25" />{dash.targetsOnTrack}/{dash.totalTargets} on track</span>
          {dash.targetsAtRisk > 0 && <span className="text-[11px] text-amber-400"><AlertTriangle className="w-3 h-3 inline mr-1" />{dash.targetsAtRisk} at risk</span>}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 app-region-no-drag">
          <ExportButton getReportConfig={buildPDFConfig} label="Export PDF" compact />
          <button className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-emerald-600 text-white hover:bg-emerald-500 flex items-center gap-1"><Plus className="w-3 h-3" /> New Report</button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 px-5 pt-3 pb-0">
        {(['overview', 'metrics', 'targets', 'reports', 'frameworks', 'sources'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setSelectedReport(null); }} className={cn('px-3 py-1.5 text-[11px] font-medium rounded-t capitalize', tab === t ? 'text-white bg-white/[0.06]' : 'text-zinc-500 hover:text-zinc-300')}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {/* ═══ OVERVIEW ═══ */}
        {tab === 'overview' && (
          <div className="p-5 space-y-5">
            {/* KPI row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { l: 'Overall ESG Score', v: '72/100', s: '+5 from prev year', c: 'text-emerald-400', ic: BarChart3 },
                { l: 'Targets On Track', v: `${dash.targetsOnTrack}/${dash.totalTargets}`, s: `${dash.targetsAtRisk} at risk`, c: dash.targetsAtRisk > 0 ? 'text-amber-400' : 'text-emerald-400', ic: Target },
                { l: 'Active Frameworks', v: String(dash.totalFrameworks), s: '2 pending deadlines', c: 'text-blue-400', ic: Shield },
                { l: 'Data Sources', v: String(dash.activeDataSources), s: `${dash.totalMetrics} metrics tracked`, c: 'text-indigo-400', ic: Activity },
              ].map(card => (
                <div key={card.l} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                  <div className="flex items-center justify-between mb-2"><span className="text-[10px] text-zinc-600 uppercase tracking-wider">{card.l}</span><card.ic className={cn('w-4 h-4', card.c)} /></div>
                  <div className={cn('text-[22px] font-semibold', card.c)}>{card.v}</div>
                  <span className="text-[11px] text-zinc-600">{card.s}</span>
                </div>
              ))}
            </div>

            {/* ESG Score breakdown */}
            <div className="grid grid-cols-3 gap-3">
              {([
                { l: 'Environmental', score: 68, prev: 62, icon: Leaf, textCls: 'text-emerald-400', barCls: 'bg-emerald-500' },
                { l: 'Social', score: 74, prev: 67, icon: Users, textCls: 'text-blue-400', barCls: 'bg-blue-500' },
                { l: 'Governance', score: 77, prev: 72, icon: Shield, textCls: 'text-purple-400', barCls: 'bg-purple-500' },
              ] as const).map(p => (
                <div key={p.l} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <p.icon className={cn('w-4 h-4', p.textCls)} />
                    <span className="text-[12px] font-medium text-white/80">{p.l}</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className={cn('text-[28px] font-bold', p.textCls)}>{p.score}</span>
                    <span className="text-[11px] text-zinc-600 mb-1">/100</span>
                    <span className="text-[11px] text-emerald-400 mb-1 ml-auto">+{p.score - p.prev} YoY</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-zinc-800">
                    <div className={cn('h-full rounded-full', p.barCls)} style={{ width: `${p.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Score trend + Radar */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">ESG Score Trend (Quarterly)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={ESG_SCORES_OVER_TIME}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis dataKey="period" tick={{ fill: '#71717a', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} domain={[40, 100]} />
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                    <Area type="monotone" dataKey="environmental" stroke="#10b981" fill="#10b981" fillOpacity={0.08} />
                    <Area type="monotone" dataKey="social" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.08} />
                    <Area type="monotone" dataKey="governance" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.08} />
                    <Legend wrapperStyle={{ fontSize: 10, color: '#71717a' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">ESG Performance Radar</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid stroke="#1a1a1a" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 9 }} />
                    <PolarRadiusAxis tick={{ fill: '#3f3f46', fontSize: 8 }} domain={[0, 100]} />
                    <Radar name="ESG Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Targets progress */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
              <h3 className="text-[12px] font-medium text-white/70 mb-3">Target Progress</h3>
              <div className="space-y-3">
                {MOCK_TARGETS.map(t => {
                  const CatIcon = CAT_ICON[t.category] || Leaf;
                  return (
                    <div key={t.id} className="flex items-center gap-3">
                      <CatIcon className={cn('w-3.5 h-3.5 flex-shrink-0', CAT_CLR[t.category])} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-white/80 truncate">{t.target_name}</span>
                          {t.science_based && <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-900/30 text-emerald-400">SBTi</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 rounded-full bg-zinc-800">
                            <div className={cn('h-full rounded-full', t.status === 'on_track' ? 'bg-emerald-500' : t.status === 'at_risk' ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${Math.min(t.progress_pct, 100)}%` }} />
                          </div>
                          <span className={cn('text-[10px] tabular-nums w-10 text-right', STATUS_CLR[t.status])}>{t.progress_pct}%</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-600 w-12 text-right">{t.target_year}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ METRICS ═══ */}
        {tab === 'metrics' && (
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setFilterCategory('')} className={cn('h-6 px-2.5 rounded-full text-[10px]', !filterCategory ? 'bg-white/[0.1] text-white' : 'text-zinc-500 hover:text-zinc-300')}>All</button>
              {['environmental', 'social', 'governance'].map(c => (
                <button key={c} onClick={() => setFilterCategory(c)} className={cn('h-6 px-2.5 rounded-full text-[10px] capitalize', filterCategory === c ? cn('bg-white/[0.1]', CAT_CLR[c]) : 'text-zinc-500 hover:text-zinc-300')}>{c}</button>
              ))}
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a]">
              <div className="divide-y divide-white/[0.04]">
                {filteredMetrics.map(m => {
                  const CatIcon = CAT_ICON[m.category] || Leaf;
                  const pctOfTarget = m.target_value && m.value != null ? Math.round((m.value / m.target_value) * 100) : null;
                  const improved = m.previous_value != null && m.value != null && (
                    (m.unit === '%' && m.metric_name.includes('Gap')) ? m.value < m.previous_value :
                    (m.unit === '%') ? m.value > m.previous_value :
                    (m.metric_name.includes('Emissions') || m.metric_name.includes('Consumption') || m.metric_name.includes('Incidents')) ? m.value < m.previous_value :
                    m.value > m.previous_value
                  );
                  return (
                    <div key={m.id} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                      <CatIcon className={cn('w-4 h-4 flex-shrink-0', CAT_CLR[m.category])} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-white/80">{m.metric_name}</div>
                        <div className="text-[10px] text-zinc-600">{m.subcategory} · {m.data_quality}{m.framework_ref ? ` · ${m.framework_ref}` : ''}</div>
                      </div>
                      <div className="text-right w-24">
                        <div className="text-[14px] font-semibold text-white/80 tabular-nums">{m.value} <span className="text-[10px] text-zinc-600">{m.unit}</span></div>
                        {m.previous_value != null && (
                          <div className={cn('text-[10px]', improved ? 'text-emerald-400' : 'text-red-400')}>
                            {improved ? '↑' : '↓'} from {m.previous_value}
                          </div>
                        )}
                      </div>
                      <div className="text-right w-20">
                        {m.target_value != null && (
                          <>
                            <div className="text-[10px] text-zinc-600">Target: {m.target_value}</div>
                            <div className="h-1 rounded-full bg-zinc-800 mt-1 w-16">
                              <div className={cn('h-full rounded-full', pctOfTarget! >= 100 ? 'bg-emerald-500' : pctOfTarget! >= 70 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${Math.min(pctOfTarget!, 100)}%` }} />
                            </div>
                          </>
                        )}
                      </div>
                      <span className={cn('text-[10px] capitalize', STATUS_CLR[m.status])}>{m.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ TARGETS ═══ */}
        {tab === 'targets' && (
          <div className="p-5">
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a]">
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-[12px] font-medium text-white/70">ESG Targets & Goals</h3>
                <button className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-emerald-600/80 text-white hover:bg-emerald-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Target</button>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {MOCK_TARGETS.map(t => {
                  const CatIcon = CAT_ICON[t.category] || Leaf;
                  return (
                    <div key={t.id} className="px-4 py-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <CatIcon className={cn('w-4 h-4', CAT_CLR[t.category])} />
                        <span className="text-[12px] font-medium text-white/80">{t.target_name}</span>
                        {t.science_based && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-400">Science-Based</span>}
                        <span className={cn('text-[10px] ml-auto capitalize', STATUS_CLR[t.status])}>{t.status.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center gap-4 ml-7">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-zinc-600">Baseline ({t.baseline_year}): {t.baseline_value}</span>
                            <span className="text-[10px] text-zinc-600">Target ({t.target_year}): {t.target_value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-zinc-800">
                            <div className={cn('h-full rounded-full transition-all', t.status === 'on_track' ? 'bg-emerald-500' : t.status === 'at_risk' ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${Math.min(t.progress_pct, 100)}%` }} />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-white/60">Current: {t.current_value}</span>
                            <span className={cn('text-[10px] font-medium tabular-nums', STATUS_CLR[t.status])}>{t.progress_pct}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ REPORTS ═══ */}
        {tab === 'reports' && !selectedReport && (
          <div className="p-5">
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a]">
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-[12px] font-medium text-white/70">ESG Reports</h3>
                <button className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-emerald-600/80 text-white hover:bg-emerald-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Generate Report</button>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {MOCK_REPORTS.map(r => (
                  <div key={r.id} onClick={() => setSelectedReport(r)} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <FileText className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-white/80">{r.title}</div>
                      <div className="text-[10px] text-zinc-600">{r.report_type.replace(/_/g, ' ')} · {r.framework} · {r.reporting_year}</div>
                    </div>
                    {r.overall_score != null && (
                      <div className="flex items-center gap-1.5">
                        <span className={cn('text-[14px] font-semibold tabular-nums', scoreColor(r.overall_score))}>{r.overall_score}</span>
                        <span className="text-[10px] text-zinc-600">/100</span>
                      </div>
                    )}
                    <span className={cn('text-[10px] capitalize', STATUS_CLR[r.status])}>{r.status.replace(/_/g, ' ')}</span>
                    <ChevronRight className="w-3 h-3 text-zinc-700" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Report detail */}
        {tab === 'reports' && selectedReport && (
          <div className="p-5 space-y-4">
            <button onClick={() => setSelectedReport(null)} className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-white/70">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to reports
            </button>
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[14px] font-medium text-white/90">{selectedReport.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-zinc-500">{selectedReport.framework} · {selectedReport.reporting_year}</span>
                    <span className={cn('text-[10px] capitalize', STATUS_CLR[selectedReport.status])}>{selectedReport.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-7 px-3 rounded-lg text-[11px] text-indigo-400 border border-indigo-400/20 hover:bg-indigo-400/5 flex items-center gap-1"><Zap className="w-3 h-3" /> AI Generate</button>
                  <button className="h-7 px-3 rounded-lg text-[11px] bg-emerald-600/80 text-white hover:bg-emerald-500 flex items-center gap-1"><Download className="w-3 h-3" /> Export PDF</button>
                </div>
              </div>

              {/* Score cards */}
              {selectedReport.overall_score != null && (
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { l: 'Overall', v: selectedReport.overall_score, c: scoreColor(selectedReport.overall_score) },
                    { l: 'Environmental', v: selectedReport.environmental_score, c: 'text-emerald-400' },
                    { l: 'Social', v: selectedReport.social_score, c: 'text-blue-400' },
                    { l: 'Governance', v: selectedReport.governance_score, c: 'text-purple-400' },
                  ].map(s => (
                    <div key={s.l} className="p-3 rounded-lg bg-white/[0.02]">
                      <div className="text-[10px] text-zinc-600 uppercase">{s.l}</div>
                      <div className={cn('text-[20px] font-bold mt-1', s.c)}>{s.v}<span className="text-[11px] text-zinc-600">/100</span></div>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Summary */}
              {selectedReport.ai_executive_summary && (
                <div>
                  <h3 className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Zap className="w-3 h-3 text-indigo-400" /> AI Executive Summary</h3>
                  <div className="p-4 rounded-lg bg-indigo-950/10 border border-indigo-400/10">
                    <p className="text-[12px] text-white/70 leading-relaxed">{selectedReport.ai_executive_summary}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ FRAMEWORKS ═══ */}
        {tab === 'frameworks' && (
          <div className="p-5">
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a]">
              <div className="p-4 border-b border-white/[0.06]">
                <h3 className="text-[12px] font-medium text-white/70">Compliance Frameworks</h3>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {MOCK_FRAMEWORKS.map(f => (
                  <div key={f.id} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                    <Globe className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-white/80">{f.name}</div>
                      <div className="text-[10px] text-zinc-600">{f.code} · v{f.version} · {f.jurisdiction}</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 capitalize">{f.framework_type}</span>
                    <span className={cn('text-[10px] capitalize', STATUS_CLR[f.status])}>{f.status}</span>
                    {f.compliance_deadline && (
                      <div className="text-right w-24">
                        <div className="text-[10px] text-zinc-600">Deadline</div>
                        <div className="text-[10px] text-amber-400">{new Date(f.compliance_deadline).toLocaleDateString()}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ DATA SOURCES ═══ */}
        {tab === 'sources' && (
          <div className="p-5">
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a]">
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-[12px] font-medium text-white/70">ESG Data Sources</h3>
                <button className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-emerald-600/80 text-white hover:bg-emerald-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Source</button>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {MOCK_DATA_SOURCES.map(ds => (
                  <div key={ds.id} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className={cn('w-2 h-2 rounded-full flex-shrink-0', ds.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-700')} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-white/80">{ds.source_name}</div>
                      <div className="text-[10px] text-zinc-600">{ds.source_type.replace(/_/g, ' ')} · {ds.category} · {ds.sync_frequency}</div>
                    </div>
                    <span className="text-[10px] text-zinc-500">{ds.metrics_count} metrics</span>
                    <span className="text-[10px] text-zinc-600">{ds.last_sync_at ? `Synced ${new Date(ds.last_sync_at).toLocaleDateString()}` : 'Never'}</span>
                    <span className={cn('text-[10px] capitalize', STATUS_CLR[ds.status])}>{ds.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
