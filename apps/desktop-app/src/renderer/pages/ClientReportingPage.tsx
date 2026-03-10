import { useState } from 'react';
import {
  FileText, Plus, Download, Eye, ArrowLeft, ChevronRight, Calendar,
  BarChart3, TrendingUp, Zap, Clock, CheckCircle2,
  Send, Layout, Table, Printer,
  Building2, Settings,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend,
} from 'recharts';
import { cn } from '../lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   COMPREHENSIVE MOCK DATA — Automated Client & Board Reporting
   Models a fund administration / financial services firm that generates
   structured reports and board packs from connected systems.
   ═══════════════════════════════════════════════════════════════════════════ */

const MOCK_TEMPLATES = [
  { id: 't1', name: 'Quarterly Client Performance Report', type: 'client_report', format: 'PDF', frequency: 'quarterly', sections: 8, last_used: '2026-03-01', status: 'active', description: 'Full AUM performance, allocation breakdown, transaction summary, and outlook for individual client portfolios.' },
  { id: 't2', name: 'Board Pack — Governance & Risk', type: 'board_pack', format: 'PPTX', frequency: 'quarterly', sections: 12, last_used: '2026-02-28', status: 'active', description: 'Comprehensive board pack covering risk dashboard, compliance status, incident reports, and strategic KPIs.' },
  { id: 't3', name: 'Monthly Fund NAV Report', type: 'fund_report', format: 'PDF', frequency: 'monthly', sections: 5, last_used: '2026-03-01', status: 'active', description: 'Net Asset Value calculations, performance attribution, and fee reconciliation for each fund.' },
  { id: 't4', name: 'Annual Investor Letter', type: 'investor_letter', format: 'PDF', frequency: 'annually', sections: 6, last_used: '2026-01-15', status: 'active', description: 'Year-in-review investor communication with market commentary, fund performance, and forward guidance.' },
  { id: 't5', name: 'Regulatory Filing Pack', type: 'regulatory', format: 'PDF', frequency: 'quarterly', sections: 10, last_used: '2026-02-15', status: 'active', description: 'JFSC regulatory submission pack with capital adequacy, client money, and compliance attestations.' },
  { id: 't6', name: 'ESG Impact Report', type: 'esg_report', format: 'PDF', frequency: 'annually', sections: 9, last_used: '2026-01-20', status: 'draft', description: 'TCFD-aligned ESG performance report for investor and stakeholder distribution.' },
];

