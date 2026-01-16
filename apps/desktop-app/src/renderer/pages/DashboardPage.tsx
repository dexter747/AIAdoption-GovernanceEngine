import { Database, MessageSquare, Zap, TrendingUp, ArrowUpRight, Clock } from 'lucide-react';

const stats = [
  { name: 'Connected Databases', value: '3', icon: Database, color: 'blue' },
  { name: 'AI Queries Today', value: '47', icon: MessageSquare, color: 'green' },
  { name: 'Tokens Used', value: '12.4k', icon: Zap, color: 'purple' },
  { name: 'Avg Response Time', value: '1.2s', icon: TrendingUp, color: 'orange' },
];

const recentQueries = [
  { id: 1, query: 'Show me all users who signed up last month', database: 'Production DB', time: '5 min ago', status: 'success' },
  { id: 2, query: 'Calculate monthly revenue by product category', database: 'Analytics DB', time: '15 min ago', status: 'success' },
  { id: 3, query: 'Find duplicate customer entries', database: 'Production DB', time: '1 hour ago', status: 'success' },
  { id: 4, query: 'Generate sales forecast for Q2', database: 'Analytics DB', time: '2 hours ago', status: 'error' },
];

const connectedDatabases = [
  { id: 1, name: 'Production DB', type: 'PostgreSQL', status: 'connected', queries: 234 },
  { id: 2, name: 'Analytics DB', type: 'MySQL', status: 'connected', queries: 156 },
  { id: 3, name: 'Legacy System', type: 'Oracle', status: 'disconnected', queries: 0 },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black dark:text-white">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's an overview of your AI workspace.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                'bg-orange-100 dark:bg-orange-900/30'
              }`}>
                <stat.icon className={`w-5 h-5 ${
                  stat.color === 'blue' ? 'text-blue-500' :
                  stat.color === 'green' ? 'text-green-500' :
                  stat.color === 'purple' ? 'text-purple-500' :
                  'text-orange-500'
                }`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-black dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Queries */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black dark:text-white">Recent Queries</h2>
            <button className="text-sm text-blue-500 hover:text-blue-600">View All</button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-900">
            {recentQueries.map((query) => (
              <div key={query.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black dark:text-white truncate">{query.query}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{query.database}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {query.time}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    query.status === 'success' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {query.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connected Databases */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black dark:text-white">Connected Databases</h2>
            <button className="text-sm text-blue-500 hover:text-blue-600">Add New</button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-900">
            {connectedDatabases.map((db) => (
              <div key={db.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    db.status === 'connected' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <Database className={`w-5 h-5 ${
                      db.status === 'connected' ? 'text-green-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">{db.name}</p>
                    <p className="text-xs text-gray-500">{db.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    db.status === 'connected' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {db.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{db.queries} queries</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
