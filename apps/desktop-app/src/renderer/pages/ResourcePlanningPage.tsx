import { useState } from 'react';
import { Users, Sparkles, AlertTriangle, Plus, BarChart3, Clock, Trash2, X } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';
import ExportButton from '../components/ui/ExportButton';
import type { PDFReportOptions } from '../lib/pdfExport';

/* ═══════════════════════════════════════════════════════════════════════════
   COMPREHENSIVE MOCK DATA — Resource Planning & Team Utilisation
   Data modelled on a Jersey financial services compliance/technology team.
   Roles reflect typical Jersey fund administration & trust company staffing.
   ═══════════════════════════════════════════════════════════════════════════ */

interface Resource {
  id: string;
  name: string;
  role: string;
  department: string;
  skills: string[];
  available_hours_week: number;
  status: string;
  email?: string;
}
interface Allocation {
  id: string;
  resource_id: string;
  project_name: string;
  allocated_hours: number;
  start_date: string;
  end_date: string;
  status: string;
  resources?: Resource;
}
interface UtilRow {
  resource: { id: string; name: string; role: string; department: string; skills: string[] };
  utilization: number;
  allocatedHours: number;
  availableHours: number;
  status: string;
  activeProjects: string[];
}
interface Dashboard {
  totalResources: number;
  activeResources: number;
  avgUtilization: number;
  overAllocated: number;
  idle: number;
  optimalRange: string;
  departmentUtilization: { department: string; utilization: number }[];
  topSkills: { skill: string; count: number }[];
  utilizationBreakdown: { range: string; count: number }[];
}

const MOCK_RESOURCES: Resource[] = [
  {
    id: 'rr1',
    name: 'Claire de la Haye',
    role: 'Head of Compliance',
    department: 'Compliance',
    skills: ['AML/CFT', 'JFSC Regulation', 'Risk Assessment', 'MONEYVAL'],
    available_hours_week: 40,
    status: 'active',
    email: 'claire.delahaye@firm.je',
  },
  {
    id: 'rr2',
    name: 'David Le Cornu',
    role: 'Chief Technology Officer',
    department: 'Technology',
    skills: ['Cloud Architecture', 'Cybersecurity', 'AI/ML', 'Solution Design'],
    available_hours_week: 40,
    status: 'active',
    email: 'david.lecornu@firm.je',
  },
  {
    id: 'rr3',
    name: 'Mark Le Brocq',
    role: 'Finance Director',
    department: 'Finance',
    skills: ['Financial Reporting', 'Audit', 'Tax Compliance', 'Budget Planning'],
    available_hours_week: 40,
    status: 'active',
    email: 'mark.lebrocq@firm.je',
  },
  {
    id: 'rr4',
    name: 'Sarah Nicolle',
    role: 'Operations Manager',
    department: 'Operations',
    skills: ['Vendor Management', 'Facilities', 'Process Improvement', 'ISO 27001'],
    available_hours_week: 40,
    status: 'active',
    email: 'sarah.nicolle@firm.je',
  },
  {
    id: 'rr5',
    name: 'Philippe Sinel',
    role: 'Senior Legal Counsel',
    department: 'Legal',
    skills: ['Jersey Law', 'Trust Law', 'Corporate Governance', 'Regulatory'],
    available_hours_week: 37.5,
    status: 'active',
    email: 'philippe.sinel@firm.je',
  },
  {
    id: 'rr6',
    name: 'Emma Journeaux',
    role: 'HR Business Partner',
    department: 'HR',
    skills: ['Employment Law (Jersey)', 'Talent Management', 'L&D', 'HRIS'],
    available_hours_week: 37.5,
    status: 'active',
    email: 'emma.journeaux@firm.je',
  },
  {
    id: 'rr7',
    name: 'Thomas Perchard',
    role: 'Senior Fund Administrator',
    department: 'Fund Services',
    skills: ['NAV Calculation', 'Fund Accounting', 'Investor Reporting', 'JFSC Filings'],
    available_hours_week: 40,
    status: 'active',
    email: 'thomas.perchard@firm.je',
  },
  {
    id: 'rr8',
    name: 'Rachel Le Marquand',
    role: 'Trust Administrator',
    department: 'Trust Services',
    skills: ['Trust Administration', 'Succession Planning', 'Jersey Trust Law', 'PTC Management'],
    available_hours_week: 40,
    status: 'active',
    email: 'rachel.lemarquand@firm.je',
  },
  {
    id: 'rr9',
    name: 'James Ahier',
    role: 'KYC/CDD Analyst',
    department: 'Compliance',
    skills: ['KYC/CDD', 'Sanctions Screening', 'PEP Checks', 'Enhanced Due Diligence'],
    available_hours_week: 40,
    status: 'active',
    email: 'james.ahier@firm.je',
  },
  {
    id: 'rr10',
    name: 'Sophie Le Maistre',
    role: 'Software Engineer',
    department: 'Technology',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    available_hours_week: 40,
    status: 'active',
    email: 'sophie.lemaistre@firm.je',
  },
  {
    id: 'rr11',
    name: 'Peter Coutanche',
    role: 'Data Analyst',
    department: 'Technology',
    skills: ['SQL', 'Python', 'BI Reporting', 'Data Governance'],
    available_hours_week: 40,
    status: 'active',
    email: 'peter.coutanche@firm.je',
  },
  {
    id: 'rr12',
    name: 'Natalie Bree',
    role: 'Client Relationship Manager',
    department: 'Client Services',
    skills: ['Client Onboarding', 'HNW Clients', 'Jersey Market', 'CRM'],
    available_hours_week: 37.5,
    status: 'on_leave',
    email: 'natalie.bree@firm.je',
  },
];

