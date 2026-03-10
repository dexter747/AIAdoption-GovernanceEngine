import { useState } from 'react';
import {
  ScanSearch, Plus, Sparkles, AlertTriangle, UserCheck,
  FileText, Trash2, ChevronRight, Shield, Users,
  CheckCircle2, Clock, XCircle, Building2, User,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   COMPREHENSIVE MOCK DATA — KYC & Client Onboarding
   Data modelled on Jersey / Channel Islands financial services KYC workflows.
   Jersey Financial Services Commission (JFSC) regulatory requirements.
   ═══════════════════════════════════════════════════════════════════════════ */

interface Client { id: string; name: string; entity_type: string; jurisdiction: string; email?: string; risk_rating: string; overall_risk_score?: number; status: string; pep_status: boolean; industry?: string; source_of_wealth?: string; created_at: string }
interface Check { id: string; check_type: string; status: string; ai_assessment?: string; ai_risk_flags: string[]; ai_confidence?: number; completed_at?: string; created_at: string }
interface Doc { id: string; document_type: string; file_name: string; status: string; ai_extracted_data: any; ai_verification_result: any; created_at: string }
interface Workflow { id: string; template: string; status: string; current_step: number; total_steps: number; steps: any[]; completion_pct: number; created_at: string }
interface DashData { totalClients: number; byStatus: Record<string, number>; byRisk: Record<string, number>; checksTotal: number; checksPending: number; checksFailed: number; onboardingActive: number; avgCompletion: number; recentClients: Client[] }

const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Le Masurier Holdings Ltd', entity_type: 'corporate', jurisdiction: 'JE', email: 'compliance@lemasurier.je', risk_rating: 'standard', overall_risk_score: 28, status: 'active', pep_status: false, industry: 'Real Estate', source_of_wealth: 'Property Development', created_at: '2025-06-15T10:00:00Z' },
  { id: 'c2', name: 'Sir Philip Bailhache Trust', entity_type: 'trust', jurisdiction: 'JE', email: 'admin@jftrust.je', risk_rating: 'enhanced', overall_risk_score: 62, status: 'active', pep_status: true, industry: 'Legal Services', source_of_wealth: 'Professional Fees & Investments', created_at: '2025-04-20T09:30:00Z' },
  { id: 'c3', name: 'St Helier Capital Partners', entity_type: 'corporate', jurisdiction: 'JE', email: 'ops@stheliercapital.je', risk_rating: 'standard', overall_risk_score: 22, status: 'active', pep_status: false, industry: 'Fund Administration', source_of_wealth: 'Management Fees', created_at: '2025-08-10T14:00:00Z' },
  { id: 'c4', name: 'Grouville Marine Trading Ltd', entity_type: 'corporate', jurisdiction: 'JE', email: 'info@grouvillemarine.je', risk_rating: 'enhanced', overall_risk_score: 55, status: 'onboarding', pep_status: false, industry: 'Maritime Trade', source_of_wealth: 'Import/Export', created_at: '2026-01-22T11:00:00Z' },
  { id: 'c5', name: 'Catherine de Carteret', entity_type: 'individual', jurisdiction: 'JE', email: 'c.decarteret@gmail.com', risk_rating: 'low', overall_risk_score: 12, status: 'active', pep_status: false, industry: 'Retired', source_of_wealth: 'Pension & Savings', created_at: '2025-09-05T16:00:00Z' },
  { id: 'c6', name: 'Channel Islands Wealth Management', entity_type: 'corporate', jurisdiction: 'JE', email: 'kyc@ciwm.je', risk_rating: 'standard', overall_risk_score: 30, status: 'active', pep_status: false, industry: 'Wealth Management', source_of_wealth: 'Advisory Fees', created_at: '2025-03-12T08:00:00Z' },
  { id: 'c7', name: 'Viktor Petrov', entity_type: 'individual', jurisdiction: 'RU', email: 'v.petrov@mail.ru', risk_rating: 'high', overall_risk_score: 82, status: 'suspended', pep_status: false, industry: 'Energy', source_of_wealth: 'Oil & Gas Holdings', created_at: '2024-11-20T10:00:00Z' },
  { id: 'c8', name: 'Gorey Harbour Developments', entity_type: 'corporate', jurisdiction: 'JE', email: 'dev@goreyharbour.je', risk_rating: 'low', overall_risk_score: 15, status: 'onboarding', pep_status: false, industry: 'Property Development', source_of_wealth: 'Construction Revenue', created_at: '2026-02-18T13:00:00Z' },
  { id: 'c9', name: 'Gulf Investment Holdings FZE', entity_type: 'corporate', jurisdiction: 'AE', email: 'compliance@gulfih.ae', risk_rating: 'enhanced', overall_risk_score: 58, status: 'active', pep_status: false, industry: 'Investment', source_of_wealth: 'Sovereign Wealth', created_at: '2025-07-01T09:00:00Z' },
  { id: 'c10', name: 'La Corbi\u00e8re Fund Services', entity_type: 'corporate', jurisdiction: 'JE', email: 'admin@lacorbiere.je', risk_rating: 'standard', overall_risk_score: 25, status: 'active', pep_status: false, industry: 'Fund Services', source_of_wealth: 'Fund Administration Fees', created_at: '2025-05-30T15:00:00Z' },
  { id: 'c11', name: 'Hon. James Saunders', entity_type: 'individual', jurisdiction: 'JE', email: 'j.saunders@states.je', risk_rating: 'pep', overall_risk_score: 71, status: 'active', pep_status: true, industry: 'Government', source_of_wealth: 'Public Service & Investments', created_at: '2025-01-15T11:00:00Z' },
  { id: 'c12', name: 'Trinity Bay Shipping Co', entity_type: 'corporate', jurisdiction: 'JE', email: 'ops@trinitybay.je', risk_rating: 'standard', overall_risk_score: 34, status: 'prospect', pep_status: false, industry: 'Shipping', source_of_wealth: 'Freight Revenue', created_at: '2026-03-01T10:00:00Z' },
];

