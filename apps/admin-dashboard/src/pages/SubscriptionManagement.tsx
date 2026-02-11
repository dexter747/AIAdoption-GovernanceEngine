import React, { useState, useEffect } from 'react';

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  billing_cycle: string;
  status: string;
  amount: number;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  user?: {
    email: string;
    full_name?: string;
  };
}

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5500/api/admin/subscriptions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ADMIN_SECRET_TOKEN')}`,
        },
      });
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (userId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    try {
      const response = await fetch(`http://localhost:5500/api/subscriptions/${userId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ADMIN_SECRET_TOKEN')}`,
        },
        body: JSON.stringify({ reason: 'Admin cancellation', immediate: false }),
      });

      if (response.ok) {
        alert('Subscription cancelled successfully');
        fetchSubscriptions();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filter !== 'all' && sub.status !== filter) return false;
    if (searchQuery && !sub.user?.email?.includes(searchQuery)) return false;
    return true;
  });

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
    pastDue: subscriptions.filter(s => s.status === 'past_due').length,
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <button
          onClick={fetchSubscriptions}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Total Subscriptions</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Cancelled</div>
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Past Due</div>
          <div className="text-2xl font-bold text-orange-600">{stats.pastDue}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border rounded"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="past_due">Past Due</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Billing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period End</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    {subscription.user?.email || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      subscription.plan_type === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                      subscription.plan_type === 'professional' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {subscription.plan_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm capitalize">
                    {subscription.billing_cycle}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    {formatCurrency(subscription.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                      subscription.status === 'past_due' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {subscription.status}
                    </span>
                    {subscription.cancel_at_period_end && (
                      <span className="ml-2 text-xs text-orange-600">(Cancelling)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => cancelSubscription(subscription.user_id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={subscription.status !== 'active'}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
