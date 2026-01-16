'use client';

import { 
  Users, Download, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface Stats {
  totalUsers: number;
  totalDownloads: number;
  totalRevenue: number;
  activeUsers: number;
  userGrowth: number;
  downloadGrowth: number;
  revenueGrowth: number;
  activeUserGrowth: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  joined: string;
}

interface Payment {
  id: string;
  user: string;
  amount: number;
  plan: string;
  status: string;
  date: string;
}

interface DownloadItem {
  id: string;
  user: string;
  version: string;
  platform: string;
  date: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, paymentsRes, downloadsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/users?limit=5'),
        fetch('/api/payments?limit=3'),
        fetch('/api/downloads?limit=4'),
      ]);

      const [statsData, usersData, paymentsData, downloadsData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        paymentsRes.json(),
        downloadsRes.json(),
      ]);

      setStats(statsData.error ? null : statsData);
      setUsers(usersData.users || []);
      setPayments(paymentsData.payments || []);
      setDownloads(downloadsData.downloads || []);
    } catch (err) {
      setError('Failed to load dashboard data.');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    { 
      name: 'Total Users', 
      value: stats?.totalUsers?.toLocaleString() || '0', 
      change: `${(stats?.userGrowth || 0) >= 0 ? '+' : ''}${stats?.userGrowth || 0}%`, 
      trend: (stats?.userGrowth || 0) >= 0 ? 'up' : 'down',
      icon: Users,
      color: 'blue'
    },
    { 
      name: 'Total Downloads', 
      value: stats?.totalDownloads?.toLocaleString() || '0', 
      change: `${(stats?.downloadGrowth || 0) >= 0 ? '+' : ''}${stats?.downloadGrowth || 0}%`, 
      trend: (stats?.downloadGrowth || 0) >= 0 ? 'up' : 'down',
      icon: Download,
      color: 'green'
    },
    { 
      name: 'Revenue', 
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, 
      change: `${(stats?.revenueGrowth || 0) >= 0 ? '+' : ''}${stats?.revenueGrowth || 0}%`, 
      trend: (stats?.revenueGrowth || 0) >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'purple'
    },
    { 
      name: 'Active Users', 
      value: stats?.activeUsers?.toLocaleString() || '0', 
      change: `${(stats?.activeUserGrowth || 0) >= 0 ? '+' : ''}${stats?.activeUserGrowth || 0}%`, 
      trend: (stats?.activeUserGrowth || 0) >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      color: 'orange'
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here is what is happening.</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-black dark:hover:text-white border border-gray-200 dark:border-gray-800 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-600 dark:text-yellow-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
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
              <span className={`flex items-center gap-1 text-xs font-medium ${
                stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-black dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.name}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black dark:text-white">Recent Users</h2>
            <a href="/dashboard/users" className="text-sm text-blue-500 hover:text-blue-600">View All</a>
          </div>
          <div className="p-4">
            {users.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No users yet</p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      user.plan === 'Pro' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>{user.plan}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black dark:text-white">Recent Payments</h2>
            <a href="/dashboard/payments" className="text-sm text-blue-500 hover:text-blue-600">View All</a>
          </div>
          <div className="p-4">
            {payments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No payments yet</p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">{payment.user}</p>
                      <p className="text-xs text-gray-500">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-black dark:text-white">${payment.amount.toFixed(2)}</p>
                      <span className={`text-xs ${payment.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black dark:text-white">Recent Downloads</h2>
          <a href="/dashboard/downloads" className="text-sm text-blue-500 hover:text-blue-600">View All</a>
        </div>
        <div className="p-4">
          {downloads.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No downloads yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {downloads.map((download) => (
                <div key={download.id} className="p-4 rounded-lg border border-gray-100 dark:border-gray-900">
                  <p className="text-sm font-medium text-black dark:text-white">{download.user}</p>
                  <p className="text-xs text-gray-500 mt-1">{download.version} - {download.platform}</p>
                  <p className="text-xs text-gray-400 mt-2">{download.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
