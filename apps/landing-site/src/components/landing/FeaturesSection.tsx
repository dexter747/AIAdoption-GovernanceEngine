'use client';

import { useEffect, useRef } from 'react';
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
  Timer
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  metric?: string;
}

const features: Feature[] = [
  {
    icon: Database,
    title: '64+ System Connectors',
    description: 'Connect to any database, ERP, CRM, or legacy system. PostgreSQL, Oracle, SAP, Salesforce, and 60+ more.',
    metric: '95% Compatibility',
  },
  {
    icon: Cpu,
    title: 'Multi-Model AI Engine',
    description: 'Leverage GPT-4, Claude 3.5, Gemini, Mistral, or your private models. Automatic failover and load balancing.',
    metric: '99.9% Uptime',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'SOC 2 Type II, HIPAA, GDPR compliant. Zero-knowledge architecture with AES-256-GCM encryption.',
    metric: 'Military Grade',
  },
  {
    icon: MessageSquare,
    title: 'Natural Language Interface',
    description: 'Ask complex questions in plain English. AI translates to SQL, GraphQL, or API calls automatically.',
    metric: '89% Time Saved',
  },
  {
    icon: Zap,
    title: 'Real-Time Processing',
    description: 'Sub-second query execution with intelligent caching. Handle millions of concurrent queries.',
    metric: '<200ms Latency',
  },
  {
    icon: Shield,
    title: 'Bring Your Own Keys',
    description: 'Use your own API keys for complete cost control and compliance. No vendor lock-in.',
    metric: '100% Control',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Built-in dashboards, custom reports, and data visualization. Export to Excel, PDF, or BI tools.',
    metric: 'Instant Insights',
  },
  {
    icon: FileSearch,
    title: 'Intelligent Search',
    description: 'Semantic search across all connected systems. Find data relationships you never knew existed.',
    metric: '10x Faster Discovery',
  },
  {
    icon: Workflow,
    title: 'Workflow Automation',
    description: 'Create multi-step workflows triggered by queries. Automate reports, alerts, and data sync.',
    metric: '70% Less Manual Work',
  },
  {
    icon: Timer,
    title: 'Query Scheduling',
    description: 'Schedule recurring queries and automated reports. Morning dashboards delivered to your inbox.',
    metric: 'Set & Forget',
  },
  {
    icon: Cloud,
    title: 'Hybrid Deployment',
    description: 'On-premise, cloud, or air-gapped. Desktop app for local processing, cloud for collaboration.',
    metric: 'Maximum Flexibility',
  },
  {
    icon: Layers,
    title: 'Plugin Ecosystem',
    description: 'Extend with custom connectors, AI models, and business logic. Active marketplace and SDK.',
    metric: '500+ Extensions',
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !cardsRef.current) return;

    const ctx = gsap.context(() => {
      // Animate header
      gsap.from(headerRef.current, {
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 80%',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
      });

      // Stagger animate cards
      const cards = cardsRef.current?.querySelectorAll('.feature-card');
      if (cards) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
          },
          y: 30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      id="features" 
      className="relative py-24 bg-white dark:bg-black"
    >
      <div className="relative max-w-7xl mx-auto px-6">
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Enterprise Features
          </div>
          <h2 className="text-4xl md:text-5xl font-medium text-black dark:text-white mb-4">
            Everything you need to{' '}
            <span className="text-blue-500">
              transform your enterprise
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            A complete AI-powered platform to unlock the value in your legacy systems. 
            Deploy in 24 hours, see ROI in 30 days.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title} 
                className="feature-card group relative border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300"
              >
                <CardContent className="p-6">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                    {feature.description}
                  </p>

                  {/* Metric badge */}
                  {feature.metric && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {feature.metric}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Ready to see how it works?
          </p>
          <a 
            href="#demo" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all duration-300"
          >
            <Zap className="w-5 h-5" />
            Watch 2-Minute Demo
          </a>
        </div>
      </div>
    </section>
  );
}
