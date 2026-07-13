import { useState } from 'react';
import {
  Globe, ChevronDown, ChevronRight, CheckCircle2,
  AlertTriangle, ArrowLeftRight, Shield, Scale, Filter,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { cn } from '../lib/utils';
import ExportButton from '../components/ui/ExportButton';
import type { PDFReportOptions } from '../lib/pdfExport';

/* ═══════════════════════════════════════════════════════════════════════════
   MULTI-JURISDICTION REGULATORY COMPARISON
   Side-by-side comparison of regulatory environments across key jurisdictions.
   Aligned with FATF mutual evaluations, OECD guidance, and local regulator
   handbooks (JFSC, FCA, FINMA, MAS, etc.)
   ═══════════════════════════════════════════════════════════════════════════ */

interface Jurisdiction {
  id: string;
  name: string;
  code: string;
  regulator: string;
  fatfRating: string;
  riskScore: number;
  amlFramework: { score: number; detail: string };
  kycRequirements: { score: number; detail: string };
  dataProtection: { score: number; detail: string };
  aiGovernance: { score: number; detail: string };
  sanctionsRegime: { score: number; detail: string };
  taxTransparency: { score: number; detail: string };
  cryptoRegulation: { score: number; detail: string };
  esgReporting: { score: number; detail: string };
  whistleblower: { score: number; detail: string };
  enforcementStrength: { score: number; detail: string };
}

type DimensionKey = 'amlFramework' | 'kycRequirements' | 'dataProtection' | 'aiGovernance' | 'sanctionsRegime' | 'taxTransparency' | 'cryptoRegulation' | 'esgReporting' | 'whistleblower' | 'enforcementStrength';

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  amlFramework: 'AML Framework',
  kycRequirements: 'KYC Requirements',
  dataProtection: 'Data Protection',
  aiGovernance: 'AI Governance',
  sanctionsRegime: 'Sanctions Regime',
  taxTransparency: 'Tax Transparency',
  cryptoRegulation: 'Crypto Regulation',
  esgReporting: 'ESG Reporting',
  whistleblower: 'Whistleblower Protection',
  enforcementStrength: 'Enforcement Strength',
};

const DIMENSIONS = Object.keys(DIMENSION_LABELS) as DimensionKey[];

