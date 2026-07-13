import { useState } from 'react';
import {
  Key, Brain, Shield, CheckCircle2, AlertTriangle,
  Cpu, Lock, Eye,
  Activity, ChevronDown, ChevronRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';
import ExportButton from '../components/ui/ExportButton';
import type { PDFReportOptions } from '../lib/pdfExport';

/* ═══════════════════════════════════════════════════════════════════════════
   BYOK (Bring Your Own Key) AI MODEL CONFIGURATION
   AI model governance dashboard showing model inventory, configuration,
   performance metrics, and regulatory compliance status.
   Aligned with EU AI Act Art. 9-15, UK AI White Paper, OECD AI Principles.
   ═══════════════════════════════════════════════════════════════════════════ */

type ModelRisk = 'high' | 'medium' | 'low';
type ModelStatus = 'active' | 'inactive' | 'testing' | 'deprecated';
type ProviderType = 'velanova' | 'openai' | 'anthropic' | 'custom';

interface AIModel {
  id: string;
  name: string;
  version: string;
  provider: ProviderType;
  type: string;
  module: string;
  status: ModelStatus;
  riskClassification: ModelRisk;
  description: string;
  useCase: string;
  accuracy: number;
  latencyMs: number;
  requestsToday: number;
  requestsMonth: number;
  lastTrained: string;
  dataResidency: string;
  encryptionStandard: string;
  humanOversight: string;
  biasAuditDate: string;
  explainability: string;
  config: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    confidenceThreshold?: number;
    falsePositiveTarget?: number;
  };
  compliance: string[];
}

interface APIKeyConfig {
  id: string;
  provider: ProviderType;
  label: string;
  status: 'active' | 'expired' | 'revoked' | 'inactive';
  lastUsed: string;
  maskedKey: string;
  permissions: string[];
}

const PROVIDER_CLR: Record<ProviderType, string> = {
  velanova: 'text-indigo-400 bg-indigo-400/10',
  openai: 'text-emerald-400 bg-emerald-400/10',
  anthropic: 'text-amber-400 bg-amber-400/10',
  custom: 'text-blue-400 bg-blue-400/10',
};

const STATUS_CLR: Record<ModelStatus, string> = {
  active: 'text-emerald-400 bg-emerald-400/10',
  inactive: 'text-zinc-400 bg-zinc-400/10',
  testing: 'text-amber-400 bg-amber-400/10',
  deprecated: 'text-red-400 bg-red-400/10',
};

const RISK_CLR: Record<ModelRisk, string> = {
  high: 'text-red-400 bg-red-400/10',
  medium: 'text-amber-400 bg-amber-400/10',
  low: 'text-emerald-400 bg-emerald-400/10',
};

