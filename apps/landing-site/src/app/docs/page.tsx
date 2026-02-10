'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  Download, Sparkles, ArrowRight, Monitor, Apple, 
  Terminal, CheckCircle2, FileText, Book, Code, 
  ExternalLink, ChevronRight, Cpu, Database, MessageSquare,
  HelpCircle, Zap, Shield
} from 'lucide-react';

type OS = 'windows' | 'macos' | 'linux';

interface DownloadInfo {
  os: OS;
  name: string;
  icon: React.ElementType;
  version: string;
  size: string;
  downloadUrl: string;
  requirements: string[];
}

const downloads: DownloadInfo[] = [
  {
    os: 'windows',
    name: 'Windows',
    icon: Monitor,
    version: '1.2.0',
    size: '89 MB',
    downloadUrl: 'https://res.cloudinary.com/ainexus/raw/upload/v1/releases/AINextus-Setup-1.2.0.exe',
    requirements: ['Windows 10 or later', '64-bit processor', '4 GB RAM minimum', '500 MB disk space'],
  },
  {
    os: 'macos',
    name: 'macOS',
    icon: Apple,
    version: '1.2.0',
    size: '95 MB',
    downloadUrl: 'https://res.cloudinary.com/ainexus/raw/upload/v1/releases/AINextus-1.2.0.dmg',
    requirements: ['macOS 11 (Big Sur) or later', 'Apple Silicon or Intel', '4 GB RAM minimum', '500 MB disk space'],
  },
  {
    os: 'linux',
    name: 'Linux',
    icon: Terminal,
    version: '1.2.0',
    size: '92 MB',
    downloadUrl: 'https://res.cloudinary.com/ainexus/raw/upload/v1/releases/AINextus-1.2.0.AppImage',
    requirements: ['Ubuntu 20.04+, Fedora 34+, or similar', '64-bit processor', '4 GB RAM minimum', '500 MB disk space'],
  },
];

const docSections = [
  {
    title: 'Getting Started',
    icon: Zap,
    links: [
      { title: 'Quick Start Guide', href: '/docs/quickstart' },
      { title: 'Installation', href: '/docs/installation' },
      { title: 'First Query', href: '/docs/first-query' },
    ],
  },
  {
    title: 'Database Connectors',
    icon: Database,
    links: [
      { title: 'PostgreSQL', href: '/docs/connectors/postgresql' },
      { title: 'MySQL', href: '/docs/connectors/mysql' },
      { title: 'Oracle', href: '/docs/connectors/oracle' },
      { title: 'SQL Server', href: '/docs/connectors/sqlserver' },
      { title: 'MongoDB', href: '/docs/connectors/mongodb' },
    ],
  },
  {
    title: 'AI Providers',
    icon: Cpu,
    links: [
      { title: 'OpenAI (GPT-4)', href: '/docs/ai/openai' },
      { title: 'Anthropic (Claude)', href: '/docs/ai/anthropic' },
      { title: 'Google (Gemini)', href: '/docs/ai/google' },
      { title: 'Local Models (Ollama)', href: '/docs/ai/ollama' },
    ],
  },
  {
    title: 'Advanced Usage',
    icon: Code,
    links: [
      { title: 'Custom Prompts', href: '/docs/advanced/prompts' },
      { title: 'API Reference', href: '/docs/api' },
      { title: 'Plugins', href: '/docs/plugins' },
    ],
  },
];

export default function DocsPage() {
  const [selectedOS, setSelectedOS] = useState<OS>('macos');
  const selectedDownload = downloads.find(d => d.os === selectedOS)!;

  // Detect OS on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (userAgent.includes('win')) setSelectedOS('windows');
      else if (userAgent.includes('mac')) setSelectedOS('macos');
      else if (userAgent.includes('linux')) setSelectedOS('linux');
    }
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-medium text-gray-900">AI Nexus</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link href="/#features" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100/80 transition-all">
                Features
              </Link>
              <Link href="/#pricing" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100/80 transition-all">
                Pricing
              </Link>
              <Link href="/docs" className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                Docs
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link href="/subscribe" className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/25">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
              Documentation &amp; Downloads
            </span>
            <h1 className="text-4xl lg:text-5xl font-medium text-gray-900 mb-6">
              Get started with AI Nexus
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Download the app, connect your database, and start querying in minutes.
            </p>
          </div>

          {/* Download Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
              {/* OS Selector */}
              <div className="flex border-b border-gray-100">
                {downloads.map((download) => {
                  const Icon = download.icon;
                  const isSelected = selectedOS === download.os;
                  return (
                    <button
                      key={download.os}
                      onClick={() => setSelectedOS(download.os)}
                      className={`flex-1 px-6 py-4 flex items-center justify-center gap-3 transition-all ${
                        isSelected 
                          ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{download.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Download Details */}
              <div className="p-8">
                <div className="flex flex-col lg:flex-row items-start gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <selectedDownload.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-medium text-gray-900">
                          AI Nexus for {selectedDownload.name}
                        </h2>
                        <p className="text-gray-500">
                          Version {selectedDownload.version} • {selectedDownload.size}
                        </p>
                      </div>
                    </div>

                    <a
                      href={selectedDownload.downloadUrl}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-medium text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all mb-6"
                    >
                      <Download className="w-5 h-5" />
                      Download for {selectedDownload.name}
                    </a>

                    <p className="text-sm text-gray-500">
                      By downloading, you agree to our{' '}
                      <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                    </p>
                  </div>

                  <div className="w-full lg:w-72 bg-gray-50 rounded-2xl p-6">
                    <h3 className="font-medium text-gray-900 mb-4">System Requirements</h3>
                    <ul className="space-y-3">
                      {selectedDownload.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a 
                href="https://github.com/ainexus/releases" 
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="w-4 h-4" />
                Release Notes
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://github.com/ainexus/releases/archive" 
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-4 h-4" />
                Previous Versions
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-medium mb-4">
              Documentation
            </span>
            <h2 className="text-4xl font-medium text-gray-900 mb-6">
              Learn how to use AI Nexus
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive guides and references to help you get the most out of AI Nexus.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {docSections.map((section) => {
              const Icon = section.icon;
              return (
                <div 
                  key={section.title}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link 
                          href={link.href}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors group"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-green-50 text-green-600 text-sm font-medium mb-4">
              Quick Start
            </span>
            <h2 className="text-4xl font-medium text-gray-900 mb-6">
              Up and running in 3 steps
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Download & Install',
                description: 'Download AI Nexus for your operating system and run the installer. The app will be ready in under a minute.',
                icon: Download,
              },
              {
                step: '2',
                title: 'Connect Your Database',
                description: 'Click "Add Connection" and enter your database credentials. We support PostgreSQL, MySQL, Oracle, and more.',
                icon: Database,
              },
              {
                step: '3',
                title: 'Ask Your First Question',
                description: 'Type a question in natural language like "Show me all orders from last month" and watch AI generate the perfect SQL.',
                icon: MessageSquare,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.step}
                  className="relative bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg shadow-lg">
                    {item.step}
                  </div>
                  <div className="pt-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-medium text-white mb-6">
            Need help getting started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Our support team is here to help. Check out our FAQ or reach out directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/faq" 
              className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-medium hover:bg-blue-50 transition-colors shadow-lg"
            >
              View FAQ
            </Link>
            <Link 
              href="/contact" 
              className="px-8 py-4 bg-white/10 text-white rounded-2xl font-medium hover:bg-white/20 transition-colors border border-white/20"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">AI Nexus</span>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} AI Nexus. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
