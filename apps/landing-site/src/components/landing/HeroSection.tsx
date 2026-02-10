'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, Zap, Terminal } from 'lucide-react';

const trustBadges = [
  { icon: CheckCircle2, text: 'Free to download' },
  { icon: Shield, text: 'Enterprise-grade security' },
  { icon: Zap, text: 'Setup in 5 minutes' },
];

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 text-sm font-medium text-blue-700 dark:text-blue-300 mb-6">
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
            Now with GPT-4o, Claude 3.5 &amp; Gemini 2
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-black dark:text-white mb-6 leading-[1.1] tracking-tight">
            Bring AI to Your{' '}
            <span className="text-blue-500">Legacy Systems</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect your databases and enterprise systems to powerful AI models.
            Query your data in natural language — no code required.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/download"
              className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm inline-flex items-center justify-center gap-2"
            >
              Download Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-black text-black dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors font-medium text-sm inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700"
            >
              Learn More
            </Link>
          </div>

          {/* Trust */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-500 dark:text-gray-400">
            {trustBadges.map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-blue-500" />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="mt-12">
          <div className="relative mx-auto max-w-4xl">
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm">
              {/* Window Chrome */}
              <div className="bg-gray-100 dark:bg-gray-900 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="px-3 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
                    AI Nexus
                  </div>
                </div>
              </div>
              {/* App Preview */}
              <div className="p-8 bg-black dark:bg-gray-900 min-h-[280px] flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-medium">
                  <Terminal className="w-3.5 h-3.5" />
                  Connected to production_db (PostgreSQL)
                </div>
                <div className="max-w-lg w-full bg-gray-900 dark:bg-gray-800 rounded-lg border border-gray-800 dark:border-gray-700 px-4 py-3">
                  <p className="text-gray-300 dark:text-gray-200 text-sm font-medium">
                    &quot;Show me all customers who haven&apos;t ordered in 30 days&quot;
                  </p>
                </div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-medium">
                  <div className="w-1 h-1 rounded-full bg-blue-400" />
                  Generating SQL with GPT-4o...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