const MOCK_REPORTS = [
  {
    id: 'r1', title: 'Q1 2026 Client Performance — Apex Growth Fund', template: 'Quarterly Client Performance Report',
    client: 'Apex Capital Partners', report_type: 'client_report', status: 'published',
    created_at: '2026-03-15', published_at: '2026-03-18', reporting_period: 'Q1 2026',
    pages: 24, data_sources: ['Portfolio Management System', 'Market Data Feed', 'Risk Engine'],
    ai_summary: 'Apex Growth Fund returned +4.8% in Q1 2026, outperforming the benchmark (MSCI World +3.2%) by 160bps. The outperformance was primarily driven by overweight positions in European technology (+12.4%) and healthcare (+6.1%). Fixed income allocation provided stability amid rising yields. AUM grew to £342M from £326M, reflecting both performance and net inflows of £8.2M. Key risk: concentration in tech sector now at 28% of NAV, above the 25% guideline limit. Recommendation: rebalance towards defensive sectors ahead of Q2 earnings season.',
    sections: [
      { title: 'Executive Summary', status: 'complete', ai_generated: true },
      { title: 'Portfolio Performance', status: 'complete', ai_generated: false },
      { title: 'Asset Allocation', status: 'complete', ai_generated: false },
      { title: 'Transaction Activity', status: 'complete', ai_generated: false },
      { title: 'Risk Metrics', status: 'complete', ai_generated: true },
      { title: 'Fee Summary', status: 'complete', ai_generated: false },
      { title: 'Market Commentary', status: 'complete', ai_generated: true },
      { title: 'Forward Outlook', status: 'complete', ai_generated: true },
    ],
  },
  {
    id: 'r2', title: 'Board Pack — March 2026', template: 'Board Pack — Governance & Risk',
    client: 'Internal — Board of Directors', report_type: 'board_pack', status: 'in_review',
    created_at: '2026-03-10', published_at: null, reporting_period: 'Q1 2026',
    pages: 48, data_sources: ['Risk Engine', 'Compliance System', 'HR Platform', 'Finance System', 'CRM'],
    ai_summary: 'Firm-wide AUM reached £2.4B (+8% YoY). Revenue growth of 12% driven by new client onboarding and fee uplift from structured products. Regulatory compliance score at 96%. Two minor incidents reported (data access policy violations) — both resolved. Staff attrition at 9.2%, below industry benchmark. Capital adequacy ratio at 142%, well above JFSC minimum. Strategic focus: digital transformation programme on track, MCP integration delivering 23% efficiency gain in reporting workflows.',
    sections: [
      { title: 'CEO Report', status: 'complete', ai_generated: true },
      { title: 'Financial Overview', status: 'complete', ai_generated: false },
      { title: 'AUM Dashboard', status: 'complete', ai_generated: false },
      { title: 'Risk Dashboard', status: 'in_review', ai_generated: true },
      { title: 'Compliance & Regulatory', status: 'in_review', ai_generated: true },
      { title: 'Incident Summary', status: 'complete', ai_generated: false },
      { title: 'Client Activity', status: 'draft', ai_generated: false },
      { title: 'People & Culture', status: 'complete', ai_generated: true },
      { title: 'Technology & Operations', status: 'complete', ai_generated: true },
      { title: 'ESG Update', status: 'draft', ai_generated: false },
      { title: 'Strategic Initiatives', status: 'complete', ai_generated: true },
      { title: 'Forward Agenda', status: 'draft', ai_generated: false },
    ],
  },
  {
    id: 'r3', title: 'Feb 2026 NAV Report — Meridian Global Fund', template: 'Monthly Fund NAV Report',
    client: 'Meridian Investments', report_type: 'fund_report', status: 'published',
    created_at: '2026-03-05', published_at: '2026-03-06', reporting_period: 'Feb 2026',
    pages: 12, data_sources: ['Portfolio Management System', 'Pricing Service', 'Transfer Agent'],
    ai_summary: null,
    sections: [
      { title: 'NAV Summary', status: 'complete', ai_generated: false },
      { title: 'Performance Attribution', status: 'complete', ai_generated: false },
      { title: 'Subscription/Redemption', status: 'complete', ai_generated: false },
      { title: 'Fee Calculation', status: 'complete', ai_generated: false },
      { title: 'Compliance Check', status: 'complete', ai_generated: true },
    ],
  },
  {
    id: 'r4', title: '2025 Annual Investor Letter', template: 'Annual Investor Letter',
    client: 'All Investors', report_type: 'investor_letter', status: 'published',
    created_at: '2026-01-10', published_at: '2026-01-20', reporting_period: 'FY 2025',
    pages: 18, data_sources: ['Portfolio Management System', 'Market Data Feed', 'CRM'],
    ai_summary: 'Annual investor letter covering 2025 performance, market outlook for 2026, and firm strategic updates. Fund strategies delivered weighted average return of 11.2%, with 4 of 5 strategies outperforming respective benchmarks. Firm processed £1.2B in new subscriptions across all fund structures. Jersey regulatory environment remains stable with enhanced cyber and AML requirements.',
    sections: [
      { title: 'Chairman\'s Letter', status: 'complete', ai_generated: true },
      { title: 'Performance Review', status: 'complete', ai_generated: false },
      { title: 'Market Commentary', status: 'complete', ai_generated: true },
      { title: 'Fund Highlights', status: 'complete', ai_generated: false },
      { title: 'Firm Update', status: 'complete', ai_generated: true },
      { title: '2026 Outlook', status: 'complete', ai_generated: true },
    ],
  },
  {
    id: 'r5', title: 'Q1 2026 JFSC Regulatory Filing', template: 'Regulatory Filing Pack',
    client: 'JFSC', report_type: 'regulatory', status: 'draft',
    created_at: '2026-03-20', published_at: null, reporting_period: 'Q1 2026',
    pages: 32, data_sources: ['Finance System', 'Compliance System', 'Risk Engine', 'Client Money Records'],
    ai_summary: null,
    sections: [
      { title: 'Capital Adequacy', status: 'complete', ai_generated: false },
      { title: 'Client Money Reconciliation', status: 'in_review', ai_generated: false },
      { title: 'AML/CFT Report', status: 'draft', ai_generated: true },
      { title: 'Compliance Attestation', status: 'draft', ai_generated: false },
      { title: 'Risk Assessment', status: 'draft', ai_generated: true },
      { title: 'Incident Register', status: 'complete', ai_generated: false },
      { title: 'Staff Competency', status: 'draft', ai_generated: false },
      { title: 'Business Continuity', status: 'draft', ai_generated: false },
      { title: 'Outsourcing Register', status: 'complete', ai_generated: false },
      { title: 'Appendices', status: 'draft', ai_generated: false },
    ],
  },
];

