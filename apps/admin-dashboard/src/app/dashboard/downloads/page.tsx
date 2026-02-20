'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Download, Monitor, Apple, Terminal, RefreshCw } from 'lucide-react';

interface DownloadItem {
 id: string;
 user: string;
 email: string;
 version: string; // license tier
 platform: string;
 deviceName: string;
 date: string;
 isActive: boolean;
}

interface DownloadsResponse {
 downloads: DownloadItem[];
 total: number;
 platforms: {
 windows: number;
 macos: number;
 linux: number;
 };
}

const platformIcon = (platform: string) => {
 switch (platform.toLowerCase()) {
 case 'windows':
 return <Monitor className="w-4 h-4" />;
 case 'macos':
 return <Apple className="w-4 h-4" />;
 case 'linux':
 return <Terminal className="w-4 h-4" />;
 default:
 return <Download className="w-4 h-4" />;
 }
};

export default function DownloadsPage() {
 const [downloads, setDownloads] = useState<DownloadItem[]>([]);
 const [total, setTotal] = useState(0);
 const [platforms, setPlatforms] = useState({ windows: 0, macos: 0, linux: 0 });
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const [filterPlatform, setFilterPlatform] = useState('all');
 const [page, setPage] = useState(1);

 const fetchDownloads = useCallback(async () => {
 setLoading(true);
 try {
 const params = new URLSearchParams();
 params.append('page', page.toString());
 params.append('limit', '10');
 if (searchQuery) params.append('search', searchQuery);
 if (filterPlatform !== 'all') params.append('platform', filterPlatform);

 const res = await fetch(`/api/downloads?${params.toString()}`);
 const data: DownloadsResponse = await res.json();
 setDownloads(data.downloads || []);
 setTotal(data.total || 0);
 setPlatforms(data.platforms || { windows: 0, macos: 0, linux: 0 });
 } catch (err) {
 console.error('Failed to fetch activations:', err);
 } finally {
 setLoading(false);
 }
 }, [page, searchQuery, filterPlatform]);

 useEffect(() => {
 fetchDownloads();
 }, [fetchDownloads]);

 useEffect(() => {
 setPage(1);
 }, [searchQuery, filterPlatform]);

 if (loading && downloads.length === 0) {
 return (
 <div className="p-8 flex items-center justify-center min-h-screen">
 <div className="text-center">
 <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
 <p className="text-muted-foreground">Loading activations...</p>
 </div>
 </div>
 );
 }

 return (
 <div className="p-8">
 {/* Header */}
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="font-medium text-white">Activations</h1>
 <p className="text-muted-foreground mt-1">Track all license activations by device</p>
 </div>
 <button
 onClick={fetchDownloads}
 className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground rounded-lg hover:text-white border-gray-800"
 >
 <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
 Refresh
 </button>
 </div>

 {/* Filters */}
 <div className="flex flex-col sm:flex-row gap-4 mb-6">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <input
 type="text"
 placeholder="Search by user..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black border-gray-800 text-white"
 />
 </div>
 <select
 value={filterPlatform}
 onChange={(e) => setFilterPlatform(e.target.value)}
 className="px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black border-gray-800 text-white"
 >
 <option value="all">All Platforms</option>
 <option value="windows">Windows</option>
 <option value="macos">macOS</option>
 <option value="linux">Linux</option>
 </select>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
 <div className="rounded-lg p-4 bg-black border-gray-800">
 <p className="font-medium text-white">{total}</p>
 <p className="text-sm text-muted-foreground">Total Activations</p>
 </div>
 <div className="rounded-lg p-4 bg-black border-gray-800">
 <div className="flex items-center gap-2">
 <Monitor className="w-5 h-5 text-blue-500" />
 <p className="text-2xl font-medium text-blue-500">{platforms.windows}</p>
 </div>
 <p className="text-sm text-muted-foreground">Windows</p>
 </div>
 <div className="rounded-lg p-4 bg-black border-gray-800">
 <div className="flex items-center gap-2">
 <Apple className="w-5 h-5 text-muted-foreground" />
 <p className="font-medium text-gray-300">{platforms.macos}</p>
 </div>
 <p className="text-sm text-muted-foreground">macOS</p>
 </div>
 <div className="rounded-lg p-4 bg-black border-gray-800">
 <div className="flex items-center gap-2">
 <Terminal className="w-5 h-5 text-orange-500" />
 <p className="text-2xl font-medium text-orange-500">{platforms.linux}</p>
 </div>
 <p className="text-sm text-muted-foreground">Linux</p>
 </div>
 </div>

 {/* Downloads Table */}
 <div className="rounded-xl overflow-hidden bg-black border-gray-800">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-gray-800 bg-gray-900/50">
 <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">User</th>
 <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Device</th>
 <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Tier</th>
 <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Platform</th>
 <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
 </tr>
 </thead>
 <tbody>
 {downloads.length === 0 ? (
 <tr>
 <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
 No downloads found
 </td>
 </tr>
 ) : (
 downloads.map((download) => (
 <tr key={download.id} className="border-b last:border-0 border-gray-900 hover:bg-gray-900/50">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
 <span className="text-white text-sm font-medium">{download.user.charAt(0).toUpperCase()}</span>
 </div>
 <div>
 <p className="font-medium text-white">{download.user}</p>
 <p className="text-xs text-muted-foreground">{download.email}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <p className="text-white">{download.deviceName || '—'}</p>
 </td>
 <td className="px-6 py-4">
 <span className="px-2 py-1 font-medium rounded-full capitalize bg-blue-900/30 text-blue-400">
 {download.version}
 </span>
 </td>
 <td className="px-6 py-4">
 <span className={`inline-flex items-center gap-1.5 px-2 py-1 font-medium rounded-full ${ download.platform.toLowerCase() === 'windows' ? 'bg-blue-900/30 text-blue-400' : download.platform.toLowerCase() === 'macos' ? 'bg-secondary text-muted-foreground' : 'bg-orange-900/30 text-orange-400' }`}>
 {platformIcon(download.platform)}
 {download.platform}
 </span>
 </td>
 <td className="px-6 py-4">
 <span className="text-sm text-muted-foreground">{download.date}</span>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 
 {/* Pagination */}
 <div className="px-6 py-4 border-t flex items-center justify-between border-gray-800">
 <p className="text-sm text-muted-foreground">
 Showing <span className="font-medium text-white">{downloads.length}</span> of <span className="font-medium text-white">{total}</span> activations
 </p>
 <div className="flex gap-2">
 <button 
 onClick={() => setPage(p => Math.max(1, p - 1))}
 disabled={page === 1}
 className="px-3 py-1.5 text-sm font-medium text-muted-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:text-white border-gray-800"
 >
 Previous
 </button>
 <button 
 onClick={() => setPage(p => p + 1)}
 disabled={downloads.length < 10}
 className="px-3 py-1.5 text-sm font-medium text-muted-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:text-white border-gray-800"
 >
 Next
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
