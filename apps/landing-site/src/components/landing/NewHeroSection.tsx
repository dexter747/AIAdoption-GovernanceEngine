"use client";

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Play, Sparkles, Zap, Shield, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({ companies: 0, queries: 0, savings: 0, uptime: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate hero elements on load
      gsap.from('.hero-badge', {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: 'power3.out',
      });

      gsap.from('.hero-title', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out',
      });

      gsap.from('.hero-description', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.4,
        ease: 'power3.out',
      });

      gsap.from('.hero-cta', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.6,
        ease: 'power3.out',
      });

      gsap.from('.hero-stats', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.8,
        ease: 'power3.out',
      });

      gsap.from('.hero-visual', {
        opacity: 0,
        scale: 0.95,
        duration: 1,
        delay: 0.4,
        ease: 'power3.out',
      });

      // Floating animation for visual elements
      gsap.to('.float-element', {
        y: -15,
        duration: 2.5,
        yoyo: true,
        repeat: -1,
        ease: 'power1.inOut',
        stagger: 0.3,
      });
    }, heroRef);

    // Animate stats counters
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
      animateCounter(99.9, 'uptime');
    }, 1000);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={heroRef}
      className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl float-element" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl float-element" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-400/5 rounded-full blur-3xl float-element" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-6">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Trusted by 2,500+ Enterprises
              </span>
            </div>

            {/* Headline */}
            <h1 className="hero-title text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight mb-6">
              <span className="text-gray-900 dark:text-white">Transform</span>{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Legacy Systems
              </span>{' '}
              <span className="text-gray-900 dark:text-white">into AI Powerhouses</span>
            </h1>

            {/* Description */}
            <p className="hero-description text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
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
            <div className="hero-stats flex flex-wrap gap-4 justify-center lg:justify-start text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Right column - Visual */}
          <div className="hero-visual relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              {/* Terminal-style interface */}
              <div className="bg-gray-900 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-gray-400 ml-4">AI Nexus Query Interface</span>
              </div>

              <div className="p-6 space-y-4 bg-gradient-to-br from-gray-950 to-blue-950 text-white min-h-[400px]">
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">You:</div>
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 text-sm">
                    Show me top 10 customers by revenue this quarter
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-gray-400">AI Nexus:</div>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span>Connected to Oracle ERP</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Acme Corp</span>
                        <span className="text-blue-400 font-mono">$2.4M</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">TechStart Inc</span>
                        <span className="text-blue-400 font-mono">$1.8M</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Global Systems</span>
                        <span className="text-blue-400 font-mono">$1.5M</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">+ 7 more...</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span>Query executed in 0.3s</span>
                </div>
              </div>
            </div>

            {/* Floating stat cards */}
            <div className="absolute -top-6 -left-6 float-element">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-medium text-gray-900 dark:text-white">{stats.queries.toLocaleString()}+</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Queries Processed</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 float-element" style={{ animationDelay: '0.5s' }}>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-medium text-gray-900 dark:text-white">{stats.uptime}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Uptime SLA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live stats bar */}
        <div className="hero-stats mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-medium text-gray-900 dark:text-white mb-1">
              {stats.companies.toLocaleString()}+
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Companies Trust Us</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-medium text-gray-900 dark:text-white mb-1">
              64
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Systems Supported</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-medium text-gray-900 dark:text-white mb-1">
              {stats.savings}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Time Saved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-medium text-gray-900 dark:text-white mb-1">
              24/7
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Expert Support</div>
          </div>
        </div>
      </div>
    </div>
  );
}
