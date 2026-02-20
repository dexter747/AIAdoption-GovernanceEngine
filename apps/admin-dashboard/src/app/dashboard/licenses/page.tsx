'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
 Search, Plus, RefreshCw, Key, Shield, Crown, Sparkles,
 CheckCircle, XCircle, AlertTriangle, Calendar, Monitor,
 MoreVertical, Eye, Edit2, Trash2, Copy, Check
} from 'lucide-react';

interface User {
 id: string;
 email: string;
 name: string;
}

interface License {
 id: string;
 licenseKey: string;
 tier: string;
 isActive: boolean;
 isExpired: boolean;
 expiresAt: string | null;
 daysRemaining: number | null;
 maxMachines: number;
 activatedMachines: number;
 user: User | null;
 createdAt: string;
}

interface Stats {
 total: number;
 active: number;
 expired: number;
 byTier: {
 free: number;
 starter: number;
 pro: number;
 enterprise: number;
 };
}

export default function LicensesPage() {
 const [licenses, setLicenses] = useState<License[]>([]);
 const [stats, setStats] = useState<Stats | null>(null);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const [filterStatus, setFilterStatus] = useState('all');
 const [filterTier, setFilterTier] = useState('all');
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [showCreateModal, setShowCreateModal] = useState(false);
 const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
 const [copiedId, setCopiedId] = useState<string | null>(null);

 const fetchLicenses = useCallback(async () => {
 setLoading(true);
 try {
 const params = new URLSearchParams();
 params.append('page', page.toString());
 params.append('limit', '10');
 if (searchQuery) params.append('search', searchQuery);
 if (filterStatus !== 'all') params.append('status', filterStatus);
 if (filterTier !== 'all') params.append('tier', filterTier);

 const res = await fetch(`/api/licenses?${params.toString()}`);
 const data = await res.json();
 
 setLicenses(data.licenses || []);
 setTotalPages(data.totalPages || 1);
 setStats(data.stats || null);
 } catch (err) {
 console.error('Failed to fetch licenses:', err);
 } finally {
 setLoading(false);
 }
 }, [page, searchQuery, filterStatus, filterTier]);

 useEffect(() => {
 fetchLicenses();
 }, [fetchLicenses]);

 useEffect(() => {
 setPage(1);
 }, [searchQuery, filterStatus, filterTier]);

 const handleCopyKey = (licenseKey: string, id: string) => {
 navigator.clipboard.writeText(licenseKey);
 setCopiedId(id);
 setTimeout(() => setCopiedId(null), 2000);
 };

 const handleToggleActive = async (license: License) => {
 try {
 const res = await fetch(`/api/licenses/${license.id}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ isActive: !license.isActive }),
 });
 
 if (res.ok) {
 fetchLicenses();
 }
 } catch (err) {
 console.error('Failed to update license:', err);
 }
 };

 const handleDelete = async (license: License) => {
 if (!confirm(`Are you sure you want to revoke this license for ${license.user?.email}?`)) {
 return;
 }

 try {
 const res = await fetch(`/api/licenses/${license.id}`, {
 method: 'DELETE',
 });
 
 if (res.ok) {
 fetchLicenses();
 }
 } catch (err) {
 console.error('Failed to delete license:', err);
 }
 };

 const getTierBadge = (tier: string) => {
 const badges: Record<string, { color: string; icon: React.ReactNode }> = {
 free: { color: 'bg-zinc-900 text-zinc-400', icon: null },
 starter: { color: 'bg-white/[0.05] text-zinc-400', icon: <Sparkles className="w-3 h-3" /> },
 pro: { color: 'bg-white/[0.05] text-zinc-400', icon: <Sparkles className="w-3 h-3" /> },
 enterprise: { color: 'bg-white/[0.05] text-zinc-400', icon: <Crown className="w-3 h-3" /> },
 };
 return badges[tier] || badges.free;
 };

 const getStatusBadge = (license: License) => {
 if (license.isExpired) {
 return { color: 'bg-white/[0.05] text-zinc-400', icon: <XCircle className="w-3 h-3" />, label: 'Expired' };
 }
 if (!license.isActive) {
 return { color: 'bg-zinc-900 text-zinc-400', icon: <XCircle className="w-3 h-3" />, label: 'Revoked' };
 }
 if (license.daysRemaining !== null && license.daysRemaining < 7) {
 return { color: 'bg-white/[0.05] text-zinc-400', icon: <AlertTriangle className="w-3 h-3" />, label: 'Expiring Soon' };
 }
 return { color: 'bg-white/[0.05] text-zinc-400', icon: <CheckCircle className="w-3 h-3" />, label: 'Active' };
 };

 return (
 <div className="p-8">
 {/* Header */}
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="font-medium flex items-center gap-2 text-white">
 <Key className="w-6 h-6 text-zinc-300" />
 Licenses
 </h1>
 <p className="text-zinc-500 mt-1">Manage software licenses</p>
 </div>
 <div className="flex gap-3">
 <button
 onClick={fetchLicenses}
 className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-500 rounded-lg hover:text-white border-white/[0.06]"
 >
 <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
 Refresh
 </button>
 <button
 onClick={() => setShowCreateModal(true)}
 className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
 >
 <Plus className="w-4 h-4" />
 Create License
 </button>
 </div>
 </div>

 {/* Stats Cards */}
 {stats && (
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
 <div className="rounded-xl p-4 bg-zinc-950 border-white/[0.06]">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-lg bg-white/[0.05]">
 <Key className="w-5 h-5 text-zinc-300" />
 </div>
 <div>
 <p className="font-medium text-white">{stats.total}</p>
 <p className="text-sm text-zinc-500">Total Licenses</p>
 </div>
 </div>
 </div>
 <div className="rounded-xl p-4 bg-zinc-950 border-white/[0.06]">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-lg bg-white/[0.05]">
 <CheckCircle className="w-5 h-5 text-zinc-400" />
 </div>
 <div>
 <p className="font-medium text-white">{stats.active}</p>
 <p className="text-sm text-zinc-500">Active</p>
 </div>
 </div>
 </div>
 <div className="rounded-xl p-4 bg-zinc-950 border-white/[0.06]">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-lg bg-white/[0.05]">
 <XCircle className="w-5 h-5 text-zinc-400" />
 </div>
 <div>
 <p className="font-medium text-white">{stats.expired}</p>
 <p className="text-sm text-zinc-500">Expired</p>
 </div>
 </div>
 </div>
 <div className="rounded-xl p-4 bg-zinc-950 border-white/[0.06]">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-lg bg-white/[0.05]">
 <Crown className="w-5 h-5 text-zinc-300" />
 </div>
 <div>
 <p className="font-medium text-white">{stats.byTier.pro + stats.byTier.enterprise}</p>
 <p className="text-sm text-zinc-500">Pro & Enterprise</p>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Filters */}
 <div className="flex flex-wrap gap-4 mb-6">
 <div className="flex-1 min-w-[200px]">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
 <input
 type="text"
 placeholder="Search by email or license key..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-1 focus:ring-white/20 focus:border-transparent border-white/[0.06] bg-zinc-950 text-white"
 />
 </div>
 </div>
 <select
 value={filterStatus}
 onChange={(e) => setFilterStatus(e.target.value)}
 className="px-4 py-2 rounded-lg border-white/[0.06] bg-zinc-950 text-white"
 >
 <option value="all">All Status</option>
 <option value="active">Active</option>
 <option value="inactive">Inactive/Expired</option>
 </select>
 <select
 value={filterTier}
 onChange={(e) => setFilterTier(e.target.value)}
 className="px-4 py-2 rounded-lg border-white/[0.06] bg-zinc-950 text-white"
 >
 <option value="all">All Tiers</option>
 <option value="free">Free</option>
 <option value="starter">Starter</option>
 <option value="pro">Pro</option>
 <option value="enterprise">Enterprise</option>
 </select>
 </div>

 {/* Table */}
 <div className="rounded-xl overflow-hidden bg-zinc-950 border-white/[0.06]">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-white/[0.06]">
 <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">User</th>
 <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">License Key</th>
 <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Tier</th>
 <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
 <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Devices</th>
 <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Expires</th>
 <th className="text-right px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-gray-800">
 {loading && licenses.length === 0 ? (
 <tr>
 <td colSpan={7} className="px-6 py-12 text-center">
 <RefreshCw className="w-6 h-6 text-zinc-300 animate-spin mx-auto mb-2" />
 <p className="text-zinc-500">Loading licenses...</p>
 </td>
 </tr>
 ) : licenses.length === 0 ? (
 <tr>
 <td colSpan={7} className="px-6 py-12 text-center">
 <Key className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
 <p className="text-zinc-500">No licenses found</p>
 </td>
 </tr>
 ) : (
 licenses.map((license) => {
 const tierBadge = getTierBadge(license.tier);
 const statusBadge = getStatusBadge(license);
 
 return (
 <tr key={license.id} className="hover:bg-zinc-900/50">
 <td className="px-6 py-4">
 <div>
 <p className="font-medium text-white">
 {license.user?.name || 'Unknown'}
 </p>
 <p className="text-sm text-zinc-500">
 {license.user?.email || '-'}
 </p>
 </div>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-2">
 <code className="font-mono px-2 py-1 rounded text-zinc-500 bg-zinc-900">
 {license.licenseKey}
 </code>
 <button
 onClick={() => handleCopyKey(license.licenseKey, license.id)}
 className="p-1 rounded hover:bg-zinc-800"
 >
 {copiedId === license.id ? (
 <Check className="w-4 h-4 text-zinc-400" />
 ) : (
 <Copy className="w-4 h-4 text-zinc-500" />
 )}
 </button>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${tierBadge.color}`}>
 {tierBadge.icon}
 {license.tier.charAt(0).toUpperCase() + license.tier.slice(1)}
 </span>
 </td>
 <td className="px-6 py-4">
 <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
 {statusBadge.icon}
 {statusBadge.label}
 </span>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-1 text-zinc-500">
 <Monitor className="w-4 h-4" />
 {license.activatedMachines}/{license.maxMachines === -1 ? '∞' : license.maxMachines}
 </div>
 </td>
 <td className="px-6 py-4">
 {license.expiresAt ? (
 <div className="text-sm">
 <p className={`${license.daysRemaining !== null && license.daysRemaining < 7 ? 'text-zinc-400' : 'text-zinc-500'}`}>
 {new Date(license.expiresAt).toLocaleDateString()}
 </p>
 {license.daysRemaining !== null && (
 <p className="text-xs text-zinc-500">
 {license.daysRemaining > 0 ? `${license.daysRemaining} days left` : 'Expired'}
 </p>
 )}
 </div>
 ) : (
 <span className="text-sm text-zinc-500">Never</span>
 )}
 </td>
 <td className="px-6 py-4 text-right">
 <div className="flex items-center justify-end gap-2">
 <button
 onClick={() => handleToggleActive(license)}
 className={`p-2 rounded-lg transition-colors ${license.isActive ? 'text-zinc-400' : 'text-zinc-500'} hover:bg-white/[0.05]`}
 title={license.isActive ? 'Revoke' : 'Activate'}
 >
 {license.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
 </button>
 <button
 onClick={() => handleDelete(license)}
 className="p-2 text-zinc-400 rounded-lg transition-colors hover:bg-white/[0.05]"
 title="Delete"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
 <p className="text-sm text-zinc-500">
 Page {page} of {totalPages}
 </p>
 <div className="flex gap-2">
 <button
 onClick={() => setPage(p => Math.max(1, p - 1))}
 disabled={page === 1}
 className="px-3 py-1 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border-white/[0.06] hover:bg-zinc-900"
 >
 Previous
 </button>
 <button
 onClick={() => setPage(p => Math.min(totalPages, p + 1))}
 disabled={page === totalPages}
 className="px-3 py-1 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border-white/[0.06] hover:bg-zinc-900"
 >
 Next
 </button>
 </div>
 </div>
 )}
 </div>

 {/* Create License Modal - Placeholder */}
 {showCreateModal && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
 <div className="rounded-xl p-6 max-w-md w-full mx-4 bg-zinc-950">
 <h2 className="font-medium mb-4 text-white">Create License</h2>
 <p className="text-zinc-500 mb-4">
 License creation requires user selection. Please use the Users page to create licenses for specific users.
 </p>
 <button
 onClick={() => setShowCreateModal(false)}
 className="w-full px-4 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800"
 >
 Close
 </button>
 </div>
 </div>
 )}
 </div>
 );
}
