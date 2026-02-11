import React, { useState, useEffect } from 'react';

interface AnalyticsData {
  revenue: {
    total: number;
    thisMonth: number;
    growth: number;
  };
  users: {
    total: number;
    active: number;
    new: number;
  };
  subscriptions: {
    total: number;
    byPlan: Record<string, number>;
    churnRate: number;
  };
  usage: {
    totalQueries: number;
    totalTokens: number;
    topUsers: Array<{ email: string; queries: number }>;
  };
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5500/api/admin/analytics/dashboard?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ADMIN_SECRET_TOKEN')}`,
        },
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="p-6 text-center">No data available</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      {/* Revenue Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Revenue</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded shadow">
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(data.revenue.total)}
            </div>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <div className="text-sm text-gray-600">This Month</div>
            <div className="text-3xl font-bold">
              {formatCurrency(data.revenue.thisMonth)}
            </div>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <div className="text-sm text-gray-600">Growth</div>
            <div className={`text-3xl font-bold ${data.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.revenue.growth > 0 ? '+' : ''}{data.revenue.growth.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Users Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded shadow">
            <div className="text-sm text-gray-600">Total Users</div>
            <div className="text-3xl font-bold">{formatNumber(data.users.total)}</div>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <div className="text-sm text-gray-600">Active Users</div>
            <div className="text-3xl font-bold text-blue-600">{formatNumber(data.users.active)}</div>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <div className="text-sm text-gray-600">New Users</div>
            <div className="text-3xl font-bold text-green-600">{formatNumber(data.users.new)}</div>
          </div>
        </div>
      </div>

      {/* Subscriptions Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Subscriptions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded shadow">
            <div className="text-sm text-gray-600 mb-4">By Plan</div>
            <div className="space-y-3">
              {Object.entries(data.subscriptions.byPlan).map(([plan, count]) => (
                <div key={plan} className="flex justify-between items-center">
                  <span className="capitalize">{plan}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <div className="text-sm text-gray-600">Churn Rate</div>
            <div className="text-3xl font-bold text-orange-600">
              {data.subscriptions.churnRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {data.subscriptions.total} total subscriptions
            </div>
          </div>
        </div>
      </div>

      {/* Usage Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-6 rounded shadow">
            <div className="text-sm text-gray-600">Total Queries</div>
            <div className="text-3xl font-bold">{formatNumber(data.usage.totalQueries)}</div>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <div className="text-sm text-gray-600">Total Tokens</div>
            <div className="text-3xl font-bold">{formatNumber(data.usage.totalTokens)}</div>
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-4">Top Users by Queries</h3>
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left py- text-sm font-medium text-gray-600">User</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Queries</th>
              </tr>
            </thead>
            <tbody>
              {data.usage.topUsers.map((user, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{user.email}</td>
                  <td className="py-2 text-right font-semibold">{formatNumber(user.queries)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
