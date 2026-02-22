import React, { useState, useEffect } from 'react';
import { User, Shield, Palette, Save, Upload, Check, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  createdAt: Date;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    desktop: boolean;
    newFeatures: boolean;
  };
  defaultModel: string;
  autoSave: boolean;
}

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'en',
    notifications: {
      email: true,
      desktop: true,
      newFeatures: true,
    },
    defaultModel: 'gpt-4o-mini',
    autoSave: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');

  useEffect(() => {
    loadProfile();
    loadPreferences();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await window.electron.api?.getUserProfile?.();
      if (user) setProfile(user);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const prefs = await window.electron.api?.getUserPreferences?.();
      if (prefs) setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const saveProfile = async () => {
    try {
      setIsSaving(true);
      await window.electron.api?.updateUserProfile?.(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const savePreferences = async () => {
    try {
      setIsSaving(true);
      await window.electron.api?.updateUserPreferences?.(preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const result = await window.electron.api?.uploadAvatar?.(formData);
      if (result?.url) {
        setProfile(prev => (prev ? { ...prev, avatar: result.url } : null));
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">
          Profile &amp; Settings
        </h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        {/* Tab strip inside toolbar */}
        <div className="flex items-center gap-0.5 app-region-no-drag">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'tab-strip-item flex items-center gap-1.5',
                activeTab === tab.id ? 'is-active' : ''
              )}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button
          onClick={activeTab === 'preferences' ? savePreferences : saveProfile}
          disabled={isSaving || (activeTab !== 'security' && !profile && activeTab === 'profile')}
          className="app-region-no-drag h-6 px-3 rounded-[5px] text-[11px] font-medium bg-white/[0.08] text-white/70 hover:bg-white/[0.14] flex items-center gap-1.5 transition-all disabled:opacity-40"
        >
          {isSaving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : saved ? (
            <Check className="w-3 h-3" />
          ) : (
            <Save className="w-3 h-3" />
          )}
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto p-6 bg-[#0b0b0b]">
        {/* ── Profile tab ── */}
        {activeTab === 'profile' && (
          <div className="max-w-lg space-y-6">
            {profile ? (
              <>
                {/* Avatar row */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="Avatar"
                        className="w-14 h-14 rounded-full object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-white/[0.08] flex items-center justify-center ring-1 ring-white/[0.07]">
                        <span className="text-white text-xl font-medium">
                          {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 w-6 h-6 bg-white/[0.12] rounded-full flex items-center justify-center cursor-pointer hover:bg-white/[0.22] transition-colors"
                    >
                      <Upload className="w-3 h-3 text-white" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={uploadAvatar}
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-white/80">{profile.name}</p>
                    <p className="text-[11px] text-white/40">{profile.email}</p>
                    <p className="text-[10px] text-white/25 mt-0.5 capitalize">
                      {profile.role} &middot; Member since{' '}
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-white/40 mb-1.5">
                      Display Name
                    </label>
                    <input
                      value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                      className="input-desktop w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-white/40 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                      className="input-desktop w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-white/40 mb-1.5">
                      Role
                    </label>
                    <input
                      value={profile.role}
                      readOnly
                      className="input-desktop w-full opacity-40 cursor-not-allowed"
                    />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-[12px] text-white/30">
                No profile data — check your backend connection.
              </p>
            )}
          </div>
        )}

        {/* ── Preferences tab ── */}
        {activeTab === 'preferences' && (
          <div className="max-w-lg space-y-6">
            {/* Theme */}
            <div>
              <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-2">
                Theme
              </label>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as const).map(theme => (
                  <button
                    key={theme}
                    onClick={() => setPreferences({ ...preferences, theme })}
                    className={cn(
                      'h-7 px-3 rounded-[5px] text-[11px] font-medium capitalize border transition-all',
                      preferences.theme === theme
                        ? 'border-white/[0.2] bg-white/[0.08] text-white'
                        : 'border-white/[0.07] text-white/40 hover:text-white/60'
                    )}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {/* Default model */}
            <div>
              <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5">
                Default AI Model
              </label>
              <select
                value={preferences.defaultModel}
                onChange={e => setPreferences({ ...preferences, defaultModel: e.target.value })}
                className="input-desktop w-56"
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              </select>
            </div>

            {/* Notifications */}
            <div>
              <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-2">
                Notifications
              </label>
              <div className="space-y-1 rounded-lg border border-white/[0.06] overflow-hidden">
                {(
                  [
                    {
                      key: 'email',
                      label: 'Email notifications',
                      desc: 'Receive updates via email',
                    },
                    {
                      key: 'desktop',
                      label: 'Desktop notifications',
                      desc: 'Show in-app toast messages',
                    },
                    {
                      key: 'newFeatures',
                      label: 'New feature announcements',
                      desc: 'Know when we ship something new',
                    },
                  ] as const
                ).map(({ key, label, desc }, i) => (
                  <div
                    key={key}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.02]',
                      i !== 2 && 'border-b border-white/[0.04]'
                    )}
                  >
                    <div>
                      <p className="text-[12px] font-medium text-white/70">{label}</p>
                      <p className="text-[10.5px] text-white/30">{desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        setPreferences({
                          ...preferences,
                          notifications: {
                            ...preferences.notifications,
                            [key]: !preferences.notifications[key],
                          },
                        })
                      }
                      className={cn(
                        'w-9 h-5 rounded-full transition-colors relative flex-shrink-0',
                        preferences.notifications[key] ? 'bg-emerald-600/80' : 'bg-white/[0.08]'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 w-4 h-4 bg-white/90 rounded-full shadow transition-all',
                          preferences.notifications[key] ? 'left-4' : 'left-0.5'
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Security tab ── */}
        {activeTab === 'security' && (
          <div className="max-w-lg space-y-6">
            <div>
              <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-3">
                Change Password
              </label>
              <div className="space-y-2.5">
                {['Current Password', 'New Password', 'Confirm Password'].map(label => (
                  <div key={label}>
                    <label className="block text-[11px] font-medium text-white/35 mb-1.5">
                      {label}
                    </label>
                    <input
                      type="password"
                      placeholder={`Enter ${label.toLowerCase()}`}
                      className="input-desktop w-full"
                    />
                  </div>
                ))}
                <button className="h-7 px-4 rounded-[5px] text-[11px] font-medium bg-white/[0.08] text-white/70 hover:bg-white/[0.14] transition-all mt-1">
                  Update Password
                </button>
              </div>
            </div>

            <div className="border-t border-white/[0.05] pt-5">
              <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-3">
                Active Sessions
              </label>
              <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-white/25" />
                  <div>
                    <p className="text-[12px] font-medium text-white/70">
                      Desktop App (This device)
                    </p>
                    <p className="text-[10.5px] text-white/30">Last active: just now</p>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-500/70 font-medium px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Active
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