const MOCK_MODELS: AIModel[] = [
  {
    id: 'm1', name: 'Fraud Detection Engine', version: '3.2.1', provider: 'velanova', type: 'Ensemble (XGBoost + Rule Engine)', module: 'Fraud Detection', status: 'active', riskClassification: 'high',
    description: 'Real-time transaction monitoring and fraud pattern detection for Jersey financial services.',
    useCase: 'Detects structuring, sanctions evasion, account takeover, and unusual transaction patterns.',
    accuracy: 96.2, latencyMs: 45, requestsToday: 12847, requestsMonth: 384210,
    lastTrained: '2026-02-15', dataResidency: 'Jersey (JDC)', encryptionStandard: 'AES-256-GCM',
    humanOversight: 'Mandatory analyst review for all alerts. MLRO approval for SAR filing.',
    biasAuditDate: '2026-01-20', explainability: 'Feature importance scores, decision tree paths, SHAP values available per prediction.',
    config: { confidenceThreshold: 0.85, falsePositiveTarget: 0.05 },
    compliance: ['EU AI Act Art. 9 (High-risk)', 'JFSC AML/CFT Handbook', 'UK AI White Paper Principle 2'],
  },
  {
    id: 'm2', name: 'AML Detection Engine', version: '4.1.0', provider: 'velanova', type: 'Ensemble (Gradient Boosting + Neural Network + Rule Engine)', module: 'AML / SAR', status: 'active', riskClassification: 'high',
    description: 'Anti-money laundering detection covering transaction monitoring, SAR generation, and risk scoring.',
    useCase: 'Identifies money laundering patterns, generates SAR drafts, monitors ongoing customer behaviour.',
    accuracy: 94.8, latencyMs: 120, requestsToday: 8934, requestsMonth: 267450,
    lastTrained: '2026-02-20', dataResidency: 'Jersey (JDC)', encryptionStandard: 'AES-256-GCM',
    humanOversight: 'AI-generated SARs require MLRO review. Sanctions matches auto-freeze with human verification.',
    biasAuditDate: '2026-01-25', explainability: 'Full factor decomposition, confidence intervals, and alternative hypothesis scoring.',
    config: { confidenceThreshold: 0.80, falsePositiveTarget: 0.08 },
    compliance: ['EU AI Act Art. 9 (High-risk)', 'POCL 1999', 'FATF Rec. 20', 'JFSC AML/CFT Handbook'],
  },
  {
    id: 'm3', name: 'KYC Risk Engine', version: '2.8.0', provider: 'velanova', type: 'Bayesian Risk Network + Rule-based Scoring', module: 'KYC', status: 'active', riskClassification: 'high',
    description: 'Client risk assessment engine for KYC onboarding and periodic reviews.',
    useCase: 'Evaluates client risk based on identity, geography, industry, PEP status, and transaction patterns.',
    accuracy: 92.5, latencyMs: 80, requestsToday: 3421, requestsMonth: 102340,
    lastTrained: '2026-01-30', dataResidency: 'Jersey (JDC)', encryptionStandard: 'AES-256-GCM',
    humanOversight: 'All risk ratings require compliance officer sign-off. EDD triggers mandatory human review.',
    biasAuditDate: '2026-02-05', explainability: 'Bayesian network visualization, factor weights, prior/posterior distributions.',
    config: { confidenceThreshold: 0.75 },
    compliance: ['EU AI Act Art. 9 (High-risk)', 'JFSC Code of Practice', 'Money Laundering Order'],
  },
  {
    id: 'm4', name: 'Regulatory Intelligence NLP', version: '1.4.2', provider: 'anthropic', type: 'Large Language Model (Claude)', module: 'Regulatory', status: 'active', riskClassification: 'medium',
    description: 'Natural language processing for regulatory document analysis and change detection.',
    useCase: 'Summarises regulatory updates, identifies impact on current policies, drafts compliance assessments.',
    accuracy: 89.1, latencyMs: 2400, requestsToday: 156, requestsMonth: 4680,
    lastTrained: 'Foundation model (2025)', dataResidency: 'API call — no data stored externally', encryptionStandard: 'TLS 1.3 in transit',
    humanOversight: 'All AI-generated regulatory summaries reviewed by regulatory analyst before distribution.',
    biasAuditDate: 'N/A (generative)', explainability: 'Chain-of-thought reasoning visible. Source citation required.',
    config: { temperature: 0.3, maxTokens: 4096, topP: 0.9 },
    compliance: ['UK AI White Paper', 'OECD AI Principle 1.3'],
  },
  {
    id: 'm5', name: 'ESG Scoring Model', version: '1.2.0', provider: 'velanova', type: 'Multi-factor Linear Model + NLP Sentiment', module: 'ESG', status: 'active', riskClassification: 'low',
    description: 'Environmental, social, and governance scoring for client and investment analysis.',
    useCase: 'Calculates ESG scores from public data, generates sustainability reports, flags ESG incidents.',
    accuracy: 85.3, latencyMs: 350, requestsToday: 234, requestsMonth: 7020,
    lastTrained: '2026-01-15', dataResidency: 'Jersey (JDC)', encryptionStandard: 'AES-256-GCM',
    humanOversight: 'ESG analyst reviews scores quarterly. Material rating changes require committee approval.',
    biasAuditDate: '2025-12-10', explainability: 'Factor weights transparent. Data sources listed per score component.',
    config: { confidenceThreshold: 0.70 },
    compliance: ['TCFD Framework', 'Jersey Sustainable Finance Framework'],
  },
  {
    id: 'm6', name: 'Document OCR & Extraction', version: '2.0.3', provider: 'velanova', type: 'CNN + Transformer (Vision)', module: 'KYC', status: 'active', riskClassification: 'medium',
    description: 'Optical character recognition and structured data extraction from identity documents.',
    useCase: 'Extracts name, DOB, document number, and expiry from passports, driving licenses, and utility bills.',
    accuracy: 97.8, latencyMs: 1200, requestsToday: 89, requestsMonth: 2670,
    lastTrained: '2025-11-20', dataResidency: 'Jersey (JDC) — on-premise processing', encryptionStandard: 'AES-256-GCM',
    humanOversight: 'Low-confidence extractions flagged for manual verification.',
    biasAuditDate: '2025-12-15', explainability: 'Bounding box overlay shows extraction locations. Confidence per field.',
    config: { confidenceThreshold: 0.90 },
    compliance: ['EU AI Act Art. 10 (Data Governance)', 'GDPR Art. 22'],
  },
];

