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
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-medium mb-6 bg-blue-950 border-blue-900 text-blue-300">
 <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
 Now with GPT-4o, Claude 3.5 &amp; Gemini 2
 </div>

 {/* Heading */}
 <h1 className="sm:text-5xl lg:text-6xl font-medium mb-6 leading-[1.1] tracking-tight text-white">
 Bring AI to Your{' '}
 <span className="text-blue-500">Legacy Systems</span>
 </h1>

 {/* Subheading */}
 <p className="mb-8 max-w-2xl mx-auto leading-relaxed text-muted-foreground">
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
 className="w-full sm:w-auto px-6 py-3 rounded-lg transition-colors font-medium inline-flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-900 border-gray-700"
 >
 Learn More
 </Link>
 </div>

 {/* Trust */}
 <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-muted-foreground">
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
 <div className="rounded-xl overflow-hidden shadow-sm border-gray-800 bg-black">
 {/* Window Chrome */}
 <div className="px-4 py-2.5 flex items-center gap-2 border-b bg-gray-900 border-gray-800">
 <div className="flex gap-1.5">
 <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
 <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
 <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
 </div>
 <div className="flex-1 flex items-center justify-center">
 <div className="px-3 py-0.5 rounded bg-gray-800 text-muted-foreground">
 Velanova
 </div>
 </div>
 </div>
 {/* App Preview */}
 <div className="p-8 min-h-[280px] flex flex-col items-center justify-center gap-4 bg-gray-900">
 <div className="flex items-center gap-2 font-medium text-muted-foreground">
 <Terminal className="w-3.5 h-3.5" />
 Connected to production_db (PostgreSQL)
 </div>
 <div className="max-w-lg w-full rounded-lg px-4 py-3 bg-gray-800 border-gray-700">
 <p className="font-medium text-gray-200">
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
