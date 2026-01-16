'use client';

import { 
  Users, Download, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Stats data - would come from API in production
const statsData = [
  { 
    name: 'Total Users', 
    value: '1,243', 
    change: '+12.5%', 
    trend: 'up',
    icon: Users,
    color: 'blue'
  },
  { 
    name: 'Total Downloads', 
    value: '3,567', 
    change: '+8.2%', 
    trend: 'up',
    icon: Download,
    color: 'green'
  },
  { 
    name: 'Revenue', 
    value: '$45,230', 
    change: '+23.1%', 
    trend: 'up',
    icon: DollarSign,
    color: 'purple'
  },
  { 
    name: 'Active Users', 
    value: '892', 
    change: '-3.2%', 
    trend: 'down',
    icon: TrendingUp,
    color: 'orange'
  },
];

// Mock data for tables
const recentUsers = [
  { id: 1, name: 'John Smith', email: 'john@example.com', plan: 'Pro', status: 'Active', joined: '2 hours ago' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', plan: 'Enterprise', status: 'Active', joined: '5 hours ago' },
  { id: 3, name: 'Mike Wilson', email: 'mike@example.com', plan: 'Free', status: 'Pending', joined: '1 day ago' },
  { id: 4, name: 'Emily Davis', email: 'emily@example.com', plan: 'Pro', status: 'Active', joined: '2 days ago' },
  { id: 5, name: 'David Brown', email: 'david@example.com', plan: 'Free', status: 'Inactive', joined: '3 days ago' },
];

const recentDownloads = [
  { id: 1, user: 'John Smith', version: 'v2.4.1', platform: 'Windows', date: '2 hours ago' },
  { id: 2, user: 'Sarah Johnson', version: 'v2.4.1', platform: 'macOS', date: '4 hours ago' },
  { id: 3, user: 'Mike Wilson', version: 'v2.4.0', platform: 'Linux', date: '1 day ago' },
  { id: 4, user: 'Emily Davis', version: 'v2.4.1', platform: 'Windows', date: '1 day ago' },
];

const recentPayments = [
  { id: 1, user: 'Sarah Johnson', amount: '$99.00', plan: 'Enterprise', status: 'Completed', date: '1 hour ago' },
  { id: 2, user: 'John Smith', amount: '$29.00', plan: 'Pro', status: 'Completed', date: '3 hours ago' },
  { id: 3, user: 'Emily Davis', amount: '$29.00', plan: 'Pro', status: 'Pending', date: '1 day ago' },
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black dark:text-white">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat) => (
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

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black dark:text-white">Recent Users</h2>
            <button className="text-sm text-blue-500 hover:text-blue-600">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.slice(0, 5).map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-900 last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        user.plan === 'Pro' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        user.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black dark:text-white">Recent Payments</h2>
            <button className="text-sm text-blue-500 hover:text-blue-600">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-900 last:border-0">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-black dark:text-white">{payment.user}</p>
                        <p className="text-xs text-gray-500">{payment.date}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-black dark:text-white">{payment.amount}</p>
                        <p className="text-xs text-gray-500">{payment.plan}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Downloads */}
      <div className="mt-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black dark:text-white">Recent Downloads</h2>
          <button className="text-sm text-blue-500 hover:text-blue-600">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Version</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Platform</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentDownloads.map((download) => (
                <tr key={download.id} className="border-b border-gray-100 dark:border-gray-900 last:border-0">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-black dark:text-white">{download.user}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{download.version}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      download.platform === 'Windows' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      download.platform === 'macOS' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {download.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{download.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