const MOCK_ALLOCATIONS: Allocation[] = [
  {
    id: 'ra1',
    resource_id: 'rr1',
    project_name: 'JFSC AML/CFT Handbook Compliance',
    allocated_hours: 20,
    start_date: '2026-03-01',
    end_date: '2026-04-30',
    status: 'active',
  },
  {
    id: 'ra2',
    resource_id: 'rr1',
    project_name: 'MONEYVAL Follow-Up Response',
    allocated_hours: 12,
    start_date: '2026-03-01',
    end_date: '2026-05-31',
    status: 'active',
  },
  {
    id: 'ra3',
    resource_id: 'rr2',
    project_name: 'Digital KYC Platform Build',
    allocated_hours: 25,
    start_date: '2026-01-15',
    end_date: '2026-06-30',
    status: 'active',
  },
  {
    id: 'ra4',
    resource_id: 'rr2',
    project_name: 'Cybersecurity Audit 2026',
    allocated_hours: 10,
    start_date: '2026-03-01',
    end_date: '2026-04-15',
    status: 'active',
  },
  {
    id: 'ra5',
    resource_id: 'rr3',
    project_name: 'Annual Audit — PwC Engagement',
    allocated_hours: 30,
    start_date: '2026-02-01',
    end_date: '2026-04-30',
    status: 'active',
  },
  {
    id: 'ra6',
    resource_id: 'rr4',
    project_name: 'Office Relocation — Royal Square',
    allocated_hours: 15,
    start_date: '2026-03-01',
    end_date: '2026-05-31',
    status: 'active',
  },
  {
    id: 'ra7',
    resource_id: 'rr5',
    project_name: 'Economic Substance Review',
    allocated_hours: 18,
    start_date: '2026-03-01',
    end_date: '2026-06-30',
    status: 'active',
  },
  {
    id: 'ra8',
    resource_id: 'rr7',
    project_name: 'Q1 NAV Calculations & Reporting',
    allocated_hours: 35,
    start_date: '2026-03-01',
    end_date: '2026-03-31',
    status: 'active',
  },
  {
    id: 'ra9',
    resource_id: 'rr8',
    project_name: 'Trust Restructure — Le Masurier Family',
    allocated_hours: 22,
    start_date: '2026-02-15',
    end_date: '2026-04-30',
    status: 'active',
  },
  {
    id: 'ra10',
    resource_id: 'rr9',
    project_name: 'Enhanced Due Diligence — Gulf Clients',
    allocated_hours: 30,
    start_date: '2026-03-01',
    end_date: '2026-04-15',
    status: 'active',
  },
  {
    id: 'ra11',
    resource_id: 'rr10',
    project_name: 'Digital KYC Platform Build',
    allocated_hours: 35,
    start_date: '2026-01-15',
    end_date: '2026-06-30',
    status: 'active',
  },
  {
    id: 'ra12',
    resource_id: 'rr11',
    project_name: 'Regulatory Reporting Dashboard',
    allocated_hours: 28,
    start_date: '2026-02-01',
    end_date: '2026-04-30',
    status: 'active',
  },
  {
    id: 'ra13',
    resource_id: 'rr6',
    project_name: 'Jersey Employment Law Update',
    allocated_hours: 8,
    start_date: '2026-03-01',
    end_date: '2026-03-31',
    status: 'active',
  },
];

