'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, DollarSign, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';

interface Payment {
 id: string;
 user: string;
 email: string;
 amount: number;
 plan: string;
 status: string;
 method: string;
 date: string;
}

interface PaymentsResponse {
 payments: Payment[];
 total: number;
 summary: {
 totalRevenue: number;
 pendingAmount: number;
 refundedAmount: number;
 };
}

export default function PaymentsPage() {
 const [payments, setPayments] = useState<Payment[]>([]);
 const [total, setTotal] = useState(0);
 const [summary, setSummary] = useState({ totalRevenue: 0, pendingAmount: 0, refundedAmount: 0 });
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const [filterStatus, setFilterStatus] = useState('all');
 const [filterPlan, setFilterPlan] = useState('all');
 const [page, setPage] = useState(1);

 const fetchPayments = useCallback(async () => {
 setLoading(true);
 try {
 const params = new URLSearchParams();
 params.append('page', page.toString());
 params.append('limit', '10');
 if (searchQuery) params.append('search', searchQuery);
 if (filterStatus !== 'all') params.append('status', filterStatus);
 if (filterPlan !== 'all') params.append('plan', filterPlan);

 const res = await fetch(`/api/payments?${params.toString()}`);
 const data: PaymentsResponse = await res.json();
 setPayments(data.payments || []);
 setTotal(data.total || 0);
 setSummary(data.summary || { totalRevenue: 0, pendingAmount: 0, refundedAmount: 0 });
 } catch (err) {
 console.error('Failed to fetch payments:', err);
 } finally {
 setLoading(false);
 }
 }, [page, searchQuery, filterStatus, filterPlan]);

 useEffect(() => {
 fetchPayments();
 }, [fetchPayments]);

 useEffect(() => {
 setPage(1);
 }, [searchQuery, filterStatus, filterPlan]);

 const statusIcon = (status: string) => {
 switch (status.toLowerCase()) {
 case 'completed':
 return <CheckCircle className="w-4 h-4 text-zinc-400" />;
 case 'pending':
 return <Clock className="w-4 h-4 text-zinc-400" />;
 case 'failed':
 return <XCircle className="w-4 h-4 text-zinc-400" />;
 case 'refunded':
 return <RefreshCw className="w-4 h-4 text-zinc-500" />;
 default:
 return null;
 }
 };

 if (loading && payments.length === 0) {
 return (
 <div className="p-8 flex items-center justify-center min-h-screen">
 <div className="text-center">
 <RefreshCw className="w-8 h-8 text-zinc-300 animate-spin mx-auto mb-4" />
 <p className="text-zinc-500">Loading payments...</p>
 </div>
 </div>
 );
 }

 return (
 <div className="p-8">
 {/* Header */}
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="font-medium text-white">Payments</h1>
 <p className="text-zinc-500 mt-1">Manage all payment transactions</p>
 </div>
 <button
 onClick={fetchPayments}
 className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-500 rounded-lg hover:text-white border-white/[0.06]"
 >
 <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
 Refresh
 </button>
 </div>

 {/* Filters */}
 <div className="flex flex-col sm:flex-row gap-4 mb-6">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
 <input
 type="text"
 placeholder="Search by user..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-2 rounded-lg placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 border border-white/[0.08] bg-black text-white"
 />
 </div>
 <select
 value={filterStatus}
 onChange={(e) => setFilterStatus(e.target.value)}
 className="px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/20 border border-white/[0.08] bg-black text-white"
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
 className="px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/20 border border-white/[0.08] bg-black text-white"
 >
 <option value="all">All Plans</option>
 <option value="Pro">Pro</option>
 <option value="Enterprise">Enterprise</option>
 </select>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
 <div className="rounded-lg p-4 border border-white/[0.06] bg-white/[0.02]">
 <div className="flex items-center gap-2">
 <DollarSign className="w-5 h-5 text-zinc-400" />
 <p className="text-2xl font-medium text-zinc-400">${summary.totalRevenue.toFixed(2)}</p>
 </div>
 <p className="text-sm text-zinc-500">Total Revenue</p>
 </div>
 <div className="rounded-lg p-4 border border-white/[0.06] bg-white/[0.02]">
 <p className="font-medium text-white">{total}</p>
 <p className="text-sm text-zinc-500">Total Transactions</p>
 </div>
 <div className="rounded-lg p-4 border border-white/[0.06] bg-white/[0.02]">
 <div className="flex items-center gap-2">
 <Clock className="w-5 h-5 text-zinc-400" />
 <p className="text-2xl font-medium text-zinc-400">${summary.pendingAmount.toFixed(2)}</p>
 </div>
 <p className="text-sm text-zinc-500">Pending</p>
 </div>
 <div className="rounded-lg p-4 border border-white/[0.06] bg-white/[0.02]">
 <div className="flex items-center gap-2">
 <RefreshCw className="w-5 h-5 text-zinc-500" />
 <p className="text-2xl font-medium text-zinc-500">${summary.refundedAmount.toFixed(2)}</p>
 </div>
 <p className="text-sm text-zinc-500">Refunded</p>
 </div>
 </div>

 {/* Payments Table */}
 <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-white/[0.06] bg-white/[0.02]">
 <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">User</th>
 <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Amount</th>
 <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Plan</th>
 <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Method</th>
 <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
 <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Date</th>
 </tr>
 </thead>
 <tbody>
 {payments.length === 0 ? (
 <tr>
 <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
 No payments found
 </td>
 </tr>
 ) : (
 payments.map((payment) => (
 <tr key={payment.id} className="border-b last:border-0 border-white/[0.04] hover:bg-white/[0.02]">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
 <span className="text-white text-sm font-medium">{payment.user.charAt(0).toUpperCase()}</span>
 </div>
 <div>
 <p className="font-medium text-white">{payment.user}</p>
 <p className="text-xs text-zinc-500">{payment.email}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className="font-medium text-white">${payment.amount.toFixed(2)}</span>
 </td>
 <td className="px-6 py-4">
 <span className={`px-2 py-1 font-medium rounded-full ${ payment.plan === 'Enterprise' ? 'bg-white/[0.05] text-zinc-400' : 'bg-white/[0.05] text-zinc-400' }`}>
 {payment.plan}
 </span>
 </td>
 <td className="px-6 py-4">
 <span className="text-sm text-zinc-500">{payment.method}</span>
 </td>
 <td className="px-6 py-4">
 <span className={`inline-flex items-center gap-1.5 px-2 py-1 font-medium rounded-full ${ payment.status.toLowerCase() === 'completed' ? 'bg-white/[0.05] text-zinc-400' : payment.status.toLowerCase() === 'pending' ? 'bg-white/[0.05] text-zinc-400' : payment.status.toLowerCase() === 'failed' ? 'bg-white/[0.05] text-zinc-400' : 'bg-white/[0.04] text-zinc-500' }`}>
 {statusIcon(payment.status)}
 {payment.status}
 </span>
 </td>
 <td className="px-6 py-4">
 <span className="text-sm text-zinc-500">{payment.date}</span>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 
 {/* Pagination */}
 <div className="px-6 py-4 border-t flex items-center justify-between border-white/[0.06]">
 <p className="text-sm text-zinc-500">
 Showing <span className="font-medium text-white">{payments.length}</span> of <span className="font-medium text-white">{total}</span> payments
 </p>
 <div className="flex gap-2">
 <button 
 onClick={() => setPage(p => Math.max(1, p - 1))}
 disabled={page === 1}
 className="px-3 py-1.5 text-sm font-medium text-zinc-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:text-white border-white/[0.06]"
 >
 Previous
 </button>
 <button 
 onClick={() => setPage(p => p + 1)}
 disabled={payments.length < 10}
 className="px-3 py-1.5 text-sm font-medium text-zinc-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:text-white border-white/[0.06]"
 >
 Next
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
