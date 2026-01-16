'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Download, Apple, Monitor, Terminal, CheckCircle2, Sparkles,
  Shield, Zap, Database, ArrowRight, ChevronDown, ExternalLink
} from 'lucide-react';

export default function DownloadPage() {
  const [platform, setPlatform] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [detected, setDetected] = useState(false);
  const [showAllVersions, setShowAllVersions] = useState(false);

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
    { icon: <Database className="w-5 h-5" />, text: '20+ database connectors included' },
    { icon: <Zap className="w-5 h-5" />, text: '10+ AI providers ready to use' },
    { icon: <Shield className="w-5 h-5" />, text: 'Local-first, privacy-focused' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-xl font-medium bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">AI Nexus</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/subscribe" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
              <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary">Sign In</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-medium text-foreground mb-4">
              Download AI Nexus
            </h1>
            <p className="text-lg text-muted-foreground">
              Get started in minutes. Free forever for personal use.
            </p>
          </div>

          {/* Platform Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {Object.entries(downloads).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setPlatform(key as typeof platform)}
                className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                  platform === key
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {data.icon}
                {data.name}
              </button>
            ))}
          </div>

          {detected && (
            <p className="text-center text-sm text-muted-foreground mb-8">
              <CheckCircle2 className="w-4 h-4 inline mr-1 text-green-500" />
              We detected you&apos;re on <strong className="text-foreground">{current.name}</strong>
            </p>
          )}

          {/* Main Download Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-primary to-indigo-600 px-8 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-medium mb-1">AI Nexus for {current.name}</h2>
                    <p className="text-white/80 text-sm">Version {currentVersion} • Released {releaseDate}</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    {current.icon}
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Recommended Download */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-xs font-medium rounded">RECOMMENDED</span>
                  </div>
                  <a
                    href={`/downloads/${current.recommended.file}`}
                    className="group flex items-center justify-between p-4 bg-primary/5 border-2 border-primary rounded-xl hover:bg-primary/10 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Download className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{current.recommended.name}</p>
                        <p className="text-sm text-muted-foreground">{current.recommended.size}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>

                {/* Other Options */}
                <button
                  onClick={() => setShowAllVersions(!showAllVersions)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                  <span>Other download options</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAllVersions ? 'rotate-180' : ''}`} />
                </button>

                {showAllVersions && (
                  <div className="space-y-2 mb-6">
                    {current.options.map((option, i) => (
                      <a
                        key={i}
                        href={`/downloads/${option.file}`}
                        className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Download className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{option.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{option.size}</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* System Requirements */}
                <div className="pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">System requirements:</strong> {current.requirements}
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-primary">{feature.icon}</span>
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-medium text-foreground text-center mb-12">Quick Installation</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-medium text-xl flex items-center justify-center mx-auto mb-4">1</div>
                <h3 className="font-medium text-foreground mb-2">Download</h3>
                <p className="text-muted-foreground text-sm">Click the download button above for your platform</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-medium text-xl flex items-center justify-center mx-auto mb-4">2</div>
                <h3 className="font-medium text-foreground mb-2">Install</h3>
                <p className="text-muted-foreground text-sm">Run the installer and follow the prompts</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-medium text-xl flex items-center justify-center mx-auto mb-4">3</div>
                <h3 className="font-medium text-foreground mb-2">Connect</h3>
                <p className="text-muted-foreground text-sm">Add your data sources and start querying</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Previous Releases */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-medium text-foreground">Previous Releases</h2>
              <Link href="/changelog" className="text-sm text-primary hover:underline flex items-center gap-1">
                View changelog <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {[
                { version: '1.1.2', date: 'December 28, 2024', notes: 'Bug fixes and performance improvements' },
                { version: '1.1.0', date: 'December 15, 2024', notes: 'Added Claude 3.5 and Gemini 2.0 support' },
                { version: '1.0.0', date: 'November 30, 2024', notes: 'Initial stable release' },
              ].map((release, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl">
                  <div>
                    <p className="font-medium text-foreground">Version {release.version}</p>
                    <p className="text-sm text-muted-foreground">{release.date} • {release.notes}</p>
                  </div>
                  <Link href={`/downloads/archive/${release.version}`} className="text-sm text-primary hover:underline">
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
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-12">
            <h2 className="text-2xl sm:text-3xl font-medium text-white mb-4">Need more features?</h2>
            <p className="text-white/80 mb-8">Upgrade to Pro for unlimited queries, all AI providers, and priority support.</p>
            <Link href="/subscribe" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl hover:bg-white/90 transition-all font-medium">
              View Pricing <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© 2025 AI Nexus. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
