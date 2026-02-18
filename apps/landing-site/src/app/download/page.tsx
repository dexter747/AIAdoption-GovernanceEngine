'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Download, Apple, Monitor, Terminal, CheckCircle2, Sparkles,
  Shield, Zap, Database, ArrowRight, ChevronDown, ExternalLink,
  Lock, Loader2, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const currentVersion = '1.2.0';
  const releaseDate = 'January 15, 2025';

  const downloads = {
    windows: {
      name: 'Windows',
      icon: <Monitor className="w-6 h-6" />,
      recommended: { name: 'Installer (.exe)', file: `AI-Nexus-Setup-${currentVersion}.exe`, size: '124 MB' },
      options: [
        { name: 'MSI Package', file: `AI-Nexus-${currentVersion}.msi`, size: '122 MB' },
        { name: 'Portable (.zip)', file: `AI-Nexus-${currentVersion}-win.zip`, size: '145 MB' },
      ],
      requirements: 'Windows 10/11 (64-bit)',
    },
    mac: {
      name: 'macOS',
      icon: <Apple className="w-6 h-6" />,
      recommended: { name: 'Universal DMG', file: `AI-Nexus-${currentVersion}-universal.dmg`, size: '156 MB' },
      options: [
        { name: 'Intel DMG', file: `AI-Nexus-${currentVersion}-x64.dmg`, size: '148 MB' },
        { name: 'Apple Silicon DMG', file: `AI-Nexus-${currentVersion}-arm64.dmg`, size: '142 MB' },
      ],
      requirements: 'macOS 12 Monterey or later',
    },
    linux: {
      name: 'Linux',
      icon: <Terminal className="w-6 h-6" />,
      recommended: { name: 'AppImage', file: `AI-Nexus-${currentVersion}.AppImage`, size: '138 MB' },
      options: [
        { name: 'Debian (.deb)', file: `ai-nexus_${currentVersion}_amd64.deb`, size: '132 MB' },
        { name: 'Red Hat (.rpm)', file: `ai-nexus-${currentVersion}.x86_64.rpm`, size: '134 MB' },
        { name: 'Tarball (.tar.gz)', file: `ai-nexus-${currentVersion}-linux.tar.gz`, size: '140 MB' },
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Auth required screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Simple header */}
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">AI Nexus</span>
            </Link>
          </div>
        </header>

        {/* Auth Required Content */}
        <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md w-full mx-auto px-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/25">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-medium text-gray-900 mb-3">Sign in to Download</h1>
              <p className="text-gray-500 text-lg">
                Create a free account to download AI Nexus and unlock all features.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <Link
                href="/login?callbackUrl=/download"
                className="flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25"
              >
                Sign in with Google
                <ArrowRight className="w-5 h-5" />
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="font-medium text-gray-900 mb-3">Why create an account?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Free 14-day trial with all Pro features
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Sync settings across devices
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Get notified about updates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Access to community support
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-center mt-6 text-sm text-gray-500">
              Already have the app?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-gray-900">AI Nexus</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
              {user.image ? (
                <img 
                  src={user.image.includes('googleusercontent.com') ? `/api/avatar/proxy?url=${encodeURIComponent(user.image)}` : user.image} 
                  alt="" 
                  className="w-8 h-8 rounded-full" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-gray-900 hidden sm:inline">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 lg:py-20">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-200/50 to-purple-200/50 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-200/30 to-blue-200/30 rounded-full blur-[80px]" />
        </div>

        <div className="container relative mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
              <CheckCircle2 className="w-4 h-4" />
              Signed in as {user.email}
            </div>
            <h1 className="text-4xl sm:text-5xl font-medium text-gray-900 mb-4">
              Download AI Nexus
            </h1>
            <p className="text-lg text-gray-500">
              Get started in minutes. Your {user.plan === 'trial' ? '14-day free trial' : user.plan} is ready.
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
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
                )}
              >
                {data.icon}
                <span className="hidden sm:inline">{data.name}</span>
              </button>
            ))}
          </div>

          {detected && (
            <p className="text-center text-sm text-gray-500 mb-8">
              <CheckCircle2 className="w-4 h-4 inline mr-1 text-green-500" />
              We detected you&apos;re on <strong className="text-gray-700">{current.name}</strong>
            </p>
          )}

          {/* Main Download Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 px-8 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-medium mb-1">AI Nexus for {current.name}</h2>
                    <p className="text-white/80 text-sm">Version {currentVersion} • Released {releaseDate}</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    {current.icon}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Recommended Download */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      RECOMMENDED
                    </span>
                  </div>
                  <a
                    href={`/downloads/${current.recommended.file}`}
                    className="group flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                        <Download className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{current.recommended.name}</p>
                        <p className="text-sm text-gray-500">{current.recommended.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 font-medium">
                      <span className="hidden sm:inline">Download</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>
                </div>

                {/* Other Options */}
                <button
                  onClick={() => setShowAllVersions(!showAllVersions)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
                >
                  <span>Other download options</span>
                  <ChevronDown className={cn('w-4 h-4 transition-transform', showAllVersions && 'rotate-180')} />
                </button>

                {showAllVersions && (
                  <div className="space-y-2 mb-6">
                    {current.options.map((option, i) => (
                      <a
                        key={i}
                        href={`/downloads/${option.file}`}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                          <span className="text-gray-700">{option.name}</span>
                        </div>
                        <span className="text-sm text-gray-400">{option.size}</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* System Requirements */}
                <div className="pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    <strong className="text-gray-700">System requirements:</strong> {current.requirements}
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
                  <span className="text-blue-500">{feature.icon}</span>
                  <span className="text-sm text-gray-600">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-medium text-gray-900 text-center mb-12">Quick Installation</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Download', desc: 'Click the download button above for your platform' },
                { step: '2', title: 'Install', desc: 'Run the installer and follow the prompts' },
                { step: '3', title: 'Sign In', desc: 'Use your Google account to sync everything' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
                    {item.step}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Previous Releases */}
      <section className="py-16 border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-medium text-gray-900">Previous Releases</h2>
              <Link href="/changelog" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
                View changelog <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { version: '1.1.2', date: 'December 28, 2024', notes: 'Bug fixes and performance improvements' },
                { version: '1.1.0', date: 'December 15, 2024', notes: 'Added Claude 3.5 and Gemini 2.0 support' },
                { version: '1.0.0', date: 'November 30, 2024', notes: 'Initial stable release' },
              ].map((release, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Version {release.version}</p>
                    <p className="text-sm text-gray-500">{release.date} • {release.notes}</p>
                  </div>
                  <Link href={`/downloads/archive/${release.version}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Download
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl shadow-blue-500/25">
            <h2 className="text-2xl sm:text-3xl font-medium text-white mb-4">Need more features?</h2>
            <p className="text-white/80 mb-8">Upgrade to Pro for unlimited queries, all AI providers, and priority support.</p>
            <Link 
              href="/pricing" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all font-medium shadow-lg"
            >
              View Pricing <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 bg-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-gray-400">© 2025 AI Nexus. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-600">Privacy</Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-gray-600">Terms</Link>
            <Link href="/contact" className="text-sm text-gray-400 hover:text-gray-600">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
