'use client';

import { useState } from 'react';
import { Save, Bell, Shield, CreditCard, Globe, Palette, Mail, Key } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'AI Nexus',
    siteDescription: 'Enterprise AI Management Platform',
    supportEmail: 'support@ainexus.com',
    enableRegistration: true,
    requireEmailVerification: true,
    enableNotifications: true,
    emailOnNewUser: true,
    emailOnPayment: true,
    emailOnDownload: false,
    stripePublishableKey: 'pk_test_xxxxx',
    stripeSecretKey: 'sk_test_xxxxx',
    enableProPlan: true,
    enableEnterprisePlan: true,
    proMonthlyPrice: 29,
    enterpriseMonthlyPrice: 99,
  });

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'billing', name: 'Billing', icon: CreditCard },
  ];

  const handleSave = () => {
    // Would save to API in production
    alert('Settings saved successfully!');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your platform settings</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl">
        {activeTab === 'general' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-black dark:text-white">General Settings</h3>
            
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full max-w-md px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Site Description
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                  className="w-full max-w-md px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full max-w-md px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between max-w-md">
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">Enable User Registration</p>
                  <p className="text-xs text-gray-500">Allow new users to register</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, enableRegistration: !settings.enableRegistration })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.enableRegistration ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.enableRegistration ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between max-w-md">
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">Require Email Verification</p>
                  <p className="text-xs text-gray-500">Users must verify email before access</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, requireEmailVerification: !settings.requireEmailVerification })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.requireEmailVerification ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.requireEmailVerification ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-black dark:text-white">Notification Settings</h3>
            
            <div className="grid gap-6 max-w-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">Enable Notifications</p>
                  <p className="text-xs text-gray-500">Master toggle for all notifications</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, enableNotifications: !settings.enableNotifications })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.enableNotifications ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.enableNotifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">Email on New User</p>
                  <p className="text-xs text-gray-500">Receive email when a new user registers</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, emailOnNewUser: !settings.emailOnNewUser })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.emailOnNewUser ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.emailOnNewUser ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">Email on Payment</p>
                  <p className="text-xs text-gray-500">Receive email for payment transactions</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, emailOnPayment: !settings.emailOnPayment })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.emailOnPayment ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.emailOnPayment ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">Email on Download</p>
                  <p className="text-xs text-gray-500">Receive email when software is downloaded</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, emailOnDownload: !settings.emailOnDownload })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.emailOnDownload ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.emailOnDownload ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-black dark:text-white">Security Settings</h3>
            
            <div className="grid gap-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg max-w-md">
                <div className="flex items-center gap-3 mb-3">
                  <Key className="w-5 h-5 text-blue-500" />
                  <p className="text-sm font-medium text-black dark:text-white">API Keys</p>
                </div>
                <p className="text-xs text-gray-500 mb-3">Manage your API keys for third-party integrations</p>
                <button className="px-3 py-1.5 text-xs font-medium text-blue-500 border border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                  Generate New Key
                </button>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg max-w-md">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <p className="text-sm font-medium text-black dark:text-white">Two-Factor Authentication</p>
                </div>
                <p className="text-xs text-gray-500 mb-3">Add an extra layer of security to admin accounts</p>
                <button className="px-3 py-1.5 text-xs font-medium text-blue-500 border border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                  Enable 2FA
                </button>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg max-w-md">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <p className="text-sm font-medium text-black dark:text-white">Session Management</p>
                </div>
                <p className="text-xs text-gray-500 mb-3">View and revoke active sessions</p>
                <button className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                  Revoke All Sessions
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-black dark:text-white">Billing Settings</h3>
            
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Stripe Publishable Key
                </label>
                <input
                  type="password"
                  value={settings.stripePublishableKey}
                  onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                  className="w-full max-w-md px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Stripe Secret Key
                </label>
                <input
                  type="password"
                  value={settings.stripeSecretKey}
                  onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                  className="w-full max-w-md px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <hr className="border-gray-200 dark:border-gray-800" />

              <h4 className="text-md font-medium text-black dark:text-white">Pricing Plans</h4>

              <div className="flex items-center justify-between max-w-md">
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">Pro Plan</p>
                  <p className="text-xs text-gray-500">Enable Pro subscription tier</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, enableProPlan: !settings.enableProPlan })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.enableProPlan ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.enableProPlan ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Pro Monthly Price ($)
                </label>
                <input
                  type="number"
                  value={settings.proMonthlyPrice}
                  onChange={(e) => setSettings({ ...settings, proMonthlyPrice: parseFloat(e.target.value) })}
                  className="w-32 px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between max-w-md">
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">Enterprise Plan</p>
                  <p className="text-xs text-gray-500">Enable Enterprise subscription tier</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, enableEnterprisePlan: !settings.enableEnterprisePlan })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.enableEnterprisePlan ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.enableEnterprisePlan ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Enterprise Monthly Price ($)
                </label>
                <input
                  type="number"
                  value={settings.enterpriseMonthlyPrice}
                  onChange={(e) => setSettings({ ...settings, enterpriseMonthlyPrice: parseFloat(e.target.value) })}
                  className="w-32 px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
