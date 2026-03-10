import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Database, Sparkles, Copy, Check, Clock, Loader2, AlertCircle,
  Star, StarOff, History, Save, BarChart3, Table2, LineChart, PieChart,
  Download, Trash2, Search, TrendingUp, Zap, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart as ReLine, Line, PieChart as RePie, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { cn } from '../lib/utils';

/* ── Types ─────────────────────────────────────────────────────────────── */

interface ConnectionOption { id: string; name: string; type: string }
interface SavedQuery { id: string; title: string; natural_language: string; generated_sql: string; is_favorite: boolean; tags: string[]; run_count: number; last_run_at: string; connection_type?: string }
interface HistoryItem { id: string; natural_language: string; generated_sql: string; connection_name: string; execution_ms: number; status: string; row_count: number; created_at: string; ai_model?: string }
interface HistoryStats { total: number; today: number; avgExecMs: number; successRate: number; topConnections: { name: string; count: number }[] }

type Tab = 'query' | 'saved' | 'history';
type ChartType = 'table' | 'bar' | 'line' | 'pie' | 'area';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

const EXAMPLE_QUERIES = [
  'Show all users who signed up this month',
  'Revenue by month for the last 12 months',
  'Top 10 customers by total spend',
  'Average order value by product category',
  'Daily active users trend over last 30 days',
  'Overdue invoices with amount > £1000',
];

/* ── Main Component ────────────────────────────────────────────────────── */

