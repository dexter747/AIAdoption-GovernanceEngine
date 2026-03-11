import { useState, useEffect, useRef } from 'react';
import {
  Globe, MapPin, AlertTriangle,
  Shield, ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import ExportButton from '../components/ui/ExportButton';
import type { PDFReportOptions } from '../lib/pdfExport';

/* ═══════════════════════════════════════════════════════════════════════════
   Geographic Risk Heatmap — Jurisdiction Risk Intelligence
   Interactive Leaflet map showing global risk exposure by jurisdiction.
   Data aligned with JFSC risk-based approach, FATF grey/black lists,
   and Jersey-specific financial services corridors.
   ═══════════════════════════════════════════════════════════════════════════ */

interface JurisdictionRisk {
  id: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  overallRisk: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number;
  clientCount: number;
  transactionVolume: number;
  currency: string;
  flags: string[];
  riskFactors: string[];
  lastReview: string;
  regulatoryStatus: string;
  fatfStatus?: string;
}

const MOCK_JURISDICTIONS: JurisdictionRisk[] = [
  { id: 'j1',  country: 'Jersey',          countryCode: 'JE', lat: 49.2144, lng: -2.1313,  overallRisk: 'low',      riskScore: 8,  clientCount: 342, transactionVolume: 145000000, currency: 'GBP', flags: [], riskFactors: ['Home jurisdiction', 'MONEYVAL compliant'], lastReview: '2026-03-01', regulatoryStatus: 'JFSC regulated', fatfStatus: 'Compliant' },
  { id: 'j2',  country: 'United Kingdom',  countryCode: 'GB', lat: 51.5074, lng: -0.1278,  overallRisk: 'low',      riskScore: 12, clientCount: 289, transactionVolume: 320000000, currency: 'GBP', flags: [], riskFactors: ['Strong AML regime', 'FCA regulated corridor'], lastReview: '2026-02-15', regulatoryStatus: 'FCA regulated', fatfStatus: 'Compliant' },
  { id: 'j3',  country: 'Switzerland',     countryCode: 'CH', lat: 46.8182, lng: 8.2275,   overallRisk: 'medium',   riskScore: 38, clientCount: 67,  transactionVolume: 89000000,  currency: 'CHF', flags: ['trust_structures'], riskFactors: ['Banking secrecy history', 'Trust opacity', 'Cross-border structuring risk'], lastReview: '2026-01-20', regulatoryStatus: 'FINMA regulated', fatfStatus: 'Compliant' },
  { id: 'j4',  country: 'Latvia',          countryCode: 'LV', lat: 56.9496, lng: 24.1052,  overallRisk: 'high',     riskScore: 72, clientCount: 12,  transactionVolume: 18500000,  currency: 'EUR', flags: ['maritime_trade', 'shell_companies'], riskFactors: ['Baltic corridor for Russian funds', 'Maritime trade risk', 'Shell company proliferation'], lastReview: '2026-02-28', regulatoryStatus: 'FKTK regulated', fatfStatus: 'Monitored' },
  { id: 'j5',  country: 'Cyprus',          countryCode: 'CY', lat: 35.1264, lng: 33.4299,  overallRisk: 'high',     riskScore: 78, clientCount: 8,   transactionVolume: 12400000,  currency: 'EUR', flags: ['sanctions_evasion', 'shell_companies'], riskFactors: ['Sanctions circumvention route', 'Golden passport programme', 'Russian capital flows'], lastReview: '2026-02-25', regulatoryStatus: 'CySEC regulated', fatfStatus: 'Grey list' },
  { id: 'j6',  country: 'Russia',          countryCode: 'RU', lat: 55.7558, lng: 37.6173,  overallRisk: 'critical', riskScore: 98, clientCount: 2,   transactionVolume: 1200000,   currency: 'USD', flags: ['sanctions', 'blocked'], riskFactors: ['Comprehensive sanctions regime', 'OFSI/EU/OFAC designated', 'All transactions blocked'], lastReview: '2026-03-01', regulatoryStatus: 'Sanctioned', fatfStatus: 'FATF black list' },
  { id: 'j7',  country: 'United Arab Emirates', countryCode: 'AE', lat: 25.2048, lng: 55.2708, overallRisk: 'medium', riskScore: 52, clientCount: 34, transactionVolume: 67000000, currency: 'AED', flags: ['velocity_anomaly'], riskFactors: ['Trade-based ML risk', 'Free trade zone opacity', 'Gold trading corridor'], lastReview: '2026-02-20', regulatoryStatus: 'CBUAE regulated', fatfStatus: 'Grey list (removed 2024)' },
  { id: 'j8',  country: 'British Virgin Islands', countryCode: 'VG', lat: 18.4207, lng: -64.6400, overallRisk: 'high', riskScore: 68, clientCount: 45, transactionVolume: 42000000, currency: 'USD', flags: ['shell_companies', 'opaque_structures'], riskFactors: ['Offshore secrecy jurisdiction', 'Limited beneficial ownership transparency', 'Account takeover destination'], lastReview: '2026-02-10', regulatoryStatus: 'FSC regulated', fatfStatus: 'Monitored' },
  { id: 'j9',  country: 'France',          countryCode: 'FR', lat: 48.8566, lng: 2.3522,   overallRisk: 'low',      riskScore: 15, clientCount: 156, transactionVolume: 198000000, currency: 'EUR', flags: [], riskFactors: ['Strong EU AML framework', 'Established Jersey-Normandy trade corridor'], lastReview: '2026-02-01', regulatoryStatus: 'AMF regulated', fatfStatus: 'Compliant' },
  { id: 'j10', country: 'Guernsey',        countryCode: 'GG', lat: 49.4548, lng: -2.5364,  overallRisk: 'low',      riskScore: 10, clientCount: 98,  transactionVolume: 87000000,  currency: 'GBP', flags: [], riskFactors: ['Sister Crown Dependency', 'MONEYVAL compliant', 'Shared regulatory framework'], lastReview: '2026-01-15', regulatoryStatus: 'GFSC regulated', fatfStatus: 'Compliant' },
  { id: 'j11', country: 'Panama',          countryCode: 'PA', lat: 8.9824,  lng: -79.5199, overallRisk: 'high',     riskScore: 74, clientCount: 5,   transactionVolume: 3200000,   currency: 'USD', flags: ['shell_companies', 'opacity'], riskFactors: ['Panama Papers jurisdiction', 'Bearer share structures', 'Limited CDD enforcement'], lastReview: '2026-01-05', regulatoryStatus: 'SBP regulated', fatfStatus: 'Grey list' },
  { id: 'j12', country: 'Hong Kong',       countryCode: 'HK', lat: 22.3193, lng: 114.1694, overallRisk: 'medium',   riskScore: 42, clientCount: 28,  transactionVolume: 56000000,  currency: 'HKD', flags: [], riskFactors: ['China flow-through risk', 'Trade-based ML corridor', 'Cryptocurrency exchange hub'], lastReview: '2026-02-12', regulatoryStatus: 'SFC regulated', fatfStatus: 'Compliant' },
  { id: 'j13', country: 'Singapore',       countryCode: 'SG', lat: 1.3521,  lng: 103.8198, overallRisk: 'low',      riskScore: 18, clientCount: 42,  transactionVolume: 78000000,  currency: 'SGD', flags: [], riskFactors: ['Strong AML regime', 'MAS regulatory oversight'], lastReview: '2026-02-18', regulatoryStatus: 'MAS regulated', fatfStatus: 'Compliant' },
  { id: 'j14', country: 'Cayman Islands',  countryCode: 'KY', lat: 19.3133, lng: -81.2546, overallRisk: 'medium',   riskScore: 48, clientCount: 52,  transactionVolume: 95000000,  currency: 'USD', flags: ['fund_structures'], riskFactors: ['Offshore financial centre', 'Fund domicile risk', 'Improving transparency framework'], lastReview: '2026-01-28', regulatoryStatus: 'CIMA regulated', fatfStatus: 'Compliant' },
  { id: 'j15', country: 'North Korea',     countryCode: 'KP', lat: 39.0392, lng: 125.7625, overallRisk: 'critical', riskScore: 100, clientCount: 0,  transactionVolume: 0,         currency: 'USD', flags: ['sanctions', 'blocked', 'proliferation'], riskFactors: ['Comprehensive sanctions', 'FATF call for action', 'WMD proliferation risk'], lastReview: '2026-03-01', regulatoryStatus: 'Sanctioned', fatfStatus: 'FATF black list' },
  { id: 'j16', country: 'Luxembourg',      countryCode: 'LU', lat: 49.6117, lng: 6.1300,   overallRisk: 'low',      riskScore: 16, clientCount: 88,  transactionVolume: 120000000, currency: 'EUR', flags: [], riskFactors: ['Strong EU framework', 'Fund administration centre', 'CSSF regulated'], lastReview: '2026-02-05', regulatoryStatus: 'CSSF regulated', fatfStatus: 'Compliant' },
];

const RISK_CLR: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-amber-400',
  medium: 'text-blue-400',
  low: 'text-emerald-400',
};
const RISK_BG: Record<string, string> = {
  critical: 'bg-red-900/30 text-red-400 border-red-500/20',
  high: 'bg-amber-900/30 text-amber-400 border-amber-500/20',
  medium: 'bg-blue-900/30 text-blue-400 border-blue-500/20',
  low: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/20',
};
const RISK_DOT: Record<string, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#10b981',
};

type RiskFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';

export default function RiskHeatmapPage() {
  const [filter, setFilter] = useState<RiskFilter>('all');
  const [selected, setSelected] = useState<JurisdictionRisk | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);

  const filtered = filter === 'all'
    ? MOCK_JURISDICTIONS
    : MOCK_JURISDICTIONS.filter(j => j.overallRisk === filter);

  const stats = {
    totalJurisdictions: MOCK_JURISDICTIONS.length,
    criticalCount: MOCK_JURISDICTIONS.filter(j => j.overallRisk === 'critical').length,
    highCount: MOCK_JURISDICTIONS.filter(j => j.overallRisk === 'high').length,
    totalClients: MOCK_JURISDICTIONS.reduce((s, j) => s + j.clientCount, 0),
    totalVolume: MOCK_JURISDICTIONS.reduce((s, j) => s + j.transactionVolume, 0),
  };

  const fmtVolume = (v: number) =>
    v >= 1e9 ? `£${(v / 1e9).toFixed(1)}B` :
    v >= 1e6 ? `£${(v / 1e6).toFixed(0)}M` :
    `£${(v / 1e3).toFixed(0)}K`;

  /* ── Leaflet Map Initialization (imperatively) ── */
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let L: any;
    let mounted = true;

    const initMap = async () => {
      try {
        L = await import('leaflet');
        // Leaflet CSS is loaded via the Vite CSS pipeline
        if (typeof document !== 'undefined') {
          const existing = document.getElementById('leaflet-css');
          if (!existing) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
          }
        }

        if (!mounted || !mapRef.current) return;
        if (leafletMapRef.current) return; // already initialized

        const map = L.map(mapRef.current, {
          center: [30, 10],
          zoom: 2,
          minZoom: 2,
          maxZoom: 8,
          zoomControl: true,
          attributionControl: false,
        });

        // Dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
        }).addTo(map);

        leafletMapRef.current = map;
        setMapReady(true);
      } catch (err) {
        console.error('Leaflet init error:', err);
      }
    };

    initMap();
    return () => { mounted = false; };
  }, []);

  /* ── Update Markers when filter changes ── */
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current) return;

    const addMarkers = async () => {
      const L = await import('leaflet');
      const map = leafletMapRef.current;

      // Clear existing markers
      markersRef.current.forEach(m => map.removeLayer(m));
      markersRef.current = [];

      filtered.forEach(j => {
        const size = j.overallRisk === 'critical' ? 18 :
                     j.overallRisk === 'high' ? 14 :
                     j.overallRisk === 'medium' ? 11 : 8;

        const icon = L.divIcon({
          className: 'risk-marker',
          html: `<div style="
            width: ${size}px; height: ${size}px;
            border-radius: 50%;
            background: ${RISK_DOT[j.overallRisk]};
            border: 2px solid rgba(255,255,255,0.15);
            box-shadow: 0 0 ${size}px ${RISK_DOT[j.overallRisk]}80;
            cursor: pointer;
          "></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([j.lat, j.lng], { icon }).addTo(map);
        marker.on('click', () => setSelected(j));

        // Tooltip
        marker.bindTooltip(
          `<div style="font-size:11px;font-weight:500;color:#fff">${j.country}</div>
           <div style="font-size:10px;color:#999">Risk Score: ${j.riskScore} · ${j.clientCount} clients</div>`,
          { className: 'risk-tooltip', direction: 'top', offset: [0, -size / 2] }
        );

        markersRef.current.push(marker);
      });
    };

    addMarkers();
  }, [mapReady, filter, filtered]);

  const buildPDFConfig = (): PDFReportOptions => ({
    title: 'Geographic Risk Heatmap Report',
    subtitle: `${stats.totalJurisdictions} Jurisdictions Monitored — ${stats.criticalCount} Critical, ${stats.highCount} High Risk`,
    module: 'Risk Heatmap',
    jurisdiction: 'Jersey (JFSC)',
    classification: 'CONFIDENTIAL',
    includeComplianceBadges: true,
    sections: [
      { type: 'stats', stats: [
        { label: 'Total Jurisdictions', value: String(stats.totalJurisdictions) },
        { label: 'Critical Risk', value: String(stats.criticalCount) },
        { label: 'High Risk', value: String(stats.highCount) },
        { label: 'Total Clients', value: stats.totalClients.toLocaleString() },
        { label: 'Total Volume', value: fmtVolume(stats.totalVolume) },
      ] },
      { type: 'table', title: 'Jurisdiction Risk Register', columns: ['Country', 'Code', 'Risk', 'Score', 'Clients', 'Volume', 'FATF Status'],
        rows: MOCK_JURISDICTIONS.sort((a, b) => b.riskScore - a.riskScore).map(j => [j.country, j.countryCode, j.overallRisk.toUpperCase(), String(j.riskScore), String(j.clientCount), fmtVolume(j.transactionVolume), j.fatfStatus || 'N/A']) },
      { type: 'text', title: 'Risk Methodology', content: 'Risk scores are calculated using a composite model incorporating FATF mutual evaluation results, sanctions designations (OFSI/EU/UN/OFAC), Transparency International CPI scores, historical STR/SAR filing rates, and Jersey-specific corridor risk assessments per JFSC AML/CFT Handbook Chapter 4.' },
    ],
  });

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#030303]">
      {/* Leaflet CSS overrides */}
      <style>{`
        .risk-tooltip { background: rgba(10,10,10,0.95) !important; border: 1px solid rgba(255,255,255,0.08) !important; border-radius: 8px !important; padding: 6px 10px !important; box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important; }
        .risk-tooltip::before { border-top-color: rgba(10,10,10,0.95) !important; }
        .leaflet-container { background: #030303 !important; }
        .leaflet-control-zoom a { background: #0a0a0a !important; color: #999 !important; border-color: rgba(255,255,255,0.06) !important; }
        .leaflet-control-zoom a:hover { background: #141414 !important; color: #fff !important; }
        .risk-marker { background: transparent !important; border: none !important; }
      `}</style>

      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <div className="flex items-center gap-2 flex-1">
          <Globe className="w-4 h-4 text-indigo-400" />
          <h1 className="text-[13px] font-semibold text-white/80">Geographic Risk Heatmap</h1>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-500">{stats.totalJurisdictions} jurisdictions</span>
        </div>
        <div className="flex items-center gap-1.5 app-region-no-drag">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={cn('h-6 px-2.5 rounded text-[10px] font-medium capitalize transition-colors', filter === f ? f === 'all' ? 'bg-white/10 text-white' : `${RISK_BG[f]} border` : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]')}>
              {f === 'all' ? 'All' : f}
              {f !== 'all' && <span className="ml-1 text-[9px] opacity-70">({MOCK_JURISDICTIONS.filter(j => j.overallRisk === f).length})</span>}
            </button>
          ))}
          <div className="w-px h-4 bg-white/[0.06] mx-1" />
          <ExportButton getReportConfig={buildPDFConfig} compact />
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 px-5 py-2.5 border-b border-white/[0.04]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[11px] text-red-400 font-medium">{stats.criticalCount} Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-[11px] text-amber-400">{stats.highCount} High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[11px] text-blue-400">{MOCK_JURISDICTIONS.filter(j => j.overallRisk === 'medium').length} Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-emerald-400">{MOCK_JURISDICTIONS.filter(j => j.overallRisk === 'low').length} Low</span>
        </div>
        <div className="flex-1" />
        <span className="text-[10px] text-zinc-600">{stats.totalClients.toLocaleString()} clients · {fmtVolume(stats.totalVolume)} volume across all jurisdictions</span>
      </div>

      {/* Main content — map + detail panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="absolute inset-0" />
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#030303]">
              <div className="text-center space-y-2">
                <Globe className="w-8 h-8 text-indigo-400/30 animate-pulse mx-auto" />
                <p className="text-[12px] text-zinc-600">Initialising map…</p>
              </div>
            </div>
          )}
        </div>

        {/* Detail / jurisdiction list panel */}
        <div className="w-[340px] border-l border-white/[0.04] overflow-y-auto">
          {selected ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <button onClick={() => setSelected(null)} className="text-[10px] text-zinc-500 hover:text-zinc-300">&larr; All jurisdictions</button>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full border capitalize', RISK_BG[selected.overallRisk])}>{selected.overallRisk} risk</span>
              </div>
              <div>
                <h2 className="text-[16px] font-semibold text-white/90">{selected.country}</h2>
                <span className="text-[11px] text-zinc-500">{selected.countryCode} · {selected.regulatoryStatus}</span>
              </div>

              {/* Risk score gauge */}
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Risk Score</span>
                  <span className={cn('text-[24px] font-bold tabular-nums', RISK_CLR[selected.overallRisk])}>{selected.riskScore}</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${selected.riskScore}%`, background: RISK_DOT[selected.overallRisk] }} />
                </div>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-[10px] text-zinc-600">Clients</div>
                  <div className="text-[14px] font-semibold text-white/80">{selected.clientCount}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-[10px] text-zinc-600">Volume</div>
                  <div className="text-[14px] font-semibold text-white/80">{fmtVolume(selected.transactionVolume)}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-[10px] text-zinc-600">FATF Status</div>
                  <div className={cn('text-[12px] font-medium', selected.fatfStatus?.includes('black') ? 'text-red-400' : selected.fatfStatus?.includes('Grey') ? 'text-amber-400' : 'text-emerald-400')}>{selected.fatfStatus || 'N/A'}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-[10px] text-zinc-600">Last Review</div>
                  <div className="text-[12px] text-white/60">{selected.lastReview}</div>
                </div>
              </div>

              {/* Risk factors */}
              <div>
                <h3 className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Risk Factors</h3>
                <div className="space-y-1.5">
                  {selected.riskFactors.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px]">
                      <AlertTriangle className={cn('w-3 h-3 mt-0.5 flex-shrink-0', RISK_CLR[selected.overallRisk])} />
                      <span className="text-zinc-400">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flags */}
              {selected.flags.length > 0 && (
                <div>
                  <h3 className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Active Flags</h3>
                  <div className="flex flex-wrap gap-1">
                    {selected.flags.map((f, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/20 text-red-400 border border-red-500/10 capitalize">{f.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance note */}
              <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.03] text-[10px] text-zinc-500 leading-relaxed">
                <Shield className="w-3 h-3 inline mr-1 text-zinc-600" />
                Jurisdiction risk assessed per JFSC AML/CFT Handbook Chapter 4 — Risk-Based Approach.
                {selected.overallRisk === 'critical' && ' All transactions blocked per Sanctions and Asset-Freezing (Jersey) Law 2019.'}
                {selected.overallRisk === 'high' && ' Enhanced due diligence required for all client relationships and transactions.'}
              </div>
            </div>
          ) : (
            <div className="p-3">
              <div className="flex items-center gap-2 pb-3 border-b border-white/[0.04] mb-3">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[11px] font-medium text-white/60">Jurisdictions ({filtered.length})</span>
              </div>
              <div className="space-y-1">
                {filtered.sort((a, b) => b.riskScore - a.riskScore).map(j => (
                  <button key={j.id} onClick={() => setSelected(j)} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors text-left">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: RISK_DOT[j.overallRisk] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] text-white/70">{j.country}</span>
                        <span className="text-[9px] text-zinc-600 font-mono">{j.countryCode}</span>
                      </div>
                      <div className="text-[10px] text-zinc-600">{j.clientCount} clients · {fmtVolume(j.transactionVolume)}</div>
                    </div>
                    <div className="text-right">
                      <div className={cn('text-[13px] font-semibold tabular-nums', RISK_CLR[j.overallRisk])}>{j.riskScore}</div>
                      <div className={cn('text-[9px] capitalize', RISK_CLR[j.overallRisk])}>{j.overallRisk}</div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-zinc-700 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
