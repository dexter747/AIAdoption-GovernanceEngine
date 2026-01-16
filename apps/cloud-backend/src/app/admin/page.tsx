'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Key,
  CreditCard,
  Activity,
  Settings,
  Database,
  LogOut,
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-2xl font-medium">
              AI Nexus Admin
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">admin@ainexus.com</span>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r">
          <nav className="p-4 space-y-2">
            <NavItem
              icon={<Users />}
              label="Users"
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
            />
            <NavItem
              icon={<Key />}
              label="Licenses"
              active={activeTab === 'licenses'}
              onClick={() => setActiveTab('licenses')}
            />
            <NavItem
              icon={<CreditCard />}
              label="Subscriptions"
              active={activeTab === 'subscriptions'}
              onClick={() => setActiveTab('subscriptions')}
            />
            <NavItem
              icon={<Activity />}
              label="Usage Analytics"
              active={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
            />
            <NavItem
              icon={<Database />}
              label="Database"
              active={activeTab === 'database'}
              onClick={() => setActiveTab('database')}
            />
            <NavItem
              icon={<Settings />}
              label="Settings"
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          {activeTab === 'users' && <UsersPanel />}
          {activeTab === 'licenses' && <LicensesPanel />}
          {activeTab === 'subscriptions' && <SubscriptionsPanel />}
          {activeTab === 'analytics' && <AnalyticsPanel />}
          {activeTab === 'database' && <DatabasePanel />}
          {activeTab === 'settings' && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function UsersPanel() {
  const users = [
    {
      id: '1',
      email: 'user@example.com',
      name: 'John Doe',
      plan: 'Professional',
      status: 'active',
      joinedAt: '2026-01-10',
    },
    {
      id: '2',
      email: 'jane@company.com',
      name: 'Jane Smith',
      plan: 'Team',
      status: 'active',
      joinedAt: '2026-01-12',
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-medium">Users</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left p-4 font-medium">Email</th>
              <th className="text-left p-4 font-medium">Name</th>
              <th className="text-left p-4 font-medium">Plan</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Joined</th>
              <th className="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b last:border-0">
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.name}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                    {user.plan}
                  </span>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{user.joinedAt}</td>
                <td className="p-4">
                  <button className="text-blue-600 hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LicensesPanel() {
  return (
    <div>
      <h1 className="text-3xl font-medium mb-6">Licenses</h1>
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Licenses" value="156" />
        <StatCard title="Active" value="142" color="green" />
        <StatCard title="Expired" value="8" color="red" />
        <StatCard title="Trial" value="6" color="yellow" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
        License management table coming soon...
      </div>
    </div>
  );
}

function SubscriptionsPanel() {
  return (
    <div>
      <h1 className="text-3xl font-medium mb-6">Subscriptions</h1>
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard title="MRR" value="$7,350" />
        <StatCard title="Active Subs" value="142" color="green" />
        <StatCard title="Churned" value="3" color="red" />
        <StatCard title="Trial→Paid" value="78%" color="green" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
        Subscription details table coming soon...
      </div>
    </div>
  );
}

function AnalyticsPanel() {
  return (
    <div>
      <h1 className="text-3xl font-medium mb-6">Usage Analytics</h1>
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard title="AI Queries" value="45.2K" />
        <StatCard title="Avg Cost/Query" value="$0.012" />
        <StatCard title="Most Used AI" value="GPT-4o" />
        <StatCard title="Active Users" value="142" color="green" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
        Charts and analytics coming soon...
      </div>
    </div>
  );
}

function DatabasePanel() {
  return (
    <div>
      <h1 className="text-3xl font-medium mb-6">Database Management</h1>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-medium mb-4">PostgreSQL</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Connection Status:</span>
              <span className="text-green-600 font-medium">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Users:</span>
              <span>156</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Licenses:</span>
              <span>156</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-medium mb-4">MongoDB</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Connection Status:</span>
              <span className="text-green-600 font-medium">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Logs:</span>
              <span>1.2M documents</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Storage Used:</span>
              <span>4.5 GB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div>
      <h1 className="text-3xl font-medium mb-6">Settings</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        <div>
          <h3 className="font-medium mb-2">Payment Providers</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked readOnly className="rounded" />
              <span>Dodo Payments</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked readOnly className="rounded" />
              <span>PayPal</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked readOnly className="rounded" />
              <span>Razorpay (India)</span>
            </label>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Email Settings</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>SMTP Host: smtp.gmail.com</p>
            <p>From Address: noreply@ainexus.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color = 'blue',
}: {
  title: string;
  value: string;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-gray-600 text-sm mb-2">{title}</h3>
      <p className={`text-3xl font-medium ${colorClasses[color]}`}>{value}</p>
    </div>
  );
}