export default function BusinessIntelPage() {
  const [tab, setTab] = useState<Tab>('query');
  const [query, setQuery] = useState('');
  const [selectedDb, setSelectedDb] = useState('');
  const [databases, setDatabases] = useState<ConnectionOption[]>([]);
  const [loadingDbs, setLoadingDbs] = useState(true);

  // Query state
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [explanation, setExplanation] = useState('');
  const [resultData, setResultData] = useState<Record<string, unknown>[]>([]);
  const [resultColumns, setResultColumns] = useState<string[]>([]);
  const [resultSummary, setResultSummary] = useState('');
  const [chartType, setChartType] = useState<ChartType>('table');
  const [executionMs, setExecutionMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Saved / History
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyStats, setHistoryStats] = useState<HistoryStats | null>(null);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* ── Load connections ─────────────────────────────────────────────── */

  useEffect(() => { loadConnections(); }, []);

  const loadConnections = async () => {
    try {
      setLoadingDbs(true);
      const conns = (await window.electron.mcp?.getAllConnections?.()) || (await window.electron.express?.getUserConnections?.()) || [];
      const arr = Array.isArray(conns) ? conns : (conns as any)?.data || [];
      const mapped: ConnectionOption[] = arr.map((c: any) => ({ id: c.id, name: c.name || c.type || 'Unknown', type: c.type || 'unknown' }));
      setDatabases(mapped);
      if (mapped.length > 0 && !selectedDb) setSelectedDb(mapped[0].id);
    } catch { /* silent */ } finally { setLoadingDbs(false); }
  };

  /* ── Tab loaders ──────────────────────────────────────────────────── */

  useEffect(() => {
    if (tab === 'saved') loadSavedQueries();
    if (tab === 'history') { loadHistory(); loadHistoryStats(); }
  }, [tab]);

  const loadSavedQueries = async () => {
    try {
      const res = await fetch('/api/bi/saved', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const json = await res.json();
      if (json.success) setSavedQueries(json.data);
    } catch { /* silent */ }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/bi/history?limit=100', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const json = await res.json();
      if (json.success) setHistory(json.data);
    } catch { /* silent */ }
  };

  const loadHistoryStats = async () => {
    try {
      const res = await fetch('/api/bi/history/stats', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const json = await res.json();
      if (json.success) setHistoryStats(json.data);
    } catch { /* silent */ }
  };

  /* ── Generate SQL ─────────────────────────────────────────────────── */

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedSQL('');
    setExplanation('');
    setResultData([]);
    setResultColumns([]);
    setResultSummary('');

    const start = Date.now();
    try {
      const conn = databases.find(d => d.id === selectedDb);

      // Strategy 1: Use backend NL-to-SQL service
      let response: any = null;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/bi/generate-sql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ naturalLanguage: query, connectionId: selectedDb, connectionType: conn?.type }),
        });
        if (res.ok) response = await res.json();
      } catch { /* fall through */ }

      // Strategy 2: MCP query-with-ai
      if (!response?.data?.sql) {
        try {
          const mcpRes = await (window.electron as any).api?.queryWithMCP?.({ connectionId: selectedDb, prompt: query });
          if (mcpRes?.sql || mcpRes?.result) {
            response = { data: { sql: mcpRes.sql || mcpRes.result, explanation: mcpRes.explanation || '' } };
          }
        } catch { /* fall through */ }
      }

      // Strategy 3: Local AI router
      if (!response?.data?.sql) {
        const localRes = await window.electron.ai?.query?.(query, { connectionId: selectedDb, type: 'sql-generation' });
        response = { data: { sql: localRes?.sql || localRes?.content || localRes?.result || 'No SQL generated.', explanation: localRes?.explanation || '' } };
      }

      const elapsed = Date.now() - start;
      setExecutionMs(elapsed);

      const sql = response?.data?.sql || '';
      setGeneratedSQL(typeof sql === 'string' ? sql : JSON.stringify(sql, null, 2));
      setExplanation(response?.data?.explanation || '');

      if (response?.data?.suggestedChart && response.data.suggestedChart !== 'null') {
        setChartType(response.data.suggestedChart as ChartType);
      }

      // Try to execute the query via MCP and get actual results
      try {
        const execRes = await (window.electron as any).api?.executeMCPQuery?.({ connectionId: selectedDb, sql: typeof sql === 'string' ? sql : '' });
        if (execRes?.rows && Array.isArray(execRes.rows)) {
          setResultData(execRes.rows);
          setResultColumns(execRes.columns || (execRes.rows.length > 0 ? Object.keys(execRes.rows[0]) : []));
        }
      } catch { /* query execution optional */ }

    } catch (err: any) {
      setError(err?.message || 'Query failed. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [query, selectedDb, databases, isLoading]);

  /* ── Save & Favorite ──────────────────────────────────────────────── */

  const handleSave = async () => {
    if (!saveTitle.trim() || !generatedSQL) return;
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/bi/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: saveTitle, naturalLanguage: query, generatedSQL, connectionId: selectedDb, connectionType: databases.find(d => d.id === selectedDb)?.type }),
      });
      setShowSaveDialog(false);
      setSaveTitle('');
    } catch { /* silent */ }
  };

  const toggleFavorite = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/bi/saved/${id}/favorite`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      setSavedQueries(prev => prev.map(q => q.id === id ? { ...q, is_favorite: !q.is_favorite } : q));
    } catch { /* silent */ }
  };

  const deleteSaved = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/bi/saved/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setSavedQueries(prev => prev.filter(q => q.id !== id));
    } catch { /* silent */ }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCSV = () => {
    if (resultData.length === 0) return;
    const headers = resultColumns.join(',');
    const rows = resultData.map(r => resultColumns.map(c => JSON.stringify(r[c] ?? '')).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'query-results.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Render Helpers ──────────────────────────────────────────────── */

  const renderChart = () => {
    if (resultData.length === 0) return null;
    const xKey = resultColumns[0];
    const yKeys = resultColumns.filter((_, i) => i > 0 && typeof resultData[0]?.[resultColumns[i]] === 'number');
    if (yKeys.length === 0 && chartType !== 'table') return null;

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={resultData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey={xKey} tick={{ fill: '#71717a', fontSize: 11 }} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
              <Legend />
              {yKeys.map((key, i) => <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />)}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <ReLine data={resultData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey={xKey} tick={{ fill: '#71717a', fontSize: 11 }} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
              <Legend />
              {yKeys.map((key, i) => <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={false} />)}
            </ReLine>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <RePie>
              <Pie data={resultData} dataKey={yKeys[0] || resultColumns[1]} nameKey={xKey} cx="50%" cy="50%" outerRadius={120} label>
                {resultData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
              <Legend />
            </RePie>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={resultData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey={xKey} tick={{ fill: '#71717a', fontSize: 11 }} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, fontSize: 11 }} />
              {yKeys.map((key, i) => <Area key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.15} />)}
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  /* ── Render ──────────────────────────────────────────────────────── */

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">Business Intelligence</h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        {historyStats && (
          <div className="flex items-center gap-4 app-region-no-drag">
            <span className="flex items-center gap-1.5 text-[11px] text-white/40">
              <Zap className="w-3 h-3 text-white/25" />
              <span className="tabular-nums font-medium text-white/60">{historyStats.total}</span> queries
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-white/40">
              <TrendingUp className="w-3 h-3 text-white/25" />
              <span className="tabular-nums font-medium text-white/60">{historyStats.successRate || 0}%</span> success
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-white/40">
              <Clock className="w-3 h-3 text-white/25" />
              <span className="tabular-nums font-medium text-white/60">{historyStats.avgExecMs}ms</span> avg
            </span>
          </div>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 app-region-no-drag">
          {(['query', 'saved', 'history'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn(
              'h-6 px-2.5 rounded-[5px] text-[11px] font-medium transition-all capitalize',
              tab === t ? 'bg-white/[0.1] text-white/80' : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
            )}>
              {t === 'query' && <Search className="w-3 h-3 inline mr-1" />}
              {t === 'saved' && <Star className="w-3 h-3 inline mr-1" />}
              {t === 'history' && <History className="w-3 h-3 inline mr-1" />}
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">

        {/* ── QUERY TAB ─────────────────────────────────────────────── */}
        {tab === 'query' && (
          <div className="p-5 flex flex-col gap-5 h-full">
            {/* Input area */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-5">
              <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-4 h-4 text-zinc-500" />
                  {loadingDbs ? (
                    <span className="flex items-center gap-2 text-[12px] text-zinc-600"><Loader2 className="w-3 h-3 animate-spin" /> Loading…</span>
                  ) : databases.length === 0 ? (
                    <span className="text-[12px] text-amber-400/60">No connections — add one in Connections</span>
                  ) : (
                    <select value={selectedDb} onChange={e => setSelectedDb(e.target.value)} className="h-7 px-2 rounded-md text-[12px] bg-white/[0.04] border border-white/[0.08] text-white/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/40">
                      {databases.map(db => <option key={db.id} value={db.id}>{db.name} ({db.type})</option>)}
                    </select>
                  )}
                </div>
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Ask a question about your data in plain English…"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg text-[13px] placeholder-zinc-600 bg-white/[0.03] border border-white/[0.06] text-white/90 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                    onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
                  />
                  <button type="submit" disabled={isLoading || !query.trim() || databases.length === 0} className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>
              {/* Examples */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {EXAMPLE_QUERIES.map((ex, i) => (
                  <button key={i} onClick={() => { setQuery(ex); inputRef.current?.focus(); }} className="h-6 px-2.5 rounded-md text-[11px] bg-white/[0.03] border border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-all">
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-[12px] text-red-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}

            {/* Results */}
            {generatedSQL && (
              <div className="flex-1 flex flex-col rounded-xl border border-white/[0.06] bg-[#0a0a0a] overflow-hidden min-h-0">
                {/* Result header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-[12px] font-medium text-white/80">Result</span>
                    <span className="text-[11px] text-zinc-600 ml-1">{executionMs}ms</span>
                    {resultData.length > 0 && <span className="text-[11px] text-zinc-600">{resultData.length} rows</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Chart type toggles */}
                    {resultData.length > 0 && (
                      <>
                        {([['table', Table2], ['bar', BarChart3], ['line', LineChart], ['pie', PieChart]] as [ChartType, any][]).map(([type, Icon]) => (
                          <button key={type} onClick={() => setChartType(type)} className={cn('p-1.5 rounded-md transition-all', chartType === type ? 'bg-white/[0.1] text-white' : 'text-zinc-600 hover:text-zinc-400')}>
                            <Icon className="w-3.5 h-3.5" />
                          </button>
                        ))}
                        <div className="w-px h-4 bg-white/[0.06] mx-1" />
                        <button onClick={exportCSV} className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-400 transition-all" title="Export CSV">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button onClick={handleCopy} className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-400 transition-all" title="Copy SQL">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => { setSaveTitle(query.slice(0, 60)); setShowSaveDialog(true); }} className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-400 transition-all" title="Save query">
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Explanation */}
                {explanation && (
                  <div className="px-4 py-2 border-b border-white/[0.04] text-[12px] text-zinc-400 leading-relaxed">{explanation}</div>
                )}

                {/* SQL Block */}
                <div className="px-4 py-3 border-b border-white/[0.04]">
                  <pre className="text-[12px] font-mono text-indigo-300/80 whitespace-pre-wrap leading-relaxed">{generatedSQL}</pre>
                </div>

                {/* Chart / Table */}
                {resultData.length > 0 && (
                  <div className="flex-1 overflow-auto">
                    {chartType === 'table' ? (
                      <div className="overflow-auto">
                        <table className="w-full text-[12px]">
                          <thead>
                            <tr className="border-b border-white/[0.06]">
                              {resultColumns.map(col => (
                                <th key={col} className="px-3 py-2 text-left font-medium text-zinc-500 uppercase text-[10px] tracking-wider">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {resultData.slice(0, 100).map((row, i) => (
                              <tr key={i} className={cn('border-b border-white/[0.03]', i % 2 === 0 ? 'bg-white/[0.01]' : '')}>
                                {resultColumns.map(col => (
                                  <td key={col} className="px-3 py-1.5 text-zinc-300 font-mono">{String(row[col] ?? '')}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4">{renderChart()}</div>
                    )}
                  </div>
                )}

                {/* Summary */}
                {resultSummary && (
                  <div className="px-4 py-2.5 border-t border-white/[0.06] text-[12px] text-zinc-400 bg-white/[0.02]">
                    <TrendingUp className="w-3.5 h-3.5 inline mr-1.5 text-indigo-400" />{resultSummary}
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {!generatedSQL && !error && !isLoading && (
              <div className="flex-1 rounded-xl border border-white/[0.04] bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                  <Database className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                  <p className="text-[13px] text-zinc-600 font-medium">Ask anything about your data</p>
                  <p className="text-[11px] text-zinc-700 mt-1">Natural language → SQL → Results → Charts</p>
                  <p className="text-[11px] text-zinc-800 mt-0.5">⌘ + Enter to submit</p>
                </div>
              </div>
            )}

            {/* Save Dialog */}
            {showSaveDialog && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowSaveDialog(false)}>
                <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5 w-[380px] space-y-3" onClick={e => e.stopPropagation()}>
                  <h3 className="text-[13px] font-medium text-white">Save Query</h3>
                  <input value={saveTitle} onChange={e => setSaveTitle(e.target.value)} placeholder="Query title…" className="w-full h-8 px-3 rounded-lg text-[12px] bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40" />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowSaveDialog(false)} className="h-7 px-3 rounded-md text-[11px] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] transition-all">Cancel</button>
                    <button onClick={handleSave} disabled={!saveTitle.trim()} className="h-7 px-3 rounded-md text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30 transition-all">Save</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SAVED TAB ─────────────────────────────────────────────── */}
        {tab === 'saved' && (
          <div className="p-5">
            {savedQueries.length === 0 ? (
              <div className="text-center py-20">
                <Star className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                <p className="text-[13px] text-zinc-600">No saved queries yet</p>
                <p className="text-[11px] text-zinc-700 mt-1">Generate a query and click Save to keep it here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedQueries.map(sq => (
                  <div key={sq.id} className="group rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-4 hover:border-white/[0.1] transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[13px] font-medium text-white/80 truncate">{sq.title}</h3>
                          {sq.is_favorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
                        </div>
                        <p className="text-[12px] text-zinc-500 mt-0.5 truncate">{sq.natural_language}</p>
                        {sq.generated_sql && <pre className="text-[11px] font-mono text-indigo-300/50 mt-2 truncate">{sq.generated_sql.slice(0, 120)}</pre>}
                        <div className="flex items-center gap-3 mt-2">
                          {sq.tags?.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-600">{t}</span>)}
                          <span className="text-[10px] text-zinc-700">Run {sq.run_count}x</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setQuery(sq.natural_language); setTab('query'); }} className="p-1.5 rounded-md text-zinc-600 hover:text-white hover:bg-white/[0.06] transition-all" title="Run">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => toggleFavorite(sq.id)} className="p-1.5 rounded-md text-zinc-600 hover:text-amber-400 hover:bg-white/[0.06] transition-all" title="Favorite">
                          {sq.is_favorite ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => deleteSaved(sq.id)} className="p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-white/[0.06] transition-all" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ───────────────────────────────────────────── */}
        {tab === 'history' && (
          <div className="flex flex-col h-full">
            {/* Stats bar */}
            {historyStats && (
              <div className="flex items-center gap-6 px-5 py-3 border-b border-white/[0.05]">
                <div className="text-center">
                  <div className="text-[16px] font-semibold text-white/80 tabular-nums">{historyStats.total}</div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-wider">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-[16px] font-semibold text-white/80 tabular-nums">{historyStats.today}</div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-wider">Today</div>
                </div>
                <div className="text-center">
                  <div className="text-[16px] font-semibold text-white/80 tabular-nums">{historyStats.avgExecMs}ms</div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-wider">Avg Time</div>
                </div>
                <div className="text-center">
                  <div className="text-[16px] font-semibold text-emerald-400/80 tabular-nums">{historyStats.successRate}%</div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-wider">Success</div>
                </div>
              </div>
            )}
            {/* History list */}
            <div className="flex-1 overflow-auto">
              {history.length === 0 ? (
                <div className="text-center py-20">
                  <History className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
                  <p className="text-[13px] text-zinc-600">No query history yet</p>
                </div>
              ) : (
                history.map((h, i) => (
                  <div key={h.id} className={cn(
                    'flex items-center gap-4 px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer',
                    i % 2 === 0 ? 'bg-[#0c0c0c]' : 'bg-[#0a0a0a]'
                  )} onClick={() => { setQuery(h.natural_language); setTab('query'); }}>
                    <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', h.status === 'success' ? 'bg-emerald-500' : h.status === 'error' ? 'bg-red-500' : 'bg-amber-500')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-white/70 truncate">{h.natural_language}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-zinc-600">{h.connection_name}</span>
                        {h.ai_model && <span className="text-[10px] text-zinc-700">{h.ai_model}</span>}
                        {h.row_count > 0 && <span className="text-[10px] text-zinc-700">{h.row_count} rows</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[11px] text-zinc-600 tabular-nums">{h.execution_ms}ms</span>
                      <span className="text-[10px] text-zinc-700">{new Date(h.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