const MOCK_SCHEDULES = [
  { id: 's1', report_name: 'Monthly Fund NAV', frequency: 'monthly', next_due: '2026-04-05', clients: 4, status: 'active' },
  { id: 's2', report_name: 'Quarterly Client Performance', frequency: 'quarterly', next_due: '2026-06-15', clients: 12, status: 'active' },
  { id: 's3', report_name: 'Board Pack', frequency: 'quarterly', next_due: '2026-06-01', clients: 1, status: 'active' },
  { id: 's4', report_name: 'JFSC Regulatory Filing', frequency: 'quarterly', next_due: '2026-06-30', clients: 1, status: 'active' },
  { id: 's5', report_name: 'Annual Investor Letter', frequency: 'annually', next_due: '2027-01-15', clients: 48, status: 'active' },
];

const MOCK_DATA_SOURCES = [
  { id: 'ds1', name: 'Portfolio Management System', type: 'api', status: 'connected', metrics: 120, last_sync: '2026-03-22T08:00:00Z' },
  { id: 'ds2', name: 'Market Data Feed (Bloomberg)', type: 'api', status: 'connected', metrics: 450, last_sync: '2026-03-22T07:45:00Z' },
  { id: 'ds3', name: 'Risk Engine', type: 'internal', status: 'connected', metrics: 85, last_sync: '2026-03-22T06:00:00Z' },
  { id: 'ds4', name: 'Compliance & Regulatory System', type: 'internal', status: 'connected', metrics: 42, last_sync: '2026-03-22T08:00:00Z' },
  { id: 'ds5', name: 'Finance & Accounting (Xero)', type: 'api', status: 'connected', metrics: 68, last_sync: '2026-03-21T22:00:00Z' },
  { id: 'ds6', name: 'CRM (Salesforce)', type: 'api', status: 'warning', metrics: 35, last_sync: '2026-03-20T18:00:00Z' },
  { id: 'ds7', name: 'HR Platform (BambooHR)', type: 'api', status: 'connected', metrics: 28, last_sync: '2026-03-22T01:00:00Z' },
  { id: 'ds8', name: 'Transfer Agent Records', type: 'manual', status: 'connected', metrics: 15, last_sync: '2026-03-19T12:00:00Z' },
];

const REPORT_VOLUME = [
  { month: 'Oct', client: 8, board: 1, regulatory: 2, fund: 4 },
  { month: 'Nov', client: 6, board: 0, regulatory: 1, fund: 4 },
  { month: 'Dec', client: 12, board: 1, regulatory: 3, fund: 4 },
  { month: 'Jan', client: 14, board: 1, regulatory: 2, fund: 4 },
  { month: 'Feb', client: 7, board: 0, regulatory: 1, fund: 4 },
  { month: 'Mar', client: 10, board: 1, regulatory: 2, fund: 4 },
];

const TIME_SAVINGS = [
  { month: 'Oct', manual_hrs: 120, automated_hrs: 45 },
  { month: 'Nov', manual_hrs: 95, automated_hrs: 32 },
  { month: 'Dec', manual_hrs: 155, automated_hrs: 48 },
  { month: 'Jan', manual_hrs: 160, automated_hrs: 42 },
  { month: 'Feb', manual_hrs: 88, automated_hrs: 28 },
  { month: 'Mar', manual_hrs: 130, automated_hrs: 38 },
];

const TYPE_DIST = [
  { name: 'Client Reports', value: 57 },
  { name: 'Board Packs', value: 4 },
  { name: 'Regulatory', value: 11 },
  { name: 'Fund NAV', value: 24 },
  { name: 'Investor Letters', value: 4 },
];

