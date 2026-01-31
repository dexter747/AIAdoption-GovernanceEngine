'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, Zap, Play, MessageSquare } from 'lucide-react';

const trustBadges = [
  { icon: CheckCircle2, text: 'Free 14-day trial' },
  { icon: Shield, text: 'Enterprise-grade security' },
  { icon: Zap, text: 'Setup in 5 minutes' },
];

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl" />
      <div className="absolute inset-0 dot-pattern opacity-30" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 text-sm font-medium text-blue-700 mb-8 animate-fade-in shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse-soft" />
            Now with GPT-4o, Claude 3.5 &amp; Gemini 2
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-[1.1] animate-slide-up tracking-tight">
            Bring AI to Your
            <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Legacy Systems
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up delay-100">
            Connect your databases and enterprise systems to powerful AI models.
            Query your data in natural language—no code required.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up delay-200">
            <Link
              href="/subscribe"
              className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold text-lg inline-flex items-center justify-center gap-3 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/docs"
              className="group w-full sm:w-auto px-8 py-4 bg-white text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-semibold text-lg inline-flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:-translate-y-1"
            >
              <Play className="w-5 h-5 text-blue-500" />
              Watch Demo
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-gray-500 animate-fade-in delay-300">
            {trustBadges.map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-blue-500" />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Hero Preview */}
        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="mt-20 relative animate-slide-up delay-400">
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
      <div className="relative mx-auto max-w-5xl">
        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-gray-900/10 border border-gray-200 bg-gradient-to-br from-gray-50 to-white">
          {/* Window Chrome */}
          <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 text-center text-sm text-gray-500">AI Nexus</div>
          </div>
          {/* App Preview */}
          <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <p className="text-white/80 text-lg">
                &quot;Show me all customers who haven&apos;t ordered in 30 days&quot;
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-blue-400">
                <Zap className="w-4 h-4" />
                <span className="text-sm">Generating SQL query...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