const MOCK_KEYS: APIKeyConfig[] = [
  { id: 'k1', provider: 'velanova', label: 'Production Velanova API', status: 'active', lastUsed: '2026-03-14T10:30:00Z', maskedKey: 'vel_****...r8x2', permissions: ['fraud.detect', 'aml.monitor', 'kyc.assess', 'esg.score'] },
  { id: 'k2', provider: 'anthropic', label: 'Claude API (Regulatory NLP)', status: 'active', lastUsed: '2026-03-14T09:45:00Z', maskedKey: 'sk-ant-****...k9p1', permissions: ['regulatory.summarise', 'regulatory.assess'] },
  { id: 'k3', provider: 'openai', label: 'OpenAI Backup (GPT-4)', status: 'inactive', lastUsed: '2026-02-28T16:00:00Z', maskedKey: 'sk-****...m3v7', permissions: ['regulatory.summarise'] },
];

export default function BYOKConfigPage() {
  const [selectedModel, setSelectedModel] = useState<string | null>('m1');
  const [viewMode, setViewMode] = useState<'models' | 'keys' | 'governance'>('models');
  const [expandedConfig, setExpandedConfig] = useState<string | null>(null);

  // Chart: requests per model
  const requestData = MOCK_MODELS.filter(m => m.status === 'active').map(m => ({
    name: m.name.split(' ')[0],
    requests: m.requestsToday,
  }));

  function buildPDFConfig(): PDFReportOptions {
    return {
      title: 'AI Model Governance & BYOK Report',
      subtitle: 'Model inventory, configuration, and compliance status',
      module: 'AI Model Governance',
      jurisdiction: 'Jersey',
      classification: 'CONFIDENTIAL',
      generatedBy: 'Velanova AI Governance Engine',
      sections: [
        { type: 'stats', stats: [
          { label: 'Active Models', value: String(MOCK_MODELS.filter(m => m.status === 'active').length) },
          { label: 'High-risk Models', value: String(MOCK_MODELS.filter(m => m.riskClassification === 'high').length) },
          { label: 'API Keys', value: String(MOCK_KEYS.filter(k => k.status === 'active').length) + ' active' },
          { label: 'Avg Accuracy', value: (MOCK_MODELS.reduce((s, m) => s + m.accuracy, 0) / MOCK_MODELS.length).toFixed(1) + '%' },
        ]},
        { type: 'heading', content: 'Model Inventory' },
        { type: 'table', columns: ['Model', 'Version', 'Provider', 'Risk', 'Accuracy', 'Status'], rows: MOCK_MODELS.map(m => [m.name, m.version, m.provider, m.riskClassification, m.accuracy + '%', m.status]) },
        { type: 'heading', content: 'API Key Inventory' },
        { type: 'table', columns: ['Provider', 'Label', 'Status', 'Permissions'], rows: MOCK_KEYS.map(k => [k.provider, k.label, k.status, k.permissions.join(', ')]) },
      ],
    };
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#030303] text-white overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-400" />
          <h1 className="text-[14px] font-semibold tracking-tight">AI Model Governance</h1>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-medium">BYOK</span>
        </div>
        <div className="flex items-center gap-1.5 app-region-no-drag">
          {(['models', 'keys', 'governance'] as const).map(v => (
            <button key={v} onClick={() => setViewMode(v)} className={cn('h-7 px-3 rounded-lg text-[11px] capitalize transition-colors', viewMode === v ? 'bg-white/[0.08] text-white' : 'text-zinc-500 hover:text-zinc-300')}>
              {v === 'models' ? 'Models' : v === 'keys' ? 'API Keys' : 'Governance'}
            </button>
          ))}
          <ExportButton getReportConfig={buildPDFConfig} compact />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Active Models', value: String(MOCK_MODELS.filter(m => m.status === 'active').length), icon: Cpu, color: 'text-indigo-400' },
            { label: 'High-Risk Models', value: String(MOCK_MODELS.filter(m => m.riskClassification === 'high').length), icon: AlertTriangle, color: 'text-red-400' },
            { label: 'Active API Keys', value: String(MOCK_KEYS.filter(k => k.status === 'active').length), icon: Key, color: 'text-emerald-400' },
            { label: 'Avg Accuracy', value: (MOCK_MODELS.reduce((s, m) => s + m.accuracy, 0) / MOCK_MODELS.length).toFixed(1) + '%', icon: Activity, color: 'text-emerald-400' },
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

        {/* Models View */}
        {viewMode === 'models' && (
          <>
            {/* Requests chart */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <span className="text-[11px] text-zinc-400 font-medium">Requests Today by Model</span>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={requestData} margin={{ top: 12, right: 4, bottom: 0, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#52525b', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="requests" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Model Cards */}
            <div className="grid grid-cols-2 gap-3">
              {MOCK_MODELS.map(model => (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(selectedModel === model.id ? null : model.id)}
                  className={cn(
                    'rounded-xl border p-4 cursor-pointer transition-all',
                    selectedModel === model.id ? 'border-indigo-500/30 bg-white/[0.03]' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.03]'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[12px] font-medium text-white/80">{model.name}</span>
                      <span className="text-[10px] text-zinc-600 ml-2">v{model.version}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', STATUS_CLR[model.status])}>{model.status}</span>
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', RISK_CLR[model.riskClassification])}>{model.riskClassification} risk</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 mb-3">{model.description}</p>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-[14px] font-bold text-emerald-400 tabular-nums">{model.accuracy}%</div>
                      <span className="text-[8px] text-zinc-600">Accuracy</span>
                    </div>
                    <div className="text-center">
                      <div className="text-[14px] font-bold text-blue-400 tabular-nums">{model.latencyMs}ms</div>
                      <span className="text-[8px] text-zinc-600">Latency</span>
                    </div>
                    <div className="text-center">
                      <div className="text-[14px] font-bold text-indigo-400 tabular-nums">{(model.requestsToday / 1000).toFixed(1)}k</div>
                      <span className="text-[8px] text-zinc-600">Today</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className={cn('text-[9px] px-1.5 py-0.5 rounded capitalize', PROVIDER_CLR[model.provider])}>{model.provider}</span>
                    <span className="text-[9px] text-zinc-600">{model.type}</span>
                  </div>

                  {/* Expanded detail */}
                  {selectedModel === model.id && (
                    <div className="border-t border-white/[0.06] pt-3 mt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Data Residency</span>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{model.dataResidency}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Encryption</span>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{model.encryptionStandard}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Human Oversight</span>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{model.humanOversight}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Explainability</span>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{model.explainability}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Last Trained</span>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{model.lastTrained}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Bias Audit</span>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{model.biasAuditDate}</p>
                        </div>
                      </div>

                      {/* Config */}
                      <div>
                        <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Model Configuration</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Object.entries(model.config).map(([k, v]) => (
                            <span key={k} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400">
                              {k}: <span className="text-white/70">{v}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Compliance */}
                      <div>
                        <span className="text-[9px] text-zinc-600 uppercase tracking-wider">Compliance</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {model.compliance.map(c => (
                            <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* API Keys View */}
        {viewMode === 'keys' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <span className="text-[12px] font-medium text-white/70">API Key Management</span>
              <span className="text-[10px] text-zinc-600">(BYOK — Bring Your Own Key)</span>
            </div>

            {MOCK_KEYS.map(key => (
              <div key={key.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded capitalize', PROVIDER_CLR[key.provider])}>{key.provider}</span>
                    <span className="text-[12px] font-medium text-white/80">{key.label}</span>
                  </div>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded capitalize', key.status === 'active' ? 'text-emerald-400 bg-emerald-400/10' : 'text-zinc-500 bg-zinc-500/10')}>{key.status}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> {key.maskedKey}</span>
                  <span>Last used: {new Date(key.lastUsed).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {key.permissions.map(p => (
                    <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400">{p}</span>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-xl border border-indigo-500/10 bg-indigo-900/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span className="text-[11px] font-medium text-indigo-400">Key Security Policy</span>
              </div>
              <ul className="space-y-1">
                {[
                  'API keys encrypted at rest using AES-256-GCM in Jersey data centre',
                  'Keys never transmitted to client-side code or browser',
                  'Automatic rotation every 90 days with 7-day grace period',
                  'All API calls logged with full audit trail',
                  'IP whitelisting available per key',
                ].map(p => (
                  <li key={p} className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Governance View */}
        {viewMode === 'governance' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span className="text-[12px] font-medium text-white/70">AI Governance Framework</span>
            </div>

            {/* Governance Principles */}
            {[
              { title: 'Safety, Security & Robustness', ref: 'EU AI Act Art. 9 / UK Principle 1', status: 'compliant', detail: 'All high-risk models undergo adversarial testing, input validation, and failover mechanisms. Transaction freezing on model failure.' },
              { title: 'Transparency & Explainability', ref: 'EU AI Act Art. 13 / UK Principle 2', status: 'compliant', detail: 'All model decisions include explainability outputs (SHAP values, factor decomposition, confidence intervals). Users informed when interacting with AI.' },
              { title: 'Fairness & Non-discrimination', ref: 'EU AI Act Art. 10 / UK Principle 3', status: 'partial', detail: 'Bias audits conducted quarterly. Demographic parity monitoring active. Geographic bias detected in sanctions screening — remediation in progress.' },
              { title: 'Accountability & Governance', ref: 'EU AI Act Art. 14 / UK Principle 4', status: 'compliant', detail: 'Designated AI Governance Officer. Model registry maintained. All changes require approval workflow. Incident response plan tested annually.' },
              { title: 'Human Oversight', ref: 'EU AI Act Art. 14 / UK Principle 5', status: 'compliant', detail: 'Human-in-the-loop for all high-risk decisions. No autonomous SAR filing. MLRO retains override authority. Kill switch available.' },
              { title: 'Data Governance', ref: 'EU AI Act Art. 10 / JDPA', status: 'compliant', detail: 'Training data inventoried and versioned. Bias in training data monitored. Data residency requirements met. Anonymisation validated.' },
            ].map((principle, idx) => (
              <div key={idx}
                onClick={() => setExpandedConfig(expandedConfig === `p${idx}` ? null : `p${idx}`)}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {principle.status === 'compliant' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    <div>
                      <span className="text-[12px] font-medium text-white/80">{principle.title}</span>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{principle.ref}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded capitalize', principle.status === 'compliant' ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-400 bg-amber-400/10')}>
                      {principle.status}
                    </span>
                    {expandedConfig === `p${idx}` ? <ChevronDown className="w-3.5 h-3.5 text-zinc-600" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />}
                  </div>
                </div>
                {expandedConfig === `p${idx}` && (
                  <div className="px-4 pb-4 border-t border-white/[0.04] pt-3">
                    <p className="text-[10px] text-zinc-400 leading-relaxed">{principle.detail}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Model Risk Matrix */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
              <span className="text-[11px] text-zinc-400 font-medium">Model Risk Classification (EU AI Act)</span>
              <div className="space-y-2">
                {(['high', 'medium', 'low'] as ModelRisk[]).map(risk => {
                  const models = MOCK_MODELS.filter(m => m.riskClassification === risk);
                  return (
                    <div key={risk} className="flex items-center gap-3">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded capitalize font-medium w-16 text-center', RISK_CLR[risk])}>{risk}</span>
                      <div className="flex-1 flex flex-wrap gap-1">
                        {models.map(m => (
                          <span key={m.id} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400">{m.name}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 flex items-start gap-2">
          <Eye className="w-3.5 h-3.5 text-zinc-600 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-zinc-600 leading-relaxed">
            AI model governance aligned with EU AI Act (2024), UK AI White Paper (2023), OECD AI Principles (2019),
            and JFSC expectations. Model registry maintained per EU AI Act Art. 60. Bias audits per Art. 10(2)(f).
            Human oversight requirements per Art. 14.
          </p>
        </div>
      </div>
    </div>
  );
}
