import { useState } from 'react';
import {
  Database, Server, Lock, ShieldCheck, Scale,
  CheckCircle2, MapPin, Cloud, HardDrive, ArrowRightLeft,
  ChevronDown, ChevronRight, Eye,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { cn } from '../lib/utils';
import ExportButton from '../components/ui/ExportButton';
import type { PDFReportOptions } from '../lib/pdfExport';

/* ═══════════════════════════════════════════════════════════════════════════
   DATA SOVEREIGNTY & RESIDENCY DASHBOARD
   Demonstrates compliance with GDPR, Jersey Data Protection Authority (JDPA),
   UK Data Protection Act 2018, and cross-border data transfer requirements.
   Critical for government & regulatory demo: shows WHERE data lives, HOW it
   moves, and WHAT controls are in place.
   ═══════════════════════════════════════════════════════════════════════════ */

type ComplianceStatus = 'compliant' | 'partial' | 'non_compliant' | 'pending';
type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';

interface DataStore {
  id: string;
  name: string;
  type: 'primary' | 'replica' | 'backup' | 'archive';
  provider: string;
  region: string;
  country: string;
  countryCode: string;
  classification: DataClassification;
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
  dataCategories: string[];
  recordCount: number;
  lastAudit: string;
  complianceStatus: ComplianceStatus;
  retentionPolicy: string;
  accessControls: string[];
}

interface DataFlow {
  id: string;
  source: string;
  destination: string;
  dataType: string;
  frequency: string;
  encrypted: boolean;
  legalBasis: string;
  transferMechanism: string;
  status: ComplianceStatus;
}

interface Regulation {
  id: string;
  name: string;
  jurisdiction: string;
  status: ComplianceStatus;
  requirements: number;
  met: number;
  lastAssessed: string;
}

const MOCK_STORES: DataStore[] = [
  { id: 'ds1', name: 'Primary Transaction DB', type: 'primary', provider: 'Jersey Data Centre (JDC)', region: 'St Helier', country: 'Jersey', countryCode: 'JE', classification: 'restricted', encryptionAtRest: true, encryptionInTransit: true, dataCategories: ['Transaction Records', 'SAR Data', 'KYC Documents'], recordCount: 2847000, lastAudit: '2026-02-15', complianceStatus: 'compliant', retentionPolicy: '7 years (JFSC requirement)', accessControls: ['RBAC', 'MFA', 'IP Whitelisting', 'Audit Logging'] },
  { id: 'ds2', name: 'KYC Document Store', type: 'primary', provider: 'Jersey Data Centre (JDC)', region: 'St Helier', country: 'Jersey', countryCode: 'JE', classification: 'restricted', encryptionAtRest: true, encryptionInTransit: true, dataCategories: ['Identity Documents', 'Proof of Address', 'UBO Records'], recordCount: 18500, lastAudit: '2026-02-10', complianceStatus: 'compliant', retentionPolicy: '5 years post relationship end', accessControls: ['RBAC', 'MFA', 'Document-level ACL'] },
  { id: 'ds3', name: 'AI Model Registry', type: 'primary', provider: 'Jersey Data Centre (JDC)', region: 'St Helier', country: 'Jersey', countryCode: 'JE', classification: 'confidential', encryptionAtRest: true, encryptionInTransit: true, dataCategories: ['Model Weights', 'Training Metadata', 'Inference Logs'], recordCount: 156, lastAudit: '2026-01-28', complianceStatus: 'compliant', retentionPolicy: '3 years model lifecycle', accessControls: ['RBAC', 'Key-based Auth', 'Audit Logging'] },
  { id: 'ds4', name: 'Disaster Recovery Replica', type: 'replica', provider: 'Guernsey Secure Hosting', region: 'St Peter Port', country: 'Guernsey', countryCode: 'GG', classification: 'restricted', encryptionAtRest: true, encryptionInTransit: true, dataCategories: ['Full Database Replica', 'Document Store Mirror'], recordCount: 2847000, lastAudit: '2026-02-01', complianceStatus: 'compliant', retentionPolicy: 'Mirrored from primary', accessControls: ['RBAC', 'MFA', 'VPN-only', 'Geo-restricted'] },
  { id: 'ds5', name: 'Regulatory Reporting Archive', type: 'archive', provider: 'Crown Dependencies Cloud', region: 'Jersey', country: 'Jersey', countryCode: 'JE', classification: 'confidential', encryptionAtRest: true, encryptionInTransit: true, dataCategories: ['Historical SARs', 'Regulatory Reports', 'Audit Records'], recordCount: 45200, lastAudit: '2026-01-15', complianceStatus: 'compliant', retentionPolicy: '10 years (regulatory minimum)', accessControls: ['RBAC', 'Time-locked Access', 'Dual Authorization'] },
  { id: 'ds6', name: 'Analytics Sandbox', type: 'primary', provider: 'Jersey Data Centre (JDC)', region: 'St Helier', country: 'Jersey', countryCode: 'JE', classification: 'internal', encryptionAtRest: true, encryptionInTransit: true, dataCategories: ['Anonymised Metrics', 'Aggregated Statistics', 'Performance Data'], recordCount: 890000, lastAudit: '2026-02-18', complianceStatus: 'compliant', retentionPolicy: '2 years rolling', accessControls: ['RBAC', 'Data Masking', 'Anonymisation Layer'] },
  { id: 'ds7', name: 'Email & Communications Log', type: 'primary', provider: 'Jersey Data Centre (JDC)', region: 'St Helier', country: 'Jersey', countryCode: 'JE', classification: 'confidential', encryptionAtRest: true, encryptionInTransit: true, dataCategories: ['Client Communications', 'Internal Correspondence', 'Alert Notifications'], recordCount: 312000, lastAudit: '2026-02-12', complianceStatus: 'partial', retentionPolicy: '3 years', accessControls: ['RBAC', 'MFA'] },
  { id: 'ds8', name: 'Third-party Sanctions Feed', type: 'primary', provider: 'UK Secure Cloud', region: 'London', country: 'United Kingdom', countryCode: 'GB', classification: 'confidential', encryptionAtRest: true, encryptionInTransit: true, dataCategories: ['OFSI Sanctions List', 'EU Sanctions', 'UN Sanctions', 'PEP Data'], recordCount: 1240000, lastAudit: '2026-02-20', complianceStatus: 'compliant', retentionPolicy: 'Real-time feed, 30-day cache', accessControls: ['API Key Auth', 'IP Whitelisting', 'TLS 1.3'] },
];

const MOCK_FLOWS: DataFlow[] = [
  { id: 'f1', source: 'Primary Transaction DB', destination: 'Disaster Recovery Replica', dataType: 'Full database replication', frequency: 'Real-time (async)', encrypted: true, legalBasis: 'Business continuity — Crown Dependencies adequacy', transferMechanism: 'TLS 1.3 VPN tunnel', status: 'compliant' },
  { id: 'f2', source: 'KYC Document Store', destination: 'AI Model Registry', dataType: 'Anonymised training features', frequency: 'Weekly batch', encrypted: true, legalBasis: 'Legitimate interest — model improvement', transferMechanism: 'Internal encrypted bus', status: 'compliant' },
  { id: 'f3', source: 'Third-party Sanctions Feed', destination: 'Primary Transaction DB', dataType: 'Sanctions & PEP updates', frequency: 'Every 6 hours', encrypted: true, legalBasis: 'Legal obligation — JFSC AML/CFT', transferMechanism: 'TLS 1.3 API', status: 'compliant' },
  { id: 'f4', source: 'Primary Transaction DB', destination: 'Regulatory Reporting Archive', dataType: 'SAR & STR reports', frequency: 'Event-driven', encrypted: true, legalBasis: 'Legal obligation — POCL 1999', transferMechanism: 'Internal encrypted bus', status: 'compliant' },
  { id: 'f5', source: 'Primary Transaction DB', destination: 'Analytics Sandbox', dataType: 'Anonymised transaction metrics', frequency: 'Daily batch', encrypted: true, legalBasis: 'Legitimate interest — analytics', transferMechanism: 'Data pipeline with masking', status: 'compliant' },
  { id: 'f6', source: 'Primary Transaction DB', destination: 'JFSC Reporting Portal', dataType: 'SAR filings', frequency: 'On-demand', encrypted: true, legalBasis: 'Legal obligation — POCL 1999', transferMechanism: 'JFSC Secure Portal (HTTPS)', status: 'compliant' },
  { id: 'f7', source: 'Email & Communications Log', destination: 'Regulatory Reporting Archive', dataType: 'Flagged communications', frequency: 'Event-driven', encrypted: true, legalBasis: 'Legal obligation — record keeping', transferMechanism: 'Internal encrypted bus', status: 'partial' },
];

const MOCK_REGULATIONS: Regulation[] = [
  { id: 'r1', name: 'JDPA Data Protection (Jersey) Law 2018', jurisdiction: 'Jersey', status: 'compliant', requirements: 12, met: 12, lastAssessed: '2026-02-15' },
  { id: 'r2', name: 'GDPR (via adequacy agreement)', jurisdiction: 'EU/EEA', status: 'compliant', requirements: 18, met: 17, lastAssessed: '2026-02-10' },
  { id: 'r3', name: 'UK Data Protection Act 2018', jurisdiction: 'United Kingdom', status: 'compliant', requirements: 15, met: 15, lastAssessed: '2026-01-28' },
  { id: 'r4', name: 'JFSC Data Handling Requirements', jurisdiction: 'Jersey', status: 'compliant', requirements: 8, met: 8, lastAssessed: '2026-02-20' },
  { id: 'r5', name: 'EU AI Act — Data Governance (Art. 10)', jurisdiction: 'EU', status: 'partial', requirements: 6, met: 4, lastAssessed: '2026-02-01' },
  { id: 'r6', name: 'Crown Dependencies Mutual Recognition', jurisdiction: 'Crown Dependencies', status: 'compliant', requirements: 5, met: 5, lastAssessed: '2026-01-20' },
];

const STATUS_CLR: Record<ComplianceStatus, string> = {
  compliant: 'text-emerald-400 bg-emerald-400/10',
  partial: 'text-amber-400 bg-amber-400/10',
  non_compliant: 'text-red-400 bg-red-400/10',
  pending: 'text-zinc-400 bg-zinc-400/10',
};

const CLASS_CLR: Record<DataClassification, string> = {
  public: 'text-zinc-400 bg-zinc-400/10',
  internal: 'text-blue-400 bg-blue-400/10',
  confidential: 'text-amber-400 bg-amber-400/10',
  restricted: 'text-red-400 bg-red-400/10',
};

const TYPE_ICON: Record<string, React.ElementType> = {
  primary: HardDrive,
  replica: ArrowRightLeft,
  backup: Cloud,
  archive: Database,
};

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function DataSovereigntyPage() {
  const [selectedStore, setSelectedStore] = useState<DataStore | null>(null);
  const [viewMode, setViewMode] = useState<'stores' | 'flows' | 'regulations'>('stores');
  const [expandedFlow, setExpandedFlow] = useState<string | null>(null);

  // Aggregate stats
  const totalRecords = MOCK_STORES.reduce((s, d) => s + d.recordCount, 0);
  const encryptedPct = Math.round((MOCK_STORES.filter(d => d.encryptionAtRest && d.encryptionInTransit).length / MOCK_STORES.length) * 100);
  const compliantStores = MOCK_STORES.filter(d => d.complianceStatus === 'compliant').length;
  const jerseyStores = MOCK_STORES.filter(d => d.countryCode === 'JE').length;

  // Chart: records by country
  const byCountry = MOCK_STORES.reduce((acc, d) => {
    acc[d.country] = (acc[d.country] || 0) + d.recordCount;
    return acc;
  }, {} as Record<string, number>);
  const countryData = Object.entries(byCountry).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Chart: stores by classification
  const byClassification = MOCK_STORES.reduce((acc, d) => {
    acc[d.classification] = (acc[d.classification] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const classData = Object.entries(byClassification).map(([name, value]) => ({ name, value }));

  function buildPDFConfig(): PDFReportOptions {
    return {
      title: 'Data Sovereignty & Residency Report',
      subtitle: 'Data storage locations, transfer compliance, and regulatory status',
      module: 'Data Sovereignty',
      jurisdiction: 'Jersey / Crown Dependencies',
      classification: 'CONFIDENTIAL',
      generatedBy: 'Velanova AI Governance Engine',
      sections: [
        { type: 'stats', stats: [
          { label: 'Total Records', value: (totalRecords / 1000000).toFixed(1) + 'M' },
          { label: 'Encryption Coverage', value: encryptedPct + '%' },
          { label: 'Compliant Stores', value: `${compliantStores}/${MOCK_STORES.length}` },
          { label: 'Jersey-Resident', value: `${jerseyStores}/${MOCK_STORES.length}` },
        ]},
        { type: 'heading', content: 'Data Store Inventory' },
        { type: 'table', columns: ['Store', 'Location', 'Classification', 'Status', 'Records'], rows: MOCK_STORES.map(d => [d.name, `${d.region}, ${d.country}`, d.classification, d.complianceStatus, d.recordCount.toLocaleString()]) },
        { type: 'heading', content: 'Cross-Border Data Flows' },
        { type: 'table', columns: ['Source', 'Destination', 'Data Type', 'Legal Basis', 'Status'], rows: MOCK_FLOWS.map(f => [f.source, f.destination, f.dataType, f.legalBasis, f.status]) },
        { type: 'heading', content: 'Regulatory Compliance' },
        { type: 'table', columns: ['Regulation', 'Jurisdiction', 'Requirements Met', 'Status'], rows: MOCK_REGULATIONS.map(r => [r.name, r.jurisdiction, `${r.met}/${r.requirements}`, r.status]) },
      ],
    };
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#030303] text-white overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <h1 className="text-[14px] font-semibold tracking-tight">Data Sovereignty</h1>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-medium">JDPA / GDPR</span>
        </div>
        <div className="flex items-center gap-1.5 app-region-no-drag">
          {(['stores', 'flows', 'regulations'] as const).map(v => (
            <button key={v} onClick={() => setViewMode(v)} className={cn('h-7 px-3 rounded-lg text-[11px] capitalize transition-colors', viewMode === v ? 'bg-white/[0.08] text-white' : 'text-zinc-500 hover:text-zinc-300')}>
              {v === 'stores' ? 'Data Stores' : v === 'flows' ? 'Data Flows' : 'Regulations'}
            </button>
          ))}
          <ExportButton getReportConfig={buildPDFConfig} compact />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Data Records', value: (totalRecords / 1000000).toFixed(1) + 'M', icon: Database, color: 'text-indigo-400' },
            { label: 'Encryption Coverage', value: encryptedPct + '%', icon: Lock, color: 'text-emerald-400' },
            { label: 'Compliant Stores', value: `${compliantStores}/${MOCK_STORES.length}`, icon: ShieldCheck, color: 'text-emerald-400' },
            { label: 'Jersey-Resident Data', value: `${jerseyStores}/${MOCK_STORES.length} stores`, icon: MapPin, color: 'text-indigo-400' },
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

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <span className="text-[11px] text-zinc-400 font-medium">Records by Country</span>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={countryData} margin={{ top: 12, right: 4, bottom: 0, left: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#52525b', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => (v / 1000000).toFixed(1) + 'M'} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <span className="text-[11px] text-zinc-400 font-medium">Classification Breakdown</span>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={classData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {classData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-1 justify-center">
              {classData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-[10px] text-zinc-500 capitalize">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Stores View */}
        {viewMode === 'stores' && (
          <div className="grid grid-cols-3 gap-3">
            {MOCK_STORES.map(store => {
              const TypeIcon = TYPE_ICON[store.type] || HardDrive;
              return (
                <div
                  key={store.id}
                  onClick={() => setSelectedStore(selectedStore?.id === store.id ? null : store)}
                  className={cn(
                    'rounded-xl border bg-white/[0.02] p-4 space-y-3 cursor-pointer transition-all hover:bg-white/[0.03]',
                    selectedStore?.id === store.id ? 'border-indigo-500/30' : 'border-white/[0.06]'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="w-4 h-4 text-zinc-500" />
                      <span className="text-[12px] font-medium text-white/80 truncate">{store.name}</span>
                    </div>
                    <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', STATUS_CLR[store.complianceStatus])}>
                      {store.complianceStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-zinc-600" />
                      <span className="text-[10px] text-zinc-400">{store.region}, {store.country}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Server className="w-3 h-3 text-zinc-600" />
                      <span className="text-[10px] text-zinc-400">{store.provider}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', CLASS_CLR[store.classification])}>{store.classification}</span>
                      {store.encryptionAtRest && <Lock className="w-3 h-3 text-emerald-500" />}
                      {store.encryptionInTransit && <ArrowRightLeft className="w-3 h-3 text-emerald-500" />}
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-600">
                    {store.recordCount.toLocaleString()} records · Last audit: {store.lastAudit}
                  </div>

                  {/* Expanded detail panel */}
                  {selectedStore?.id === store.id && (
                    <div className="border-t border-white/[0.06] pt-3 mt-2 space-y-2">
                      <div>
                        <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Data Categories</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {store.dataCategories.map(c => (
                            <span key={c} className="text-[9px] px-1.5 py-0.5 bg-white/[0.04] text-zinc-400 rounded">{c}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Access Controls</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {store.accessControls.map(a => (
                            <span key={a} className="text-[9px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded">{a}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Retention Policy</span>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{store.retentionPolicy}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-zinc-600">Encryption:</span>
                        <span className="text-[9px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> At Rest
                        </span>
                        <span className="text-[9px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> In Transit
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Data Flows View */}
        {viewMode === 'flows' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
              <span className="text-[12px] font-medium text-white/70">Cross-border & Internal Data Flows</span>
              <span className="text-[10px] text-zinc-600">({MOCK_FLOWS.length} active flows)</span>
            </div>
            {MOCK_FLOWS.map(flow => (
              <div
                key={flow.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
              >
                <div
                  onClick={() => setExpandedFlow(expandedFlow === flow.id ? null : flow.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Server className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      <span className="text-[11px] text-white/70 truncate">{flow.source}</span>
                    </div>
                    <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <div className="flex items-center gap-2 min-w-0">
                      <Server className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      <span className="text-[11px] text-white/70 truncate">{flow.destination}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {flow.encrypted && <Lock className="w-3 h-3 text-emerald-500" />}
                    <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', STATUS_CLR[flow.status])}>
                      {flow.status.replace('_', ' ')}
                    </span>
                    {expandedFlow === flow.id ? <ChevronDown className="w-3.5 h-3.5 text-zinc-600" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />}
                  </div>
                </div>
                {expandedFlow === flow.id && (
                  <div className="px-4 pb-4 pt-0 grid grid-cols-2 gap-3 border-t border-white/[0.04]">
                    <div className="pt-3">
                      <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Data Type</span>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{flow.dataType}</p>
                    </div>
                    <div className="pt-3">
                      <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Frequency</span>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{flow.frequency}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Legal Basis</span>
                      <p className="text-[11px] text-indigo-400 mt-0.5">{flow.legalBasis}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Transfer Mechanism</span>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{flow.transferMechanism}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Regulations View */}
        {viewMode === 'regulations' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-indigo-400" />
              <span className="text-[12px] font-medium text-white/70">Data Protection Regulatory Compliance</span>
            </div>
            {MOCK_REGULATIONS.map(reg => {
              const pct = Math.round((reg.met / reg.requirements) * 100);
              return (
                <div key={reg.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[12px] font-medium text-white/80">{reg.name}</span>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{reg.jurisdiction} · Last assessed: {reg.lastAssessed}</p>
                    </div>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded capitalize font-medium', STATUS_CLR[reg.status])}>
                      {reg.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-zinc-500">{reg.met}/{reg.requirements} requirements met</span>
                      <span className="text-[10px] text-zinc-400 font-medium">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', pct === 100 ? 'bg-emerald-500' : pct >= 80 ? 'bg-amber-500' : 'bg-red-500')}
                        style={{ width: pct + '%' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Data Residency Guarantee */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-900/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[12px] font-medium text-emerald-400">Data Residency Guarantee</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                All primary data stores are physically located in Jersey (Crown Dependency). Disaster recovery 
                replication is limited to Guernsey under Crown Dependencies mutual adequacy recognition. 
                No personal or sensitive data is transferred to jurisdictions outside Crown Dependencies adequacy 
                coverage without explicit legal basis and appropriate transfer mechanisms.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {['JDPA Adequacy', 'GDPR Art.45 Equivalent', 'UK DPA 2018 Compatible', 'No US Cloud Dependency', 'Crown Dependencies Residency'].map(t => (
                  <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer compliance notice */}
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 flex items-start gap-2">
          <Eye className="w-3.5 h-3.5 text-zinc-600 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-zinc-600 leading-relaxed">
            Data sovereignty dashboard reflects the current configuration of Velanova AI Governance Engine deployments. 
            Storage locations and transfer mechanisms are subject to ongoing audit by Jersey Data Protection Authority (JDPA) 
            and Jersey Financial Services Commission (JFSC). Last infrastructure audit: February 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
