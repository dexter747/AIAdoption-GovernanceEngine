import { useState } from 'react';
import { Send, Database, Sparkles, Copy, Check, Clock } from 'lucide-react';

export default function QueriesPage() {
  const [query, setQuery] = useState('');
  const [selectedDb, setSelectedDb] = useState('production');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const databases = [
    { id: 'production', name: 'Production DB' },
    { id: 'analytics', name: 'Analytics DB' },
  ];

  const exampleQueries = [
    'Show me all users who signed up in the last 7 days',
    'Calculate the total revenue by month for 2024',
    'Find customers who haven\'t made a purchase in 90 days',
    'List the top 10 products by sales volume',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    // Simulate AI query
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`SELECT * FROM users WHERE created_at > NOW() - INTERVAL '7 days'`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">AI Queries</h1>
        <p className="text-gray-500 mt-1">Ask questions in natural language and get SQL queries</p>
      </div>

      {/* Query Input */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium text-gray-500">Database:</label>
            <select
              value={selectedDb}
              onChange={(e) => setSelectedDb(e.target.value)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {databases.map(db => (
                <option key={db.id} value={db.id}>{db.name}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your data in plain English..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute bottom-3 right-3 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>

        {/* Example Queries */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, i) => (
              <button
                key={i}
                onClick={() => setQuery(example)}
                className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sample Result */}
      <div className="flex-1 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-black dark:text-white">Generated Query</h2>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm text-black dark:text-white">
            <pre className="whitespace-pre-wrap">
{`SELECT 
  id,
  email,
  name,
  created_at
FROM users
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;`}
            </pre>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Database className="w-4 h-4" />
              Production DB
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              0.8s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
