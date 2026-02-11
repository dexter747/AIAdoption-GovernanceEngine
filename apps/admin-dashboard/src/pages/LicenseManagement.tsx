import React, { useState, useEffect } from 'react';

interface License {
  id: string;
  license_key: string;
  user_id: string;
  plan_type: string;
  status: string;
  issued_at: string;
  expires_at: string;
  last_validated_at?: string;
  user?: {
    email: string;
    full_name?: string;
  };
}

interface LicenseActivation {
  device_id: string;
  device_name?: string;
  platform?: string;
  app_version?: string;
  activated_at: string;
  last_checked_at: string;
}

export default function LicenseManagement() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [activations, setActivations] = useState<LicenseActivation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5500/api/admin/licenses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ADMIN_SECRET_TOKEN')}`,
        },
      });
      const data = await response.json();
      setLicenses(data.licenses || []);
    } catch (error) {
      console.error('Error fetching licenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLicenseActivations = async (licenseKey: string) => {
    try {
      const response = await fetch(`http://localhost:5500/api/licenses/${licenseKey}/devices`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ADMIN_SECRET_TOKEN')}`,
        },
      });
      const data = await response.json();
      setActivations(data.devices || []);
    } catch (error) {
      console.error('Error fetching activations:', error);
    }
  };

  const createLicense = async () => {
    const userId = prompt('Enter User ID:');
    const planType = prompt('Enter Plan Type (starter/professional/enterprise):');
    
    if (!userId || !planType) return;

    try {
      const response = await fetch('http://localhost:5500/api/admin/licenses/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ADMIN_SECRET_TOKEN')}`,
        },
        body: JSON.stringify({ userId, planType }),
      });

      if (response.ok) {
        alert('License created successfully');
        fetchLicenses();
      } else {
        alert('Failed to create license');
      }
    } catch (error) {
      console.error('Error creating license:', error);
      alert('Error creating license');
    }
  };

  const revokeLicense = async (licenseId: string) => {
    if (!confirm('Are you sure you want to revoke this license?')) return;

    try {
      const response = await fetch(`http://localhost:5500/api/admin/licenses/${licenseId}/revoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ADMIN_SECRET_TOKEN')}`,
        },
      });

      if (response.ok) {
        alert('License revoked successfully');
        fetchLicenses();
      }
    } catch (error) {
      console.error('Error revoking license:', error);
    }
  };

  const filteredLicenses = licenses
    .filter(license => {
      if (filter !== 'all' && license.status !== filter) return false;
      if (searchQuery && !license.license_key.includes(searchQuery) && 
          !license.user?.email?.includes(searchQuery)) return false;
      return true;
    });

  const stats = {
    total: licenses.length,
    active: licenses.filter(l => l.status === 'active').length,
    expired: licenses.filter(l => l.status === 'expired').length,
    cancelled: licenses.filter(l => l.status === 'cancelled').length,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">License Management</h1>
        <button
          onClick={createLicense}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create License
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Total Licenses</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Expired</div>
          <div className="text-2xl font-bold text-orange-600">{stats.expired}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Cancelled</div>
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by license key or email..."
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
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Licenses Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLicenses.map((license) => (
                <tr key={license.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono">
                    {license.license_key.substring(0, 20)}...
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {license.user?.email || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      license.plan_type === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                      license.plan_type === 'professional' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {license.plan_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      license.status === 'active' ? 'bg-green-100 text-green-800' :
                      license.status === 'expired' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {license.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(license.issued_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(license.expires_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => {
                        setSelectedLicense(license);
                        fetchLicenseActivations(license.license_key);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => revokeLicense(license.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={license.status !== 'active'}
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* License Details Modal */}
      {selectedLicense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">License Details</h2>
              <button
                onClick={() => setSelectedLicense(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">License Key</label>
                <code className="block p-2 bg-gray-100 rounded text-xs break-all">
                  {selectedLicense.license_key}
                </code>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plan Type</label>
                  <p className="text-sm">{selectedLicense.plan_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="text-sm">{selectedLicense.status}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Device Activations</h3>
                {activations.length === 0 ? (
                  <p className="text-sm text-gray-500">No devices activated</p>
                ) : (
                  <div className="space-y-2">
                    {activations.map((activation, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded">
                        <div className="flex justify-between">
                          <span className="font-medium">{activation.device_name || 'Unknown Device'}</span>
                          <span className="text-sm text-gray-500">{activation.platform}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Device ID: {activation.device_id}
                        </div>
                        <div className="text-xs text-gray-500">
                          Last checked: {new Date(activation.last_checked_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
