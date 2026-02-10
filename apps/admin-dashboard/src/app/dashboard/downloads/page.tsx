'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Download, Monitor, Apple, Terminal, RefreshCw } from 'lucide-react';

interface DownloadItem {
  id: string;
  user: string;
  email: string;
  version: string;
  platform: string;
  date: string;
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
  const [versions, setVersions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterVersion, setFilterVersion] = useState('all');
  const [page, setPage] = useState(1);

  const fetchDownloads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (searchQuery) params.append('search', searchQuery);
      if (filterPlatform !== 'all') params.append('platform', filterPlatform);
      if (filterVersion !== 'all') params.append('version', filterVersion);

      const res = await fetch(`/api/downloads?${params.toString()}`);
      const data: DownloadsResponse = await res.json();
      setDownloads(data.downloads || []);
      setTotal(data.total || 0);
      setPlatforms(data.platforms || { windows: 0, macos: 0, linux: 0 });

      // Get unique versions
      const uniqueVersions = [...new Set((data.downloads || []).map((d: DownloadItem) => d.version))];
      setVersions(uniqueVersions);
    } catch (err) {
      console.error('Failed to fetch downloads:', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filterPlatform, filterVersion]);

  useEffect(() => {
    fetchDownloads();
  }, [fetchDownloads]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterPlatform, filterVersion]);

  if (loading && downloads.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading downloads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium text-black dark:text-white">Downloads</h1>
          <p className="text-gray-500 mt-1">Track all software downloads</p>
        </div>
        <button
          onClick={fetchDownloads}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-black dark:hover:text-white border border-gray-200 dark:border-gray-800 rounded-lg"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
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
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Platforms</option>
          <option value="Windows">Windows</option>
          <option value="macOS">macOS</option>
          <option value="Linux">Linux</option>
        </select>
        <select
          value={filterVersion}
          onChange={(e) => setFilterVersion(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Versions</option>
          {versions.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-2xl font-medium text-black dark:text-white">{total}</p>
          <p className="text-sm text-gray-500">Total Downloads</p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-500" />
            <p className="text-2xl font-medium text-blue-500">{platforms.windows}</p>
          </div>
          <p className="text-sm text-gray-500">Windows</p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-gray-500" />
            <p className="text-2xl font-medium text-gray-700 dark:text-gray-300">{platforms.macos}</p>
          </div>
          <p className="text-sm text-gray-500">macOS</p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-orange-500" />
            <p className="text-2xl font-medium text-orange-500">{platforms.linux}</p>
          </div>
          <p className="text-sm text-gray-500">Linux</p>
        </div>
      </div>

      {/* Downloads Table */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Version</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Platform</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {downloads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No downloads found
                  </td>
                </tr>
              ) : (
                downloads.map((download) => (
                  <tr key={download.id} className="border-b border-gray-100 dark:border-gray-900 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">{download.user.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black dark:text-white">{download.user}</p>
                          <p className="text-xs text-gray-500">{download.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {download.version}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${
                        download.platform.toLowerCase() === 'windows' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        download.platform.toLowerCase() === 'macos' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        {platformIcon(download.platform)}
                        {download.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{download.date}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-black dark:text-white">{downloads.length}</span> of <span className="font-medium text-black dark:text-white">{total}</span> downloads
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white border border-gray-200 dark:border-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={downloads.length < 10}
              className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white border border-gray-200 dark:border-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