const MOCK_CHECKS: Check[] = [
  { id: 'ch1', check_type: 'identity', status: 'passed', ai_assessment: 'Identity verified via Jersey passport. Name match confirmed against electoral register.', ai_risk_flags: [], ai_confidence: 98, completed_at: '2026-01-20T14:30:00Z', created_at: '2026-01-20T14:00:00Z' },
  { id: 'ch2', check_type: 'sanctions', status: 'passed', ai_assessment: 'No sanctions matches found across OFAC, EU, UN and JFSC lists.', ai_risk_flags: [], ai_confidence: 99, completed_at: '2026-01-20T14:05:00Z', created_at: '2026-01-20T14:00:00Z' },
  { id: 'ch3', check_type: 'pep', status: 'needs_review', ai_assessment: 'Potential PEP match \u2014 States of Jersey Assembly member. Requires enhanced due diligence under JFSC Handbook.', ai_risk_flags: ['pep_match', 'enhanced_dd_required'], ai_confidence: 87, created_at: '2026-01-20T14:00:00Z' },
  { id: 'ch4', check_type: 'adverse_media', status: 'passed', ai_assessment: 'No adverse media identified. Positive coverage in Jersey Evening Post regarding community involvement.', ai_risk_flags: [], ai_confidence: 92, completed_at: '2026-01-20T14:10:00Z', created_at: '2026-01-20T14:00:00Z' },
  { id: 'ch5', check_type: 'source_of_wealth', status: 'in_progress', ai_assessment: 'Source of wealth documentation submitted. Reviewing property valuations and historic tax filings with Comptroller of Revenue.', ai_risk_flags: ['documentation_pending'], ai_confidence: 65, created_at: '2026-01-20T14:00:00Z' },
  { id: 'ch6', check_type: 'ubo', status: 'failed', ai_assessment: 'Ultimate beneficial ownership unclear. Nominee shareholder structure in BVI \u2014 requires look-through analysis per JFSC guidance.', ai_risk_flags: ['opaque_structure', 'offshore_nominee', 'jfsc_flag'], ai_confidence: 78, created_at: '2026-02-05T10:00:00Z' },
  { id: 'ch7', check_type: 'address', status: 'passed', ai_assessment: 'Jersey residential address confirmed via utility bill verification. Parish: St Helier.', ai_risk_flags: [], ai_confidence: 96, completed_at: '2026-01-22T09:00:00Z', created_at: '2026-01-22T09:00:00Z' },
];

