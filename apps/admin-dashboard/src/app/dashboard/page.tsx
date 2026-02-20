'use client';

import { 
 Users, Download, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight,
 RefreshCw, Activity, BarChart3
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

interface ChartData {
 userChartData: Array<{ date: string; users: number }>;
 revenueChartData: Array<{ date: string; revenue: number }>;
 downloadChartData: Array<{ date: string; downloads: number }>;
 platformChartData: Array<{ name: string; value: number }>;
 planChartData: Array<{ name: string; value: number }>;
}

export default function DashboardPage() {
 const [stats, setStats] = useState<Stats | null>(null);
 const [users, setUsers] = useState<User[]>([]);
 const [payments, setPayments] = useState<Payment[]>([]);
 const [chartData, setChartData] = useState<ChartData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const fetchData = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const [statsRes, usersRes, paymentsRes, analyticsRes] = await Promise.all([
 fetch('/api/stats'),
 fetch('/api/users?limit=5'),
 fetch('/api/payments?limit=5'),
 fetch('/api/analytics'),
 ]);

 const [statsData, usersData, paymentsData, analyticsData] = await Promise.all([
 statsRes.json(),
 usersRes.json(),
 paymentsRes.json(),
 analyticsRes.json(),
 ]);

 setStats(statsData.error ? null : statsData);
 setUsers(usersData.users || []);
 setPayments(paymentsData.payments || []);
 setChartData(analyticsData.error ? null : analyticsData);
 } catch (err) {
 setError('Failed to load dashboard data. Check your database connection.');
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
 <RefreshCw className="w-8 h-8 text-zinc-300 animate-spin mx-auto mb-4" />
 <p className="text-muted-foreground">Loading dashboard data...</p>
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
 value: `$${((stats?.totalRevenue || 0) / 100).toLocaleString()}`, 
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
 icon: Activity,
 color: 'orange'
 },
 ];

 // Simple bar chart component
 const MiniBarChart = ({ data, dataKey, color }: { data: any[]; dataKey: string; color: string }) => {
 const maxValue = Math.max(...data.map(d => d[dataKey]), 1);
 return (
 <div className="flex items-end gap-1 h-24">
 {data.slice(-14).map((item, i) => (
 <div
 key={i}
 className={`flex-1 rounded-t ${color}`}
 style={{ height: `${(item[dataKey] / maxValue) * 100}%`, minHeight: '2px' }}
 title={`${item.date}: ${item[dataKey]}`}
 />
 ))}
 </div>
 );
 };

 // Simple pie/donut display
 const PlanDistribution = ({ data }: { data: Array<{ name: string; value: number }> }) => {
 const total = data.reduce((sum, d) => sum + d.value, 0);
 const colors = ['bg-zinc-800', 'bg-zinc-800', 'bg-zinc-800', 'bg-zinc-700'];
 
 return (
 <div className="space-y-3">
 {data.map((item, i) => {
 const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
 return (
 <div key={item.name} className="flex items-center gap-3">
 <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`} />
 <div className="flex-1">
 <div className="flex justify-between text-sm">
 <span className="text-zinc-400">{item.name}</span>
 <span className="text-muted-foreground">{item.value} ({percentage}%)</span>
 </div>
 <div className="mt-1 h-1.5 rounded-full overflow-hidden bg-zinc-900">
 <div 
 className={`h-full ${colors[i % colors.length]} rounded-full transition-all`}
 style={{ width: `${percentage}%` }}
 />
 </div>
 </div>
 </div>
 );
 })}
 </div>
 );
 };

 return (
 <div className="p-8">
 {/* Header */}
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="font-medium text-white">Dashboard</h1>
 <p className="text-muted-foreground mt-1">Overview of your platform analytics and metrics</p>
 </div>
 <button
 onClick={fetchData}
 className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground rounded-lg transition-colors hover:text-white border-zinc-800 hover:bg-zinc-950"
 >
 <RefreshCw className="w-4 h-4" />
 Refresh
 </button>
 </div>

 {/* Error Alert */}
 {error && (
 <div className="mb-6 border rounded-lg p-4 bg-zinc-950 border-zinc-800">
 <p className="text-zinc-400">{error}</p>
 </div>
 )}

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
 {statsCards.map((stat) => (
 <div key={stat.name} className="rounded-xl p-6 bg-black border-zinc-800">
 <div className="flex items-center justify-between mb-4">
 <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ stat.color === 'blue' ? 'bg-zinc-900/40' : stat.color === 'green' ? 'bg-zinc-900/40' : stat.color === 'purple' ? 'bg-zinc-900/40' : 'bg-zinc-900/40' }`}>
 <stat.icon className={`w-5 h-5 ${
 stat.color === 'blue' ? 'text-zinc-300' :
 stat.color === 'green' ? 'text-zinc-400' :
 stat.color === 'purple' ? 'text-zinc-300' :
 'text-zinc-400'
 }`} />
 </div>
 <span className={`flex items-center gap-1 text-xs font-medium ${
 stat.trend === 'up' ? 'text-zinc-400' : 'text-zinc-400'
 }`}>
 {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
 {stat.change}
 </span>
 </div>
 <p className="font-medium text-white">{stat.value}</p>
 <p className="text-sm text-muted-foreground mt-1">{stat.name}</p>
 </div>
 ))}
 </div>

 {/* Analytics Charts Row */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
 {/* User Signups Chart */}
 <div className="rounded-xl p-6 bg-black border-zinc-800">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-medium text-white">User Signups</h3>
 <span className="text-xs text-muted-foreground">Last 14 days</span>
 </div>
 {chartData?.userChartData ? (
 <MiniBarChart data={chartData.userChartData} dataKey="users" color="bg-zinc-800" />
 ) : (
 <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">No data</div>
 )}
 </div>

 {/* Revenue Chart */}
 <div className="rounded-xl p-6 bg-black border-zinc-800">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-medium text-white">Revenue</h3>
 <span className="text-xs text-muted-foreground">Last 14 days</span>
 </div>
 {chartData?.revenueChartData ? (
 <MiniBarChart data={chartData.revenueChartData} dataKey="revenue" color="bg-zinc-800" />
 ) : (
 <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">No data</div>
 )}
 </div>

 {/* Downloads Chart */}
 <div className="rounded-xl p-6 bg-black border-zinc-800">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-medium text-white">Downloads</h3>
 <span className="text-xs text-muted-foreground">Last 14 days</span>
 </div>
 {chartData?.downloadChartData ? (
 <MiniBarChart data={chartData.downloadChartData} dataKey="downloads" color="bg-zinc-800" />
 ) : (
 <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">No data</div>
 )}
 </div>
 </div>

 {/* Distribution Charts Row */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
 {/* Plan Distribution */}
 <div className="rounded-xl p-6 bg-black border-zinc-800">
 <div className="flex items-center gap-2 mb-6">
 <BarChart3 className="w-5 h-5 text-muted-foreground" />
 <h3 className="font-medium text-white">Plan Distribution</h3>
 </div>
 {chartData?.planChartData && chartData.planChartData.some(d => d.value > 0) ? (
 <PlanDistribution data={chartData.planChartData} />
 ) : (
 <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">No users yet</div>
 )}
 </div>

 {/* Platform Distribution */}
 <div className="rounded-xl p-6 bg-black border-zinc-800">
 <div className="flex items-center gap-2 mb-6">
 <Download className="w-5 h-5 text-muted-foreground" />
 <h3 className="font-medium text-white">Download Platforms</h3>
 </div>
 {chartData?.platformChartData && chartData.platformChartData.some(d => d.value > 0) ? (
 <PlanDistribution data={chartData.platformChartData} />
 ) : (
 <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">No downloads yet</div>
 )}
 </div>
 </div>

 {/* Recent Activity Row */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Recent Users */}
 <div className="rounded-xl bg-black border-zinc-800">
 <div className="px-6 py-4 border-b flex items-center justify-between border-zinc-800">
 <h2 className="font-medium text-white">Recent Users</h2>
 <a href="/dashboard/users" className="text-sm text-zinc-300 hover:text-zinc-400">View All</a>
 </div>
 <div className="p-4">
 {users.length === 0 ? (
 <p className="text-center text-muted-foreground py-8">No users yet</p>
 ) : (
 <div className="space-y-3">
 {users.map((user) => (
 <div key={user.id} className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-zinc-950">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 bg-gradient-to-br from-zinc-400 to-zinc-600 rounded-full flex items-center justify-center">
 <span className="text-white text-sm font-medium">{user.name.charAt(0).toUpperCase()}</span>
 </div>
 <div>
 <p className="font-medium text-white">{user.name}</p>
 <p className="text-xs text-muted-foreground">{user.email}</p>
 </div>
 </div>
 <div className="text-right">
 <span className={`px-2 py-1 font-medium rounded-full ${ user.plan === 'Enterprise' ? 'bg-zinc-900/40 text-zinc-400' : user.plan === 'Pro' ? 'bg-zinc-900/40 text-zinc-400' : 'bg-secondary text-muted-foreground' }`}>{user.plan}</span>
 <p className="text-xs text-muted-foreground mt-1">{user.joined}</p>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Recent Payments */}
 <div className="rounded-xl bg-black border-zinc-800">
 <div className="px-6 py-4 border-b flex items-center justify-between border-zinc-800">
 <h2 className="font-medium text-white">Recent Payments</h2>
 <a href="/dashboard/payments" className="text-sm text-zinc-300 hover:text-zinc-400">View All</a>
 </div>
 <div className="p-4">
 {payments.length === 0 ? (
 <p className="text-center text-muted-foreground py-8">No payments yet</p>
 ) : (
 <div className="space-y-3">
 {payments.map((payment) => (
 <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-zinc-950">
 <div className="flex items-center gap-3">
 <div className={`w-9 h-9 rounded-full flex items-center justify-center ${ payment.status === 'Completed' ? 'bg-zinc-900/40' : 'bg-zinc-900/40' }`}>
 <DollarSign className={`w-4 h-4 ${
 payment.status === 'Completed' ? 'text-zinc-300' : 'text-zinc-300'
 }`} />
 </div>
 <div>
 <p className="font-medium text-white">{payment.user}</p>
 <p className="text-xs text-muted-foreground">{payment.plan}</p>
 </div>
 </div>
 <div className="text-right">
 <p className="font-medium text-white">${(payment.amount / 100).toFixed(2)}</p>
 <p className="text-xs text-muted-foreground">{payment.date}</p>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
