import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
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
    <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          badge="Pricing"
          badgeColor="green"
          title="Simple, transparent pricing"
          description="No hidden fees. Cancel anytime. Start free."
        />

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({ tier }: { tier: PricingTier }) {
  const { name, price, period, features, cta, ctaLink, highlighted } = tier;

  if (highlighted) {
    return (
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-2xl shadow-blue-500/25 hover:-translate-y-2 transition-all">
        <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full text-sm font-semibold shadow-lg">
          Most Popular
        </div>
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-5xl font-bold">{price}</span>
          {period && <span className="text-blue-200">{period}</span>}
        </div>
        <ul className="space-y-4 mb-8">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-blue-100">
              <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Link
          href={ctaLink}
          className="block w-full text-center py-3.5 rounded-xl font-semibold bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow-lg"
        >
          {cta}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-5xl font-bold text-gray-900">{price}</span>
        {period && <span className="text-gray-500">{period}</span>}
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-gray-600">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={ctaLink}
        className="block w-full text-center py-3.5 rounded-xl font-semibold border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
      >
        {cta}
      </Link>
    </div>
  );
}
