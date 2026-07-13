'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, RefreshCw } from 'lucide-react';

interface AnalyticsData {
  userChartData: Array<{ date: string; users: number }>;
  revenueChartData: Array<{ date: string; revenue: number }>;
  downloadChartData: Array<{ date: string; downloads: number }>;
  platformChartData: Array<{ name: string; value: number }>;
  planChartData: Array<{ name: string; value: number }>;
}

const COLORS = ['#d4d4d8', '#a1a1aa', '#a1a1aa', '#71717a', '#a1a1aa'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-zinc-300 animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-medium text-white">Analytics</h1>
          <p className="text-zinc-500 mt-1">30-day platform performance overview</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-500 rounded-lg hover:text-white border-white/[0.06]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-6">
        {/* User Signups */}
        <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-zinc-300" />
            <h2 className="font-medium text-white">Daily User Signups</h2>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data?.userChartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
              <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#d4d4d8"
                strokeWidth={2}
                dot={false}
                name="Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue */}
        <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-zinc-400" />
            <h2 className="font-medium text-white">Daily Revenue (USD)</h2>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data?.revenueChartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
              <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#a1a1aa" radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activations + Plan Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* License Activations */}
          <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-zinc-300" />
              <h2 className="font-medium text-white">Daily Activations</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data?.downloadChartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="downloads"
                  stroke="#a1a1aa"
                  strokeWidth={2}
                  dot={false}
                  name="Activations"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Plan Distribution */}
          <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-zinc-400" />
              <h2 className="font-medium text-white">Plan Distribution</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data?.planChartData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(data?.planChartData || []).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.02]">
          <h2 className="font-medium mb-6 text-white">Platform Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.platformChartData || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#a1a1aa' }}
                width={70}
              />
              <Tooltip />
              <Bar dataKey="value" fill="#d4d4d8" radius={[0, 4, 4, 0]} name="Activations" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
