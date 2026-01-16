import { useAuth } from '../context/AuthContext';
import { Mail, User, CreditCard, Calendar, Shield, ExternalLink } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black dark:text-white">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-6">
          {user?.image ? (
            <img src={user.image} alt={user.name} className="w-20 h-20 rounded-full" />
          ) : (
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white">{user?.name || 'User'}</h2>
            <p className="text-gray-500">{user?.email || ''}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                Pro Plan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Account Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm text-black dark:text-white">{user?.name || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-black dark:text-white">{user?.email || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="text-sm text-black dark:text-white">January 2024</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Subscription</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Current Plan</p>
                <p className="text-sm text-black dark:text-white">Pro - $29/month</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Next Billing Date</p>
                <p className="text-sm text-black dark:text-white">February 15, 2024</p>
              </div>
            </div>
            <button className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600">
              <ExternalLink className="w-4 h-4" />
              Manage subscription
            </button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="mt-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Security</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-black dark:text-white">Signed in with Google</p>
              <p className="text-xs text-gray-500">Your account is secured with Google authentication</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
