'use client';

import { useState } from 'react';
import { Search, Download, Monitor, Apple, Terminal } from 'lucide-react';

// Mock downloads data - would come from API
const downloadsData = [
  { id: 1, user: 'John Smith', email: 'john@example.com', version: 'v2.4.1', platform: 'Windows', date: 'Jan 18, 2024 14:32' },
  { id: 2, user: 'Sarah Johnson', email: 'sarah@example.com', version: 'v2.4.1', platform: 'macOS', date: 'Jan 18, 2024 11:15' },
  { id: 3, user: 'Mike Wilson', email: 'mike@example.com', version: 'v2.4.0', platform: 'Linux', date: 'Jan 17, 2024 09:45' },
  { id: 4, user: 'Emily Davis', email: 'emily@example.com', version: 'v2.4.1', platform: 'Windows', date: 'Jan 17, 2024 08:20' },
  { id: 5, user: 'David Brown', email: 'david@example.com', version: 'v2.3.5', platform: 'macOS', date: 'Jan 16, 2024 16:30' },
  { id: 6, user: 'Lisa Anderson', email: 'lisa@example.com', version: 'v2.4.1', platform: 'Windows', date: 'Jan 16, 2024 14:00' },
  { id: 7, user: 'James Taylor', email: 'james@example.com', version: 'v2.4.1', platform: 'Linux', date: 'Jan 15, 2024 11:45' },
  { id: 8, user: 'Jennifer Martinez', email: 'jennifer@example.com', version: 'v2.4.0', platform: 'Windows', date: 'Jan 15, 2024 09:30' },
  { id: 9, user: 'Robert Garcia', email: 'robert@example.com', version: 'v2.4.1', platform: 'macOS', date: 'Jan 14, 2024 15:20' },
  { id: 10, user: 'Maria Rodriguez', email: 'maria@example.com', version: 'v2.4.1', platform: 'Windows', date: 'Jan 14, 2024 10:10' },
];

const platformIcon = (platform: string) => {
  switch (platform) {
    case 'Windows':
      return <Monitor className="w-4 h-4" />;
    case 'macOS':
      return <Apple className="w-4 h-4" />;
    case 'Linux':
      return <Terminal className="w-4 h-4" />;
    default:
      return <Download className="w-4 h-4" />;
  }
};

export default function DownloadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterVersion, setFilterVersion] = useState('all');

  const filteredDownloads = downloadsData.filter(download => {
    const matchesSearch = download.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          download.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || download.platform === filterPlatform;
    const matchesVersion = filterVersion === 'all' || download.version === filterVersion;
    return matchesSearch && matchesPlatform && matchesVersion;
  });

  const versions = [...new Set(downloadsData.map(d => d.version))];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Downloads</h1>
          <p className="text-gray-500 mt-1">Track all software downloads</p>
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
          <p className="text-2xl font-bold text-black dark:text-white">{downloadsData.length}</p>
          <p className="text-sm text-gray-500">Total Downloads</p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-500" />
            <p className="text-2xl font-bold text-blue-500">{downloadsData.filter(d => d.platform === 'Windows').length}</p>
          </div>
          <p className="text-sm text-gray-500">Windows</p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-gray-500" />
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{downloadsData.filter(d => d.platform === 'macOS').length}</p>
          </div>
          <p className="text-sm text-gray-500">macOS</p>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-orange-500" />
            <p className="text-2xl font-bold text-orange-500">{downloadsData.filter(d => d.platform === 'Linux').length}</p>
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
              {filteredDownloads.map((download) => (
                <tr key={download.id} className="border-b border-gray-100 dark:border-gray-900 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{download.user.charAt(0)}</span>
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
                      download.platform === 'Windows' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      download.platform === 'macOS' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
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
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-black dark:text-white">{filteredDownloads.length}</span> of <span className="font-medium text-black dark:text-white">{downloadsData.length}</span> downloads
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