const MOCK_DOCS: Doc[] = [
  { id: 'd1', document_type: 'passport', file_name: 'jersey_passport_scan.pdf', status: 'verified', ai_extracted_data: { name: 'Catherine de Carteret', dob: '1965-04-12', nationality: 'British \u2014 Jersey' }, ai_verification_result: { valid: true, confidence: 97 }, created_at: '2025-09-05T16:10:00Z' },
  { id: 'd2', document_type: 'utility_bill', file_name: 'jec_electricity_bill.pdf', status: 'verified', ai_extracted_data: { provider: 'Jersey Electricity', address: '14 La Route de St Aubin, St Helier, JE2 3SE' }, ai_verification_result: { valid: true, confidence: 94 }, created_at: '2025-09-05T16:15:00Z' },
  { id: 'd3', document_type: 'certificate_of_incorporation', file_name: 'grouville_marine_coi.pdf', status: 'pending', ai_extracted_data: { company: 'Grouville Marine Trading Ltd', registration: 'JFSC Reg #128456', date: '2018-03-22' }, ai_verification_result: null, created_at: '2026-01-22T11:30:00Z' },
  { id: 'd4', document_type: 'tax_return', file_name: 'petrov_tax_declaration.pdf', status: 'rejected', ai_extracted_data: { name: 'Viktor Petrov', year: 2024 }, ai_verification_result: { valid: false, reason: 'Document appears altered \u2014 metadata inconsistencies detected' }, created_at: '2024-11-25T10:00:00Z' },
  { id: 'd5', document_type: 'bank_reference', file_name: 'rbsi_bank_reference.pdf', status: 'verified', ai_extracted_data: { bank: 'RBS International (Jersey)', account_holder: 'St Helier Capital Partners' }, ai_verification_result: { valid: true, confidence: 96 }, created_at: '2025-08-12T14:00:00Z' },
];

const MOCK_WORKFLOWS: Workflow[] = [
  { id: 'w1', template: 'standard', status: 'completed', current_step: 5, total_steps: 5, steps: [{ name: 'Identity Verification' }, { name: 'Address Check' }, { name: 'Sanctions Screening' }, { name: 'Risk Assessment' }, { name: 'MLRO Approval' }], completion_pct: 100, created_at: '2025-06-15T10:00:00Z' },
  { id: 'w2', template: 'enhanced', status: 'in_progress', current_step: 3, total_steps: 7, steps: [{ name: 'Identity Verification' }, { name: 'PEP Screening' }, { name: 'Source of Wealth Review' }, { name: 'Enhanced Due Diligence' }, { name: 'JFSC Notification' }, { name: 'MLRO Sign-off' }, { name: 'Board Approval' }], completion_pct: 43, created_at: '2026-01-22T11:00:00Z' },
  { id: 'w3', template: 'corporate', status: 'in_progress', current_step: 4, total_steps: 8, steps: [{ name: 'Company Registry Check' }, { name: 'Director Verification' }, { name: 'UBO Identification' }, { name: 'Sanctions Screening' }, { name: 'Adverse Media Check' }, { name: 'Financial Due Diligence' }, { name: 'Risk Scoring' }, { name: 'Compliance Approval' }], completion_pct: 50, created_at: '2026-02-18T13:00:00Z' },
];

const MOCK_DASHBOARD: DashData = {
  totalClients: 12,
  byStatus: { prospect: 1, onboarding: 2, active: 8, suspended: 1, offboarded: 0 },
  byRisk: { low: 2, standard: 5, enhanced: 3, high: 1, pep: 1 },
  checksTotal: 47,
  checksPending: 5,
  checksFailed: 3,
  onboardingActive: 2,
  avgCompletion: 72,
  recentClients: [],
};

/* ═══════════════════════════════════════════════════════════════════════════ */

type View = 'dashboard' | 'detail';

