/* ═══════════════════════════════════════════════════════════════════════════
   ExportButton — Reusable PDF export trigger for any page
   ═══════════════════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect } from 'react';
import { FileDown, Loader2, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { generatePDFReport, PDFReportOptions } from '../../lib/pdfExport';

interface ExportButtonProps {
  /** Function that returns the PDF report config when clicked */
  getReportConfig: () => PDFReportOptions;
  /** Optional label override */
  label?: string;
  /** Compact icon-only variant */
  compact?: boolean;
  /** Extra CSS classes */
  className?: string;
}

export default function ExportButton({
  getReportConfig,
  label = 'Export PDF',
  compact = false,
  className,
}: ExportButtonProps) {
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleExport = async () => {
    if (status === 'generating') return;
    setStatus('generating');
    try {
      const config = getReportConfig();
      await generatePDFReport(config);
      setStatus('done');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error('PDF export failed:', err);
      setStatus('idle');
    }
  };

  const Icon = status === 'generating' ? Loader2 : status === 'done' ? Check : FileDown;
  const text =
    status === 'generating' ? 'Generating...' : status === 'done' ? 'Downloaded!' : label;

  if (compact) {
    return (
      <button
        onClick={handleExport}
        disabled={status === 'generating'}
        title={text}
        className={cn(
          'p-2 rounded-lg transition-all',
          status === 'done'
            ? 'text-emerald-400 bg-emerald-500/10'
            : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]',
          status === 'generating' && 'opacity-60 cursor-wait',
          className
        )}
      >
        <Icon className={cn('w-4 h-4', status === 'generating' && 'animate-spin')} />
      </button>
    );
  }

  return (
    <button
      onClick={handleExport}
      disabled={status === 'generating'}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all',
        status === 'done'
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
          : 'bg-white/[0.04] text-zinc-400 border border-white/[0.06] hover:text-white hover:bg-white/[0.08] hover:border-white/10',
        status === 'generating' && 'opacity-60 cursor-wait',
        className
      )}
    >
      <Icon className={cn('w-3.5 h-3.5', status === 'generating' && 'animate-spin')} />
      {text}
    </button>
  );
}
