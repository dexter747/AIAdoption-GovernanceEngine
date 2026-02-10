'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Check, Sparkles, Building2, Rocket, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface PricingTier {
  name: string;
  icon: any;
  price: string;
  period?: string;
  description: string;
  features: string[];
  notIncluded?: string[];
  cta: string;
  ctaLink: string;
  highlighted?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    icon: Rocket,
    price: '$0',
    period: '/14 days',
    description: 'Perfect for trying out the platform',
    features: [
      '1 device license',
      '100 queries per month',
      'All AI model providers',
      'Basic database connectors',
      'Email support',
      '7-day data retention',
    ],
    notIncluded: [
      'Advanced analytics',
      'Custom workflows',
      'API access',
    ],
    cta: 'Start Free Trial',
    ctaLink: '/download',
  },
  {
    name: 'Professional',
    icon: Sparkles,
    price: '$199',
    period: '/month per user',
    description: 'For teams that need unlimited power',
    features: [
      'Up to 10 device licenses',
      'Unlimited queries',
      'All 64+ system connectors',
      'All AI model providers',
      'Advanced analytics & dashboards',
      'Custom workflows & automation',
      'Priority support (4h SLA)',
      'API access & webhooks',
      '90-day data retention',
      'SSO integration',
      'Custom reports',
    ],
    cta: 'Start 14-Day Trial',
    ctaLink: '/subscribe?plan=pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: 'Custom',
    description: 'For organizations with complex needs',
    features: [
      'Unlimited device licenses',
      'Unlimited everything',
      'All Professional features',
      'On-premise / air-gapped deployment',
      'White-label & custom branding',
      'Dedicated account manager',
      '24/7 phone support (1h SLA)',
      'Custom integrations & development',
      'Unlimited data retention',
      'SOC 2 Type II compliance',
      'SLA guarantees',
      'Training & onboarding',
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact',
  },
];

export function PricingSection() {
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

      // Stagger animate pricing cards
      const cards = cardsRef.current?.querySelectorAll('.pricing-card');
      if (cards) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 70%',
          },
          y: 50,
          opacity: 0,
          duration: 0.6,
          stagger: 0.15,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="pricing" 
      className="relative py-24 bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-gray-950 dark:via-indigo-950/10 dark:to-gray-950"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-gray-100/[0.02]" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Simple, Transparent Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-medium text-black dark:text-white mb-4">
            Plans that{' '}
            <span className="text-blue-500">
              scale with you
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Start free. Upgrade when you're ready. No hidden fees. Cancel anytime.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card
                key={tier.name}
                className={cn(
                  'pricing-card relative overflow-hidden transition-all duration-300',
                  tier.highlighted
                    ? 'border-2 border-blue-500 dark:border-blue-400 shadow-xl shadow-blue-500/20 scale-105 md:scale-110'
                    : 'border-gray-200 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1'
                )}
              >
                {/* Most popular badge */}
                {tier.highlighted && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-medium px-4 py-1.5 rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-medium text-black dark:text-white">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {tier.description}
                  </p>
                  
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-5xl font-medium text-black dark:text-white">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        {tier.period}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pb-6">
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                    {tier.notIncluded?.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm opacity-50">
                        <X className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-400" />
                        <span className="text-gray-500 dark:text-gray-500 line-through">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Link
                    href={tier.ctaLink}
                    className={cn(
                      'w-full text-center py-3 rounded-lg font-medium text-sm transition-all duration-300',
                      tier.highlighted
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'border-2 border-gray-200 dark:border-gray-700 text-black dark:text-white hover:border-blue-500 dark:hover:border-blue-400'
                    )}
                  >
                    {tier.cta}
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            All plans include 14-day free trial • No credit card required • Cancel anytime
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Check className="w-4 h-4 text-blue-500" />
              SOC 2 Certified
            </span>
            <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Check className="w-4 h-4 text-blue-500" />
              GDPR Compliant
            </span>
            <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Check className="w-4 h-4 text-blue-500" />
              99.9% Uptime SLA
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
