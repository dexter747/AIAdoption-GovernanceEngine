import { useState, useEffect, useRef } from 'react';
import { Send, Database, Sparkles, Copy, Check, Clock, Loader2, AlertCircle } from 'lucide-react';

interface ConnectionOption {
  id: string;
  name: string;
  type: string;
}

interface QueryResult {
  sql: string;
  explanation?: string;
  duration: number;
  connectionName: string;
}

export default function QueriesPage() {
  const [query, setQuery] = useState('');
  const [selectedDb, setSelectedDb] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [databases, setDatabases] = useState<ConnectionOption[]>([]);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingDbs, setLoadingDbs] = useState(true);
  const startTime = useRef<number>(0);

  const exampleQueries = [
    'Show me all users who signed up in the last 7 days',
    'Calculate the total revenue by month for 2024',
    "Find customers who haven't made a purchase in 90 days",
    'List the top 10 products by sales volume',
  ];

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoadingDbs(true);
      const conns =
        (await window.electron.mcp?.getAllConnections?.()) ||
        (await window.electron.express?.getUserConnections?.()) ||
        [];
      const connsArray = Array.isArray(conns) ? conns : (conns as any)?.data || [];
      const mapped: ConnectionOption[] = connsArray.map((c: any) => ({
        id: c.id,
        name: c.name || c.type || 'Unknown',
        type: c.type || 'unknown',
      }));
      setDatabases(mapped);
      if (mapped.length > 0 && !selectedDb) {
        setSelectedDb(mapped[0].id);
      }
    } catch {
      console.error('Failed to load connections');
    } finally {
      setLoadingDbs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    startTime.current = Date.now();

    try {
      const selectedConn = databases.find(d => d.id === selectedDb);
      let response: any = null;

      // Strategy 1: MCP query-with-ai (best for connected databases)
      try {
        response = await (window.electron as any).api?.queryWithMCP?.({
          connectionId: selectedDb,
          prompt: query,
        });
      } catch {
        /* fall through */
      }

      // Strategy 2: Express AI endpoint
      if (!response?.sql && !response?.result) {
        try {
          response = await window.electron.express?.queryAI?.({
            prompt: query,
            connectionId: selectedDb,
            connectionType: selectedConn?.type,
          } as any);
        } catch {
          /* fall through */
        }
      }

      // Strategy 3: Local AI router
      if (!response?.sql && !response?.result) {
        response = await window.electron.ai?.query?.(query, {
          connectionId: selectedDb,
          type: 'sql-generation',
        });
      }

      const duration = ((Date.now() - startTime.current) / 1000).toFixed(1);
      const sql =
        response?.sql ||
        response?.result?.sql ||
        response?.content ||
        response?.result ||
        response?.message ||
        'No SQL generated. Make sure a database is connected and try again.';

      setResult({
        sql: typeof sql === 'string' ? sql : JSON.stringify(sql, null, 2),
        explanation: response?.explanation || response?.result?.explanation || undefined,
        duration: parseFloat(duration),
        connectionName: selectedConn?.name || 'Unknown',
      });
    } catch (err: any) {
      setError(err?.message || 'Query failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.sql) return;
    navigator.clipboard.writeText(result.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-medium text-white">AI Queries</h1>
        <p className="text-muted-foreground mt-1">
          Ask questions in natural language and get SQL queries
        </p>
      </div>

      {/* Query Input */}
      <div className="rounded-xl p-6 mb-6 bg-black border-zinc-800">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium text-muted-foreground">Database:</label>
            {loadingDbs ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading connections…
              </div>
            ) : databases.length === 0 ? (
              <span className="text-sm text-amber-400/70">
                No connections found — add one in Connections
              </span>
            ) : (
              <select
                value={selectedDb}
                onChange={e => setSelectedDb(e.target.value)}
                className="px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-zinc-950 border-zinc-800 text-white"
              >
                {databases.map(db => (
                  <option key={db.id} value={db.id}>
                    {db.name} ({db.type})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="relative">
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask a question about your data in plain English..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none bg-zinc-950 border-zinc-800 text-white"
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e);
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim() || databases.length === 0}
              className="absolute bottom-3 right-3 p-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>

        {/* Example Queries */}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, i) => (
              <button
                key={i}
                onClick={() => setQuery(example)}
                className="px-3 py-1.5 rounded-lg transition-colors bg-zinc-950 text-muted-foreground hover:bg-zinc-900"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-950/20 px-5 py-4 text-[13px] text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="flex-1 rounded-xl overflow-hidden bg-black border-zinc-800">
          <div className="px-6 py-4 border-b flex items-center justify-between border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-zinc-300" />
              <h2 className="font-medium text-white">Generated Query</h2>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-white"
            >
              {copied ? <Check className="w-4 h-4 text-zinc-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="p-6">
            {result.explanation && (
              <p className="text-[13px] text-zinc-400 mb-4 leading-relaxed">{result.explanation}</p>
            )}
            <div className="rounded-lg p-4 font-mono bg-zinc-950 text-white">
              <pre className="whitespace-pre-wrap">{result.sql}</pre>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Database className="w-4 h-4" />
                {result.connectionName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {result.duration}s
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !error && !isLoading && (
        <div className="flex-1 rounded-xl bg-black border-zinc-800 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
            <p className="text-[13px] text-zinc-600">Ask a question to generate a SQL query</p>
            <p className="text-[11px] text-zinc-700 mt-1">⌘ + Enter to submit</p>
          </div>
        </div>
      )}
    </div>
  );
}
