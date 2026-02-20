'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const plans = [
  {
    name: 'Trial',
    price: { monthly: 0, yearly: 0 },
    description: '14-day free trial',
    features: [
      '100 AI queries',
      '1 database connection',
      'Basic support',
      'All AI providers',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: { monthly: 49, yearly: 490 },
    description: 'Perfect for individuals',
    features: [
      'Unlimited AI queries',
      'Unlimited database connections',
      '2 devices',
      'Priority support',
      'All AI providers',
      'Cost tracking & analytics',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Team',
    price: { monthly: 199, yearly: 1990 },
    description: 'For small teams',
    features: [
      'Everything in Professional',
      '5 users',
      '5 devices per user',
      'Shared connections',
      'Team analytics',
      'Dedicated support',
    ],
    cta: 'Start Team Plan',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: { monthly: null, yearly: null },
    description: 'For large organizations',
    features: [
      'Everything in Team',
      'Unlimited users',
      'Unlimited devices',
      'SSO integration',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleSubscribe = async (planName: string) => {
    if (planName === 'Enterprise') {
      window.location.href = 'mailto:sales@velanova.com?subject=Enterprise Plan Inquiry';
      return;
    }

    setLoading(planName);

    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: planName.toLowerCase(),
          billingCycle,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-gray-800 to-zinc-950">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-medium text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-zinc-500 mb-8">
            Start with a 14-day free trial. No credit card required.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-zinc-900 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-white'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-white text-white'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-zinc-800 text-white px-2 py-1 rounded">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-zinc-900 rounded-2xl p-8 ${
                plan.popular
                  ? 'ring-2 ring-zinc-600 shadow-2xl shadow-white/5'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-zinc-800 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-medium text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-zinc-500 text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-8">
                {plan.price[billingCycle] !== null ? (
                  <>
                    <span className="text-5xl font-medium text-white">
                      ${plan.price[billingCycle]}
                    </span>
                    <span className="text-zinc-500 ml-2">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-medium text-white">
                    Custom Pricing
                  </span>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-zinc-300 mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-zinc-400 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.name)}
                disabled={loading !== null}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                  plan.popular
                    ? 'bg-white hover:bg-zinc-200 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-800 text-white'
                } ${loading === plan.name ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading === plan.name ? 'Loading...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-medium text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-zinc-500">
                Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.
              </p>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-zinc-500">
                We accept all major credit cards via Dodo Payments. Enterprise customers can pay via invoice.
              </p>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">
                Is my data secure?
              </h3>
              <p className="text-zinc-500">
                Absolutely! Your legacy system data never leaves your infrastructure. All credentials are encrypted with AES-256-GCM.
              </p>
            </div>

            <div className="bg-zinc-900 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-zinc-500">
                Yes! You can change your plan at any time. Upgrades take effect immediately, while downgrades apply at the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
