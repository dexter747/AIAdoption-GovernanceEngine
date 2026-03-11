import { useState } from 'react';
import {
  AlertTriangle, FileText, Bell, Activity, Eye,
  Zap, ChevronRight, Plus,
  CheckCircle2, ArrowLeft, Users,
  Fingerprint, Scale, Send, Lock, Building2,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { cn } from '../lib/utils';
import ExportButton from '../components/ui/ExportButton';
import type { PDFReportOptions } from '../lib/pdfExport';

/* ═══════════════════════════════════════════════════════════════════════════
   COMPREHENSIVE MOCK DATA — AML & SAR
   Data is modelled on Jersey/UK financial services AML compliance workflows.
   ═══════════════════════════════════════════════════════════════════════════ */

const MOCK_ACCOUNTS = [
  { id: '1', account_ref: 'ACC-001-JE', account_holder: 'Meridian Holdings Ltd', account_type: 'corporate', jurisdiction: 'JE', risk_tier: 'enhanced', pep_flag: false, sanctions_flag: false, adverse_media_flag: true, status: 'active', last_review_date: '2025-11-15', next_review_date: '2026-05-15' },
  { id: '2', account_ref: 'ACC-002-JE', account_holder: 'Sir Richard Pemberton', account_type: 'individual', jurisdiction: 'JE', risk_tier: 'high', pep_flag: true, sanctions_flag: false, adverse_media_flag: false, status: 'under_review', last_review_date: '2025-08-20', next_review_date: '2026-02-20' },
  { id: '3', account_ref: 'ACC-003-UK', account_holder: 'Apex Capital Partners', account_type: 'corporate', jurisdiction: 'GB', risk_tier: 'standard', pep_flag: false, sanctions_flag: false, adverse_media_flag: false, status: 'active', last_review_date: '2025-12-01', next_review_date: '2026-06-01' },
  { id: '4', account_ref: 'ACC-004-CH', account_holder: 'Heinrich Müller Trust', account_type: 'trust', jurisdiction: 'CH', risk_tier: 'enhanced', pep_flag: false, sanctions_flag: false, adverse_media_flag: true, status: 'active', last_review_date: '2025-10-10', next_review_date: '2026-04-10' },
  { id: '5', account_ref: 'ACC-005-JE', account_holder: 'Coastal Properties Group', account_type: 'corporate', jurisdiction: 'JE', risk_tier: 'low', pep_flag: false, sanctions_flag: false, adverse_media_flag: false, status: 'active', last_review_date: '2026-01-05', next_review_date: '2027-01-05' },
  { id: '6', account_ref: 'ACC-006-RU', account_holder: 'Volkov International LLC', account_type: 'corporate', jurisdiction: 'RU', risk_tier: 'high', pep_flag: false, sanctions_flag: true, adverse_media_flag: true, status: 'blocked', last_review_date: '2025-06-01', next_review_date: '2026-06-01' },
  { id: '7', account_ref: 'ACC-007-JE', account_holder: 'Catherine de Vere', account_type: 'individual', jurisdiction: 'JE', risk_tier: 'standard', pep_flag: false, sanctions_flag: false, adverse_media_flag: false, status: 'active', last_review_date: '2025-12-20', next_review_date: '2026-12-20' },
  { id: '8', account_ref: 'ACC-008-AE', account_holder: 'Gulf Maritime Trading FZE', account_type: 'corporate', jurisdiction: 'AE', risk_tier: 'enhanced', pep_flag: false, sanctions_flag: false, adverse_media_flag: false, status: 'active', last_review_date: '2025-09-15', next_review_date: '2026-03-15' },
];

const MOCK_TRANSACTIONS = [
  { id: 't1', account_id: '1', transaction_ref: 'TXN-20260301-001', transaction_type: 'wire', amount: 245000, currency: 'GBP', counterparty_name: 'Baltic Shipping Corp', counterparty_jurisdiction: 'LV', channel: 'swift', risk_score: 78, flagged: true, screening_status: 'flagged', timestamp: '2026-03-01T09:15:00Z' },
  { id: 't2', account_id: '2', transaction_ref: 'TXN-20260301-002', transaction_type: 'transfer', amount: 150000, currency: 'GBP', counterparty_name: 'Personal Account - Lloyds', counterparty_jurisdiction: 'GB', channel: 'online', risk_score: 62, flagged: true, screening_status: 'flagged', timestamp: '2026-03-01T10:30:00Z' },
  { id: 't3', account_id: '3', transaction_ref: 'TXN-20260228-003', transaction_type: 'transfer', amount: 50000, currency: 'USD', counterparty_name: 'Apex NY Branch', counterparty_jurisdiction: 'US', channel: 'online', risk_score: 12, flagged: false, screening_status: 'cleared', timestamp: '2026-02-28T14:00:00Z' },
  { id: 't4', account_id: '4', transaction_ref: 'TXN-20260228-004', transaction_type: 'deposit', amount: 9900, currency: 'CHF', counterparty_name: 'Cash Deposit', counterparty_jurisdiction: 'CH', channel: 'branch', risk_score: 72, flagged: true, screening_status: 'flagged', timestamp: '2026-02-28T11:00:00Z' },
  { id: 't5', account_id: '4', transaction_ref: 'TXN-20260227-005', transaction_type: 'deposit', amount: 9800, currency: 'CHF', counterparty_name: 'Cash Deposit', counterparty_jurisdiction: 'CH', channel: 'branch', risk_score: 75, flagged: true, screening_status: 'escalated', timestamp: '2026-02-27T10:30:00Z' },
  { id: 't6', account_id: '4', transaction_ref: 'TXN-20260226-006', transaction_type: 'deposit', amount: 9950, currency: 'CHF', counterparty_name: 'Cash Deposit', counterparty_jurisdiction: 'CH', channel: 'branch', risk_score: 82, flagged: true, screening_status: 'escalated', timestamp: '2026-02-26T15:45:00Z' },
  { id: 't7', account_id: '6', transaction_ref: 'TXN-20260225-007', transaction_type: 'wire', amount: 1200000, currency: 'USD', counterparty_name: 'Unknown Entity - Cyprus', counterparty_jurisdiction: 'CY', channel: 'swift', risk_score: 95, flagged: true, screening_status: 'blocked', timestamp: '2026-02-25T08:00:00Z' },
  { id: 't8', account_id: '1', transaction_ref: 'TXN-20260224-008', transaction_type: 'wire', amount: 340000, currency: 'EUR', counterparty_name: 'Industrial Supplies GmbH', counterparty_jurisdiction: 'DE', channel: 'swift', risk_score: 35, flagged: false, screening_status: 'cleared', timestamp: '2026-02-24T13:20:00Z' },
  { id: 't9', account_id: '5', transaction_ref: 'TXN-20260224-009', transaction_type: 'transfer', amount: 25000, currency: 'GBP', counterparty_name: 'Property Management Ltd', counterparty_jurisdiction: 'JE', channel: 'online', risk_score: 8, flagged: false, screening_status: 'cleared', timestamp: '2026-02-24T09:00:00Z' },
  { id: 't10', account_id: '8', transaction_ref: 'TXN-20260223-010', transaction_type: 'wire', amount: 890000, currency: 'AED', counterparty_name: 'Dhow Maritime LLC', counterparty_jurisdiction: 'AE', channel: 'swift', risk_score: 55, flagged: false, screening_status: 'cleared', timestamp: '2026-02-23T07:30:00Z' },
  { id: 't11', account_id: '2', transaction_ref: 'TXN-20260222-011', transaction_type: 'cash', amount: 15000, currency: 'GBP', counterparty_name: 'Cash Withdrawal', counterparty_jurisdiction: 'JE', channel: 'branch', risk_score: 68, flagged: true, screening_status: 'flagged', timestamp: '2026-02-22T16:00:00Z' },
  { id: 't12', account_id: '7', transaction_ref: 'TXN-20260222-012', transaction_type: 'transfer', amount: 3500, currency: 'GBP', counterparty_name: 'Waitrose Grocers', counterparty_jurisdiction: 'GB', channel: 'online', risk_score: 2, flagged: false, screening_status: 'cleared', timestamp: '2026-02-22T12:00:00Z' },
];

const MOCK_ALERTS = [
  { id: 'a1', alert_type: 'structuring', severity: 'critical', status: 'investigating', title: 'Potential structuring detected — Heinrich Müller Trust', description: 'Three consecutive cash deposits just below CHF 10,000 threshold within 72 hours (CHF 9,950 + CHF 9,800 + CHF 9,900 = CHF 29,650). Classic structuring pattern to avoid mandatory reporting thresholds.', ai_confidence: 92, ai_reasoning: 'Sequential deposits in 3-day window, each within 2% of reporting threshold. Statistical probability of coincidence: <0.3%.', ai_recommended_action: 'File SAR immediately. Freeze further cash deposits pending MLRO review.', created_at: '2026-02-28T16:00:00Z' },
  { id: 'a2', alert_type: 'sanctions_match', severity: 'critical', status: 'escalated', title: 'Sanctions flag — Volkov International LLC wire transfer blocked', description: 'Wire transfer of $1.2M to Unknown Entity in Cyprus. Account holder is Russian-jurisdiction entity on enhanced monitoring. Transfer attempts to high-risk jurisdiction.', ai_confidence: 97, ai_reasoning: 'Account has active sanctions flag. Destination jurisdiction Cyprus is commonly used for sanctions evasion. Beneficiary entity has no verifiable registration.', ai_recommended_action: 'Block transaction. File STR with JFSC. Notify compliance officer immediately.', created_at: '2026-02-25T08:05:00Z' },
  { id: 'a3', alert_type: 'pep_transaction', severity: 'high', status: 'open', title: 'Large PEP transaction — Sir Richard Pemberton', description: '£150,000 transfer to personal Lloyds account. Additional £15,000 cash withdrawal. Total £165,000 moved in 10-day period from PEP-flagged account.', ai_confidence: 74, ai_reasoning: 'PEP account shows elevated transaction activity. Pattern suggests fund consolidation for purpose unclear from available data.', ai_recommended_action: 'Request source of funds documentation. Enhanced monitoring for 90 days.', created_at: '2026-03-01T11:00:00Z' },
  { id: 'a4', alert_type: 'geographic_risk', severity: 'high', status: 'open', title: 'High-risk jurisdiction wire — Meridian Holdings', description: '£245,000 wire to Baltic Shipping Corp in Latvia. Meridian has adverse media flags. Latvia is elevated-risk jurisdiction for maritime trade transactions.', ai_confidence: 71, ai_reasoning: 'Combination of adverse media on account holder + high-risk jurisdiction + large value makes this transaction a compliance concern.', ai_recommended_action: 'Verify trade documentation. Request invoice/bill of lading for underlying transaction.', created_at: '2026-03-01T09:20:00Z' },
  { id: 'a5', alert_type: 'velocity_anomaly', severity: 'medium', status: 'open', title: 'Unusual transaction velocity — Gulf Maritime Trading', description: 'Transaction frequency has increased 340% month-over-month. 8 wire transfers totalling AED 4.2M in February vs typical 2-3 per month.', ai_confidence: 65, ai_reasoning: 'Significant deviation from established transaction pattern. May be legitimate business expansion or could indicate layering.', ai_recommended_action: 'Review latest business activity. Request updated business profile and recent financial statements.', created_at: '2026-02-28T12:00:00Z' },
  { id: 'a6', alert_type: 'behavioral_anomaly', severity: 'low', status: 'resolved', title: 'New counterparty pattern — Apex Capital Partners', description: 'First-time transfer to US-based entity. Within normal parameters but flagged due to new relationship.', ai_confidence: 32, ai_reasoning: 'Low risk. Intra-group transfer to established US branch.', ai_recommended_action: 'No action required. Update counterparty whitelist.', created_at: '2026-02-28T14:05:00Z' },
];

const MOCK_SARS = [
  { id: 's1', report_ref: 'SAR-2026-0042', report_type: 'SAR', status: 'in_review', priority: 'critical', subject_name: 'Heinrich Müller Trust', subject_account: 'ACC-004-CH', subject_type: 'trust', total_suspicious_amount: 29650, currency: 'CHF', narrative: 'Structured cash deposits identified over 72-hour period. Three consecutive deposits of CHF 9,950, CHF 9,800, and CHF 9,900 were made at branch counters, each just below the CHF 10,000 mandatory reporting threshold. The pattern is consistent with deliberate structuring to avoid regulatory reporting requirements under Jersey Proceeds of Crime Law.', ai_generated_narrative: 'The Heinrich Müller Trust account (ACC-004-CH) exhibited a pattern of structured cash deposits between 26-28 February 2026. Three cash deposits totalling CHF 29,650 were made at branch over 72 hours, each carefully kept below the CHF 10,000 threshold triggering automatic reporting. This systematic pattern, combined with the trust\'s Swiss jurisdiction and prior adverse media flags, presents significant AML risk indicators consistent with deliberate structuring under Article 37 of the Proceeds of Crime (Jersey) Law 1999.', reviewer: 'Sarah Mitchell (MLRO)', created_at: '2026-03-01T10:00:00Z' },
  { id: 's2', report_ref: 'SAR-2026-0041', report_type: 'STR', status: 'submitted', priority: 'critical', subject_name: 'Volkov International LLC', subject_account: 'ACC-006-RU', subject_type: 'corporate', total_suspicious_amount: 1200000, currency: 'USD', narrative: 'Wire transfer of $1.2M attempted to unregistered Cyprus entity. Account holds Russian jurisdiction with active sanctions flag. Transaction blocked per compliance policy.', filed_with: 'JFSC', filed_at: '2026-02-26T09:00:00Z', acknowledgement_ref: 'JFSC-ACK-2026-1847', reviewer: 'Sarah Mitchell (MLRO)', approved_by: 'James Clarke (Compliance Director)', created_at: '2026-02-25T14:00:00Z' },
  { id: 's3', report_ref: 'SAR-2026-0039', report_type: 'SAR', status: 'draft', priority: 'standard', subject_name: 'Sir Richard Pemberton', subject_account: 'ACC-002-JE', subject_type: 'individual', total_suspicious_amount: 165000, currency: 'GBP', narrative: '', created_at: '2026-03-02T09:00:00Z' },
];

const MOCK_RULES = [
  { id: 'r1', rule_name: 'Cash Structuring Detection', rule_type: 'structuring', description: 'Flag multiple cash transactions below reporting threshold within rolling 72-hour window', severity: 'critical', is_active: true, matches_count: 3, conditions: { threshold: 10000, currency: 'CHF', window_hours: 72, min_transactions: 2 } },
  { id: 'r2', rule_name: 'Large Wire Transfer', rule_type: 'threshold', description: 'Flag wire transfers exceeding £100,000 to non-whitelisted counterparties', severity: 'high', is_active: true, matches_count: 12, conditions: { threshold: 100000, currency: 'GBP' } },
  { id: 'r3', rule_name: 'Sanctions Jurisdiction', rule_type: 'sanctions', description: 'Block all transactions involving sanctioned jurisdictions (RU, IR, KP, SY, BY)', severity: 'critical', is_active: true, matches_count: 5, conditions: { jurisdictions: ['RU', 'IR', 'KP', 'SY', 'BY'] } },
  { id: 'r4', rule_name: 'PEP Transaction Monitor', rule_type: 'pep', description: 'Enhanced monitoring for all PEP-flagged account transactions exceeding £5,000', severity: 'high', is_active: true, matches_count: 8, conditions: { threshold: 5000 } },
  { id: 'r5', rule_name: 'Velocity Anomaly', rule_type: 'velocity', description: 'Alert when transaction frequency exceeds 200% of 3-month average', severity: 'medium', is_active: true, matches_count: 4, conditions: { multiplier: 2.0, period_months: 3 } },
  { id: 'r6', rule_name: 'Geographic Risk — High-Risk Corridors', rule_type: 'geographic', description: 'Flag transactions involving FATF grey-list countries', severity: 'medium', is_active: true, matches_count: 7, conditions: { jurisdictions: ['AE', 'LV', 'CY', 'MT', 'PA'] } },
  { id: 'r7', rule_name: 'Round-Tripping Detection', rule_type: 'pattern', description: 'Detect funds returning to originator through intermediary accounts within 30 days', severity: 'high', is_active: false, matches_count: 0, conditions: { window_days: 30, min_amount: 50000 } },
];

const MOCK_DASHBOARD = {
  totalAccounts: 8, highRiskAccounts: 3, totalTransactions: 1247, flaggedTransactions: 42,
  totalVolume: 18450000, avgRiskScore: 34, openAlerts: 4, criticalAlerts: 2,
  activeRules: 6, totalRules: 7, pendingSARs: 2, filedSARs: 1, totalSARs: 3,
  alertsBySeverity: { low: 1, medium: 1, high: 2, critical: 2 },
  alertsByType: { structuring: 1, sanctions_match: 1, pep_transaction: 1, geographic_risk: 1, velocity_anomaly: 1, behavioral_anomaly: 1 },
};

// Monthly trend data
const MONTHLY_TRENDS = [
  { month: 'Sep', transactions: 980, flagged: 28, alerts: 8, sars: 0 },
  { month: 'Oct', transactions: 1050, flagged: 35, alerts: 12, sars: 1 },
  { month: 'Nov', transactions: 1120, flagged: 31, alerts: 9, sars: 1 },
  { month: 'Dec', transactions: 890, flagged: 22, alerts: 6, sars: 0 },
  { month: 'Jan', transactions: 1180, flagged: 38, alerts: 11, sars: 2 },
  { month: 'Feb', transactions: 1247, flagged: 42, alerts: 14, sars: 1 },
];

const RISK_DISTRIBUTION = [
  { range: '0-20', count: 534, label: 'Low' },
  { range: '21-40', count: 389, label: 'Medium-Low' },
  { range: '41-60', count: 198, label: 'Medium' },
  { range: '61-80', count: 89, label: 'High' },
  { range: '81-100', count: 37, label: 'Critical' },
];

/* ═══════════════════════════════════════════════════════════════════════════ */

type Tab = 'overview' | 'transactions' | 'alerts' | 'sars' | 'rules' | 'accounts';

const SEV_CLR: Record<string, string> = { low: 'bg-zinc-800 text-zinc-400', medium: 'bg-blue-900/30 text-blue-400', high: 'bg-amber-900/30 text-amber-400', critical: 'bg-red-900/30 text-red-400' };
const STATUS_CLR: Record<string, string> = { open: 'text-amber-400', investigating: 'text-blue-400', escalated: 'text-purple-400', sar_filed: 'text-emerald-400', false_positive: 'text-zinc-500', resolved: 'text-zinc-500', draft: 'text-zinc-400', in_review: 'text-amber-400', approved: 'text-blue-400', submitted: 'text-emerald-400', acknowledged: 'text-emerald-400', blocked: 'text-red-400', active: 'text-emerald-400', under_review: 'text-amber-400' };
const RISK_BG: Record<string, string> = { low: 'bg-emerald-900/20 text-emerald-400', standard: 'bg-blue-900/20 text-blue-400', enhanced: 'bg-amber-900/20 text-amber-400', high: 'bg-red-900/20 text-red-400', prohibited: 'bg-red-900/40 text-red-300' };
const COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

export default function AMLDashboardPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [selectedAlert, setSelectedAlert] = useState<typeof MOCK_ALERTS[0] | null>(null);
  const [selectedSAR, setSelectedSAR] = useState<typeof MOCK_SARS[0] | null>(null);
  const [screeningId, setScreeningId] = useState<string | null>(null);

  const dash = MOCK_DASHBOARD;

  const fmtCurrency = (v: number, c = 'GBP') => {
    const sym: Record<string, string> = { GBP: '£', USD: '$', EUR: '€', CHF: 'CHF ', AED: 'AED ' };
    return `${sym[c] || ''}${v.toLocaleString()}`;
  };

  const buildPDFConfig = (): PDFReportOptions => ({
    title: 'AML & Suspicious Activity Report',
    subtitle: `Dashboard export — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    module: 'AML & SAR Automation',
    jurisdiction: 'Jersey, Channel Islands',
    classification: 'OFFICIAL — SENSITIVE',
    sections: [
      { type: 'stats', stats: [
        { label: 'Accounts Monitored', value: String(dash.totalAccounts), change: dash.highRiskAccounts + ' high-risk' },
        { label: 'Flagged Transactions', value: String(dash.flaggedTransactions) },
        { label: 'Open Alerts', value: String(dash.openAlerts), change: dash.criticalAlerts + ' critical' },
        { label: 'Pending SARs', value: String(dash.pendingSARs) },
      ] },
      { type: 'heading', title: 'Flagged Transactions' },
      { type: 'table', columns: ['Ref', 'Account', 'Type', 'Amount', 'Counterparty', 'Risk', 'Status'],
        rows: MOCK_TRANSACTIONS.filter(t => t.flagged).map(t => [t.transaction_ref, t.account_id, t.transaction_type, fmtCurrency(t.amount, t.currency), t.counterparty_name, String(t.risk_score), t.screening_status]),
      },
      { type: 'heading', title: 'Open Alerts' },
      { type: 'table', columns: ['Type', 'Severity', 'Title', 'AI Confidence', 'Status'],
        rows: MOCK_ALERTS.filter(a => a.status !== 'resolved').map(a => [a.alert_type.replace(/_/g, ' '), a.severity, a.title, a.ai_confidence ? a.ai_confidence + '%' : '-', a.status]),
      },
      { type: 'heading', title: 'Suspicious Activity Reports' },
      { type: 'table', columns: ['Ref', 'Type', 'Priority', 'Subject', 'Amount', 'Status'],
        rows: MOCK_SARS.map(s => [s.report_ref, s.report_type, s.priority, s.subject_name, fmtCurrency(s.total_suspicious_amount, s.currency), s.status]),
      },
      { type: 'heading', title: 'Active Monitoring Rules' },
      { type: 'table', columns: ['Rule', 'Type', 'Severity', 'Active', 'Matches'],
        rows: MOCK_RULES.map(r => [r.rule_name, r.rule_type, r.severity, r.is_active ? 'Yes' : 'No', String(r.matches_count)]),
      },
    ],
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">AML & SAR Automation</h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        <div className="flex items-center gap-4 app-region-no-drag">
          {dash.openAlerts > 0 && <span className="text-[11px] text-amber-400"><Bell className="w-3 h-3 inline mr-1" />{dash.openAlerts} open alerts</span>}
          {dash.criticalAlerts > 0 && <span className="text-[11px] text-red-400"><AlertTriangle className="w-3 h-3 inline mr-1" />{dash.criticalAlerts} critical</span>}
          {dash.pendingSARs > 0 && <span className="text-[11px] text-purple-400"><FileText className="w-3 h-3 inline mr-1" />{dash.pendingSARs} pending SARs</span>}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 app-region-no-drag">
          <ExportButton getReportConfig={buildPDFConfig} label="Export PDF" compact />
          <button className="h-6 px-2.5 rounded-[5px] text-[11px] text-white/40 hover:text-white/60 hover:bg-white/[0.04] flex items-center gap-1"><Zap className="w-3 h-3" /> Run Screening</button>
          <button className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1"><Plus className="w-3 h-3" /> New SAR</button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 px-5 pt-3 pb-0">
        {(['overview', 'transactions', 'alerts', 'sars', 'rules', 'accounts'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setSelectedAlert(null); setSelectedSAR(null); }} className={cn('px-3 py-1.5 text-[11px] font-medium rounded-t capitalize', tab === t ? 'text-white bg-white/[0.06]' : 'text-zinc-500 hover:text-zinc-300')}>
            {t === 'sars' ? 'SARs' : t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {/* ═══ OVERVIEW ═══ */}
        {tab === 'overview' && (
          <div className="p-5 space-y-5">
            {/* KPI cards */}
            <div className="grid grid-cols-5 gap-3">
              {[
                { l: 'Monitored Accounts', v: dash.totalAccounts, s: `${dash.highRiskAccounts} high-risk`, c: 'text-indigo-400', ic: Users },
                { l: 'Flagged Txns', v: dash.flaggedTransactions, s: `of ${dash.totalTransactions.toLocaleString()}`, c: dash.flaggedTransactions > 0 ? 'text-red-400' : 'text-emerald-400', ic: Activity },
                { l: 'Open Alerts', v: dash.openAlerts, s: `${dash.criticalAlerts} critical`, c: dash.openAlerts > 0 ? 'text-amber-400' : 'text-emerald-400', ic: Bell },
                { l: 'Active Rules', v: dash.activeRules, s: `${dash.totalRules} total`, c: 'text-blue-400', ic: Scale },
                { l: 'SARs', v: dash.totalSARs, s: `${dash.pendingSARs} pending`, c: dash.pendingSARs > 0 ? 'text-purple-400' : 'text-emerald-400', ic: FileText },
              ].map(card => (
                <div key={card.l} className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                  <div className="flex items-center justify-between mb-2"><span className="text-[10px] text-zinc-600 uppercase tracking-wider">{card.l}</span><card.ic className={cn('w-4 h-4', card.c)} /></div>
                  <div className={cn('text-[22px] font-semibold tabular-nums', card.c)}>{card.v}</div>
                  <span className="text-[11px] text-zinc-600">{card.s}</span>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Monthly AML Activity Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={MONTHLY_TRENDS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                    <Area type="monotone" dataKey="flagged" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="alerts" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Risk Score Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={RISK_DISTRIBUTION}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis dataKey="range" tick={{ fill: '#71717a', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {RISK_DISTRIBUTION.map((_, i) => <Cell key={i} fill={['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#dc2626'][i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Alerts by type + severity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Alerts by Type</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={Object.entries(dash.alertsByType).map(([k, v]) => ({ name: k.replace(/_/g, ' '), count: v }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 8 }} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
                <h3 className="text-[12px] font-medium text-white/70 mb-3">Alerts by Severity</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={Object.entries(dash.alertsBySeverity).filter(([,v]) => v > 0).map(([k, v]) => ({ name: k, value: v }))} cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value" paddingAngle={3}>
                      {Object.entries(dash.alertsBySeverity).filter(([,v]) => v > 0).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent critical alerts */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4">
              <h3 className="text-[12px] font-medium text-white/70 mb-3">Recent Critical Alerts</h3>
              <div className="space-y-2">
                {MOCK_ALERTS.filter(a => a.severity === 'critical' || a.severity === 'high').map(a => (
                  <div key={a.id} onClick={() => { setTab('alerts'); setSelectedAlert(a); }} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors">
                    <AlertTriangle className={cn('w-4 h-4 flex-shrink-0', a.severity === 'critical' ? 'text-red-400' : 'text-amber-400')} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-white/80 truncate">{a.title}</div>
                      <div className="text-[10px] text-zinc-600 mt-0.5">{a.alert_type.replace(/_/g, ' ')} · AI confidence: {a.ai_confidence}%</div>
                    </div>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full capitalize', SEV_CLR[a.severity])}>{a.severity}</span>
                    <ChevronRight className="w-3 h-3 text-zinc-700" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ TRANSACTIONS ═══ */}
        {tab === 'transactions' && (
          <div className="p-5">
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a]">
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-[12px] font-medium text-white/70">AML Transaction Monitor</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-600">{MOCK_TRANSACTIONS.length} transactions · {MOCK_TRANSACTIONS.filter(t => t.flagged).length} flagged</span>
                </div>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {MOCK_TRANSACTIONS.map(t => {
                  const acct = MOCK_ACCOUNTS.find(a => a.id === t.account_id);
                  return (
                    <div key={t.id}>
                      <div className={cn('flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors', t.flagged && 'bg-red-950/5')}>
                        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', t.risk_score > 70 ? 'bg-red-500' : t.risk_score > 40 ? 'bg-amber-500' : 'bg-emerald-500')} />
                        <div className="w-32 flex-shrink-0">
                          <div className="text-[11px] text-white/80 font-mono">{t.transaction_ref}</div>
                          <div className="text-[10px] text-zinc-600">{new Date(t.timestamp).toLocaleDateString()}</div>
                        </div>
                        <div className="w-20 flex-shrink-0">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 capitalize">{t.transaction_type}</span>
                        </div>
                        <div className="w-28 flex-shrink-0 text-right">
                          <span className="text-[12px] text-white/80 font-medium tabular-nums">{fmtCurrency(t.amount, t.currency)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] text-white/60 truncate">{t.counterparty_name}</div>
                          <div className="text-[10px] text-zinc-600">{t.counterparty_jurisdiction} · {t.channel}</div>
                        </div>
                        <div className="w-16 flex-shrink-0">
                          <div className="flex items-center gap-1">
                            <div className={cn('h-1.5 rounded-full', t.risk_score > 70 ? 'bg-red-500' : t.risk_score > 40 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${t.risk_score}%` }} />
                            <span className={cn('text-[10px] tabular-nums', t.risk_score > 70 ? 'text-red-400' : t.risk_score > 40 ? 'text-amber-400' : 'text-emerald-400')}>{t.risk_score}</span>
                          </div>
                        </div>
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full capitalize', STATUS_CLR[t.screening_status] || 'text-zinc-500')}>{t.screening_status}</span>
                        <button onClick={() => setScreeningId(screeningId === t.id ? null : t.id)} className="p-1.5 rounded hover:bg-white/[0.06] text-zinc-600 hover:text-white/60"><Eye className="w-3.5 h-3.5" /></button>
                      </div>
                      {/* Screening detail expansion */}
                      {screeningId === t.id && (
                        <div className="px-4 py-3 bg-white/[0.015] border-t border-white/[0.03]">
                          <div className="grid grid-cols-4 gap-3">
                            <div className="p-2.5 rounded-lg bg-white/[0.02]">
                              <div className="text-[10px] text-zinc-600 uppercase">Account Holder</div>
                              <div className="text-[11px] text-white/70 mt-0.5">{acct?.account_holder || 'Unknown'}</div>
                              <div className="text-[10px] text-zinc-600 mt-0.5">{acct?.jurisdiction} · {acct?.account_type}</div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white/[0.02]">
                              <div className="text-[10px] text-zinc-600 uppercase">Risk Assessment</div>
                              <div className={cn('text-[16px] font-semibold mt-0.5 tabular-nums', t.risk_score > 70 ? 'text-red-400' : t.risk_score > 40 ? 'text-amber-400' : 'text-emerald-400')}>{t.risk_score}/100</div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white/[0.02]">
                              <div className="text-[10px] text-zinc-600 uppercase">Screening Flags</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {acct?.pep_flag && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-400">PEP</span>}
                                {acct?.sanctions_flag && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-900/30 text-red-400">SANCTIONS</span>}
                                {acct?.adverse_media_flag && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-400">ADV MEDIA</span>}
                                {!acct?.pep_flag && !acct?.sanctions_flag && !acct?.adverse_media_flag && <span className="text-[9px] text-zinc-600">No flags</span>}
                              </div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white/[0.02]">
                              <div className="text-[10px] text-zinc-600 uppercase">Channel / Timestamp</div>
                              <div className="text-[11px] text-white/70 mt-0.5 capitalize">{t.channel}</div>
                              <div className="text-[10px] text-zinc-600 mt-0.5">{new Date(t.timestamp).toLocaleString()}</div>
                            </div>
                          </div>
                          {t.flagged && (
                            <div className="mt-2 p-2.5 rounded-lg bg-red-950/10 border border-red-400/10">
                              <div className="text-[10px] text-red-400 font-medium">⚠ This transaction has been flagged for review</div>
                              <div className="text-[10px] text-zinc-500 mt-0.5">Counterparty: {t.counterparty_name} ({t.counterparty_jurisdiction}) · Amount: {fmtCurrency(t.amount, t.currency)}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ ALERTS ═══ */}
        {tab === 'alerts' && !selectedAlert && (
          <div className="p-5">
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a]">
              <div className="p-4 border-b border-white/[0.06]">
                <h3 className="text-[12px] font-medium text-white/70">AML Alerts</h3>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {MOCK_ALERTS.map(a => (
                  <div key={a.id} onClick={() => setSelectedAlert(a)} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <AlertTriangle className={cn('w-4 h-4 flex-shrink-0', a.severity === 'critical' ? 'text-red-400' : a.severity === 'high' ? 'text-amber-400' : a.severity === 'medium' ? 'text-blue-400' : 'text-zinc-500')} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-white/80 truncate">{a.title}</div>
                      <div className="text-[10px] text-zinc-600 mt-0.5">{a.alert_type.replace(/_/g, ' ')} · {new Date(a.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fingerprint className="w-3 h-3 text-zinc-600" />
                      <span className="text-[10px] text-zinc-500">{a.ai_confidence}%</span>
                    </div>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full capitalize', SEV_CLR[a.severity])}>{a.severity}</span>
                    <span className={cn('text-[10px] capitalize', STATUS_CLR[a.status])}>{a.status.replace(/_/g, ' ')}</span>
                    <ChevronRight className="w-3 h-3 text-zinc-700" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alert detail */}
        {tab === 'alerts' && selectedAlert && (
          <div className="p-5 space-y-4">
            <button onClick={() => setSelectedAlert(null)} className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-white/70">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to alerts
            </button>
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[14px] font-medium text-white/90">{selectedAlert.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full capitalize', SEV_CLR[selectedAlert.severity])}>{selectedAlert.severity}</span>
                    <span className={cn('text-[10px] capitalize', STATUS_CLR[selectedAlert.status])}>{selectedAlert.status.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-zinc-600">{selectedAlert.alert_type.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-7 px-3 rounded-lg text-[11px] text-amber-400 border border-amber-400/20 hover:bg-amber-400/5">Escalate</button>
                  <button className="h-7 px-3 rounded-lg text-[11px] text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/5">Resolve</button>
                  <button className="h-7 px-3 rounded-lg text-[11px] bg-indigo-600 text-white hover:bg-indigo-500">File SAR</button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <p className="text-[12px] text-white/70 leading-relaxed">{selectedAlert.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-[10px] text-zinc-600 uppercase mb-1">AI Confidence</div>
                  <div className={cn('text-[18px] font-semibold', selectedAlert.ai_confidence! > 80 ? 'text-red-400' : selectedAlert.ai_confidence! > 60 ? 'text-amber-400' : 'text-blue-400')}>{selectedAlert.ai_confidence}%</div>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-[10px] text-zinc-600 uppercase mb-1">AI Reasoning</div>
                  <p className="text-[11px] text-white/60 leading-relaxed">{selectedAlert.ai_reasoning}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-[10px] text-zinc-600 uppercase mb-1">Recommended Action</div>
                  <p className="text-[11px] text-white/60 leading-relaxed">{selectedAlert.ai_recommended_action}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ SARs ═══ */}
        {tab === 'sars' && !selectedSAR && (
          <div className="p-5">
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a]">
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-[12px] font-medium text-white/70">Suspicious Activity Reports</h3>
                <button className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600/80 text-white hover:bg-indigo-500 flex items-center gap-1"><Plus className="w-3 h-3" /> New SAR</button>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {MOCK_SARS.map(s => (
                  <div key={s.id} onClick={() => setSelectedSAR(s)} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <FileText className={cn('w-4 h-4 flex-shrink-0', s.priority === 'critical' ? 'text-red-400' : s.priority === 'urgent' ? 'text-amber-400' : 'text-zinc-500')} />
                    <div className="w-32 flex-shrink-0">
                      <div className="text-[11px] text-white/80 font-mono">{s.report_ref}</div>
                      <div className="text-[10px] text-zinc-600">{s.report_type}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-white/80 truncate">{s.subject_name}</div>
                      <div className="text-[10px] text-zinc-600">{s.subject_type} · {s.subject_account}</div>
                    </div>
                    <div className="text-right w-28">
                      <span className="text-[12px] text-white/80 font-medium">{fmtCurrency(s.total_suspicious_amount, s.currency)}</span>
                    </div>
                    <span className={cn('text-[10px] capitalize', STATUS_CLR[s.status])}>{s.status.replace(/_/g, ' ')}</span>
                    <ChevronRight className="w-3 h-3 text-zinc-700" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SAR detail */}
        {tab === 'sars' && selectedSAR && (
          <div className="p-5 space-y-4">
            <button onClick={() => setSelectedSAR(null)} className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-white/70">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to SARs
            </button>
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[14px] font-medium text-white/90">{selectedSAR.report_ref}</h2>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full capitalize', SEV_CLR[selectedSAR.priority === 'critical' ? 'critical' : selectedSAR.priority === 'urgent' ? 'high' : 'medium'])}>{selectedSAR.priority}</span>
                    <span className={cn('text-[10px] capitalize', STATUS_CLR[selectedSAR.status])}>{selectedSAR.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">Subject: {selectedSAR.subject_name} ({selectedSAR.subject_type})</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-7 px-3 rounded-lg text-[11px] text-indigo-400 border border-indigo-400/20 hover:bg-indigo-400/5 flex items-center gap-1"><Zap className="w-3 h-3" /> AI Narrative</button>
                  <button className="h-7 px-3 rounded-lg text-[11px] bg-emerald-600/80 text-white hover:bg-emerald-500 flex items-center gap-1"><Send className="w-3 h-3" /> Submit to JFSC</button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-white/[0.02]">
                  <div className="text-[10px] text-zinc-600 uppercase">Suspicious Amount</div>
                  <div className="text-[16px] font-semibold text-red-400 mt-1">{fmtCurrency(selectedSAR.total_suspicious_amount, selectedSAR.currency)}</div>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02]">
                  <div className="text-[10px] text-zinc-600 uppercase">Account</div>
                  <div className="text-[12px] text-white/70 mt-1 font-mono">{selectedSAR.subject_account || 'N/A'}</div>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02]">
                  <div className="text-[10px] text-zinc-600 uppercase">Reviewer</div>
                  <div className="text-[12px] text-white/70 mt-1">{selectedSAR.reviewer || 'Unassigned'}</div>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02]">
                  <div className="text-[10px] text-zinc-600 uppercase">Filed</div>
                  <div className="text-[12px] text-white/70 mt-1">{selectedSAR.filed_at ? new Date(selectedSAR.filed_at).toLocaleDateString() : 'Not yet filed'}</div>
                </div>
              </div>

              {/* Narrative */}
              {selectedSAR.narrative && (
                <div>
                  <h3 className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2">SAR Narrative</h3>
                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-[12px] text-white/70 leading-relaxed whitespace-pre-wrap">{selectedSAR.narrative}</p>
                  </div>
                </div>
              )}

              {/* AI Narrative */}
              {selectedSAR.ai_generated_narrative && (
                <div>
                  <h3 className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Zap className="w-3 h-3 text-indigo-400" /> AI-Generated Narrative</h3>
                  <div className="p-4 rounded-lg bg-indigo-950/10 border border-indigo-400/10">
                    <p className="text-[12px] text-white/70 leading-relaxed whitespace-pre-wrap">{selectedSAR.ai_generated_narrative}</p>
                  </div>
                </div>
              )}

              {selectedSAR.acknowledgement_ref && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/10 border border-emerald-400/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">Filed with {selectedSAR.filed_with} · Acknowledgement: {selectedSAR.acknowledgement_ref}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ RULES ═══ */}
        {tab === 'rules' && (
          <div className="p-5">
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a]">
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-[12px] font-medium text-white/70">AML Rules Engine</h3>
                <button className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600/80 text-white hover:bg-indigo-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Rule</button>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {MOCK_RULES.map(r => (
                  <div key={r.id} className="flex items-center gap-4 px-4 py-3">
                    <div className={cn('w-2 h-2 rounded-full flex-shrink-0', r.is_active ? 'bg-emerald-500' : 'bg-zinc-700')} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-white/80">{r.rule_name}</div>
                      <div className="text-[10px] text-zinc-600 mt-0.5">{r.description}</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 capitalize">{r.rule_type}</span>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full', SEV_CLR[r.severity])}>{r.severity}</span>
                    <span className="text-[10px] text-zinc-600 w-16 text-right">{r.matches_count} hits</span>
                    <button className={cn('h-6 px-2 rounded text-[10px]', r.is_active ? 'text-emerald-400 bg-emerald-900/20' : 'text-zinc-600 bg-zinc-800')}>
                      {r.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ ACCOUNTS ═══ */}
        {tab === 'accounts' && (
          <div className="p-5">
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a]">
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-[12px] font-medium text-white/70">Monitored Accounts</h3>
                <button className="h-6 px-2.5 rounded-[5px] text-[11px] font-medium bg-indigo-600/80 text-white hover:bg-indigo-500 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Account</button>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {MOCK_ACCOUNTS.map(a => (
                  <div key={a.id} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                      {a.account_type === 'corporate' ? <Building2 className="w-4 h-4 text-zinc-500" /> : a.account_type === 'trust' ? <Lock className="w-4 h-4 text-zinc-500" /> : <Users className="w-4 h-4 text-zinc-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-white/80">{a.account_holder}</div>
                      <div className="text-[10px] text-zinc-600">{a.account_ref} · {a.jurisdiction} · {a.account_type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.pep_flag && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-400">PEP</span>}
                      {a.sanctions_flag && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-900/30 text-red-400">SANCTIONS</span>}
                      {a.adverse_media_flag && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-400">ADV MEDIA</span>}
                    </div>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full', RISK_BG[a.risk_tier])}>{a.risk_tier}</span>
                    <span className={cn('text-[10px] capitalize', STATUS_CLR[a.status])}>{a.status.replace(/_/g, ' ')}</span>
                    <div className="text-right w-24">
                      <div className="text-[10px] text-zinc-600">Next review</div>
                      <div className="text-[10px] text-zinc-400">{a.next_review_date ? new Date(a.next_review_date).toLocaleDateString() : 'N/A'}</div>
                    </div>
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
