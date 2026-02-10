import Link from 'next/link';
import { Check } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { cn } from '@/lib/utils';

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  features: string[];
  cta: string;
  ctaLink: string;
  highlighted?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: '$0',
    period: '/14 days',
    features: ['1 device', '100 queries/month', 'All AI providers', 'Community support'],
    cta: 'Start Free Trial',
    ctaLink: '/download',
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/month',
    features: ['3 devices', 'Unlimited queries', 'All AI providers', 'Priority support', 'Advanced analytics'],
    cta: 'Get Started',
    ctaLink: '/subscribe?plan=pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: ['Unlimited devices', 'On-premise option', 'White-label', 'Dedicated support', 'Custom integrations'],
    cta: 'Contact Sales',
    ctaLink: '/contact',
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          badge="Pricing"
          title="Simple, transparent pricing"
          description="No hidden fees. Cancel anytime. Start free."
        />

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                'rounded-xl p-6 transition-colors',
                tier.highlighted
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
              )}
            >
              {tier.highlighted && (
                <div className="text-xs font-medium bg-white/20 rounded px-2 py-0.5 inline-block mb-3">
                  Most Popular
                </div>
              )}
              <h3 className={cn(
                'text-lg font-semibold mb-1',
                tier.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'
              )}>{tier.name}</h3>
              <div className="flex items-baseline gap-0.5 mb-5">
                <span className={cn(
                  'text-4xl font-semibold',
                  tier.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'
                )}>{tier.price}</span>
                {tier.period && (
                  <span className={cn(
                    'text-sm font-medium',
                    tier.highlighted ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'
                  )}>{tier.period}</span>
                )}
              </div>
              <ul className="space-y-3 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className={cn(
                    'flex items-center gap-2.5 text-sm font-medium',
                    tier.highlighted ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                  )}>
                    <Check className={cn(
                      'w-4 h-4 flex-shrink-0',
                      tier.highlighted ? 'text-white' : 'text-blue-500'
                    )} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.ctaLink}
                className={cn(
                  'block w-full text-center py-2.5 rounded-lg font-medium text-sm transition-colors',
                  tier.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
