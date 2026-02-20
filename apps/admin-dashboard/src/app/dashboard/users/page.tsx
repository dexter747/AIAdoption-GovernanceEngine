'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Mail, Ban, Trash2, RefreshCw } from 'lucide-react';

interface User {
 id: string;
 name: string;
 email: string;
 plan: string;
 status: string;
 joined: string;
 lastActive: string;
}

interface UsersResponse {
 users: User[];
 total: number;
 page: number;
 limit: number;
}

export default function UsersPage() {
 const [users, setUsers] = useState<User[]>([]);
 const [total, setTotal] = useState(0);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const [filterPlan, setFilterPlan] = useState('all');
 const [filterStatus, setFilterStatus] = useState('all');
 const [page, setPage] = useState(1);
 const [stats, setStats] = useState({ active: 0, pending: 0, inactive: 0 });

 const fetchUsers = useCallback(async () => {
 setLoading(true);
 try {
 const params = new URLSearchParams();
 params.append('page', page.toString());
 params.append('limit', '10');
 if (searchQuery) params.append('search', searchQuery);
 if (filterPlan !== 'all') params.append('plan', filterPlan);
 if (filterStatus !== 'all') params.append('status', filterStatus);

 const res = await fetch(`/api/users?${params.toString()}`);
 const data: UsersResponse = await res.json();
 setUsers(data.users || []);
 setTotal(data.total || 0);

 // Calculate stats from all users (fetch without filters for stats)
 const statsRes = await fetch('/api/users?limit=1000');
 const statsData: UsersResponse = await statsRes.json();
 const allUsers = statsData.users || [];
 setStats({
 active: allUsers.filter(u => u.status === 'Active').length,
 pending: allUsers.filter(u => u.status === 'Pending').length,
 inactive: allUsers.filter(u => u.status === 'Inactive').length,
 });
 } catch (err) {
 console.error('Failed to fetch users:', err);
 } finally {
 setLoading(false);
 }
 }, [page, searchQuery, filterPlan, filterStatus]);

 useEffect(() => {
 fetchUsers();
 }, [fetchUsers]);

 useEffect(() => {
 setPage(1);
 }, [searchQuery, filterPlan, filterStatus]);

 if (loading && users.length === 0) {
 return (
 <div className="p-8 flex items-center justify-center min-h-screen">
 <div className="text-center">
 <RefreshCw className="w-8 h-8 text-zinc-300 animate-spin mx-auto mb-4" />
 <p className="text-zinc-500">Loading users...</p>
 </div>
 </div>
 );
 }

 return (
 <div className="p-8">
 {/* Header */}
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="font-medium text-white">Users</h1>
 <p className="text-zinc-500 mt-1">Manage all registered users</p>
 </div>
 <div className="flex gap-3">
 <button
 onClick={fetchUsers}
 className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-500 rounded-lg hover:text-white border-white/[0.06]"
 >
 <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
 Refresh
 </button>
 <button className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors">
 <UserPlus className="w-4 h-4" />
 Add User
 </button>
 </div>
 </div>

 {/* Filters */}
 <div className="flex flex-col sm:flex-row gap-4 mb-6">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
 <input
 type="text"
 placeholder="Search users..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-2 rounded-lg placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 border border-white/[0.08] bg-black text-white"
 />
 </div>
 <select
 value={filterPlan}
 onChange={(e) => setFilterPlan(e.target.value)}
 className="px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/20 border border-white/[0.08] bg-black text-white"
 >
 <option value="all">All Plans</option>
 <option value="Free">Free</option>
 <option value="Pro">Pro</option>
 <option value="Enterprise">Enterprise</option>
 </select>
 <select
 value={filterStatus}
 onChange={(e) => setFilterStatus(e.target.value)}
 className="px-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/20 border border-white/[0.08] bg-black text-white"
 >
 <option value="all">All Status</option>
 <option value="Active">Active</option>
 <option value="Pending">Pending</option>
 <option value="Inactive">Inactive</option>
 </select>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
 <div className="rounded-lg p-4 border border-white/[0.06] bg-white/[0.02]">
 <p className="font-medium text-white">{total}</p>
 <p className="text-sm text-zinc-500">Total Users</p>
 </div>
 <div className="rounded-lg p-4 border border-white/[0.06] bg-white/[0.02]">
 <p className="text-2xl font-medium text-zinc-400">{stats.active}</p>
 <p className="text-sm text-zinc-500">Active</p>
 </div>
 <div className="rounded-lg p-4 border border-white/[0.06] bg-white/[0.02]">
 <p className="text-2xl font-medium text-zinc-400">{stats.pending}</p>
 <p className="text-sm text-zinc-500">Pending</p>
 </div>
 <div className="rounded-lg p-4 border border-white/[0.06] bg-white/[0.02]">
 <p className="text-2xl font-medium text-zinc-500">{stats.inactive}</p>
 <p className="text-sm text-zinc-500">Inactive</p>
 </div>
 </div>

 {/* Users Table */}
 <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-white/[0.06] bg-white/[0.02]">
 <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">User</th>
 <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Plan</th>
 <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
 <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Joined</th>
 <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Last Active</th>
 <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Actions</th>
 </tr>
 </thead>
 <tbody>
 {users.length === 0 ? (
 <tr>
 <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
 No users found
 </td>
 </tr>
 ) : (
 users.map((user) => (
 <tr key={user.id} className="border-b last:border-0 border-white/[0.04] hover:bg-white/[0.02]">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
 <span className="text-white text-sm font-medium">{user.name.charAt(0).toUpperCase()}</span>
 </div>
 <div>
 <p className="font-medium text-white">{user.name}</p>
 <p className="text-xs text-zinc-500">{user.email}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className={`px-2 py-1 font-medium rounded-full ${ user.plan === 'Enterprise' ? 'bg-white/[0.05] text-zinc-400' : user.plan === 'Pro' ? 'bg-white/[0.05] text-zinc-400' : 'bg-white/[0.04] text-zinc-500' }`}>
 {user.plan}
 </span>
 </td>
 <td className="px-6 py-4">
 <span className={`px-2 py-1 font-medium rounded-full ${ user.status === 'Active' ? 'bg-white/[0.05] text-zinc-400' : user.status === 'Pending' ? 'bg-white/[0.05] text-zinc-400' : 'bg-white/[0.04] text-zinc-500' }`}>
 {user.status}
 </span>
 </td>
 <td className="px-6 py-4">
 <span className="text-sm text-zinc-500">{user.joined}</span>
 </td>
 <td className="px-6 py-4">
 <span className="text-sm text-zinc-500">{user.lastActive}</span>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center justify-end gap-2">
 <button className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors" title="Send Email">
 <Mail className="w-4 h-4" />
 </button>
 <button className="p-1.5 text-zinc-500 hover:text-zinc-400 transition-colors" title="Suspend">
 <Ban className="w-4 h-4" />
 </button>
 <button className="p-1.5 text-zinc-500 hover:text-zinc-400 transition-colors" title="Delete">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
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
 Showing <span className="font-medium text-white">{users.length}</span> of <span className="font-medium text-white">{total}</span> users
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
 disabled={users.length < 10}
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
