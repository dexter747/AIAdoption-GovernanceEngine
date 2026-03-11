import { useState } from 'react';
import {
  Brain, ChevronDown, ChevronRight,
  AlertTriangle, CheckCircle2, Target, Scale,
} from 'lucide-react';
import { cn } from '../../lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   AI Explainability Panel
   Transparent, expandable panel showing WHY an AI decision was made.
   Aligned with:
   · UK AI White Paper — Transparency principle
   · EU AI Act Article 13 — Transparency requirements for high-risk AI
   · OECD AI Principle 1.3 — Transparency and explainability
   · JFSC Guidance — Accountability for AI-assisted decisions
   ═══════════════════════════════════════════════════════════════════════════ */

export interface AIExplainabilityProps {
  /** Confidence score 0-100 */
  confidence: number;
  /** The AI's reasoning / explanation */
  reasoning: string;
  /** Recommended human action */
  recommendedAction?: string;
  /** Factors that contributed to the decision */
  factors?: { factor: string; weight: 'high' | 'medium' | 'low'; detail: string }[];
  /** Data sources consulted */
  dataSources?: string[];
  /** Model / algorithm info */
  modelInfo?: { name: string; version: string; type: string };
  /** Risk flags identified */
  riskFlags?: string[];
  /** Whether the panel starts expanded */
  defaultOpen?: boolean;
  /** Compact mode for inline use */
  compact?: boolean;
}

const WEIGHT_CLR: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
};
const WEIGHT_TEXT: Record<string, string> = {
  high: 'text-red-400',
  medium: 'text-amber-400',
  low: 'text-blue-400',
};

function ConfidenceGauge({ value }: { value: number }) {
  const color = value >= 85 ? 'bg-red-500' : value >= 65 ? 'bg-amber-500' : value >= 40 ? 'bg-blue-500' : 'bg-zinc-500';
  const textColor = value >= 85 ? 'text-red-400' : value >= 65 ? 'text-amber-400' : value >= 40 ? 'text-blue-400' : 'text-zinc-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className={cn('text-[12px] font-semibold tabular-nums', textColor)}>{value}%</span>
    </div>
  );
}

export default function AIExplainabilityPanel({
  confidence,
  reasoning,
  recommendedAction,
  factors,
  dataSources,
  modelInfo,
  riskFlags,
  defaultOpen = false,
  compact = false,
}: AIExplainabilityProps) {
  const [expanded, setExpanded] = useState(defaultOpen);

  if (compact) {
    return (
      <div className="p-2.5 rounded-lg bg-indigo-900/10 border border-indigo-500/15">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Brain className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-medium text-indigo-400 uppercase tracking-wider">AI Explainability</span>
          <span className="text-[10px] text-zinc-600 ml-auto">Confidence: {confidence}%</span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed">{reasoning}</p>
        {recommendedAction && (
          <p className="text-[11px] text-indigo-400/80 mt-1"><Target className="w-3 h-3 inline mr-1" />{recommendedAction}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-indigo-500/15 overflow-hidden bg-gradient-to-b from-indigo-900/10 to-transparent">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <Brain className="w-4 h-4 text-indigo-400" />
        <span className="text-[12px] font-medium text-indigo-300">Why this decision?</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/30 text-indigo-400 ml-1">AI Explainability</span>
        <div className="flex-1" />
        <span className="text-[11px] text-zinc-500">Confidence: </span>
        <span className={cn('text-[12px] font-semibold tabular-nums', confidence >= 85 ? 'text-red-400' : confidence >= 65 ? 'text-amber-400' : 'text-blue-400')}>{confidence}%</span>
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />}
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-indigo-500/10">
          {/* Confidence gauge */}
          <div className="pt-3">
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Decision Confidence</div>
            <ConfidenceGauge value={confidence} />
            <p className="text-[10px] text-zinc-600 mt-1">
              {confidence >= 85 ? 'Very high confidence — strong pattern match' :
               confidence >= 65 ? 'Moderate confidence — human review recommended' :
               confidence >= 40 ? 'Low-moderate confidence — requires investigation' :
               'Low confidence — insufficient data for reliable assessment'}
            </p>
          </div>

          {/* Reasoning */}
          <div>
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Reasoning</div>
            <p className="text-[12px] text-zinc-300 leading-relaxed">{reasoning}</p>
          </div>

          {/* Contributing Factors */}
          {factors && factors.length > 0 && (
            <div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Contributing Factors</div>
              <div className="space-y-1.5">
                {factors.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded bg-white/[0.02] border border-white/[0.03]">
                    <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', WEIGHT_CLR[f.weight])} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-white/70">{f.factor}</span>
                        <span className={cn('text-[9px] uppercase', WEIGHT_TEXT[f.weight])}>{f.weight} impact</span>
                      </div>
                      <p className="text-[11px] text-zinc-500">{f.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Flags */}
          {riskFlags && riskFlags.length > 0 && (
            <div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Risk Flags</div>
              <div className="flex flex-wrap gap-1">
                {riskFlags.map((flag, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/20 text-red-400 border border-red-500/10">
                    <AlertTriangle className="w-2.5 h-2.5 inline mr-0.5" />{flag.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Action */}
          {recommendedAction && (
            <div className="p-3 rounded-lg bg-emerald-900/10 border border-emerald-500/15">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Recommended Action</span>
              </div>
              <p className="text-[12px] text-zinc-300">{recommendedAction}</p>
            </div>
          )}

          {/* Data Sources & Model Info */}
          <div className="grid grid-cols-2 gap-3">
            {dataSources && dataSources.length > 0 && (
              <div>
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Data Sources</div>
                <div className="space-y-0.5">
                  {dataSources.map((ds, i) => (
                    <div key={i} className="text-[11px] text-zinc-500 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />{ds}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {modelInfo && (
              <div>
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Model Information</div>
                <div className="space-y-0.5 text-[11px]">
                  <p className="text-zinc-400"><span className="text-zinc-600">Model:</span> {modelInfo.name}</p>
                  <p className="text-zinc-400"><span className="text-zinc-600">Version:</span> {modelInfo.version}</p>
                  <p className="text-zinc-400"><span className="text-zinc-600">Type:</span> {modelInfo.type}</p>
                </div>
              </div>
            )}
          </div>

          {/* Transparency notice */}
          <div className="p-2.5 rounded bg-white/[0.02] border border-white/[0.03]">
            <div className="flex items-start gap-2">
              <Scale className="w-3.5 h-3.5 text-zinc-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  <span className="text-zinc-400 font-medium">Transparency Notice:</span> This AI assessment is advisory only and does not constitute a final decision.
                  All flagged items require human review per JFSC AML/CFT Handbook requirements. AI outputs may contain
                  false positives or miss edge cases. The responsible officer retains accountability for all compliance decisions.
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-500">EU AI Act Compliant</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-500">OECD AI Principles</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-500">UK AI White Paper</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
