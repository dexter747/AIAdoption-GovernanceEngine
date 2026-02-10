'use client';

import { useEffect, useRef } from 'react';
import { Shield, Award, Lock, CheckCircle2, Globe, Users, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface TrustBadge {
  icon: LucideIcon;
  title: string;
  description: string;
}

const trustBadges: TrustBadge[] = [
  {
    icon: Shield,
    title: 'SOC 2 Type II',
    description: 'Independently audited security controls',
  },
  {
    icon: Lock,
    title: 'GDPR Compliant',
    description: 'Full EU data protection compliance',
  },
  {
    icon: CheckCircle2,
    title: 'HIPAA Ready',
    description: 'Healthcare data protection certified',
  },
  {
    icon: Award,
    title: 'ISO 27001',
    description: 'International security standard',
  },
  {
    icon: Globe,
    title: '99.9% Uptime',
    description: 'Enterprise-grade reliability SLA',
  },
  {
    icon: Users,
    title: '2,500+ Enterprises',
    description: 'Trusted by Fortune 500 companies',
  },
];

// Mock company logos (in production, use actual logo images)
const companies = [
  'TechCorp Global',
  'SecureBank',
  'RetailCo',
  'FinanceHub',
  'HealthTech Solutions',
  'DataFlow Industries',
  'Enterprise Systems Inc',
  'Global Manufacturing Co',
];

export function TrustSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const logosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Animate badges
      if (badgesRef.current) {
        const badges = badgesRef.current.querySelectorAll('.trust-badge');
        gsap.from(badges, {
          scrollTrigger: {
            trigger: badgesRef.current,
            start: 'top 80%',
          },
          y: 20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out',
        });
      }

      // Animate logos
      if (logosRef.current) {
        const logos = logosRef.current.querySelectorAll('.company-logo');
        gsap.from(logos, {
          scrollTrigger: {
            trigger: logosRef.current,
            start: 'top 80%',
          },
          y: 15,
          opacity: 0,
          duration: 0.4,
          stagger: 0.04,
          ease: 'power2.out',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 bg-gray-50 dark:bg-gray-900/50"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Trust badges */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-medium text-black dark:text-white mb-3">
              Enterprise-grade{' '}
              <span className="text-blue-500">
                security & compliance
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Built for the world's most security-conscious organizations
            </p>
          </div>

          <div ref={badgesRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <Card 
                  key={badge.title}
                  className="trust-badge border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300"
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-medium text-sm text-black dark:text-white mb-1">
                      {badge.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                      {badge.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Company logos */}
        <div>
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Trusted by leading enterprises
            </p>
          </div>

          <div ref={logosRef} className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
            {companies.map((company) => (
              <div 
                key={company}
                className="company-logo px-6 py-4 text-center"
              >
                <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {company}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security statement */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <Lock className="w-6 h-6 text-blue-500" />
            <div className="text-left">
              <div className="font-medium text-black dark:text-white">
                Your data never leaves your infrastructure
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Zero-knowledge architecture with AES-256-GCM encryption. Air-gapped deployment available.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrustSection;
