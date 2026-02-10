'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Check, Zap } from 'lucide-react';

export function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden bg-black dark:bg-white">

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium mb-6 border border-blue-500/20">
          <Sparkles className="w-4 h-4" />
          Start Your 14-Day Free Trial
        </div>

        {/* Headline */}
        <h2 className="text-4xl md:text-6xl font-medium text-white dark:text-black mb-6 leading-tight">
          Ready to transform your
          <br />
          legacy systems with AI?
        </h2>

        {/* Description */}
        <p className="text-xl text-gray-400 dark:text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Join 2,500+ enterprises using AI Nexus to unlock insights, automate workflows, and save 89% on data access time.
        </p>

        {/* Benefits */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-gray-300 dark:text-gray-600">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">24-hour setup</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Cancel anytime</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/download"
            className="group px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium text-lg inline-flex items-center justify-center gap-3"
          >
            <Zap className="w-5 h-5" />
            Start Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/contact"
            className="px-8 py-4 bg-gray-800 dark:bg-gray-200 text-white dark:text-black rounded-xl hover:bg-gray-700 dark:hover:bg-gray-300 transition-all font-medium text-lg inline-flex items-center justify-center gap-3 border border-gray-700 dark:border-gray-300"
          >
            Talk to Sales
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-gray-400 dark:text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            SOC 2 Type II Certified
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            GDPR & HIPAA Compliant
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            99.9% Uptime SLA
          </div>
        </div>
      </div>
    </section>
  );
}
