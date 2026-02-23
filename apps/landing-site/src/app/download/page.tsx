'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Apple,
  Monitor,
  Terminal,
  CheckCircle2,
  Shield,
  Zap,
  Database,
  ArrowRight,
  ChevronDown,
  ExternalLink,
  Lock,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/landing';

interface UserSession {
  id: string;
  email: string;
  name?: string;
  image?: string;
  plan?: string;
}

export default function DownloadPage() {
  const [platform, setPlatform] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [detected, setDetected] = useState(false);
  const [showAllVersions, setShowAllVersions] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Detect platform
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) {
      setPlatform('mac');
    } else if (userAgent.includes('linux')) {
      setPlatform('linux');
    } else {
      setPlatform('windows');
    }
    setDetected(true);
  }, []);

  const currentVersion = '1.0.0';
  const releaseDate = 'Latest';
  const ghRelease = `https://github.com/Nexolve-Technologies-India/AIAdoption-GovernanceEngine/releases/download/v${currentVersion}`;

  const downloads = {
    windows: {
      name: 'Windows',
      icon: <Monitor className="w-6 h-6" />,
      recommended: {
        name: 'Installer (.exe)',
        file: `Velanova-Setup-${currentVersion}.exe`,
        size: '124 MB',
      },
      options: [
        { name: 'MSI Package', file: `Velanova-${currentVersion}.msi`, size: '122 MB' },
        { name: 'Portable (.zip)', file: `Velanova-${currentVersion}-win.zip`, size: '145 MB' },
      ],
      requirements: 'Windows 10/11 (64-bit)',
    },
    mac: {
      name: 'macOS',
      icon: <Apple className="w-6 h-6" />,
      recommended: {
        name: 'Apple Silicon DMG',
        file: `Velanova-${currentVersion}-mac-arm64.dmg`,
        size: '175 MB',
      },
      options: [
        { name: 'Intel DMG', file: `Velanova-${currentVersion}-mac-x64.dmg`, size: '180 MB' },
        {
          name: 'Apple Silicon DMG',
          file: `Velanova-${currentVersion}-mac-arm64.dmg`,
          size: '175 MB',
        },
      ],
      requirements: 'macOS 12 Monterey or later',
    },
    linux: {
      name: 'Linux',
      icon: <Terminal className="w-6 h-6" />,
      recommended: {
        name: 'AppImage',
        file: `Velanova-${currentVersion}.AppImage`,
        size: '138 MB',
      },
      options: [
        { name: 'Debian (.deb)', file: `velanova_${currentVersion}_amd64.deb`, size: '132 MB' },
        { name: 'Red Hat (.rpm)', file: `velanova-${currentVersion}.x86_64.rpm`, size: '134 MB' },
        {
          name: 'Tarball (.tar.gz)',
          file: `velanova-${currentVersion}-linux.tar.gz`,
          size: '140 MB',
        },
      ],
      requirements: 'Ubuntu 20.04+, Fedora 35+, or equivalent',
    },
  };

  const current = downloads[platform];

  const features = [
    { icon: <Database className="w-5 h-5" />, text: '20+ database connectors' },
    { icon: <Zap className="w-5 h-5" />, text: '10+ AI providers' },
    { icon: <Shield className="w-5 h-5" />, text: 'Local-first privacy' },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
      </div>
    );
  }

  // Auth required screen
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Subtle background glow */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/[0.025] rounded-full blur-3xl" />
        </div>

        <main className="relative flex items-center justify-center min-h-screen px-6">
          <div className="max-w-md w-full mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl border border-zinc-800 bg-zinc-900/80 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-zinc-400" />
              </div>
              <h1 className="text-3xl font-medium text-white tracking-tight mb-3">
                Sign in to Download
              </h1>
              <p className="text-zinc-500 text-base leading-relaxed">
                Create a free account to download Velanova and unlock all features.
              </p>
            </div>

            <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8">
              <Link
                href="/login?callbackUrl=/download"
                className="flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-white text-black font-medium rounded-xl hover:bg-zinc-100 transition-all"
              >
                Sign In To Continue
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="mt-6 pt-6 border-t border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-400 mb-4">Why create an account?</h3>
                <ul className="space-y-3">
                  {[
                    'Free 14-day trial with all Pro features',
                    'Sync settings across devices',
                    'Get notified about updates',
                    'Access to community support',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-zinc-500">
                      <CheckCircle2 className="w-4 h-4 text-zinc-700 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-center mt-6 text-sm text-zinc-600">
              Already have the app?{' '}
              <Link
                href="/login"
                className="text-zinc-400 hover:text-white transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Authenticated download page
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Subtle background glows matching hero section */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-20 w-72 h-72 bg-white/[0.025] rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative pt-36 pb-16">
        <div className="container relative mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900/40 border border-zinc-800 rounded-full text-sm text-zinc-400 mb-6">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Signed in as {user.email}
            </div>
            <h1 className="text-4xl sm:text-5xl font-medium text-white tracking-tight mb-4">
              Download Velanova
            </h1>
            <p className="text-lg text-zinc-500">
              Get started in minutes.{' '}
              {user.plan === 'trial'
                ? 'Your 14-day free trial is ready.'
                : `${user.plan} plan active.`}
            </p>
          </div>

          {/* Platform Selector */}
          <div className="flex justify-center gap-2 mb-8">
            {Object.entries(downloads).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setPlatform(key as typeof platform)}
                className={cn(
                  'px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all',
                  platform === key
                    ? 'bg-white text-black shadow-sm'
                    : 'bg-zinc-900/50 text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-700'
                )}
              >
                {data.icon}
                <span className="hidden sm:inline">{data.name}</span>
              </button>
            ))}
          </div>

          {detected && (
            <p className="text-center text-sm text-zinc-600 mb-8">
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 text-zinc-700" />
              Detected: <span className="text-zinc-400 font-medium">{current.name}</span>
            </p>
          )}

          {/* Main Download Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-zinc-900/40 rounded-2xl overflow-hidden border border-zinc-800">
              {/* Card Header */}
              <div className="px-8 py-5 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-medium text-white">Velanova for {current.name}</h2>
                  <p className="text-zinc-500 text-sm mt-0.5">
                    Version {currentVersion} · {releaseDate}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl border border-zinc-700 bg-zinc-800/80 flex items-center justify-center text-zinc-400">
                  {current.icon}
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Recommended Download */}
                <div className="mb-6">
                  <span className="text-xs font-medium text-zinc-600 tracking-widest uppercase mb-4 block">
                    Recommended
                  </span>
                  <a
                    href={`${ghRelease}/${current.recommended.file}`}
                    className="group flex items-center justify-between p-5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-600 hover:bg-zinc-800/80 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl border border-zinc-700 bg-zinc-800 flex items-center justify-center text-zinc-300">
                        <Download className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{current.recommended.name}</p>
                        <p className="text-sm text-zinc-500">{current.recommended.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:block px-4 py-2 bg-white text-black text-sm font-medium rounded-lg group-hover:bg-zinc-100 transition-colors">
                        Download
                      </span>
                      <ArrowRight className="w-4 h-4 text-zinc-500 sm:hidden group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </a>
                </div>

                {/* Other Options */}
                <button
                  onClick={() => setShowAllVersions(!showAllVersions)}
                  className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-400 transition-colors mb-4"
                >
                  <span>Other download options</span>
                  <ChevronDown
                    className={cn('w-4 h-4 transition-transform', showAllVersions && 'rotate-180')}
                  />
                </button>

                {showAllVersions && (
                  <div className="space-y-2 mb-6">
                    {current.options.map((option, i) => (
                      <a
                        key={i}
                        href={`${ghRelease}/${option.file}`}
                        className="flex items-center justify-between p-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-900 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Download className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                          <span className="text-zinc-400">{option.name}</span>
                        </div>
                        <span className="text-sm text-zinc-500">{option.size}</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* System Requirements */}
                <div className="pt-5 border-t border-zinc-800/50">
                  <p className="text-sm text-zinc-600">
                    <span className="text-zinc-500 font-medium">System requirements: </span>
                    {current.requirements}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900/40 rounded-full border border-zinc-800 text-zinc-500 text-sm"
                >
                  <span className="text-zinc-600">{feature.icon}</span>
                  {feature.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section className="py-20 border-t border-zinc-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-medium text-white text-center tracking-tight mb-14">
              Quick Installation
            </h2>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  step: '1',
                  title: 'Download',
                  desc: 'Click the download button above for your platform',
                },
                {
                  step: '2',
                  title: 'Install',
                  desc: 'Run the installer and follow the on-screen prompts',
                },
                {
                  step: '3',
                  title: 'Sign In',
                  desc: 'Use your Google account to sync everything instantly',
                },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-2xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 font-medium text-lg flex items-center justify-center mx-auto mb-5">
                    {item.step}
                  </div>
                  <h3 className="font-medium text-white mb-2">{item.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Previous Releases */}
      <section className="py-16 border-t border-zinc-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-medium text-white tracking-tight">Previous Releases</h2>
              <a
                href="https://github.com/Nexolve-Technologies-India/AIAdoption-GovernanceEngine/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors"
              >
                View changelog <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-3">
              {[
                {
                  version: '1.0.0',
                  date: 'Initial stable release',
                  notes: 'Full-featured desktop app with AI-powered database querying',
                },
              ].map((release, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">Version {release.version}</p>
                    <p className="text-sm text-zinc-500 mt-0.5">{release.notes}</p>
                  </div>
                  <a
                    href={`https://github.com/Nexolve-Technologies-India/AIAdoption-GovernanceEngine/releases/download/v${release.version}/Velanova-Setup-${release.version}.exe`}
                    className="text-sm text-zinc-400 hover:text-white font-medium transition-colors"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-zinc-900">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center bg-zinc-900/60 rounded-3xl border border-zinc-800 p-12">
            <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight mb-4">
              Need more features?
            </h2>
            <p className="text-zinc-500 mb-8 max-w-md mx-auto leading-relaxed">
              Upgrade to Pro for unlimited queries, all AI providers, and priority support.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-medium rounded-xl hover:bg-zinc-100 transition-all"
            >
              View Pricing <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-10">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-zinc-700">© 2025 Velanova. All rights reserved.</p>
          <div className="flex justify-center gap-8 mt-4">
            {[
              { name: 'Privacy', href: '/privacy' },
              { name: 'Terms', href: '/terms' },
              { name: 'Contact', href: '/contact' },
            ].map(link => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
