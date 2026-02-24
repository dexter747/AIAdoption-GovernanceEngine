'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Database,
  Cpu,
  Lock,
  MessageSquare,
  Cloud,
  Layers,
  LucideIcon,
  Zap,
  Shield,
  BarChart3,
  FileSearch,
  Workflow,
  Timer,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  metric?: string;
}

const features: Feature[] = [
  {
    icon: Database,
    title: '200+ System Connectors',
    description:
      'Connect to any database, ERP, CRM, or legacy system. PostgreSQL, Oracle, SAP, Salesforce, and 60+ more.',
    metric: '95% Compatibility',
  },
  {
    icon: Cpu,
    title: 'Multi-Model AI Engine',
    description:
      'Leverage GPT-4, Claude 3.5, Gemini, Mistral, or your private models. Automatic failover and load balancing.',
    metric: '99.9% Uptime',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description:
      'SOC 2 Type II, HIPAA, GDPR compliant. Zero-knowledge architecture with AES-256-GCM encryption.',
    metric: 'Military Grade',
  },
  {
    icon: MessageSquare,
    title: 'Natural Language Interface',
    description:
      'Ask complex questions in plain English. AI translates to SQL, GraphQL, or API calls automatically.',
    metric: '89% Time Saved',
  },
  {
    icon: Zap,
    title: 'Real-Time Processing',
    description:
      'Sub-second query execution with intelligent caching. Handle millions of concurrent queries.',
    metric: '<200ms Latency',
  },
  {
    icon: Shield,
    title: 'Bring Your Own Keys',
    description:
      'Use your own API keys for complete cost control and compliance. No vendor lock-in.',
    metric: '100% Control',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description:
      'Built-in dashboards, custom reports, and data visualization. Export to Excel, PDF, or BI tools.',
    metric: 'Instant Insights',
  },
  {
    icon: FileSearch,
    title: 'Intelligent Search',
    description:
      'Semantic search across all connected systems. Find data relationships you never knew existed.',
    metric: '10x Faster Discovery',
  },
  {
    icon: Workflow,
    title: 'Workflow Automation',
    description:
      'Create multi-step workflows triggered by queries. Automate reports, alerts, and data sync.',
    metric: '70% Less Manual Work',
  },
  {
    icon: Timer,
    title: 'Query Scheduling',
    description:
      'Schedule recurring queries and automated reports. Morning dashboards delivered to your inbox.',
    metric: 'Set & Forget',
  },
  {
    icon: Cloud,
    title: 'Hybrid Deployment',
    description:
      'On-premise, cloud, or air-gapped. Desktop app for local processing, cloud for collaboration.',
    metric: 'Maximum Flexibility',
  },
  {
    icon: Layers,
    title: 'Plugin Ecosystem',
    description:
      'Extend with custom connectors, AI models, and business logic. Active marketplace and SDK.',
    metric: '500+ Extensions',
  },
];

export function FeaturesSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feat-header > *', {
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: '.feat-header', start: 'top 85%', once: true },
      });

      gsap.from('.feat-card', {
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.06,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: '.feat-grid', start: 'top 85%', once: true },
      });

      gsap.from('.feat-cta', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: '.feat-cta', start: 'top 90%', once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={ref} className="relative py-16 bg-black">
      {/* Subtle dot grid */}
      <div className="absolute inset-0 dot-grid opacity-30" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="feat-header text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-5 bg-white/[0.03] border-white/[0.08]">
            <Zap className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-500">Enterprise Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-5 text-white">
            Everything You Need To <span className="text-shimmer">Transform Your Enterprise</span>
          </h2>
          <p className="text-lg text-zinc-500 leading-relaxed">
            A complete AI-powered platform to unlock the value in your legacy systems. Deploy in 24
            hours, see ROI in 30 days.
          </p>
        </div>

        <div className="feat-grid grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(feature => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="feat-card border-beam group relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.10] hover:bg-white/[0.04] transition-all duration-500 card-hover"
              >
                <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                  <Icon className="w-5 h-5 text-zinc-400" />
                </div>

                <h3 className="text-base font-medium mb-2 text-white tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed mb-4 text-zinc-500">{feature.description}</p>

                {feature.metric && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                    <span className="text-xs font-medium text-zinc-500">{feature.metric}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="feat-cta mt-20 text-center">
          <p className="mb-5 text-zinc-500">Ready to see how it works?</p>
          <a
            href="#demo"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-all duration-300 shadow-lg shadow-white/5"
          >
            <Zap className="w-5 h-5" />
            Watch 2-Minute Demo
          </a>
        </div>
      </div>
    </section>
  );
}