const DASHBOARD = {
  totalReports: 96, publishedReports: 78, draftReports: 12, inReviewReports: 6,
  totalTemplates: 6, activeSchedules: 5, connectedSources: 7, warningSources: 1,
  aiSectionsGenerated: 248, avgTimeSaved: '68%', reportsThisMonth: 17,
};

/* ═══════════════════════════════════════════════════════════════════════════ */

type Tab = 'overview' | 'reports' | 'templates' | 'schedules' | 'sources';

const STATUS_CLR: Record<string, string> = {
  published: 'text-emerald-400', in_review: 'text-amber-400', draft: 'text-zinc-400',
  complete: 'text-emerald-400', active: 'text-emerald-400', connected: 'text-emerald-400',
  warning: 'text-amber-400', disconnected: 'text-red-400',
};
const TYPE_ICON: Record<string, React.ElementType> = {
  client_report: BarChart3, board_pack: Layout, fund_report: Table,
  investor_letter: Send, regulatory: Building2, esg_report: TrendingUp,
};
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function ClientReportingPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [selectedReport, setSelectedReport] = useState<typeof MOCK_REPORTS[0] | null>(null);

  const dash = DASHBOARD;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">Client & Board Reporting</h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        <div className="flex items-center gap-4 app-region-no-drag">
          <span className="text-[11px] text-emerald-400"><FileText className="w-3 h-3 inline mr-1" />{dash.reportsThisMonth} this month</span>
          <span className="text-[11px] text-white/40"><Zap className="w-3 h-3 inline mr-1 text-indigo-400" />{dash.aiSectionsGenerated} AI sections</span>
          <span className="text-[11px] text-white/40"><Clock className="w-3 h-3 inline mr-1 text-white/25" />{dash.avgTimeSaved} time saved</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 app-region-no-drag">
          <button className="h-6 px-2.5 rounded-[5px] text-[11px] text-white/40 hover:text-white/60 hover:bg-white/[0.04] flex items-center gap-1"><Download className="w-3 h-3" /> Export All</button>
          <button className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-blue-600 text-white hover:bg-blue-500 flex items-center gap-1"><Plus className="w-3 h-3" /> New Report</button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 px-5 pt-3 pb-0">
        {(['overview', 'reports', 'templates', 'schedules', 'sources'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setSelectedReport(null); }} className={cn('px-3 py-1.5 text-[11px] font-medium rounded-t capitalize', tab === t ? 'text-white bg-white/[0.06]' : 'text-zinc-500 hover:text-zinc-300')}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {/* ═══ OVERVIEW ═══ */}
        {tab === 'overview' && (
          <div className="p-5 space-y-5">
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { l: 'Total Reports', v: String(dash.totalReports), s: `${dash.publishedReports} published`, c: 'text-blue-400', ic: FileText },
                { l: 'AI Sections Generated', v: String(dash.aiSectionsGenerated), s: `${dash.avgTimeSaved} avg time saved`, c: 'text-indigo-400', ic: Zap },
                { l: 'Active Schedules', v: String(dash.activeSchedules), s: `${dash.totalTemplates} templates`, c: 'text-emerald-400', ic: Calendar },
                { l: 'Connected Sources', v: `${dash.connectedSources}/${dash.connectedSources + dash.warningSources}`, s: dash.warningSources > 0 ? `${dash.warningSources} warning` : 'All healthy', c: dash.warningSources > 0 ? 'text-amber-400' : 'text-emerald-400', ic: Settings },
              ].map(card => (
                <div key={card.l} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                  <div className="flex items-center justify-between mb-2"><span className="text-[10px] text-zinc-600 uppercase tracking-wider">{card.l}</span><card.ic className={cn('w-4 h-4', card.c)} /></div>
                  <div className={cn('text-[22px] font-semibold', card.c)}>{card.v}</div>
                  <span className="text-[11px] text-zinc-600">{card.s}</span>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 col-span-1">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Reports by Type</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={TYPE_DIST} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                      {TYPE_DIST.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                  {TYPE_DIST.map((d, i) => (
                    <span key={d.name} className="text-[9px] text-zinc-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS[i] }} />{d.name}</span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Report Volume (6mo)</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={REPORT_VOLUME}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="client" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="fund" stackId="a" fill="#10b981" />
                    <Bar dataKey="regulatory" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="board" stackId="a" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Time Savings — AI vs Manual</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={TIME_SAVINGS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                    <Area type="monotone" dataKey="manual_hrs" stroke="#ef4444" fill="#ef4444" fillOpacity={0.08} name="Manual (hrs)" />
                    <Area type="monotone" dataKey="automated_hrs" stroke="#10b981" fill="#10b981" fillOpacity={0.08} name="Automated (hrs)" />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Reports */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
              <h3 className="text-[12px] font-medium text-white/70 mb-3">Recent Reports</h3>
              <div className="divide-y divide-white/[0.04]">
                {MOCK_REPORTS.slice(0, 5).map(r => {
                  const TypeIcon = TYPE_ICON[r.report_type] || FileText;
                  return (
                    <div key={r.id} onClick={() => { setTab('reports'); setSelectedReport(r); }} className="flex items-center gap-3 py-2.5 hover:bg-white/[0.02] cursor-pointer transition-colors px-2 -mx-2 rounded">
                      <TypeIcon className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-white/80 truncate">{r.title}</div>
                        <div className="text-[10px] text-zinc-600">{r.client} · {r.reporting_period}</div>
                      </div>
                      <span className="text-[10px] text-zinc-600">{r.pages}p</span>
                      <span className={cn('text-[10px] capitalize', STATUS_CLR[r.status])}>{r.status.replace(/_/g, ' ')}</span>
                      <ChevronRight className="w-3 h-3 text-zinc-700" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming schedule */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
              <h3 className="text-[12px] font-medium text-white/70 mb-3">Upcoming Report Schedule</h3>
              <div className="divide-y divide-white/[0.04]">
                {MOCK_SCHEDULES.map(s => (
                  <div key={s.id} className="flex items-center gap-3 py-2.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <div className="flex-1">
                      <div className="text-[12px] text-white/80">{s.report_name}</div>
                      <div className="text-[10px] text-zinc-600">{s.frequency} · {s.clients} recipient{s.clients !== 1 ? 's' : ''}</div>
                    </div>
                    <span className="text-[11px] text-amber-400 tabular-nums">{new Date(s.next_due).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ REPORTS LIST ═══ */}
        {tab === 'reports' && !selectedReport && (
          <div className="p-5">
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a]">
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-[12px] font-medium text-white/70">All Reports</h3>
                <button className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-blue-600 text-white hover:bg-blue-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Create Report</button>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {MOCK_REPORTS.map(r => {
                  const TypeIcon = TYPE_ICON[r.report_type] || FileText;
                  const completeSections = r.sections.filter(s => s.status === 'complete').length;
                  return (
                    <div key={r.id} onClick={() => setSelectedReport(r)} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] cursor-pointer transition-colors">
                      <TypeIcon className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-white/80">{r.title}</div>
                        <div className="text-[10px] text-zinc-600">{r.client} · {r.reporting_period} · {r.pages} pages</div>
                      </div>
                      <div className="text-right w-28">
                        <div className="text-[10px] text-zinc-500">{completeSections}/{r.sections.length} sections</div>
                        <div className="h-1 rounded-full bg-zinc-800 mt-1">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${(completeSections / r.sections.length) * 100}%` }} />
                        </div>
                      </div>
                      <span className={cn('text-[10px] capitalize w-16 text-right', STATUS_CLR[r.status])}>{r.status.replace(/_/g, ' ')}</span>
                      <ChevronRight className="w-3 h-3 text-zinc-700" />
                    </div>
                  );
                })}
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
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-5 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[14px] font-medium text-white/90">{selectedReport.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-zinc-500">{selectedReport.client}</span>
                    <span className="text-[10px] text-zinc-500">{selectedReport.reporting_period}</span>
                    <span className="text-[10px] text-zinc-500">{selectedReport.pages} pages</span>
                    <span className={cn('text-[10px] capitalize', STATUS_CLR[selectedReport.status])}>{selectedReport.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-7 px-3 rounded-lg text-[11px] text-indigo-400 border border-indigo-400/20 hover:bg-indigo-400/5 flex items-center gap-1"><Zap className="w-3 h-3" /> AI Generate All</button>
                  <button className="h-7 px-3 rounded-lg text-[11px] text-white/50 border border-white/10 hover:bg-white/[0.04] flex items-center gap-1"><Eye className="w-3 h-3" /> Preview</button>
                  <button className="h-7 px-3 rounded-lg text-[11px] text-white/50 border border-white/10 hover:bg-white/[0.04] flex items-center gap-1"><Printer className="w-3 h-3" /> Print</button>
                  <button className="h-7 px-3 rounded-lg text-[11px] bg-blue-600 text-white hover:bg-blue-500 flex items-center gap-1"><Download className="w-3 h-3" /> Export PDF</button>
                </div>
              </div>

              {/* Data sources */}
              <div>
                <h3 className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Data Sources</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.data_sources.map(ds => (
                    <span key={ds} className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.03] text-zinc-400 border border-white/[0.04]">{ds}</span>
                  ))}
                </div>
              </div>

              {/* AI Summary */}
              {selectedReport.ai_summary && (
                <div>
                  <h3 className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Zap className="w-3 h-3 text-indigo-400" /> AI Executive Summary</h3>
                  <div className="p-4 rounded-lg bg-indigo-950/10 border border-indigo-400/10">
                    <p className="text-[12px] text-white/70 leading-relaxed">{selectedReport.ai_summary}</p>
                  </div>
                </div>
              )}

              {/* Sections */}
              <div>
                <h3 className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Report Sections</h3>
                <div className="rounded-lg border border-white/[0.04] divide-y divide-white/[0.04]">
                  {selectedReport.sections.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                      <span className="text-[10px] text-zinc-600 w-5 tabular-nums">{i + 1}</span>
                      <div className="flex-1">
                        <span className="text-[12px] text-white/80">{s.title}</span>
                      </div>
                      {s.ai_generated && <span className="text-[8px] px-1.5 py-0.5 rounded bg-indigo-900/30 text-indigo-400">AI</span>}
                      <span className={cn('text-[10px] capitalize', STATUS_CLR[s.status])}>{s.status.replace(/_/g, ' ')}</span>
                      {s.status === 'complete' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/50" />
                      ) : s.status === 'in_review' ? (
                        <Eye className="w-3.5 h-3.5 text-amber-500/50" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-zinc-700" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TEMPLATES ═══ */}
        {tab === 'templates' && (
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3">
              {MOCK_TEMPLATES.map(t => {
                const TypeIcon = TYPE_ICON[t.type] || FileText;
                return (
                  <div key={t.id} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-900/15 flex items-center justify-center flex-shrink-0">
                        <TypeIcon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-white/80">{t.name}</div>
                        <div className="text-[10px] text-zinc-600 mt-0.5">{t.type.replace(/_/g, ' ')} · {t.format} · {t.sections} sections · {t.frequency}</div>
                        <p className="text-[11px] text-zinc-500 mt-2 line-clamp-2">{t.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className={cn('text-[10px] capitalize', STATUS_CLR[t.status])}>{t.status}</span>
                          <span className="text-[10px] text-zinc-600">Last used: {new Date(t.last_used).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ SCHEDULES ═══ */}
        {tab === 'schedules' && (
          <div className="p-5">
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a]">
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-[12px] font-medium text-white/70">Report Schedules</h3>
                <button className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-blue-600/90 text-white hover:bg-blue-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Schedule</button>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {MOCK_SCHEDULES.map(s => (
                  <div key={s.id} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                    <Calendar className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-white/80">{s.report_name}</div>
                      <div className="text-[10px] text-zinc-600">{s.frequency} · {s.clients} recipient{s.clients !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-600">Next due</div>
                      <div className="text-[11px] text-amber-400 tabular-nums">{new Date(s.next_due).toLocaleDateString()}</div>
                    </div>
                    <span className={cn('text-[10px] capitalize', STATUS_CLR[s.status])}>{s.status}</span>
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
                <h3 className="text-[12px] font-medium text-white/70">Connected Data Sources</h3>
                <button className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-blue-600/90 text-white hover:bg-blue-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Connect Source</button>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {MOCK_DATA_SOURCES.map(ds => (
                  <div key={ds.id} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className={cn('w-2 h-2 rounded-full flex-shrink-0', ds.status === 'connected' ? 'bg-emerald-500' : ds.status === 'warning' ? 'bg-amber-500' : 'bg-red-500')} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-white/80">{ds.name}</div>
                      <div className="text-[10px] text-zinc-600">{ds.type} · {ds.metrics} metrics</div>
                    </div>
                    <span className="text-[10px] text-zinc-600">Synced {new Date(ds.last_sync).toLocaleDateString()}</span>
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
