'use client';

import { useState } from 'react';
import { Search, Filter, MoreHorizontal, UserPlus, Mail, Ban, Trash2 } from 'lucide-react';

// Mock users data - would come from API
const usersData = [
  { id: 1, name: 'John Smith', email: 'john@example.com', plan: 'Pro', status: 'Active', joined: 'Jan 15, 2024', lastActive: '2 hours ago' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', plan: 'Enterprise', status: 'Active', joined: 'Jan 12, 2024', lastActive: '5 hours ago' },
  { id: 3, name: 'Mike Wilson', email: 'mike@example.com', plan: 'Free', status: 'Pending', joined: 'Jan 10, 2024', lastActive: '1 day ago' },
  { id: 4, name: 'Emily Davis', email: 'emily@example.com', plan: 'Pro', status: 'Active', joined: 'Jan 8, 2024', lastActive: '2 days ago' },
  { id: 5, name: 'David Brown', email: 'david@example.com', plan: 'Free', status: 'Inactive', joined: 'Jan 5, 2024', lastActive: '5 days ago' },
  { id: 6, name: 'Lisa Anderson', email: 'lisa@example.com', plan: 'Enterprise', status: 'Active', joined: 'Jan 3, 2024', lastActive: '1 hour ago' },
  { id: 7, name: 'James Taylor', email: 'james@example.com', plan: 'Pro', status: 'Active', joined: 'Dec 28, 2023', lastActive: '3 hours ago' },
  { id: 8, name: 'Jennifer Martinez', email: 'jennifer@example.com', plan: 'Free', status: 'Pending', joined: 'Dec 25, 2023', lastActive: '2 days ago' },
  { id: 9, name: 'Robert Garcia', email: 'robert@example.com', plan: 'Pro', status: 'Active', joined: 'Dec 20, 2023', lastActive: '6 hours ago' },
  { id: 10, name: 'Maria Rodriguez', email: 'maria@example.com', plan: 'Enterprise', status: 'Active', joined: 'Dec 15, 2023', lastActive: '1 day ago' },
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredUsers = usersData.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Users</h1>
          <p className="text-gray-500 mt-1">Manage all registered users</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Plans</option>
          <option value="Free">Free</option>
          <option value="Pro">Pro</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-2xl font-bold text-black dark:text-white">{usersData.length}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-500">{usersData.filter(u => u.status === 'Active').length}</p>
          <p className="text-sm text-gray-500">Active</p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-2xl font-bold text-yellow-500">{usersData.filter(u => u.status === 'Pending').length}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-2xl font-bold text-gray-500">{usersData.filter(u => u.status === 'Inactive').length}</p>
          <p className="text-sm text-gray-500">Inactive</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Last Active</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 dark:border-gray-900 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{user.name.charAt(0)}</span>
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
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{user.joined}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{user.lastActive}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors" title="Send Email">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-yellow-500 transition-colors" title="Suspend">
                        <Ban className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-black dark:text-white">{filteredUsers.length}</span> of <span className="font-medium text-black dark:text-white">{usersData.length}</span> users
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
