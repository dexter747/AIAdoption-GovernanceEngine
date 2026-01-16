'use client';

import { useState } from 'react';
import { Search, DollarSign, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';

// Mock payments data - would come from API
const paymentsData = [
  { id: 1, user: 'Sarah Johnson', email: 'sarah@example.com', amount: 99.00, plan: 'Enterprise', status: 'Completed', method: 'Credit Card', date: 'Jan 18, 2024 14:32' },
  { id: 2, user: 'John Smith', email: 'john@example.com', amount: 29.00, plan: 'Pro', status: 'Completed', method: 'PayPal', date: 'Jan 18, 2024 11:15' },
  { id: 3, user: 'Emily Davis', email: 'emily@example.com', amount: 29.00, plan: 'Pro', status: 'Pending', method: 'Credit Card', date: 'Jan 17, 2024 09:45' },
  { id: 4, user: 'Lisa Anderson', email: 'lisa@example.com', amount: 99.00, plan: 'Enterprise', status: 'Completed', method: 'Credit Card', date: 'Jan 16, 2024 16:30' },
  { id: 5, user: 'James Taylor', email: 'james@example.com', amount: 29.00, plan: 'Pro', status: 'Failed', method: 'Credit Card', date: 'Jan 16, 2024 14:00' },
  { id: 6, user: 'Robert Garcia', email: 'robert@example.com', amount: 29.00, plan: 'Pro', status: 'Completed', method: 'PayPal', date: 'Jan 15, 2024 11:45' },
  { id: 7, user: 'Maria Rodriguez', email: 'maria@example.com', amount: 99.00, plan: 'Enterprise', status: 'Completed', method: 'Credit Card', date: 'Jan 14, 2024 15:20' },
  { id: 8, user: 'David Brown', email: 'david@example.com', amount: 29.00, plan: 'Pro', status: 'Refunded', method: 'Credit Card', date: 'Jan 14, 2024 10:10' },
];

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');

  const filteredPayments = paymentsData.filter(payment => {
    const matchesSearch = payment.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          payment.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || payment.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const totalRevenue = paymentsData.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = paymentsData.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
  const refundedAmount = paymentsData.filter(p => p.status === 'Refunded').reduce((sum, p) => sum + p.amount, 0);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Refunded':
        return <RefreshCw className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Payments</h1>
          <p className="text-gray-500 mt-1">Manage all payment transactions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Plans</option>
          <option value="Pro">Pro</option>
          <option value="Enterprise">Enterprise</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <p className="text-2xl font-bold text-green-500">${totalRevenue.toFixed(2)}</p>
          </div>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-2xl font-bold text-black dark:text-white">{paymentsData.length}</p>
          <p className="text-sm text-gray-500">Total Transactions</p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <p className="text-2xl font-bold text-yellow-500">${pendingAmount.toFixed(2)}</p>
          </div>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-gray-500" />
            <p className="text-2xl font-bold text-gray-500">${refundedAmount.toFixed(2)}</p>
          </div>
          <p className="text-sm text-gray-500">Refunded</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-900 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{payment.user.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black dark:text-white">{payment.user}</p>
                        <p className="text-xs text-gray-500">{payment.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-black dark:text-white">${payment.amount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      payment.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {payment.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{payment.method}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${
                      payment.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      payment.status === 'Failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {statusIcon(payment.status)}
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{payment.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-black dark:text-white">{filteredPayments.length}</span> of <span className="font-medium text-black dark:text-white">{paymentsData.length}</span> payments
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white border border-gray-200 dark:border-gray-800 rounded-lg transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white border border-gray-200 dark:border-gray-800 rounded-lg transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
