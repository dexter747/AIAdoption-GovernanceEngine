import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Activity, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn, formatCurrency, formatNumber } from '../lib/utils';

interface AnalyticsData {
  revenue: {
    total: number;
    change: number;
    data: Array<{ date: string; amount: number }>;
  };
  users: {
    total: number;
    change: number;
    data: Array<{ date: string; count: number }>;
  };
  queries: {
    total: number;
    change: number;
    data: Array<{ date: string; count: number }>;
  };
  topModels: Array<{ name: string; usage: number; revenue: number }>;
  planDistribution: Array<{ name: string; value: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    revenue: {
      total: 45600,
      change: 12.5,
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: Math.floor(Math.random() * 3000) + 1000,
      })),
    },
    users: {
      total: 1247,
      change: 8.3,
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: Math.floor(Math.random() * 50) + 20,
      })),
    },
    queries: {
      total: 342500,
      change: 15.7,
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: Math.floor(Math.random() * 15000) + 8000,
      })),
    },
    topModels: [
      { name: 'GPT-4o', usage: 125000, revenue: 18500 },
      { name: 'Claude 3.5 Sonnet', usage: 98000, revenue: 15200 },
      { name: 'Gemini 2.0 Flash', usage: 67000, revenue: 6700 },
      { name: 'GPT-4o Mini', usage: 45000, revenue: 3200 },
      { name: 'Groq Llama', usage: 7500, revenue: 1400 },
    ],
    planDistribution: [
      { name: 'Trial', value: 450 },
      { name: 'Professional', value: 620 },
      { name: 'Team', value: 150 },
      { name: 'Enterprise', value: 27 },
    ],
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      setTimeout(() => setIsLoading(false), 500);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{title}</p>
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold">{value}</p>
          <div className="flex items-center gap-1 text-sm">
            {trend === 'up' ? (
              <ArrowUp className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-600" />
            )}
            <span className={cn(
              'font-medium',
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            )}>
              {change}%
            </span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor your platform's performance and growth
          </p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {range === '7d' && 'Last 7 days'}
              {range === '30d' && 'Last 30 days'}
              {range === '90d' && 'Last 90 days'}
              {range === '1y' && 'Last year'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(analytics.revenue.total)}
          change={analytics.revenue.change}
          icon={DollarSign}
          trend="up"
        />
        <StatCard
          title="Total Users"
          value={formatNumber(analytics.users.total)}
          change={analytics.users.change}
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Total Queries"
          value={formatNumber(analytics.queries.total)}
          change={analytics.queries.change}
          icon={Activity}
          trend="up"
        />
        <StatCard
          title="Avg Revenue/User"
          value={formatCurrency(analytics.revenue.total / analytics.users.total)}
          change={4.2}
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Daily revenue for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.revenue.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New users registered over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.users.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Models */}
        <Card>
          <CardHeader>
            <CardTitle>Top AI Models by Usage</CardTitle>
            <CardDescription>Most used models and their revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topModels.map((model, index) => (
                <div key={model.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm',
                      `bg-gradient-to-br from-${COLORS[index]}-500 to-${COLORS[index]}-600`
                    )} style={{ background: COLORS[index] }}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{model.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(model.usage)} queries
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatCurrency(model.revenue)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Users by subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Query Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Query Activity</CardTitle>
          <CardDescription>Total queries processed over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.queries.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value: any) => formatNumber(value)}
              />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
