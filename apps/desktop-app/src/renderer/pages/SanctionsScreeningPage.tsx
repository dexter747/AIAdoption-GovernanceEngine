import { useState, useMemo } from 'react';
import {
  Search, AlertTriangle, CheckCircle2, Shield, Eye,
  ChevronDown, ChevronRight, ExternalLink, Clock, User,
  Globe, FileText, XCircle, Filter, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { cn } from '../lib/utils';
import ExportButton from '../components/ui/ExportButton';
import type { PDFReportOptions } from '../lib/pdfExport';

/* ═══════════════════════════════════════════════════════════════════════════
   OPENSANCTIONS / REAL-TIME SCREENING INTEGRATION
   Entity screening against consolidated sanctions, PEP & enforcement lists.
   Data sources modelled: OpenSanctions, UN CSCL, OFSI, EU Consolidated,
   OFAC SDN, JFSC Local List. Aligned with JFSC AML/CFT Handbook,
   FATF Recommendation 6/7, and EU 5th/6th Anti-Money Laundering Directives.
   ═══════════════════════════════════════════════════════════════════════════ */

type MatchResult = 'confirmed' | 'potential' | 'cleared' | 'pending_review';
type ListSource = 'opensanctions' | 'un_cscl' | 'ofsi' | 'eu_consolidated' | 'ofac_sdn' | 'jfsc_local';

interface ScreeningResult {
  id: string;
  entityName: string;
  entityType: 'individual' | 'organization' | 'vessel' | 'aircraft';
  clientRef: string;
  screenedDate: string;
  matchScore: number;
  matchResult: MatchResult;
  matchedName: string;
  matchedList: ListSource;
  datasets: ListSource[];
  nationality: string;
  aliases: string[];
  reasons: string[];
  riskLevel: 'high' | 'medium' | 'low';
  notes: string;
  reviewedBy?: string;
  reviewDate?: string;
}

interface ScreeningStats {
  totalScreened: number;
  matches: number;
  cleared: number;
  pendingReview: number;
  avgMatchTime: string;
}

const RESULT_CLR: Record<MatchResult, string> = {
  confirmed: 'text-red-400 bg-red-400/10',
  potential: 'text-amber-400 bg-amber-400/10',
  cleared: 'text-emerald-400 bg-emerald-400/10',
  pending_review: 'text-blue-400 bg-blue-400/10',
};

const LIST_LABELS: Record<ListSource, string> = {
  opensanctions: 'OpenSanctions',
  un_cscl: 'UN CSCL',
  ofsi: 'OFSI (UK)',
  eu_consolidated: 'EU Consolidated',
  ofac_sdn: 'OFAC SDN',
  jfsc_local: 'JFSC Local',
};

const LIST_COLORS: Record<ListSource, string> = {
  opensanctions: '#6366f1',
  un_cscl: '#3b82f6',
  ofsi: '#f59e0b',
  eu_consolidated: '#10b981',
  ofac_sdn: '#ef4444',
  jfsc_local: '#8b5cf6',
};

const MOCK_RESULTS: ScreeningResult[] = [
  {
    id: 'scr-001', entityName: 'Mikhail Petrov Holdings Ltd', entityType: 'organization',
    clientRef: 'CLT-2024-0847', screenedDate: '2026-02-22T09:15:00Z', matchScore: 94,
    matchResult: 'confirmed', matchedName: 'Mikhail S. Petrov Holdings Limited',
    matchedList: 'ofsi', datasets: ['ofsi', 'eu_consolidated', 'opensanctions'],
    nationality: 'Russia', aliases: ['Petrov Holdings International', 'MSP Holdings GmbH'],
    reasons: ['UK Sanctions — Russia (Sanctions) Regulations 2019', 'EU Council Decision 2014/145/CFSP'],
    riskLevel: 'high',
    notes: 'Confirmed match. Full name match with registered entity. Client relationship frozen pending enhanced review.',
    reviewedBy: 'J. Dupont (Compliance)', reviewDate: '2026-02-22',
  },
  {
    id: 'scr-002', entityName: 'Ahmad Al-Rashid', entityType: 'individual',
    clientRef: 'CLT-2025-1203', screenedDate: '2026-02-22T10:30:00Z', matchScore: 78,
    matchResult: 'potential', matchedName: 'Ahmad Al-Rashid bin Mohammed',
    matchedList: 'un_cscl', datasets: ['un_cscl', 'opensanctions'],
    nationality: 'UAE', aliases: ['Abu Ahmad', 'Ahmad Mohammed Al-Rashid'],
    reasons: ['UN Security Council Resolution 1267 — Listed individual'],
    riskLevel: 'high',
    notes: 'Partial name match. DOB discrepancy (1974 vs 1978). Awaiting enhanced identity verification.',
  },
  {
    id: 'scr-003', entityName: 'Evergreen Maritime Solutions SA', entityType: 'organization',
    clientRef: 'CLT-2024-0391', screenedDate: '2026-02-21T14:20:00Z', matchScore: 62,
    matchResult: 'pending_review', matchedName: 'Evergreen Marine Trading SA',
    matchedList: 'ofac_sdn', datasets: ['ofac_sdn', 'opensanctions'],
    nationality: 'Panama', aliases: ['Evergreen Shipping', 'EMS Panama SA'],
    reasons: ['OFAC SDN — Narcotics trafficking designation'],
    riskLevel: 'medium',
    notes: 'Similar company name but different registration number. Industry overlap (maritime). Escalated for manual review.',
  },
  {
    id: 'scr-004', entityName: 'Jersey Heritage Trust', entityType: 'organization',
    clientRef: 'CLT-2023-0112', screenedDate: '2026-02-22T08:00:00Z', matchScore: 12,
    matchResult: 'cleared', matchedName: 'N/A',
    matchedList: 'opensanctions', datasets: ['opensanctions', 'ofsi', 'eu_consolidated', 'ofac_sdn', 'jfsc_local'],
    nationality: 'Jersey', aliases: [],
    reasons: [],
    riskLevel: 'low',
    notes: 'No matches found across all 6 screening databases. Annual re-screening scheduled.',
    reviewedBy: 'System (Auto-cleared)', reviewDate: '2026-02-22',
  },
  {
    id: 'scr-005', entityName: 'Natasha Volkov', entityType: 'individual',
    clientRef: 'CLT-2025-0654', screenedDate: '2026-02-20T16:45:00Z', matchScore: 85,
    matchResult: 'confirmed', matchedName: 'Natasha Ivanovna Volkov',
    matchedList: 'eu_consolidated', datasets: ['eu_consolidated', 'ofsi', 'opensanctions'],
    nationality: 'Russia', aliases: ['N. Volkova', 'Natasha Volkov-Berezin'],
    reasons: ['EU Council Regulation 269/2014 — Asset freeze', 'Associated with sanctioned financial institution'],
    riskLevel: 'high',
    notes: 'Confirmed PEP and sanctions match. Former deputy director of state-affiliated bank. All transactions blocked.',
    reviewedBy: 'M. Laurent (Senior Compliance)', reviewDate: '2026-02-21',
  },
  {
    id: 'scr-006', entityName: 'Chen Wei International Trading', entityType: 'organization',
    clientRef: 'CLT-2025-0901', screenedDate: '2026-02-22T11:10:00Z', matchScore: 45,
    matchResult: 'cleared', matchedName: 'Chen Wei Military Electronics Ltd',
    matchedList: 'ofac_sdn', datasets: ['ofac_sdn', 'opensanctions'],
    nationality: 'Hong Kong', aliases: ['CW Trading HK'],
    reasons: [],
    riskLevel: 'low',
    notes: 'Name similarity only. Different industry sector (textiles vs electronics). Different registered address. Cleared after investigation.',
    reviewedBy: 'K. Perrot (Analyst)', reviewDate: '2026-02-22',
  },
  {
    id: 'scr-007', entityName: 'MV Ocean Pioneer', entityType: 'vessel',
    clientRef: 'VES-2025-0034', screenedDate: '2026-02-21T09:30:00Z', matchScore: 91,
    matchResult: 'confirmed', matchedName: 'MV Ocean Pioneer (IMO: 9432871)',
    matchedList: 'ofsi', datasets: ['ofsi', 'opensanctions', 'un_cscl'],
    nationality: 'Liberia', aliases: ['Ocean Pioneer', 'ex-Star Voyager'],
    reasons: ['OFSI — Vessel designated under Iran sanctions regime', 'IMO number match confirmed'],
    riskLevel: 'high',
    notes: 'IMO number exact match. Vessel flagged for illicit ship-to-ship oil transfers. Client notified of designation.',
    reviewedBy: 'J. Dupont (Compliance)', reviewDate: '2026-02-21',
  },
  {
    id: 'scr-008', entityName: 'Pierre Leclerc', entityType: 'individual',
    clientRef: 'CLT-2024-0445', screenedDate: '2026-02-22T07:45:00Z', matchScore: 34,
    matchResult: 'cleared', matchedName: 'Pierre Jean Leclerc',
    matchedList: 'jfsc_local', datasets: ['jfsc_local', 'opensanctions', 'ofsi'],
    nationality: 'France', aliases: [],
    reasons: [],
    riskLevel: 'low',
    notes: 'Common name match. Different DOB, different profession. No adverse media. Cleared.',
    reviewedBy: 'System (Auto-cleared)', reviewDate: '2026-02-22',
  },
];

const MOCK_STATS: ScreeningStats = {
  totalScreened: 14_847,
  matches: 23,
  cleared: 14_791,
  pendingReview: 33,
  avgMatchTime: '1.2s',
};

export default function SanctionsScreeningPage() {
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | MatchResult>('all');
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return MOCK_RESULTS.filter(r => {
      if (filterStatus !== 'all' && r.matchResult !== filterStatus) return false;
      if (filterRisk !== 'all' && r.riskLevel !== filterRisk) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return r.entityName.toLowerCase().includes(q) || r.clientRef.toLowerCase().includes(q) || r.matchedName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [filterStatus, filterRisk, searchQuery]);

  // Chart data
  const listDistribution = Object.entries(
    MOCK_RESULTS.filter(r => r.matchResult !== 'cleared').reduce<Record<string, number>>((acc, r) => {
      r.datasets.forEach(d => { acc[d] = (acc[d] || 0) + 1; });
      return acc;
    }, {})
  ).map(([key, value]) => ({ name: LIST_LABELS[key as ListSource], value, fill: LIST_COLORS[key as ListSource] }));

  const statusDistribution = [
    { name: 'Confirmed', value: MOCK_RESULTS.filter(r => r.matchResult === 'confirmed').length, fill: '#ef4444' },
    { name: 'Potential', value: MOCK_RESULTS.filter(r => r.matchResult === 'potential').length, fill: '#f59e0b' },
    { name: 'Pending', value: MOCK_RESULTS.filter(r => r.matchResult === 'pending_review').length, fill: '#3b82f6' },
    { name: 'Cleared', value: MOCK_RESULTS.filter(r => r.matchResult === 'cleared').length, fill: '#10b981' },
  ];

  function buildPDFConfig(): PDFReportOptions {
    return {
      title: 'Sanctions & PEP Screening Report',
      subtitle: 'Entity screening results from consolidated watchlists',
      module: 'Sanctions Screening',
      jurisdiction: 'Jersey',
      classification: 'RESTRICTED',
      generatedBy: 'Velanova AI Governance Engine',
      sections: [
        { type: 'stats', stats: [
          { label: 'Total Screened', value: MOCK_STATS.totalScreened.toLocaleString() },
          { label: 'Active Matches', value: String(MOCK_STATS.matches) },
          { label: 'Pending Review', value: String(MOCK_STATS.pendingReview) },
          { label: 'Avg Match Time', value: MOCK_STATS.avgMatchTime },
        ]},
        { type: 'heading', content: 'Screening Results' },
        { type: 'table', columns: ['Entity', 'Type', 'Score', 'Status', 'List', 'Risk'], rows: MOCK_RESULTS.map(r => [r.entityName, r.entityType, String(r.matchScore), r.matchResult.replace('_', ' '), LIST_LABELS[r.matchedList], r.riskLevel]) },
        { type: 'heading', content: 'Confirmed Matches' },
        ...MOCK_RESULTS.filter(r => r.matchResult === 'confirmed').map(r => ({ type: 'text' as const, content: `${r.entityName} (${r.clientRef}): ${r.notes}` })),
      ],
    };
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#030303] text-white overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-400" />
          <h1 className="text-[14px] font-semibold tracking-tight">Sanctions & PEP Screening</h1>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-medium">OpenSanctions</span>
          {MOCK_STATS.pendingReview > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" /> {MOCK_STATS.pendingReview} pending
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 app-region-no-drag">
          <button className="h-6 px-2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1 transition-colors">
            <RefreshCw className="w-3 h-3" /> Sync Lists
          </button>
          <ExportButton getReportConfig={buildPDFConfig} compact />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Total Screened', value: MOCK_STATS.totalScreened.toLocaleString(), icon: Search, color: 'text-indigo-400' },
            { label: 'Active Matches', value: String(MOCK_STATS.matches), icon: AlertTriangle, color: 'text-red-400' },
            { label: 'Cleared', value: MOCK_STATS.cleared.toLocaleString(), icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'Pending Review', value: String(MOCK_STATS.pendingReview), icon: Clock, color: 'text-amber-400' },
            { label: 'Avg Match Time', value: MOCK_STATS.avgMatchTime, icon: RefreshCw, color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{s.label}</span>
                <s.icon className={cn('w-4 h-4', s.color)} />
              </div>
              <div className="text-[20px] font-bold tabular-nums text-white/90">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <span className="text-[11px] text-zinc-400 font-medium">Matches by Screening List</span>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={listDistribution} margin={{ top: 12, right: 4, bottom: 0, left: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#52525b', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {listDistribution.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <span className="text-[11px] text-zinc-400 font-medium">Screening Outcomes</span>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value">
                    {statusDistribution.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {statusDistribution.map(s => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill }} />
                    <span className="text-[10px] text-zinc-400">{s.name}</span>
                    <span className="text-[10px] font-medium text-white/70">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              placeholder="Search entity name, client ref..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-7 pl-8 pr-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-white/80 placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.12]"
            />
          </div>
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-zinc-600" />
            <span className="text-[10px] text-zinc-500">Status:</span>
            {(['all', 'confirmed', 'potential', 'pending_review', 'cleared'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={cn('h-6 px-2 rounded text-[10px] capitalize', filterStatus === s ? 'bg-white/[0.08] text-white' : 'text-zinc-500 hover:text-zinc-300')}>
                {s === 'pending_review' ? 'pending' : s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-zinc-500">Risk:</span>
            {(['all', 'high', 'medium', 'low'] as const).map(r => (
              <button key={r} onClick={() => setFilterRisk(r)} className={cn('h-6 px-2 rounded text-[10px] capitalize', filterRisk === r ? 'bg-white/[0.08] text-white' : 'text-zinc-500 hover:text-zinc-300')}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-2">
          {filtered.map(result => (
            <div key={result.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div
                onClick={() => setSelectedResult(selectedResult === result.id ? null : result.id)}
                className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {result.matchResult === 'confirmed' ? <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    : result.matchResult === 'potential' ? <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    : result.matchResult === 'pending_review' ? <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    : <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-white/80 truncate">{result.entityName}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 capitalize flex-shrink-0">
                        {result.entityType === 'individual' ? <User className="w-2.5 h-2.5 inline mr-0.5" /> : <Globe className="w-2.5 h-2.5 inline mr-0.5" />}
                        {result.entityType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-zinc-600">{result.clientRef}</span>
                      <span className="text-[9px] text-zinc-700">•</span>
                      <span className="text-[9px] text-zinc-500">{result.nationality}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className={cn('text-[16px] font-bold tabular-nums', result.matchScore >= 80 ? 'text-red-400' : result.matchScore >= 50 ? 'text-amber-400' : 'text-emerald-400')}>
                      {result.matchScore}%
                    </div>
                    <span className="text-[8px] text-zinc-600">match</span>
                  </div>
                  <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize whitespace-nowrap', RESULT_CLR[result.matchResult])}>
                    {result.matchResult.replace('_', ' ')}
                  </span>
                  {selectedResult === result.id ? <ChevronDown className="w-3.5 h-3.5 text-zinc-600" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />}
                </div>
              </div>

              {selectedResult === result.id && (
                <div className="px-4 pb-4 border-t border-white/[0.04] space-y-3">
                  {/* Matched Against */}
                  {result.matchResult !== 'cleared' && (
                    <div className="pt-3">
                      <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Matched Against</span>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[11px] text-white/70 font-medium">{result.matchedName}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">{LIST_LABELS[result.matchedList]}</span>
                      </div>
                    </div>
                  )}

                  {/* Datasets Screened */}
                  <div>
                    <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Databases Screened</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {result.datasets.map(d => (
                        <span key={d} className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: `${LIST_COLORS[d]}15`, color: LIST_COLORS[d] }}>
                          <Shield className="w-2.5 h-2.5" /> {LIST_LABELS[d]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Aliases */}
                  {result.aliases.length > 0 && (
                    <div>
                      <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Known Aliases</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {result.aliases.map(a => (
                          <span key={a} className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reasons */}
                  {result.reasons.length > 0 && (
                    <div>
                      <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Listing Reasons</span>
                      <ul className="mt-1 space-y-1">
                        {result.reasons.map((reason, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <FileText className="w-3 h-3 text-zinc-600 mt-0.5 flex-shrink-0" />
                            <span className="text-[10px] text-zinc-400">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Notes */}
                  <div className={cn('rounded-lg border p-3', result.matchResult === 'confirmed' ? 'border-red-500/10 bg-red-900/5' : result.matchResult === 'potential' || result.matchResult === 'pending_review' ? 'border-amber-500/10 bg-amber-900/5' : 'border-emerald-500/10 bg-emerald-900/5')}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Eye className="w-3 h-3 text-zinc-500" />
                      <span className="text-[10px] font-medium text-zinc-400">Analyst Notes</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">{result.notes}</p>
                  </div>

                  {/* Review Info */}
                  <div className="flex items-center gap-4 text-[9px] text-zinc-600">
                    <span>Screened: {new Date(result.screenedDate).toLocaleString()}</span>
                    {result.reviewedBy && <span>Reviewed by: {result.reviewedBy}</span>}
                    {result.reviewDate && <span>Review date: {result.reviewDate}</span>}
                    <span className="flex items-center gap-1">
                      <ExternalLink className="w-2.5 h-2.5" /> View in OpenSanctions
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Data Sources Banner */}
        <div className="rounded-xl border border-indigo-500/10 bg-indigo-900/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span className="text-[11px] font-medium text-indigo-400">Consolidated Screening Sources</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { name: 'OpenSanctions', desc: 'Aggregated global sanctions, PEP & enforcement data', entities: '380,000+', updated: 'Daily' },
              { name: 'OFSI (UK)', desc: 'Office of Financial Sanctions Implementation', entities: '4,200+', updated: 'Real-time' },
              { name: 'UN CSCL', desc: 'UN Security Council Consolidated Sanctions List', entities: '800+', updated: 'Daily' },
              { name: 'EU Consolidated', desc: 'EU Sanctions & Restrictive Measures', entities: '12,000+', updated: 'Daily' },
              { name: 'OFAC SDN', desc: 'US Treasury Specially Designated Nationals', entities: '18,000+', updated: 'Real-time' },
              { name: 'JFSC Local', desc: 'Jersey Financial Services Commission local list', entities: '120+', updated: 'Weekly' },
            ].map(src => (
              <div key={src.name} className="rounded-lg border border-white/[0.04] p-3 bg-white/[0.01]">
                <div className="text-[11px] font-medium text-white/70">{src.name}</div>
                <div className="text-[9px] text-zinc-500 mt-0.5">{src.desc}</div>
                <div className="flex items-center gap-3 mt-1.5 text-[9px]">
                  <span className="text-zinc-400">{src.entities} entities</span>
                  <span className="text-emerald-400/70">Updated: {src.updated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Footer */}
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 flex items-start gap-2">
          <Shield className="w-3.5 h-3.5 text-zinc-600 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-zinc-600 leading-relaxed">
            Screening conducted per JFSC AML/CFT Handbook 5.5, FATF Recommendations 6 & 7, EU 6AMLD, 
            and Sanctions & Asset-Freezing (Jersey) Law 2019. All confirmed matches trigger automatic SAR 
            consideration. Screening frequency: onboarding, event-triggered, and minimum quarterly batch re-screen.
          </p>
        </div>
      </div>
    </div>
  );
}
