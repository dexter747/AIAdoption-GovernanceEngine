import { useState } from 'react';
import {
  FolderKanban, Sparkles, AlertTriangle,
  Plus, CheckCircle2, Target,
  Bug, Lightbulb, Trash2, X,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA — Project Intelligence & Portfolio Management (Jersey)
   ═══════════════════════════════════════════════════════════════════════════ */

interface Project { id: string; name: string; description: string; status: string; priority: string; start_date: string; target_end_date: string; budget: number; spent: number; health_score: number; tags: string[]; created_at: string }
interface Task { id: string; title: string; status: string; priority: string; assignee?: string; due_date?: string; estimated_hours?: number; actual_hours?: number }
interface Risk { id: string; title: string; description: string; category: string; likelihood: string; impact: string; status: string; mitigation?: string; ai_detected: boolean }
interface Insight { id: string; type: string; severity: string; title: string; body: string; created_at: string }
interface DashStats { totalProjects: number; activeProjects: number; avgHealth: number; totalTasks: number; completedTasks: number; blockedTasks: number; overdueTasks: number; openRisks: number; criticalRisks: number; recentInsights: Insight[]; projectsByStatus: Record<string, number>; tasksByStatus: Record<string, number> }

const MOCK_PROJECTS: Project[] = [
  { id: 'pp1', name: 'Digital KYC Platform', description: 'Build a Jersey-compliant digital KYC/CDD onboarding platform with AI-powered document verification and JFSC electronic identity verification standards.', status: 'in_progress', priority: 'high', start_date: '2026-01-15', target_end_date: '2026-06-30', budget: 420000, spent: 185000, health_score: 82, tags: ['kyc', 'digital', 'jfsc', 'ai'], created_at: '2025-12-01T10:00:00Z' },
  { id: 'pp2', name: 'JFSC AML/CFT Handbook Compliance', description: 'Comprehensive review and implementation of updated JFSC AML/CFT Handbook requirements including new 10% beneficial ownership threshold.', status: 'in_progress', priority: 'critical', start_date: '2026-02-15', target_end_date: '2026-04-01', budget: 95000, spent: 42000, health_score: 68, tags: ['aml', 'compliance', 'jfsc', 'handbook'], created_at: '2026-02-10T09:00:00Z' },
  { id: 'pp3', name: 'Cybersecurity Audit & Remediation', description: 'Annual cybersecurity assessment including penetration testing, SOC review, and alignment with JFSC Cyber Security guidance note.', status: 'in_progress', priority: 'high', start_date: '2026-03-01', target_end_date: '2026-04-15', budget: 135000, spent: 28000, health_score: 91, tags: ['cybersecurity', 'audit', 'jfsc'], created_at: '2026-02-15T10:00:00Z' },
  { id: 'pp4', name: 'Economic Substance Compliance', description: 'Review Jersey-resident entity substance arrangements ahead of updated Economic Substance (Jersey) Law guidance effective July 2026.', status: 'planning', priority: 'high', start_date: '2026-04-01', target_end_date: '2026-06-30', budget: 65000, spent: 0, health_score: 75, tags: ['economic-substance', 'tax', 'jersey-law'], created_at: '2026-03-01T10:00:00Z' },
  { id: 'pp5', name: 'MONEYVAL Follow-Up Response', description: 'Prepare Jersey industry response to MONEYVAL 5th Round follow-up report. Address VASP supervision gaps and BO register access.', status: 'in_progress', priority: 'medium', start_date: '2026-03-01', target_end_date: '2026-05-31', budget: 45000, spent: 12000, health_score: 78, tags: ['moneyval', 'fatf', 'international'], created_at: '2026-02-28T10:00:00Z' },
  { id: 'pp6', name: 'Office Relocation — Royal Square', description: 'Relocate main operations to new Royal Square, St Helier office. IT infrastructure, security systems, and JFSC registered office change.', status: 'in_progress', priority: 'medium', start_date: '2026-03-01', target_end_date: '2026-05-31', budget: 280000, spent: 95000, health_score: 85, tags: ['operations', 'facilities', 'st-helier'], created_at: '2026-01-20T10:00:00Z' },
  { id: 'pp7', name: 'Client Reporting Automation', description: 'Automate quarterly client reporting for fund administration and trust services including NAV reporting and JFSC regulatory submissions.', status: 'completed', priority: 'medium', start_date: '2025-09-01', target_end_date: '2026-01-31', budget: 180000, spent: 172000, health_score: 96, tags: ['automation', 'reporting', 'fund-admin'], created_at: '2025-08-15T10:00:00Z' },
  { id: 'pp8', name: 'Data Protection Impact Assessment', description: 'Comprehensive DPIA for all AI/ML processing activities following JDPA enforcement precedent. Covers cross-border transfers and automated decision-making.', status: 'planning', priority: 'high', start_date: '2026-04-15', target_end_date: '2026-06-15', budget: 35000, spent: 0, health_score: 70, tags: ['data-protection', 'jdpa', 'ai', 'dpia'], created_at: '2026-03-05T10:00:00Z' },
];

const MOCK_TASKS: Task[] = [
  { id: 'pt1', title: 'Design Jersey eKYC verification flow', status: 'completed', priority: 'high', assignee: 'Sophie Le Maistre', due_date: '2026-02-15', estimated_hours: 40, actual_hours: 38 },
  { id: 'pt2', title: 'Integrate JFSC company registry API', status: 'completed', priority: 'high', assignee: 'Sophie Le Maistre', due_date: '2026-03-01', estimated_hours: 60, actual_hours: 65 },
  { id: 'pt3', title: 'Build AI document verification module', status: 'in_progress', priority: 'high', assignee: 'David Le Cornu', due_date: '2026-04-15', estimated_hours: 80, actual_hours: 35 },
  { id: 'pt4', title: 'Implement sanctions screening integration', status: 'in_progress', priority: 'critical', assignee: 'James Ahier', due_date: '2026-04-01', estimated_hours: 40, actual_hours: 18 },
  { id: 'pt5', title: 'Build client onboarding dashboard UI', status: 'in_progress', priority: 'medium', assignee: 'Sophie Le Maistre', due_date: '2026-04-30', estimated_hours: 50, actual_hours: 12 },
  { id: 'pt6', title: 'JFSC compliance testing & sign-off', status: 'not_started', priority: 'critical', assignee: 'Claire de la Haye', due_date: '2026-05-31', estimated_hours: 30 },
  { id: 'pt7', title: 'PEP & adverse media screening module', status: 'not_started', priority: 'high', assignee: 'James Ahier', due_date: '2026-05-15', estimated_hours: 35 },
  { id: 'pt8', title: 'UAT with Jersey trust company clients', status: 'not_started', priority: 'medium', assignee: 'Natalie Bree', due_date: '2026-06-15', estimated_hours: 25 },
  { id: 'pt9', title: 'Production deployment & monitoring setup', status: 'not_started', priority: 'high', assignee: 'David Le Cornu', due_date: '2026-06-25', estimated_hours: 20 },
  { id: 'pt10', title: 'Staff training & documentation', status: 'blocked', priority: 'medium', assignee: 'Emma Journeaux', due_date: '2026-06-30', estimated_hours: 15 },
];

const MOCK_RISKS: Risk[] = [
  { id: 'pr1', title: 'JFSC regulatory approval delay', description: 'JFSC may require extended review period for AI-powered identity verification. Could delay Q2 launch by 4-6 weeks.', category: 'regulatory', likelihood: 'medium', impact: 'high', status: 'open', mitigation: 'Engage JFSC Innovation Hub early. Submit pre-application briefing by mid-March.', ai_detected: true },
  { id: 'pr2', title: 'Jersey company registry API instability', description: 'JFSC digital registry migration (Sept 2026) may cause API downtime during development.', category: 'technical', likelihood: 'low', impact: 'medium', status: 'mitigated', mitigation: 'Build local cache/fallback. Test against sandbox environment.', ai_detected: false },
  { id: 'pr3', title: 'Data protection compliance gap', description: 'AI document verification may process biometric data. JDPA requires explicit consent and DPIA for biometric processing.', category: 'compliance', likelihood: 'high', impact: 'high', status: 'open', mitigation: 'Commission DPIA (see Project PP8). Implement consent management before biometric features go live.', ai_detected: true },
  { id: 'pr4', title: 'Resource constraint — Key developer leave', description: 'Sophie Le Maistre is sole front-end developer. If unavailable for >2 weeks, sprint delivery will be impacted.', category: 'resource', likelihood: 'low', impact: 'high', status: 'open', mitigation: 'Cross-train Peter Coutanche on React front-end. Maintain contractor shortlist via C5 Alliance.', ai_detected: true },
  { id: 'pr5', title: 'Budget overrun on API integrations', description: 'Third-party API costs (sanctions screening, document verification) may exceed budget if transaction volumes are higher than forecast.', category: 'financial', likelihood: 'medium', impact: 'medium', status: 'monitoring', mitigation: 'Set API rate limits. Negotiate volume pricing tiers with vendors.', ai_detected: false },
];

const MOCK_INSIGHTS: Insight[] = [
  { id: 'pi1', type: 'schedule', severity: 'high', title: 'JFSC compliance testing may slip', body: 'Based on current velocity, AI document verification module is tracking 2 weeks behind. This creates a cascading delay for JFSC compliance testing.', created_at: '2026-03-10T09:00:00Z' },
  { id: 'pi2', type: 'risk', severity: 'critical', title: 'New JDPA enforcement creates compliance dependency', body: 'The recent JDPA enforcement action means our DPIA project (PP8) is now a hard dependency for Digital KYC go-live. Biometric document verification cannot launch without DPIA approval.', created_at: '2026-03-05T08:00:00Z' },
  { id: 'pi3', type: 'cost', severity: 'medium', title: 'Budget utilisation at 44% with 37% timeline elapsed', body: 'Healthy budget trajectory. 185k of 420k spent (44%) against 37% timeline completion. Current burn rate projects 380k total — 40k under budget.', created_at: '2026-03-08T10:00:00Z' },
  { id: 'pi4', type: 'quality', severity: 'low', title: 'Code quality metrics improving', body: 'Test coverage increased from 62% to 78% this sprint. Zero critical bugs in staging. TypeScript strict mode enabled across all modules.', created_at: '2026-03-07T14:00:00Z' },
];

const MOCK_STATS: DashStats = {
  totalProjects: 8,
  activeProjects: 5,
  avgHealth: 81,
  totalTasks: 10,
  completedTasks: 2,
  blockedTasks: 1,
  overdueTasks: 0,
  openRisks: 3,
  criticalRisks: 1,
  recentInsights: [
    { id: 'pi1', type: 'schedule', severity: 'high', title: 'JFSC compliance testing may slip', body: 'AI document verification module is tracking 2 weeks behind, creating a cascading delay.', created_at: '2026-03-10T09:00:00Z' },
    { id: 'pi2', type: 'risk', severity: 'critical', title: 'JDPA enforcement creates new dependency', body: 'DPIA project is now a hard dependency for Digital KYC go-live.', created_at: '2026-03-05T08:00:00Z' },
    { id: 'pi3', type: 'cost', severity: 'medium', title: 'Budget on track — 44% spent at 37% timeline', body: 'Healthy trajectory projecting 40k under budget.', created_at: '2026-03-08T10:00:00Z' },
  ],
  projectsByStatus: { in_progress: 5, planning: 2, completed: 1 },
  tasksByStatus: { completed: 2, in_progress: 3, not_started: 4, blocked: 1 },
};

const STATUS_COLORS: Record<string, string> = {
  in_progress: 'bg-blue-900/30 text-blue-400',
  planning: 'bg-amber-900/30 text-amber-400',
  completed: 'bg-emerald-900/30 text-emerald-400',
  not_started: 'bg-zinc-800 text-zinc-400',
  blocked: 'bg-red-900/30 text-red-400',
  open: 'bg-amber-900/30 text-amber-400',
  mitigated: 'bg-emerald-900/30 text-emerald-400',
  monitoring: 'bg-blue-900/30 text-blue-400',
};
const PRIORITY_BADGE: Record<string, string> = { critical: 'text-red-400', high: 'text-amber-400', medium: 'text-blue-400', low: 'text-zinc-400' };
const HEALTH_COLOR = (h: number) => h >= 85 ? 'text-emerald-400' : h >= 70 ? 'text-amber-400' : 'text-red-400';
const COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];
interface ProjectAnalysis { healthSummary: string; budgetAnalysis: string; scheduleAnalysis: string; riskSummary: string; recommendations: string[] }