const RISK_BG: Record<string, string> = { low: 'bg-emerald-900/20 text-emerald-400', standard: 'bg-blue-900/20 text-blue-400', enhanced: 'bg-amber-900/20 text-amber-400', high: 'bg-red-900/20 text-red-400', pep: 'bg-purple-900/20 text-purple-400' };
const STATUS_BG: Record<string, string> = { prospect: 'bg-zinc-800 text-zinc-400', onboarding: 'bg-blue-900/30 text-blue-400', active: 'bg-emerald-900/30 text-emerald-400', suspended: 'bg-red-900/30 text-red-400', offboarded: 'bg-zinc-800 text-zinc-600' };
const CHECK_IC: Record<string, string> = { passed: 'text-emerald-400', failed: 'text-red-400', pending: 'text-zinc-500', in_progress: 'text-blue-400', expired: 'text-amber-400', needs_review: 'text-amber-400' };
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function KYCDashboardPage() {
  const [view, setView] = useState<View>('dashboard');
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [selected, setSelected] = useState<Client | null>(null);
  const [checks] = useState<Check[]>(MOCK_CHECKS);
  const [docs] = useState<Doc[]>(MOCK_DOCS);
  const [workflows] = useState<Workflow[]>(MOCK_WORKFLOWS);
  const [riskResult, setRiskResult] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('individual');
  const [newEmail, setNewEmail] = useState('');
  const [tab, setTab] = useState<'checks' | 'docs' | 'workflow'>('checks');

  const dash = MOCK_DASHBOARD;

  const openClient = (c: Client) => {
    setSelected(c); setView('detail'); setRiskResult(null); setTab('checks');
  };

  const assessRisk = () => {
    if (!selected) return;
    setRiskResult({
      riskRating: selected.risk_rating,
      riskScore: selected.overall_risk_score || 35,
      summary: 'AI risk assessment for ' + selected.name + ' reviewed against JFSC AML/CFT Handbook requirements. Entity type: ' + selected.entity_type + ', Jurisdiction: ' + selected.jurisdiction + '. ' + (selected.pep_status ? 'PEP-flagged \u2014 enhanced due diligence applied.' : 'Standard due diligence applicable.'),
      factors: [
        { factor: 'Jurisdiction Risk', detail: selected.jurisdiction === 'JE' ? 'Low \u2014 Jersey is MONEYVAL compliant jurisdiction' : selected.jurisdiction === 'RU' ? 'Critical \u2014 Sanctioned jurisdiction' : 'Medium \u2014 Requires enhanced monitoring', impact: selected.jurisdiction === 'RU' ? 'high' : 'low' },
        { factor: 'Entity Structure', detail: selected.entity_type === 'trust' ? 'Enhanced \u2014 Trust structures require UBO look-through' : 'Standard complexity', impact: selected.entity_type === 'trust' ? 'medium' : 'low' },
        { factor: 'PEP Status', detail: selected.pep_status ? 'PEP identified \u2014 JFSC enhanced monitoring requirements apply' : 'No PEP connections identified', impact: selected.pep_status ? 'high' : 'low' },
        { factor: 'Transaction Profile', detail: 'Transaction patterns consistent with declared business activity', impact: 'low' },
      ],
      missingChecks: selected.risk_rating === 'high' ? ['enhanced_due_diligence', 'source_of_funds'] : [],
      recommendations: [
        'Schedule periodic review per JFSC risk-based approach',
        selected.pep_status ? 'Maintain enhanced monitoring \u2014 quarterly PEP re-screening required' : 'Annual KYC refresh sufficient',
        'Verify source of wealth documentation with Jersey Comptroller records',
      ],
    });
  };

  const handleAddClient = () => {
    if (!newName.trim()) return;
    const id = `c${Date.now()}`;
    setClients(prev => [{
      id, name: newName.trim(), entity_type: newType, jurisdiction: 'JE',
      email: newEmail || undefined, risk_rating: 'standard', overall_risk_score: 20,
      status: 'onboarding', pep_status: false, industry: 'Other',
      source_of_wealth: 'To be assessed', created_at: new Date().toISOString(),
    }, ...prev]);
    setShowAdd(false); setNewName(''); setNewType('individual'); setNewEmail('');
  };

  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    if (selected?.id === id) { setSelected(null); setView('dashboard'); }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">KYC & Onboarding</h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        <div className="flex items-center gap-4 app-region-no-drag">
          <span className="text-[11px] text-white/40"><Users className="w-3 h-3 inline mr-1 text-white/25" /><span className="font-medium text-white/60">{dash.totalClients}</span> clients</span>
          {dash.checksPending > 0 && <span className="text-[11px] text-amber-400"><Clock className="w-3 h-3 inline mr-1" />{dash.checksPending} pending</span>}
          {dash.checksFailed > 0 && <span className="text-[11px] text-red-400"><AlertTriangle className="w-3 h-3 inline mr-1" />{dash.checksFailed} failed</span>}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 app-region-no-drag">
          {view === 'detail' && <button onClick={() => setView('dashboard')} className="h-6 px-2.5 rounded-[5px] text-[11px] text-white/35 hover:text-white/60 hover:bg-white/[0.04]">\u2190 Back</button>}
          <button onClick={() => setShowAdd(true)} className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Client</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-4 gap-3">
              {[
                { l: 'Total Clients', v: dash.totalClients, s: (dash.byStatus.active || 0) + ' active', c: 'text-indigo-400', ic: Users },
                { l: 'Onboarding', v: dash.onboardingActive, s: dash.avgCompletion + '% avg', c: 'text-blue-400', ic: UserCheck },
                { l: 'Pending Checks', v: dash.checksPending, s: dash.checksTotal + ' total', c: dash.checksPending > 0 ? 'text-amber-400' : 'text-emerald-400', ic: Clock },
                { l: 'High Risk', v: (dash.byRisk.high || 0) + (dash.byRisk.pep || 0), s: (dash.byRisk.enhanced || 0) + ' enhanced', c: (dash.byRisk.high || 0) > 0 ? 'text-red-400' : 'text-emerald-400', ic: Shield },
              ].map(card => (
                <div key={card.l} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                  <div className="flex items-center justify-between mb-2"><span className="text-[10px] text-zinc-600 uppercase tracking-wider">{card.l}</span><card.ic className={cn('w-4 h-4', card.c)} /></div>
                  <div className={cn('text-[22px] font-semibold tabular-nums', card.c)}>{card.v}</div>
                  <span className="text-[11px] text-zinc-600">{card.s}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Clients by Risk</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={Object.entries(dash.byRisk).filter(([,v]) => v > 0).map(([k, v]) => ({ name: k, value: v }))} cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value" paddingAngle={3}>
                      {Object.entries(dash.byRisk).filter(([,v]) => v > 0).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Clients by Status</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={Object.entries(dash.byStatus).filter(([,v]) => v > 0).map(([k, v]) => ({ name: k, count: v }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Client List */}
            <div className="space-y-2">
              <h3 className="text-[12px] font-medium text-white/60">All Clients</h3>
              {clients.map(c => (
                <div key={c.id} onClick={() => openClient(c)} className="group rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 hover:border-white/[0.1] transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-medium text-white/80 truncate">{c.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-zinc-500 capitalize">{c.entity_type === 'individual' ? <User className="w-3 h-3 inline mr-0.5" /> : <Building2 className="w-3 h-3 inline mr-0.5" />}{c.entity_type}</span>
                        <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', STATUS_BG[c.status])}>{c.status}</span>
                        <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', RISK_BG[c.risk_rating])}>{c.risk_rating}</span>
                        {c.pep_status && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-400">PEP</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {c.overall_risk_score != null && (
                        <span className={cn('text-[14px] font-semibold tabular-nums', c.overall_risk_score > 70 ? 'text-red-400' : c.overall_risk_score > 40 ? 'text-amber-400' : 'text-emerald-400')}>{c.overall_risk_score}</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400" />
                      <button onClick={e => { e.stopPropagation(); handleDeleteClient(c.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-900/20 rounded transition-all" title="Delete"><Trash2 className="w-3 h-3 text-red-400/60" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detail View */}
        {view === 'detail' && selected && (
          <div className="p-5 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-white/90">{selected.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[12px] text-zinc-500 capitalize">{selected.entity_type}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded capitalize', STATUS_BG[selected.status])}>{selected.status}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded capitalize', RISK_BG[selected.risk_rating])}>{selected.risk_rating}</span>
                  {selected.email && <span className="text-[11px] text-zinc-600">{selected.email}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {selected.overall_risk_score != null && (
                  <div className="text-center">
                    <div className={cn('text-[28px] font-bold tabular-nums', selected.overall_risk_score > 70 ? 'text-red-400' : selected.overall_risk_score > 40 ? 'text-amber-400' : 'text-emerald-400')}>{selected.overall_risk_score}</div>
                    <span className="text-[10px] text-zinc-600">Risk Score</span>
                  </div>
                )}
                <button onClick={assessRisk} className="h-7 px-3 rounded-lg text-[11px] bg-indigo-600/80 text-white hover:bg-indigo-500 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Assess Risk
                </button>
              </div>
            </div>

            {/* Risk Result */}
            {riskResult && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 space-y-3">
                <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /><span className="text-[12px] font-medium text-white/70">AI Risk Assessment</span></div>
                <p className="text-[12px] text-zinc-400">{riskResult.summary}</p>
                {riskResult.factors?.length > 0 && (
                  <div>{riskResult.factors.map((f: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-zinc-400 py-1">
                      <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', f.impact === 'high' ? 'bg-red-500' : f.impact === 'medium' ? 'bg-amber-500' : 'bg-emerald-500')} />
                      <div><span className="text-white/60">{f.factor}</span> \u2014 {f.detail}</div>
                    </div>
                  ))}</div>
                )}
                {riskResult.missingChecks?.length > 0 && (
                  <div><h4 className="text-[11px] text-zinc-500 font-medium mb-1">Missing Checks</h4>
                    {riskResult.missingChecks.map((m: string, i: number) => <span key={i} className="text-[10px] text-amber-400/80 mr-2"><AlertTriangle className="w-3 h-3 inline mr-0.5" />{m.replace('_', ' ')}</span>)}
                  </div>
                )}
                {riskResult.recommendations?.length > 0 && (
                  <div><h4 className="text-[11px] text-zinc-500 font-medium mb-1">Recommendations</h4>
                    {riskResult.recommendations.map((r: string, i: number) => <div key={i} className="text-[11px] text-zinc-400 py-0.5"><span className="text-indigo-400 mr-1">\u2022</span>{r}</div>)}
                  </div>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-white/[0.06] pb-px">
              {(['checks', 'docs', 'workflow'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={cn('px-3 py-1.5 text-[11px] font-medium rounded-t', tab === t ? 'text-white bg-white/[0.06]' : 'text-zinc-500 hover:text-zinc-300')}>
                  {t === 'checks' ? 'Checks (' + checks.length + ')' : t === 'docs' ? 'Documents (' + docs.length + ')' : 'Workflow (' + workflows.length + ')'}
                </button>
              ))}
            </div>

            {/* Checks Tab */}
            {tab === 'checks' && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {['identity', 'address', 'sanctions', 'pep', 'adverse_media', 'source_of_wealth', 'ubo'].map(t => (
                    <button key={t} className="h-6 px-2 rounded text-[10px] bg-white/[0.04] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] capitalize">{t.replace(/_/g, ' ')}</button>
                  ))}
                </div>
                {checks.map(ch => (
                  <div key={ch.id} className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {ch.status === 'passed' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : ch.status === 'failed' ? <XCircle className="w-3.5 h-3.5 text-red-400" /> : <Clock className="w-3.5 h-3.5 text-zinc-500" />}
                        <span className="text-[12px] text-white/70 capitalize">{ch.check_type.replace(/_/g, ' ')}</span>
                      </div>
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded capitalize', CHECK_IC[ch.status])}>{ch.status.replace('_', ' ')}</span>
                    </div>
                    {ch.ai_assessment && <p className="text-[11px] text-zinc-500 mt-1">{ch.ai_assessment}</p>}
                    {ch.ai_risk_flags?.length > 0 && <div className="flex gap-1 mt-1">{ch.ai_risk_flags.map((f, i) => <span key={i} className="text-[9px] px-1 rounded bg-red-900/20 text-red-400">{f}</span>)}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Docs Tab */}
            {tab === 'docs' && (
              <div className="space-y-2">
                {docs.map(d => (
                  <div key={d.id} className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-zinc-500" />
                        <div>
                          <span className="text-[12px] text-white/70">{d.file_name}</span>
                          <span className="text-[10px] text-zinc-600 ml-2 capitalize">{d.document_type.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded capitalize', d.status === 'verified' ? 'text-emerald-400' : d.status === 'rejected' ? 'text-red-400' : 'text-zinc-500')}>{d.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Workflow Tab */}
            {tab === 'workflow' && (
              <div className="space-y-3">
                {workflows.map(wf => {
                  const steps = typeof wf.steps === 'string' ? JSON.parse(wf.steps) : (wf.steps || []);
                  return (
                    <div key={wf.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-white/70 capitalize">{wf.template} Onboarding</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500">{wf.completion_pct}%</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: wf.completion_pct + '%' }} />
                      </div>
                      <div className="space-y-1">
                        {steps.map((s: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-[11px]">
                            {i < wf.current_step ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : i === wf.current_step ? <div className="w-3 h-3 rounded-full border-2 border-indigo-500" /> : <div className="w-3 h-3 rounded-full border border-zinc-700" />}
                            <span className={cn(i < wf.current_step ? 'text-zinc-500 line-through' : i === wf.current_step ? 'text-white/70' : 'text-zinc-600')}>{s.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5 w-[420px] space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-[13px] font-medium text-white">Add Client</h3>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Client name\u2026" className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
            <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none">
              <option value="individual">Individual</option>
              <option value="corporate">Corporate</option>
              <option value="trust">Trust</option>
              <option value="fund">Fund</option>
            </select>
            <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email (optional)\u2026" className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="h-7 px-3 rounded-md text-[11px] text-zinc-500">Cancel</button>
              <button onClick={handleAddClient} disabled={!newName.trim()} className="h-7 px-3 rounded-md text-[11px] font-medium bg-indigo-600 text-white disabled:opacity-30">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
