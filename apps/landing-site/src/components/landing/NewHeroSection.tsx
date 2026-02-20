"use client";

import { useEffect, useState } from 'react';
import { ArrowRight, Play, Sparkles, Zap, Shield, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';

export default function HeroSection() {
 const [stats, setStats] = useState({ companies: 2500, queries: 10000000, savings: 89, uptime: 99 });

 useEffect(() => {
 const animateCounter = (target: number, key: 'companies' | 'queries' | 'savings' | 'uptime') => {
 let current = 0;
 const increment = target / 60;
 const timer = setInterval(() => {
 current += increment;
 if (current >= target) {
 current = target;
 clearInterval(timer);
 }
 setStats(prev => ({ ...prev, [key]: Math.floor(current) }));
 }, 30);
 };

 setTimeout(() => {
 animateCounter(2500, 'companies');
 animateCounter(10000000, 'queries');
 animateCounter(89, 'savings');
 animateCounter(99, 'uptime');
 }, 500);
 }, []);

 return (
 <div
 className="relative min-h-[90vh] overflow-hidden bg-background"
 >
 {/* Animated background elements */}
 <div className="absolute inset-0 overflow-hidden">
 <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl float-element" />
 <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl float-element" style={{ animationDelay: '1s' }} />
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl float-element" style={{ animationDelay: '2s' }} />
 </div>

 <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
 <div className="grid lg:grid-cols-2 gap-12 items-center">
 {/* Left column - Content */}
 <div className="text-center lg:text-left">
 {/* Badge */}
 <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 bg-zinc-900/40 border-zinc-800">
 <Sparkles className="w-4 h-4 text-zinc-400" />
 <span className="font-medium text-zinc-400">
 Trusted by 2,500+ Enterprises
 </span>
 </div>

 {/* Headline */}
 <h1 className="hero-title text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight mb-6">
 <span className="text-white">Transform</span>{' '}
 <span className="bg-gradient-to-r from-zinc-400 to-zinc-500 bg-clip-text text-transparent">
 Legacy Systems
 </span>{' '}
 <span className="text-white">into AI Powerhouses</span>
 </h1>

 {/* Description */}
 <p className="hero-description mb-8 max-w-2xl mx-auto lg:mx-0 text-zinc-400">
 Connect any database or enterprise system. Query with natural language. Get instant insights.
 No migration. No disruption. Just pure AI-powered efficiency.
 </p>

 {/* CTAs */}
 <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
 <Button size="xl" className="group">
 Start Free Trial
 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
 </Button>
 <Button size="xl" variant="outline" className="group">
 <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
 Watch Demo
 </Button>
 </div>

 {/* Trust indicators */}
 <div className="hero-stats flex flex-wrap gap-4 justify-center lg:justify-start text-muted-foreground">
 <div className="flex items-center gap-2">
 <CheckCircle2 className="w-4 h-4 text-zinc-300" />
 <span>Free 14-day trial</span>
 </div>
 <div className="flex items-center gap-2">
 <CheckCircle2 className="w-4 h-4 text-zinc-300" />
 <span>No credit card required</span>
 </div>
 <div className="flex items-center gap-2">
 <CheckCircle2 className="w-4 h-4 text-zinc-300" />
 <span>Cancel anytime</span>
 </div>
 </div>
 </div>

 {/* Right column - Visual */}
 <div className="hero-visual relative">
 <div className="relative rounded-2xl overflow-hidden shadow-2xl border-zinc-800 bg-zinc-950">
 {/* Terminal-style interface */}
 <div className="bg-zinc-950 px-4 py-3 flex items-center gap-2">
 <div className="flex gap-2">
 <div className="w-3 h-3 rounded-full bg-zinc-800" />
 <div className="w-3 h-3 rounded-full bg-zinc-700" />
 <div className="w-3 h-3 rounded-full bg-zinc-800" />
 </div>
 <span className="text-xs text-muted-foreground ml-4">Velanova Query Interface</span>
 </div>

 <div className="p-6 space-y-4 bg-gradient-to-br from-zinc-950 to-zinc-950 text-white min-h-[400px]">
 <div className="space-y-2">
 <div className="text-xs text-muted-foreground">You:</div>
 <div className="bg-white/10 border border-zinc-700/40 rounded-lg p-3 text-sm">
 Show me top 10 customers by revenue this quarter
 </div>
 </div>

 <div className="space-y-2">
 <div className="text-xs text-muted-foreground">Velanova:</div>
 <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4 space-y-3">
 <div className="flex items-center gap-2 text-zinc-400 text-sm">
 <div className="w-2 h-2 bg-zinc-700 rounded-full animate-pulse" />
 <span>Connected to Oracle ERP</span>
 </div>
 <div className="space-y-2">
 <div className="flex justify-between text-sm">
 <span className="text-zinc-400">Acme Corp</span>
 <span className="text-zinc-400 font-mono">$2.4M</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-zinc-400">TechStart Inc</span>
 <span className="text-zinc-400 font-mono">$1.8M</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-zinc-400">Global Systems</span>
 <span className="text-zinc-400 font-mono">$1.5M</span>
 </div>
 <div className="text-xs text-muted-foreground mt-2">+ 7 more...</div>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-2 text-xs text-muted-foreground">
 <Zap className="w-3 h-3 text-zinc-400" />
 <span>Query executed in 0.3s</span>
 </div>
 </div>
 </div>

 {/* Floating stat cards */}
 <div className="absolute -top-6 -left-6 float-element">
 <div className="rounded-xl shadow-xl p-4 bg-zinc-900 border-zinc-800">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-900/40">
 <TrendingUp className="w-5 h-5 text-zinc-400" />
 </div>
 <div>
 <div className="font-medium text-white">{stats.queries.toLocaleString('en-US')}+</div>
 <div className="text-muted-foreground">Queries Processed</div>
 </div>
 </div>
 </div>
 </div>

 <div className="absolute -bottom-6 -right-6 float-element" style={{ animationDelay: '0.5s' }}>
 <div className="rounded-xl shadow-xl p-4 bg-zinc-900 border-zinc-800">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-900/40">
 <Shield className="w-5 h-5 text-zinc-300" />
 </div>
 <div>
 <div className="font-medium text-white">{stats.uptime}%</div>
 <div className="text-muted-foreground">Uptime SLA</div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Live stats bar */}
 <div className="hero-stats mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
 <div className="text-center">
 <div className="sm:text-4xl font-medium mb-1 text-white">
 {stats.companies.toLocaleString('en-US')}+
 </div>
 <div className="text-muted-foreground">Companies Trust Us</div>
 </div>
 <div className="text-center">
 <div className="sm:text-4xl font-medium mb-1 text-white">
 64
 </div>
 <div className="text-muted-foreground">Systems Supported</div>
 </div>
 <div className="text-center">
 <div className="sm:text-4xl font-medium mb-1 text-white">
 {stats.savings}%
 </div>
 <div className="text-muted-foreground">Time Saved</div>
 </div>
 <div className="text-center">
 <div className="sm:text-4xl font-medium mb-1 text-white">
 24/7
 </div>
 <div className="text-muted-foreground">Expert Support</div>
 </div>
 </div>
 </div>
 </div>
 );
}