const JURISDICTIONS: Jurisdiction[] = [
  {
    id: 'je', name: 'Jersey', code: 'JE', regulator: 'JFSC', fatfRating: 'Compliant', riskScore: 18,
    amlFramework: { score: 92, detail: 'POCL 1999, JFSC AML/CFT Handbook 2024. Comprehensive SAR regime. 72-hour filing requirement.' },
    kycRequirements: { score: 90, detail: 'CDD/EDD under JFSC Codes of Practice. UBO registry via JFSC. Trust & Company Service Provider licensing.' },
    dataProtection: { score: 88, detail: 'Data Protection (Jersey) Law 2018. JDPA oversight. EU adequacy equivalent.' },
    aiGovernance: { score: 72, detail: 'No specific AI legislation. JFSC considering guidance. UK AI White Paper principles adopted informally.' },
    sanctionsRegime: { score: 90, detail: 'Orders in Council implement UK/UN sanctions. JFSC Sanctions & Proliferation Financing guidance.' },
    taxTransparency: { score: 94, detail: 'CRS early adopter. FATCA IGA. Beneficial ownership register. No corporate tax for most (0/10/20%).' },
    cryptoRegulation: { score: 78, detail: 'Virtual Currency Exchange registration under POCL. JFSC sandbox approach. 2025 framework update pending.' },
    esgReporting: { score: 65, detail: 'Jersey Finance ESG guidelines. TCFD adoption encouraged. Sustainable Finance Framework 2025.' },
    whistleblower: { score: 75, detail: 'Employment (Jersey) Law protections. JFSC confidential reporting. Limited statutory framework.' },
    enforcementStrength: { score: 85, detail: 'JFSC public statements, fines, licence revocations. Active enforcement stance post-2020.' },
  },
  {
    id: 'uk', name: 'United Kingdom', code: 'GB', regulator: 'FCA / PRA', fatfRating: 'Largely Compliant', riskScore: 22,
    amlFramework: { score: 95, detail: 'MLR 2017 (amended 2022). POCA 2002. NCA oversight. DAML consent regime.' },
    kycRequirements: { score: 93, detail: 'FCA CDD rules. Companies House UBO register (PSC). Electronic verification accepted.' },
    dataProtection: { score: 94, detail: 'UK GDPR + DPA 2018. ICO enforcement. UK adequacy from EU.' },
    aiGovernance: { score: 82, detail: 'AI Safety Institute. Pro-innovation AI White Paper (2023). Sector-specific regulation approach.' },
    sanctionsRegime: { score: 96, detail: 'OFSI enforcement. Sanctions & Anti-Money Laundering Act 2018. Russia regime leading.' },
    taxTransparency: { score: 88, detail: 'CRS compliant. PSC register. Corporate transparency reforms 2024.' },
    cryptoRegulation: { score: 80, detail: 'FCA crypto registration (MLR). Financial promotions regime. Stablecoin regulation 2025.' },
    esgReporting: { score: 85, detail: 'TCFD mandatory for large firms. SDR labelling regime. Transition Plan Taskforce.' },
    whistleblower: { score: 90, detail: 'PIDA 1998. FCA whistleblowing rules. Dedicated FCA team.' },
    enforcementStrength: { score: 92, detail: 'FCA fines £100M+/year. Criminal prosecutions via SFO. Active enforcement.' },
  },
  {
    id: 'ch', name: 'Switzerland', code: 'CH', regulator: 'FINMA', fatfRating: 'Largely Compliant', riskScore: 20,
    amlFramework: { score: 90, detail: 'AMLA (GwG). FINMA banking regulations. Strong bank secrecy tradition with modern AML overlay.' },
    kycRequirements: { score: 88, detail: 'VSB 20 CDD agreement. Beneficial ownership verification. Banking secrecy exceptions for AML.' },
    dataProtection: { score: 92, detail: 'nFADP (2023). EU adequacy decision. FDPIC oversight. Swiss-specific protections.' },
    aiGovernance: { score: 68, detail: 'No specific AI legislation. Federal Council monitoring EU AI Act. Self-regulation approach.' },
    sanctionsRegime: { score: 82, detail: 'Federal Embargo Act. UN sanctions implemented. Selective EU sanctions adoption (Russia evolving).' },
    taxTransparency: { score: 80, detail: 'CRS adopted (2018). AIA agreements. Banking secrecy eroded for tax purposes.' },
    cryptoRegulation: { score: 92, detail: 'FINMA ICO guidelines. DLT Act (2021). Crypto Valley ecosystem. Progressive framework.' },
    esgReporting: { score: 70, detail: 'Swiss Code of Obligations Art. 964. Climate reporting for large companies. TCFD encouraged.' },
    whistleblower: { score: 60, detail: 'Limited statutory protection. OR Art. 321a loyalty obligation. Draft legislation pending.' },
    enforcementStrength: { score: 84, detail: 'FINMA enforcement proceedings. Banking license revocations. MROS reporting.' },
  },
  {
    id: 'sg', name: 'Singapore', code: 'SG', regulator: 'MAS', fatfRating: 'Compliant', riskScore: 15,
    amlFramework: { score: 96, detail: 'CDSA. MAS AML/CFT Notices. STR regime. Strong international cooperation.' },
    kycRequirements: { score: 94, detail: 'MAS Notice SFA04-N02. MyInfo digital identity. Comprehensive CDD/EDD.' },
    dataProtection: { score: 88, detail: 'PDPA (2012, amended 2021). PDPC enforcement. Cross-border transfer mechanisms.' },
    aiGovernance: { score: 90, detail: 'Model AI Governance Framework. FEAT principles. AI Verify toolkit. MAS guidance on AI/ML.' },
    sanctionsRegime: { score: 88, detail: 'UN Security Council sanctions. MAS targeted financial sanctions. Active enforcement.' },
    taxTransparency: { score: 86, detail: 'CRS compliant. AEOI agreements. Bilateral tax treaties. No capital gains tax.' },
    cryptoRegulation: { score: 88, detail: 'Payment Services Act (2019). MAS DPT licensing. Comprehensive stablecoin framework.' },
    esgReporting: { score: 82, detail: 'SGX mandatory climate reporting. Green Finance Action Plan. MAS ESG guidelines.' },
    whistleblower: { score: 72, detail: 'PCA protections. MAS reporting channels. Limited statutory framework.' },
    enforcementStrength: { score: 94, detail: 'MAS enforcement actions. Criminal prosecution via CPIB. Strict penalties.' },
  },
  {
    id: 'ae', name: 'UAE (DIFC)', code: 'AE', regulator: 'DFSA / CBUAE', fatfRating: 'Partially Compliant', riskScore: 45,
    amlFramework: { score: 75, detail: 'Federal AML Law (2018). FATF grey list exit (2024). goAML platform. Improving framework.' },
    kycRequirements: { score: 72, detail: 'CBUAE CDD requirements. Emirates ID verification. UBO requirements strengthening.' },
    dataProtection: { score: 70, detail: 'Federal DP Law (2021). DIFC Data Protection Law. Evolving framework.' },
    aiGovernance: { score: 78, detail: 'National AI Strategy 2031. AI Office. Minister for AI. Progressive but early-stage.' },
    sanctionsRegime: { score: 68, detail: 'UN sanctions implemented. Local designations list. Enforcement improving post-FATF review.' },
    taxTransparency: { score: 72, detail: 'Corporate tax introduced (2023, 9%). CRS adopted. Beneficial ownership requirements.' },
    cryptoRegulation: { score: 82, detail: 'VARA (Dubai). ADGM crypto framework. SCA regulations. Competitive licensing.' },
    esgReporting: { score: 58, detail: 'COP28 host. ADX ESG disclosure guide. Emerging framework.' },
    whistleblower: { score: 50, detail: 'Limited statutory protections. DIFC Whistleblower Protection Regulations. Cultural barriers.' },
    enforcementStrength: { score: 70, detail: 'CBUAE fines increasing. FATF-driven reforms. Enforcement capacity building.' },
  },
  {
    id: 'ky', name: 'Cayman Islands', code: 'KY', regulator: 'CIMA', fatfRating: 'Largely Compliant', riskScore: 30,
    amlFramework: { score: 82, detail: 'POCA (2020 Revision). AML Regulations (2020). CIMA AML guidance notes.' },
    kycRequirements: { score: 80, detail: 'CIMA CDD requirements. Beneficial ownership regime (2019). DITC reporting.' },
    dataProtection: { score: 72, detail: 'Data Protection Act (2017). No EU adequacy. Local commissioner oversight.' },
    aiGovernance: { score: 40, detail: 'No specific AI governance framework. Relies on sector-specific CIMA guidance.' },
    sanctionsRegime: { score: 78, detail: 'UK sanctions extended via Orders in Council. CIMA compliance guidance.' },
    taxTransparency: { score: 80, detail: 'CRS adopted. Economic Substance Law (2019). DITC beneficial ownership.' },
    cryptoRegulation: { score: 75, detail: 'Virtual Asset Service Providers Act (2020). CIMA registration. Evolving framework.' },
    esgReporting: { score: 45, detail: 'Limited ESG regulation. CIMA exploring climate risk guidance. Early stage.' },
    whistleblower: { score: 55, detail: 'Whistleblower Protection Act (2015). Limited practical framework.' },
    enforcementStrength: { score: 72, detail: 'CIMA enforcement actions. FATF-driven improvements. Regulatory capacity growing.' },
  },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function MultiJurisdictionPage() {
  const [selected, setSelected] = useState<string[]>(['je', 'uk']);
  const [expandedDimension, setExpandedDimension] = useState<DimensionKey | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'financial' | 'technology' | 'governance'>('all');

  const selectedJurisdictions = JURISDICTIONS.filter(j => selected.includes(j.id));

  // Build radar data
  const radarData = DIMENSIONS.map(dim => {
    const entry: Record<string, string | number> = { dimension: DIMENSION_LABELS[dim] };
    selectedJurisdictions.forEach(j => {
      entry[j.name] = j[dim].score;
    });
    return entry;
  });

  // Filter dimensions by category
  const filteredDimensions = DIMENSIONS.filter(d => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'financial') return ['amlFramework', 'kycRequirements', 'sanctionsRegime', 'taxTransparency', 'cryptoRegulation'].includes(d);
    if (filterCategory === 'technology') return ['aiGovernance', 'dataProtection', 'cryptoRegulation'].includes(d);
    if (filterCategory === 'governance') return ['esgReporting', 'whistleblower', 'enforcementStrength'].includes(d);
    return true;
  });

  function toggleJurisdiction(id: string) {
    setSelected(prev => {
      if (prev.includes(id)) return prev.length > 1 ? prev.filter(x => x !== id) : prev;
      return prev.length >= 4 ? prev : [...prev, id];
    });
  }

  function getScoreColor(score: number): string {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 55) return 'text-amber-400';
    return 'text-red-400';
  }

  function buildPDFConfig(): PDFReportOptions {
    return {
      title: 'Multi-Jurisdiction Regulatory Comparison',
      subtitle: `Comparing: ${selectedJurisdictions.map(j => j.name).join(', ')}`,
      module: 'Multi-Jurisdiction',
      jurisdiction: 'Cross-border',
      classification: 'CONFIDENTIAL',
      generatedBy: 'Velanova AI Governance Engine',
      sections: [
        { type: 'stats', stats: selectedJurisdictions.map(j => ({ label: j.name, value: j.riskScore + ' risk' })) },
        { type: 'heading', content: 'Dimension-by-Dimension Comparison' },
        { type: 'table', columns: ['Dimension', ...selectedJurisdictions.map(j => j.name)], rows: DIMENSIONS.map(d => [DIMENSION_LABELS[d], ...selectedJurisdictions.map(j => j[d].score + '/100')]) },
        { type: 'heading', content: 'Detailed Analysis' },
        ...DIMENSIONS.flatMap(d => [
          { type: 'text' as const, content: `**${DIMENSION_LABELS[d]}**: ${selectedJurisdictions.map(j => `${j.name}: ${j[d].detail}`).join(' | ')}` },
        ]),
      ],
    };
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#030303] text-white overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-400" />
          <h1 className="text-[14px] font-semibold tracking-tight">Multi-Jurisdiction Comparison</h1>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-medium">
            {selected.length} Jurisdictions
          </span>
        </div>
        <div className="flex items-center gap-1.5 app-region-no-drag">
          <ExportButton getReportConfig={buildPDFConfig} compact />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Jurisdiction Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider mr-1">Compare (max 4):</span>
          {JURISDICTIONS.map(j => (
            <button
              key={j.id}
              onClick={() => toggleJurisdiction(j.id)}
              className={cn(
                'h-7 px-3 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5',
                selected.includes(j.id) ? 'text-white border' : 'text-zinc-500 bg-white/[0.03] hover:bg-white/[0.06]'
              )}
              style={selected.includes(j.id) ? { borderColor: COLORS[selected.indexOf(j.id)] + '40', background: COLORS[selected.indexOf(j.id)] + '15', color: COLORS[selected.indexOf(j.id)] } : undefined}
            >
              <span className="text-[10px] opacity-60">{j.code}</span>
              {j.name}
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {selectedJurisdictions.map((j, i) => (
            <div key={j.id} className="rounded-xl border bg-white/[0.02] p-4" style={{ borderColor: COLORS[i] + '20' }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-[13px] font-medium" style={{ color: COLORS[i] }}>{j.name}</span>
                  <p className="text-[10px] text-zinc-500">{j.regulator}</p>
                </div>
                <div className="text-right">
                  <div className={cn('text-[20px] font-bold tabular-nums', j.riskScore < 25 ? 'text-emerald-400' : j.riskScore < 40 ? 'text-amber-400' : 'text-red-400')}>{j.riskScore}</div>
                  <span className="text-[9px] text-zinc-600">Risk Score</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-zinc-600" />
                <span className={cn('text-[10px]', j.fatfRating === 'Compliant' ? 'text-emerald-400' : j.fatfRating === 'Largely Compliant' ? 'text-blue-400' : 'text-amber-400')}>
                  FATF: {j.fatfRating}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Radar Chart */}
        {selectedJurisdictions.length >= 2 && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-zinc-400 font-medium">Regulatory Strength Comparison</span>
              <div className="flex gap-3">
                {selectedJurisdictions.map((j, i) => (
                  <span key={j.id} className="flex items-center gap-1.5 text-[10px]" style={{ color: COLORS[i] }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                    {j.name}
                  </span>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#71717a', fontSize: 9 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#52525b', fontSize: 8 }} />
                {selectedJurisdictions.map((j, i) => (
                  <Radar key={j.id} name={j.name} dataKey={j.name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.12} strokeWidth={2} />
                ))}
                <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-600" />
          {(['all', 'financial', 'technology', 'governance'] as const).map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)} className={cn('h-6 px-2.5 rounded text-[10px] capitalize transition-colors', filterCategory === cat ? 'bg-white/[0.08] text-white' : 'text-zinc-500 hover:text-zinc-300')}>
              {cat}
            </button>
          ))}
        </div>

        {/* Dimension-by-Dimension Comparison */}
        <div className="space-y-2">
          {filteredDimensions.map(dim => (
            <div key={dim} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div
                onClick={() => setExpandedDimension(expandedDimension === dim ? null : dim)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Scale className="w-4 h-4 text-zinc-500" />
                  <span className="text-[12px] font-medium text-white/80">{DIMENSION_LABELS[dim]}</span>
                </div>
                <div className="flex items-center gap-3">
                  {selectedJurisdictions.map((j, _i) => (
                    <div key={j.id} className="flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-500">{j.code}</span>
                      <span className={cn('text-[12px] font-bold tabular-nums', getScoreColor(j[dim].score))}>{j[dim].score}</span>
                    </div>
                  ))}
                  {expandedDimension === dim ? <ChevronDown className="w-3.5 h-3.5 text-zinc-600" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />}
                </div>
              </div>

              {/* Score bars */}
              <div className="px-4 pb-3 space-y-1">
                {selectedJurisdictions.map((j, i) => (
                  <div key={j.id} className="flex items-center gap-2">
                    <span className="text-[9px] text-zinc-500 w-8">{j.code}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all')} style={{ width: j[dim].score + '%', background: COLORS[i] }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Expanded detail */}
              {expandedDimension === dim && (
                <div className="px-4 pb-4 pt-1 border-t border-white/[0.04] space-y-3">
                  {selectedJurisdictions.map((j, i) => (
                    <div key={j.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                        <span className="text-[11px] font-medium" style={{ color: COLORS[i] }}>{j.name} — {j[dim].score}/100</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed pl-4">{j[dim].detail}</p>
                    </div>
                  ))}

                  {/* Gap analysis */}
                  {selectedJurisdictions.length >= 2 && (() => {
                    const scores = selectedJurisdictions.map(j => ({ name: j.name, score: j[dim].score }));
                    const max = scores.reduce((a, b) => a.score > b.score ? a : b);
                    const min = scores.reduce((a, b) => a.score < b.score ? a : b);
                    const gap = max.score - min.score;
                    return gap > 10 ? (
                      <div className="mt-2 rounded-lg border border-amber-500/10 bg-amber-900/5 p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span className="text-[10px] font-medium text-amber-400">Regulatory Gap: {gap} points</span>
                        </div>
                        <p className="text-[10px] text-zinc-400">
                          {max.name} leads with {max.score}/100 vs {min.name} at {min.score}/100. 
                          Consider additional due diligence for {min.name} operations.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2 rounded-lg border border-emerald-500/10 bg-emerald-900/5 p-3">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">Regulatory alignment within {gap} points — low divergence risk.</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 flex items-start gap-2">
          <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-600 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-zinc-600 leading-relaxed">
            Regulatory scores based on FATF Mutual Evaluation Reports, local regulator publications, and Velanova compliance 
            intelligence. Scores are indicative and updated quarterly. Last update: February 2026.
            Sources include JFSC Handbook, FCA Handbook, FINMA Circulars, MAS Notices, DFSA Rulebook, and CIMA Guidance Notes.
          </p>
        </div>
      </div>
    </div>
  );
}