const buildUtilRows = (): UtilRow[] =>
  MOCK_RESOURCES.map(r => {
    const allocs = MOCK_ALLOCATIONS.filter(a => a.resource_id === r.id);
    const totalAllocated = allocs.reduce((s, a) => s + a.allocated_hours, 0);
    const util = Math.min(Math.round((totalAllocated / r.available_hours_week) * 100), 100);
    return {
      resource: {
        id: r.id,
        name: r.name,
        role: r.role,
        department: r.department,
        skills: r.skills,
      },
      utilization: util,
      allocatedHours: totalAllocated,
      availableHours: r.available_hours_week,
      status:
        r.status === 'on_leave'
          ? 'on_leave'
          : util > 90
            ? 'over_allocated'
            : util < 30
              ? 'under_utilized'
              : 'optimal',
      activeProjects: allocs.map(a => a.project_name),
    };
  });

const MOCK_UTIL_ROWS = buildUtilRows();

const MOCK_DASHBOARD: Dashboard = {
  totalResources: 12,
  activeResources: 11,
  avgUtilization: Math.round(
    MOCK_UTIL_ROWS.filter(r => r.status !== 'on_leave').reduce((s, r) => s + r.utilization, 0) / 11
  ),
  overAllocated: MOCK_UTIL_ROWS.filter(r => r.status === 'over_allocated').length,
  idle: MOCK_UTIL_ROWS.filter(r => r.status === 'under_utilized').length,
  optimalRange: '70-90%',
  departmentUtilization: [
    { department: 'Compliance', utilization: 80 },
    { department: 'Technology', utilization: 88 },
    { department: 'Finance', utilization: 75 },
    { department: 'Operations', utilization: 38 },
    { department: 'Legal', utilization: 48 },
    { department: 'Fund Services', utilization: 88 },
    { department: 'Trust Services', utilization: 55 },
    { department: 'HR', utilization: 21 },
    { department: 'Client Services', utilization: 0 },
  ],
  topSkills: [
    { skill: 'AML/CFT', count: 3 },
    { skill: 'JFSC Regulation', count: 2 },
    { skill: 'TypeScript', count: 1 },
    { skill: 'Trust Law', count: 2 },
    { skill: 'Fund Accounting', count: 1 },
    { skill: 'KYC/CDD', count: 2 },
    { skill: 'Cybersecurity', count: 1 },
    { skill: 'Financial Reporting', count: 1 },
  ],
  utilizationBreakdown: [
    { range: '0-30%', count: 2 },
    { range: '31-50%', count: 2 },
    { range: '51-70%', count: 1 },
    { range: '71-90%', count: 5 },
    { range: '91-100%', count: 2 },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════ */

const UTIL_COLOR = (u: number) =>
  u > 90
    ? 'text-red-400'
    : u > 70
      ? 'text-emerald-400'
      : u > 40
        ? 'text-amber-400'
        : 'text-zinc-500';
const UTIL_BAR = (u: number) =>
  u > 90 ? 'bg-red-500' : u > 70 ? 'bg-emerald-500' : u > 40 ? 'bg-amber-500' : 'bg-zinc-600';
const COLORS = [
  '#6366f1',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
];

type Tab = 'overview' | 'team' | 'allocations';

export default function ResourcePlanningPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [allocations] = useState<Allocation[]>(MOCK_ALLOCATIONS);
  const [optimizations, setOptimizations] = useState<{
    summary: string;
    recommendations: { title: string; description: string; impact: string }[];
  } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addRole, setAddRole] = useState('');
  const [addDept, setAddDept] = useState('Compliance');
  const [addSkills, setAddSkills] = useState('');

  const dash = MOCK_DASHBOARD;
  const utilRows = MOCK_UTIL_ROWS;

  const optimize = () => {
    setOptimizations({
      summary: 'AI Resource Optimisation Analysis — Jersey Operations Team (12 staff)',
      recommendations: [
        {
          title: 'Redistribute: Operations Manager under-utilised (38%)',
          description:
            'Sarah Nicolle has 25 available hours/week. Recommend allocating to JFSC AML Handbook project (compliance support) or Cybersecurity Audit (vendor coordination).',
          impact: 'high',
        },
        {
          title: 'Over-allocation risk: Senior Fund Administrator (88%)',
          description:
            'Thomas Perchard at 88% during Q1 NAV period. If any ad-hoc JFSC filing requests occur, capacity will be exceeded. Recommend standby resource from Trust Services.',
          impact: 'medium',
        },
        {
          title: 'Skill gap: No dedicated ESG/Sustainability resource',
          description:
            'Jersey is implementing ESG reporting requirements for fund managers. Current team has no dedicated ESG expertise. Recommend upskilling Peter Coutanche (Data Analyst) or hiring.',
          impact: 'high',
        },
        {
          title: 'On-leave cover: Client Relationship Manager',
          description:
            'Natalie Bree (Client Services) currently on leave. No cover assigned. 3 HNW client reviews due in next 2 weeks. Recommend temporary assignment from Trust Services team.',
          impact: 'medium',
        },
        {
          title: 'Cross-training opportunity: KYC + Technology',
          description:
            'James Ahier (KYC Analyst) could benefit from training on the Digital KYC Platform being built by Sophie Le Maistre. Would create knowledge bridge between compliance and technology teams.',
          impact: 'low',
        },
      ],
    });
  };

  const handleAddResource = () => {
    if (!addName.trim()) return;
    const id = `rr${Date.now()}`;
    setResources(prev => [
      {
        id,
        name: addName.trim(),
        role: addRole || 'New Role',
        department: addDept,
        skills: addSkills
          ? addSkills
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
          : [],
        available_hours_week: 40,
        status: 'active',
        email: `${addName.trim().toLowerCase().replace(/\s+/g, '.')}@firm.je`,
      },
      ...prev,
    ]);
    setShowAdd(false);
    setAddName('');
    setAddRole('');
    setAddDept('Compliance');
    setAddSkills('');
  };

  const handleDeleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const buildPDFConfig = (): PDFReportOptions => ({
    title: 'Resource Planning & Team Utilisation Report',
    subtitle: `Dashboard export — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    module: 'Resource Planning',
    jurisdiction: 'Jersey, Channel Islands',
    classification: 'INTERNAL',
    sections: [
      {
        type: 'stats',
        stats: [
          {
            label: 'Total Resources',
            value: `${dash.activeResources}/${dash.totalResources} active`,
          },
          { label: 'Avg Utilisation', value: dash.avgUtilization + '%' },
          { label: 'Over-Allocated', value: String(dash.overAllocated) },
          { label: 'Under-Utilised', value: String(dash.idle) },
        ],
      },
      { type: 'heading', title: 'Team Utilisation' },
      {
        type: 'table',
        columns: [
          'Name',
          'Role',
          'Department',
          'Utilisation',
          'Allocated Hrs',
          'Available Hrs',
          'Status',
        ],
        rows: utilRows.map(r => [
          r.resource.name,
          r.resource.role,
          r.resource.department,
          r.utilization + '%',
          String(r.allocatedHours),
          String(r.availableHours),
          r.status.replace(/_/g, ' '),
        ]),
      },
      { type: 'heading', title: 'Department Utilisation' },
      {
        type: 'table',
        columns: ['Department', 'Utilisation %'],
        rows: dash.departmentUtilization.map(d => [d.department, d.utilization + '%']),
      },
      { type: 'heading', title: 'Active Allocations' },
      {
        type: 'table',
        columns: ['Resource', 'Project', 'Hours', 'Start', 'End', 'Status'],
        rows: allocations.map(a => {
          const r = resources.find(rr => rr.id === a.resource_id);
          return [
            r?.name || a.resource_id,
            a.project_name,
            String(a.allocated_hours),
            a.start_date,
            a.end_date,
            a.status,
          ];
        }),
      },
      ...(optimizations
        ? [
            { type: 'heading' as const, title: 'AI Optimisation Recommendations' },
            {
              type: 'text' as const,
              content:
                optimizations.summary +
                '\n\n' +
                optimizations.recommendations
                  .map((r, i) => `${i + 1}. ${r.title}\n   ${r.description}`)
                  .join('\n\n'),
            },
          ]
        : []),
    ],
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">
          Resource Planning
        </h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        <div className="flex items-center gap-4 app-region-no-drag">
          <span className="text-[11px] text-zinc-400">
            {dash.activeResources}/{dash.totalResources} active
          </span>
          <span className="text-[11px] text-zinc-400">{dash.avgUtilization}% avg util</span>
          {dash.overAllocated > 0 && (
            <span className="text-[11px] text-red-400">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              {dash.overAllocated} over-allocated
            </span>
          )}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 app-region-no-drag">
          <ExportButton getReportConfig={buildPDFConfig} label="Export PDF" compact />
          <button
            onClick={optimize}
            className="h-6 px-2.5 rounded-[5px] text-[11px] text-white/40 hover:text-white/60 hover:bg-white/[0.04] flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> Optimise
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Member
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 px-5 pt-3 pb-0">
        {(['overview', 'team', 'allocations'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-3 py-1.5 text-[11px] font-medium rounded-t capitalize',
              tab === t ? 'text-white bg-white/[0.06]' : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === 'overview' && (
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-4 gap-3">
              {[
                {
                  l: 'Total Staff',
                  v: dash.totalResources,
                  s: dash.activeResources + ' active',
                  c: 'text-indigo-400',
                  ic: Users,
                },
                {
                  l: 'Avg Utilisation',
                  v: dash.avgUtilization + '%',
                  s: 'Target: ' + dash.optimalRange,
                  c: 'text-emerald-400',
                  ic: BarChart3,
                },
                {
                  l: 'Over-Allocated',
                  v: dash.overAllocated,
                  s: 'Above 90% capacity',
                  c: dash.overAllocated > 0 ? 'text-red-400' : 'text-emerald-400',
                  ic: AlertTriangle,
                },
                {
                  l: 'Under-Utilised',
                  v: dash.idle,
                  s: 'Below 30% capacity',
                  c: dash.idle > 0 ? 'text-amber-400' : 'text-emerald-400',
                  ic: Clock,
                },
              ].map(card => (
                <div
                  key={card.l}
                  className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
                      {card.l}
                    </span>
                    <card.ic className={cn('w-4 h-4', card.c)} />
                  </div>
                  <div className={cn('text-[22px] font-semibold tabular-nums', card.c)}>
                    {card.v}
                  </div>
                  <span className="text-[11px] text-zinc-600">{card.s}</span>
                </div>
              ))}
            </div>

            {/* Utilisation bars */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 space-y-2">
              <h3 className="text-[12px] font-medium text-white/70 mb-2">Team Utilisation</h3>
              {utilRows.map(r => (
                <div key={r.resource.id} className="flex items-center gap-3">
                  <span className="text-[11px] text-white/60 w-36 truncate">{r.resource.name}</span>
                  <span className="text-[10px] text-zinc-600 w-28 truncate">{r.resource.role}</span>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', UTIL_BAR(r.utilization))}
                      style={{ width: r.utilization + '%' }}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-[11px] font-medium tabular-nums w-10 text-right',
                      UTIL_COLOR(r.utilization)
                    )}
                  >
                    {r.utilization}%
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">
                  Department Utilisation
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dash.departmentUtilization}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis dataKey="department" tick={{ fill: '#71717a', fontSize: 9 }} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: '#0a0a0a',
                        border: '1px solid #27272a',
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                    />
                    <Bar dataKey="utilization" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Top Skills</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={dash.topSkills.map(s => ({ name: s.skill, value: s.count }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {dash.topSkills.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#0a0a0a',
                        border: '1px solid #27272a',
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {optimizations && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-[12px] font-medium text-white/70">
                    AI Optimisation Recommendations
                  </span>
                </div>
                <p className="text-[12px] text-zinc-400">{optimizations.summary}</p>
                {optimizations.recommendations.map((r: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 py-1">
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                        r.impact === 'high'
                          ? 'bg-red-500'
                          : r.impact === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                      )}
                    />
                    <div>
                      <span className="text-[12px] text-white/60">{r.title}</span>
                      <p className="text-[11px] text-zinc-500">{r.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'team' && (
          <div className="p-5 space-y-2">
            {resources.map(r => (
              <div key={r.id} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-white/80">{r.name}</span>
                      <span
                        className={cn(
                          'text-[9px] px-1.5 py-0.5 rounded capitalize',
                          r.status === 'active'
                            ? 'bg-emerald-900/30 text-emerald-400'
                            : 'bg-amber-900/30 text-amber-400'
                        )}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] text-zinc-500">{r.role}</span>
                      <span className="text-[10px] text-zinc-600">{r.department}</span>
                      <span className="text-[10px] text-zinc-700">
                        {r.available_hours_week}h/week
                      </span>
                    </div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {r.skills.map(s => (
                        <span
                          key={s}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteResource(r.id)}
                    className="p-1.5 hover:bg-red-900/20 rounded self-start"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400/40 hover:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'allocations' && (
          <div className="p-5 space-y-2">
            {allocations.map(a => {
              const res = resources.find(r => r.id === a.resource_id);
              return (
                <div key={a.id} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-white/80">
                          {a.project_name}
                        </span>
                        <span
                          className={cn(
                            'text-[9px] px-1.5 py-0.5 rounded capitalize',
                            a.status === 'active'
                              ? 'bg-emerald-900/30 text-emerald-400'
                              : 'bg-zinc-800 text-zinc-400'
                          )}
                        >
                          {a.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {res && (
                          <span className="text-[11px] text-zinc-500">
                            {res.name} — {res.role}
                          </span>
                        )}
                        <span className="text-[10px] text-indigo-400">
                          {a.allocated_hours}h/week
                        </span>
                        <span className="text-[10px] text-zinc-700">
                          {a.start_date} \u2192 {a.end_date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAdd && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-[#111] border border-white/[0.08] rounded-xl p-5 w-[440px] space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-medium text-white">Add Team Member</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="p-1 hover:bg-white/[0.06] rounded"
              >
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Full Name</label>
              <input
                value={addName}
                onChange={e => setAddName(e.target.value)}
                placeholder="Name..."
                className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Role</label>
              <input
                value={addRole}
                onChange={e => setAddRole(e.target.value)}
                placeholder="Job title..."
                className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Department</label>
              <select
                value={addDept}
                onChange={e => setAddDept(e.target.value)}
                className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none"
              >
                <option value="Compliance">Compliance</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Legal">Legal</option>
                <option value="HR">HR</option>
                <option value="Fund Services">Fund Services</option>
                <option value="Trust Services">Trust Services</option>
                <option value="Client Services">Client Services</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase mb-1 block">
                Skills (comma-separated)
              </label>
              <input
                value={addSkills}
                onChange={e => setAddSkills(e.target.value)}
                placeholder="AML/CFT, JFSC Regulation..."
                className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowAdd(false)}
                className="h-7 px-3 rounded-md text-[11px] text-zinc-500 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddResource}
                disabled={!addName.trim()}
                className="h-7 px-4 rounded-md text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
