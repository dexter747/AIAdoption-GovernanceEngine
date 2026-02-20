'use client';

import { useState } from 'react';
import { Save, Bell, Shield, CreditCard, Globe, Palette, Mail, Key } from 'lucide-react';

export default function SettingsPage() {
 const [activeTab, setActiveTab] = useState('general');
 const [settings, setSettings] = useState({
 siteName: 'Velanova',
 siteDescription: 'Enterprise AI Management Platform',
 supportEmail: 'support@velanova.com',
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
 <h1 className="font-medium text-white">Settings</h1>
 <p className="text-muted-foreground mt-1">Manage your platform settings</p>
 </div>
 <button 
 onClick={handleSave}
 className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
 >
 <Save className="w-4 h-4" />
 Save Changes
 </button>
 </div>

 {/* Tabs */}
 <div className="flex gap-1 p-1 rounded-lg mb-6 w-fit bg-zinc-950">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${ activeTab === tab.id ? 'bg-background shadow-sm text-white' : 'text-muted-foreground hover:text-white'}`}
 >
 <tab.icon className="w-4 h-4" />
 {tab.name}
 </button>
 ))}
 </div>

 {/* Content */}
 <div className="rounded-xl bg-black border-zinc-800">
 {activeTab === 'general' && (
 <div className="p-6 space-y-6">
 <h3 className="font-medium text-white">General Settings</h3>
 
 <div className="grid gap-6">
 <div>
 <label className="block font-medium mb-2 text-white">
 Site Name
 </label>
 <input
 type="text"
 value={settings.siteName}
 onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
 className="w-full max-w-md px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-black border-zinc-800 text-white"
 />
 </div>

 <div>
 <label className="block font-medium mb-2 text-white">
 Site Description
 </label>
 <textarea
 value={settings.siteDescription}
 onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
 rows={3}
 className="w-full max-w-md px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-black border-zinc-800 text-white"
 />
 </div>

 <div>
 <label className="block font-medium mb-2 text-white">
 Support Email
 </label>
 <input
 type="email"
 value={settings.supportEmail}
 onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
 className="w-full max-w-md px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-black border-zinc-800 text-white"
 />
 </div>

 <div className="flex items-center justify-between max-w-md">
 <div>
 <p className="font-medium text-white">Enable User Registration</p>
 <p className="text-xs text-muted-foreground">Allow new users to register</p>
 </div>
 <button
 onClick={() => setSettings({ ...settings, enableRegistration: !settings.enableRegistration })}
 className={`w-12 h-6 rounded-full transition-colors ${ settings.enableRegistration ? 'bg-zinc-800' : 'bg-zinc-800'`}
 >
 <div className={`w-5 h-5 bg-background rounded-full shadow transition-transform ${
 settings.enableRegistration ? 'translate-x-6' : 'translate-x-0.5'
 }`} />
 </button>
 </div>

 <div className="flex items-center justify-between max-w-md">
 <div>
 <p className="font-medium text-white">Require Email Verification</p>
 <p className="text-xs text-muted-foreground">Users must verify email before access</p>
 </div>
 <button
 onClick={() => setSettings({ ...settings, requireEmailVerification: !settings.requireEmailVerification })}
 className={`w-12 h-6 rounded-full transition-colors ${ settings.requireEmailVerification ? 'bg-zinc-800' : 'bg-zinc-800'`}
 >
 <div className={`w-5 h-5 bg-background rounded-full shadow transition-transform ${
 settings.requireEmailVerification ? 'translate-x-6' : 'translate-x-0.5'
 }`} />
 </button>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'notifications' && (
 <div className="p-6 space-y-6">
 <h3 className="font-medium text-white">Notification Settings</h3>
 
 <div className="grid gap-6 max-w-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-white">Enable Notifications</p>
 <p className="text-xs text-muted-foreground">Master toggle for all notifications</p>
 </div>
 <button
 onClick={() => setSettings({ ...settings, enableNotifications: !settings.enableNotifications })}
 className={`w-12 h-6 rounded-full transition-colors ${ settings.enableNotifications ? 'bg-zinc-800' : 'bg-zinc-800'`}
 >
 <div className={`w-5 h-5 bg-background rounded-full shadow transition-transform ${
 settings.enableNotifications ? 'translate-x-6' : 'translate-x-0.5'
 }`} />
 </button>
 </div>

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-white">Email on New User</p>
 <p className="text-xs text-muted-foreground">Receive email when a new user registers</p>
 </div>
 <button
 onClick={() => setSettings({ ...settings, emailOnNewUser: !settings.emailOnNewUser })}
 className={`w-12 h-6 rounded-full transition-colors ${ settings.emailOnNewUser ? 'bg-zinc-800' : 'bg-zinc-800'`}
 >
 <div className={`w-5 h-5 bg-background rounded-full shadow transition-transform ${
 settings.emailOnNewUser ? 'translate-x-6' : 'translate-x-0.5'
 }`} />
 </button>
 </div>

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-white">Email on Payment</p>
 <p className="text-xs text-muted-foreground">Receive email for payment transactions</p>
 </div>
 <button
 onClick={() => setSettings({ ...settings, emailOnPayment: !settings.emailOnPayment })}
 className={`w-12 h-6 rounded-full transition-colors ${ settings.emailOnPayment ? 'bg-zinc-800' : 'bg-zinc-800'`}
 >
 <div className={`w-5 h-5 bg-background rounded-full shadow transition-transform ${
 settings.emailOnPayment ? 'translate-x-6' : 'translate-x-0.5'
 }`} />
 </button>
 </div>

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-white">Email on Download</p>
 <p className="text-xs text-muted-foreground">Receive email when software is downloaded</p>
 </div>
 <button
 onClick={() => setSettings({ ...settings, emailOnDownload: !settings.emailOnDownload })}
 className={`w-12 h-6 rounded-full transition-colors ${ settings.emailOnDownload ? 'bg-zinc-800' : 'bg-zinc-800'`}
 >
 <div className={`w-5 h-5 bg-background rounded-full shadow transition-transform ${
 settings.emailOnDownload ? 'translate-x-6' : 'translate-x-0.5'
 }`} />
 </button>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'security' && (
 <div className="p-6 space-y-6">
 <h3 className="font-medium text-white">Security Settings</h3>
 
 <div className="grid gap-6">
 <div className="p-4 rounded-lg max-w-md bg-zinc-950">
 <div className="flex items-center gap-3 mb-3">
 <Key className="w-5 h-5 text-zinc-300" />
 <p className="font-medium text-white">API Keys</p>
 </div>
 <p className="text-xs text-muted-foreground mb-3">Manage your API keys for third-party integrations</p>
 <button className="px-3 py-1.5 text-xs font-medium text-zinc-300 border border-zinc-700 rounded-lg transition-colors hover:bg-zinc-950">
 Generate New Key
 </button>
 </div>

 <div className="p-4 rounded-lg max-w-md bg-zinc-950">
 <div className="flex items-center gap-3 mb-3">
 <Shield className="w-5 h-5 text-zinc-300" />
 <p className="font-medium text-white">Two-Factor Authentication</p>
 </div>
 <p className="text-xs text-muted-foreground mb-3">Add an extra layer of security to admin accounts</p>
 <button className="px-3 py-1.5 text-xs font-medium text-zinc-300 border border-zinc-700 rounded-lg transition-colors hover:bg-zinc-950">
 Enable 2FA
 </button>
 </div>

 <div className="p-4 rounded-lg max-w-md bg-zinc-950">
 <div className="flex items-center gap-3 mb-3">
 <Mail className="w-5 h-5 text-zinc-300" />
 <p className="font-medium text-white">Session Management</p>
 </div>
 <p className="text-xs text-muted-foreground mb-3">View and revoke active sessions</p>
 <button className="px-3 py-1.5 text-xs font-medium text-zinc-400 border border-zinc-700 rounded-lg transition-colors hover:bg-zinc-950">
 Revoke All Sessions
 </button>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'billing' && (
 <div className="p-6 space-y-6">
 <h3 className="font-medium text-white">Billing Settings</h3>
 
 <div className="grid gap-6">
 <div>
 <label className="block font-medium mb-2 text-white">
 Stripe Publishable Key
 </label>
 <input
 type="password"
 value={settings.stripePublishableKey}
 onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
 className="w-full max-w-md px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-black border-zinc-800 text-white"
 />
 </div>

 <div>
 <label className="block font-medium mb-2 text-white">
 Stripe Secret Key
 </label>
 <input
 type="password"
 value={settings.stripeSecretKey}
 onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
 className="w-full max-w-md px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-black border-zinc-800 text-white"
 />
 </div>

 <hr className="border-zinc-800" />

 <h4 className="font-medium text-white">Pricing Plans</h4>

 <div className="flex items-center justify-between max-w-md">
 <div>
 <p className="font-medium text-white">Pro Plan</p>
 <p className="text-xs text-muted-foreground">Enable Pro subscription tier</p>
 </div>
 <button
 onClick={() => setSettings({ ...settings, enableProPlan: !settings.enableProPlan })}
 className={`w-12 h-6 rounded-full transition-colors ${ settings.enableProPlan ? 'bg-zinc-800' : 'bg-zinc-800'`}
 >
 <div className={`w-5 h-5 bg-background rounded-full shadow transition-transform ${
 settings.enableProPlan ? 'translate-x-6' : 'translate-x-0.5'
 }`} />
 </button>
 </div>

 <div>
 <label className="block font-medium mb-2 text-white">
 Pro Monthly Price ($)
 </label>
 <input
 type="number"
 value={settings.proMonthlyPrice}
 onChange={(e) => setSettings({ ...settings, proMonthlyPrice: parseFloat(e.target.value) })}
 className="w-32 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-black border-zinc-800 text-white"
 />
 </div>

 <div className="flex items-center justify-between max-w-md">
 <div>
 <p className="font-medium text-white">Enterprise Plan</p>
 <p className="text-xs text-muted-foreground">Enable Enterprise subscription tier</p>
 </div>
 <button
 onClick={() => setSettings({ ...settings, enableEnterprisePlan: !settings.enableEnterprisePlan })}
 className={`w-12 h-6 rounded-full transition-colors ${ settings.enableEnterprisePlan ? 'bg-zinc-800' : 'bg-zinc-800'`}
 >
 <div className={`w-5 h-5 bg-background rounded-full shadow transition-transform ${
 settings.enableEnterprisePlan ? 'translate-x-6' : 'translate-x-0.5'
 }`} />
 </button>
 </div>

 <div>
 <label className="block font-medium mb-2 text-white">
 Enterprise Monthly Price ($)
 </label>
 <input
 type="number"
 value={settings.enterpriseMonthlyPrice}
 onChange={(e) => setSettings({ ...settings, enterpriseMonthlyPrice: parseFloat(e.target.value) })}
 className="w-32 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-black border-zinc-800 text-white"
 />
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
