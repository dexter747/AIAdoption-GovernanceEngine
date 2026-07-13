'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Apple, MonitorDown } from 'lucide-react';

export default function DownloadPage() {
  const [platform, setPlatform] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    // Detect user's platform
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

  const downloads = {
    windows: {
      installer: 'Velanova-Setup-1.0.0.exe',
      msi: 'Velanova-1.0.0.msi',
      portable: 'Velanova-1.0.0-win.zip',
    },
    mac: {
      dmg: 'Velanova-1.0.0.dmg',
      zip: 'Velanova-1.0.0-mac.zip',
    },
    linux: {
      appimage: 'Velanova-1.0.0.AppImage',
      deb: 'velanova_1.0.0_amd64.deb',
      rpm: 'velanova-1.0.0.x86_64.rpm',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-medium">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-medium mb-6 text-center">Download Velanova</h1>
          <p className="text-xl text-gray-400 mb-12 text-center">
            Choose your platform and get started in minutes
          </p>

          {/* Platform Selection */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setPlatform('windows')}
              className={`px-8 py-4 rounded-lg font-medium flex items-center gap-2 ${
                platform === 'windows'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-white border-2 border-white/10'
              }`}
            >
              <MonitorDown className="w-5 h-5" />
              Windows
            </button>
            <button
              onClick={() => setPlatform('mac')}
              className={`px-8 py-4 rounded-lg font-medium flex items-center gap-2 ${
                platform === 'mac'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-white border-2 border-white/10'
              }`}
            >
              <Apple className="w-5 h-5" />
              macOS
            </button>
            <button
              onClick={() => setPlatform('linux')}
              className={`px-8 py-4 rounded-lg font-medium flex items-center gap-2 ${
                platform === 'linux'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-white border-2 border-white/10'
              }`}
            >
              <Download className="w-5 h-5" />
              Linux
            </button>
          </div>

          {/* Download Options */}
          <div className="bg-card rounded-2xl p-8 border border-border">
            {detected && (
              <div className="mb-6 p-4 bg-blue-500/10 rounded-lg text-blue-400">
                We detected you&apos;re using{' '}
                <strong>
                  {platform === 'mac' ? 'macOS' : platform === 'linux' ? 'Linux' : 'Windows'}
                </strong>
                . Download links below are recommended for your system.
              </div>
            )}

            {platform === 'windows' && (
              <div className="space-y-4">
                <DownloadButton
                  title="Windows Installer (Recommended)"
                  subtitle="Easy installation with start menu shortcuts"
                  filename={downloads.windows.installer}
                  primary
                />
                <DownloadButton
                  title="MSI Installer"
                  subtitle="For enterprise deployments with Group Policy"
                  filename={downloads.windows.msi}
                />
                <DownloadButton
                  title="Portable ZIP"
                  subtitle="No installation required, extract and run"
                  filename={downloads.windows.portable}
                />
              </div>
            )}

            {platform === 'mac' && (
              <div className="space-y-4">
                <DownloadButton
                  title="macOS DMG (Recommended)"
                  subtitle="Drag and drop installation"
                  filename={downloads.mac.dmg}
                  primary
                />
                <DownloadButton
                  title="ZIP Archive"
                  subtitle="Extract and move to Applications folder"
                  filename={downloads.mac.zip}
                />
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-yellow-900 text-sm">
                  <strong>Note:</strong> First time running? Right-click the app and select
                  &quot;Open&quot; to bypass Gatekeeper.
                </div>
              </div>
            )}

            {platform === 'linux' && (
              <div className="space-y-4">
                <DownloadButton
                  title="AppImage (Recommended)"
                  subtitle="Universal Linux binary, works on all distributions"
                  filename={downloads.linux.appimage}
                  primary
                />
                <DownloadButton
                  title="Debian/Ubuntu Package"
                  subtitle="For Debian, Ubuntu, Linux Mint, Pop!_OS"
                  filename={downloads.linux.deb}
                />
                <DownloadButton
                  title="RPM Package"
                  subtitle="For Fedora, RHEL, CentOS, openSUSE"
                  filename={downloads.linux.rpm}
                />
                <div className="mt-6 p-4 bg-blue-500/10 rounded-lg text-blue-400 text-sm">
                  <strong>AppImage usage:</strong> Make it executable with{' '}
                  <code className="bg-blue-500/10 px-2 py-1 rounded">
                    chmod +x Velanova-*.AppImage
                  </code>
                </div>
              </div>
            )}
          </div>

          {/* System Requirements */}
          <div className="mt-12 bg-card rounded-2xl p-8 border border-border">
            <h2 className="text-2xl font-medium mb-4">System Requirements</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-2">Windows</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>Windows 10/11 (64-bit)</li>
                  <li>4GB RAM minimum</li>
                  <li>500MB disk space</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">macOS</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>macOS 10.15+ (Catalina)</li>
                  <li>4GB RAM minimum</li>
                  <li>500MB disk space</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Linux</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>Ubuntu 20.04+, Fedora 35+</li>
                  <li>4GB RAM minimum</li>
                  <li>500MB disk space</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-medium mb-4">What&apos;s Next?</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-2">1️⃣</div>
                <h3 className="font-medium mb-2">Install & Launch</h3>
                <p className="text-sm text-gray-400">
                  Download and install Velanova. Launch the app and start your 14-day free trial.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-2">2️⃣</div>
                <h3 className="font-medium mb-2">Connect Your Data</h3>
                <p className="text-sm text-gray-400">
                  Add connections to your databases or SaaS platforms. Your data stays secure.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-2">3️⃣</div>
                <h3 className="font-medium mb-2">Query with AI</h3>
                <p className="text-sm text-gray-400">
                  Ask questions in natural language and get instant insights from your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DownloadButton({
  title,
  subtitle,
  filename,
  primary = false,
}: {
  title: string;
  subtitle: string;
  filename: string;
  primary?: boolean;
}) {
  const handleDownload = () => {
    // In production, this would point to actual download URLs (GitHub releases, CDN, etc.)
    window.open(`https://releases.velanova.com/${filename}`, '_blank');
  };

  return (
    <button
      onClick={handleDownload}
      className={`w-full p-4 rounded-lg border-2 text-left hover:shadow-md transition-all ${
        primary ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-lg">{title}</h3>
          <p className="text-sm text-gray-400">{subtitle}</p>
          <p className="text-xs text-gray-400 mt-1">{filename}</p>
        </div>
        <Download className={`w-6 h-6 ${primary ? 'text-blue-600' : 'text-gray-400'}`} />
      </div>
    </button>
  );
}