export default function ProjectIntelPage() {
  const [view, setView] = useState<'dashboard' | 'project'>('dashboard');
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [risks] = useState<Risk[]>(MOCK_RISKS);
  const [insights] = useState<Insight[]>(MOCK_INSIGHTS);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ProjectAnalysis | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [addBudget, setAddBudget] = useState('');
  const [addPriority, setAddPriority] = useState('medium');

  const stats = MOCK_STATS;

  const runAnalysis = (project: Project) => {
    setAnalyzing(true);
    setTimeout(() => {
      const budgetPct = Math.round(project.spent / project.budget * 100);
      setAnalysisResult({
        healthSummary: `Project "${project.name}" health score: ${project.health_score}/100. ${project.health_score >= 85 ? 'On track.' : project.health_score >= 70 ? 'Minor concerns — attention needed.' : 'At risk — immediate intervention required.'}`,
        budgetAnalysis: `Budget: £${project.spent.toLocaleString()} of £${project.budget.toLocaleString()} spent (${budgetPct}%). ${budgetPct > 80 ? 'Approaching budget limit.' : 'Within healthy range.'}`,
        scheduleAnalysis: `Timeline: ${project.status === 'completed' ? 'Delivered.' : `Target: ${project.target_end_date}. ${project.health_score >= 80 ? 'On track for timely delivery.' : 'At risk of slipping — recommend sprint reprioritisation.'}`}`,
        riskSummary: `${risks.filter(r => r.status === 'open').length} open risks identified. ${risks.filter(r => r.ai_detected).length} were AI-detected.`,
        recommendations: [
          'Prioritise JFSC compliance testing to de-risk regulatory approval timeline',
          'Initiate DPIA project (PP8) immediately — now a hard dependency for go-live',
          'Cross-train backup developer on React front-end to mitigate key-person risk',
          'Schedule mid-project JFSC Innovation Hub engagement for early regulatory feedback',
        ],
      });
      setAnalyzing(false);
    }, 800);
  };

  const handleAddProject = () => {
    if (!addName.trim()) return;
    const id = `pp${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);
    setProjects(prev => [{
      id, name: addName.trim(), description: addDesc || 'New project',
      status: 'planning', priority: addPriority,
      start_date: today, target_end_date: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      budget: parseFloat(addBudget) || 0, spent: 0, health_score: 75,
      tags: [], created_at: new Date().toISOString(),
    }, ...prev]);
    setShowAdd(false); setAddName(''); setAddDesc(''); setAddBudget(''); setAddPriority('medium');
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (selectedProject?.id === id) { setSelectedProject(null); setView('dashboard'); setAnalysisResult(null); }
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next: Record<string, string> = { not_started: 'in_progress', in_progress: 'completed', completed: 'not_started', blocked: 'in_progress' };
      return { ...t, status: next[t.status] || 'not_started' };
    }));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">
          Project Intelligence
        </h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        {view === 'project' && selectedProject && (
          <button
            onClick={() => { setView('dashboard'); setSelectedProject(null); setAnalysisResult(null); }}
            className="text-[11px] text-zinc-400 hover:text-white app-region-no-drag"
          >
            ← Back
          </button>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-2 app-region-no-drag">
          {stats.blockedTasks > 0 && (
            <span className="text-[11px] text-red-400">
              <AlertTriangle className="w-3 h-3 inline mr-1" />{stats.blockedTasks} blocked
            </span>
          )}
          {stats.openRisks > 0 && (
            <span className="text-[11px] text-amber-400">
              <Bug className="w-3 h-3 inline mr-1" />{stats.openRisks} risks
            </span>
          )}
          <button onClick={() => setShowAdd(true)} className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1">
            <Plus className="w-3 h-3" /> New Project
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
                { l: 'Projects', v: stats.totalProjects, s: `${stats.activeProjects} active`, c: 'text-indigo-400', ic: FolderKanban },
                { l: 'Avg Health', v: `${stats.avgHealth}%`, s: 'Portfolio score', c: HEALTH_COLOR(stats.avgHealth), ic: Target },
                { l: 'Tasks', v: stats.totalTasks, s: `${stats.completedTasks} completed`, c: 'text-blue-400', ic: CheckCircle2 },
                { l: 'Open Risks', v: stats.openRisks, s: `${stats.criticalRisks} critical`, c: stats.openRisks > 0 ? 'text-amber-400' : 'text-emerald-400', ic: AlertTriangle },
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

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Projects by Status</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.projectsByStatus).map(([k, v]) => ({ name: k.replace(/_/g, ' '), value: v }))}
                      cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value" paddingAngle={3}
                    >
                      {Object.entries(stats.projectsByStatus).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Tasks by Status</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={Object.entries(stats.tasksByStatus).map(([k, v]) => ({ name: k.replace(/_/g, ' '), count: v }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Project List */}
            <div className="space-y-2">
              <h3 className="text-[12px] font-medium text-white/70">All Projects</h3>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProject(p); setView('project'); setAnalysisResult(null); }}
                  className="w-full text-left rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 hover:border-white/[0.1] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-white/80">{p.name}</span>
                        <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', STATUS_COLORS[p.status] || STATUS_COLORS.planning)}>
                          {p.status.replace(/_/g, ' ')}
                        </span>
                        <span className={cn('text-[10px] capitalize', PRIORITY_BADGE[p.priority])}>{p.priority}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{p.description}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-zinc-600">£{p.budget.toLocaleString()} budget</span>
                        <span className="text-[10px] text-zinc-700">{p.start_date} → {p.target_end_date}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className={cn('text-[18px] font-semibold tabular-nums', HEALTH_COLOR(p.health_score))}>
                        {p.health_score}
                      </span>
                      <span className="text-[9px] text-zinc-600">health</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Recent Insights */}
            {stats.recentInsights.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-indigo-400" />
                  <span className="text-[12px] font-medium text-white/70">Recent AI Insights</span>
                </div>
                {stats.recentInsights.map(ins => (
                  <div key={ins.id} className="flex items-start gap-2 py-1">
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                      ins.severity === 'critical' ? 'bg-red-500' : ins.severity === 'high' ? 'bg-amber-500' : ins.severity === 'medium' ? 'bg-blue-500' : 'bg-zinc-500',
                    )} />
                    <div>
                      <span className="text-[12px] text-white/60">{ins.title}</span>
                      <p className="text-[11px] text-zinc-500">{ins.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ──── Project Detail View ──── */}
        {view === 'project' && selectedProject && (
          <div className="p-5 space-y-4">
            {/* Header Card */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-semibold text-white/90">{selectedProject.name}</h2>
                    <button onClick={() => handleDeleteProject(selectedProject.id)} className="p-1 hover:bg-red-900/20 rounded" title="Delete project"><Trash2 className="w-3.5 h-3.5 text-red-400/50 hover:text-red-400" /></button>
                  </div>
                  <p className="text-[12px] text-zinc-400 mt-0.5">{selectedProject.description}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={cn('text-[24px] font-bold tabular-nums', HEALTH_COLOR(selectedProject.health_score))}>
                    {selectedProject.health_score}
                  </span>
                  <span className="text-[9px] text-zinc-600">health score</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { l: 'Status', v: selectedProject.status.replace(/_/g, ' ') },
                  { l: 'Priority', v: selectedProject.priority },
                  { l: 'Start', v: selectedProject.start_date },
                  { l: 'Target End', v: selectedProject.target_end_date },
                ].map(f => (
                  <div key={f.l}>
                    <span className="text-[10px] text-zinc-600 uppercase">{f.l}</span>
                    <div className="text-[13px] text-white/70 capitalize">{f.v}</div>
                  </div>
                ))}
              </div>

              {/* Budget Bar */}
              <div>
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>£{selectedProject.spent.toLocaleString()} spent</span>
                  <span>£{selectedProject.budget.toLocaleString()} budget</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      selectedProject.spent / selectedProject.budget > 0.9 ? 'bg-red-500'
                        : selectedProject.spent / selectedProject.budget > 0.7 ? 'bg-amber-500'
                        : 'bg-indigo-500',
                    )}
                    style={{ width: `${Math.min(100, Math.round(selectedProject.spent / selectedProject.budget * 100))}%` }}
                  />
                </div>
              </div>

              {/* Tags */}
              {selectedProject.tags && (
                <div className="flex gap-1 flex-wrap">
                  {selectedProject.tags.map(t => (
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
                  <span className="text-[12px] font-medium text-white/70">AI Project Analysis</span>
                </div>
                <button
                  onClick={() => runAnalysis(selectedProject)}
                  disabled={analyzing}
                  className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 flex items-center gap-1"
                >
                  {analyzing ? 'Analysing…' : 'Run Analysis'}
                </button>
              </div>
              {analysisResult && (
                <div className="space-y-2">
                  <p className="text-[12px] text-zinc-400">{analysisResult.healthSummary}</p>
                  <p className="text-[11px] text-zinc-500">{analysisResult.budgetAnalysis}</p>
                  <p className="text-[11px] text-zinc-500">{analysisResult.scheduleAnalysis}</p>
                  <p className="text-[11px] text-zinc-500">{analysisResult.riskSummary}</p>
                  {analysisResult.recommendations && (
                    <div className="space-y-1 mt-2">
                      <h4 className="text-[11px] font-medium text-white/60">Recommendations</h4>
                      {analysisResult.recommendations.map((r: string, i: number) => (
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

            {/* Tasks */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 space-y-2">
              <h3 className="text-[12px] font-medium text-white/70 mb-1">Tasks ({tasks.length})</h3>
              {tasks.map(t => (
                <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0 cursor-pointer" onClick={() => handleToggleTask(t.id)} title="Click to cycle status">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', STATUS_COLORS[t.status] || STATUS_COLORS.not_started)}>
                      {t.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[12px] text-white/70 truncate">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {t.assignee && <span className="text-[10px] text-zinc-600">{t.assignee}</span>}
                    <span className={cn('text-[10px] capitalize', PRIORITY_BADGE[t.priority])}>{t.priority}</span>
                    {t.due_date && <span className="text-[10px] text-zinc-700">{t.due_date}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Risks */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 space-y-2">
              <h3 className="text-[12px] font-medium text-white/70 mb-1">Risks ({risks.length})</h3>
              {risks.map(r => (
                <div key={r.id} className="py-1.5 border-b border-white/[0.03] last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', STATUS_COLORS[r.status] || STATUS_COLORS.open)}>
                      {r.status}
                    </span>
                    <span className="text-[12px] text-white/70">{r.title}</span>
                    {r.ai_detected && (
                      <span className="text-[9px] text-indigo-400 border border-indigo-400/30 px-1 rounded">AI</span>
                    )}
                    <span className="text-[10px] text-zinc-600 ml-auto capitalize">{r.likelihood}/{r.impact}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{r.description}</p>
                  {r.mitigation && (
                    <p className="text-[10px] text-emerald-400/60 mt-0.5">Mitigation: {r.mitigation}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Insights */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-indigo-400" />
                <span className="text-[12px] font-medium text-white/70">AI Insights</span>
              </div>
              {insights.map(ins => (
                <div key={ins.id} className="flex items-start gap-2 py-1">
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                    ins.severity === 'critical' ? 'bg-red-500' : ins.severity === 'high' ? 'bg-amber-500' : ins.severity === 'medium' ? 'bg-blue-500' : 'bg-zinc-500',
                  )} />
                  <div>
                    <span className="text-[12px] text-white/60">{ins.title}</span>
                    <span className="text-[10px] text-zinc-600 ml-2 capitalize">{ins.type}</span>
                    <p className="text-[11px] text-zinc-500">{ins.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5 w-[440px] space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-medium text-white">New Project</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-white/[0.06] rounded"><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Project Name</label>
              <input value={addName} onChange={e => setAddName(e.target.value)} placeholder="Project name..." className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Description</label>
              <textarea value={addDesc} onChange={e => setAddDesc(e.target.value)} placeholder="Project description..." className="w-full h-20 px-3 py-2 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Budget (GBP)</label>
                <input value={addBudget} onChange={e => setAddBudget(e.target.value)} placeholder="0" type="number" className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Priority</label>
                <select value={addPriority} onChange={e => setAddPriority(e.target.value)} className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowAdd(false)} className="h-7 px-3 rounded-md text-[11px] text-zinc-500 hover:text-white">Cancel</button>
              <button onClick={handleAddProject} disabled={!addName.trim()} className="h-7 px-4 rounded-md text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30">Create Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
