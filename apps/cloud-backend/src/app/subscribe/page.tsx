'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading subscription plans...</p>
      </div>
    </div>
  );
}

function SubscribeContent() {
  const searchParams = useSearchParams();
  const defaultPlan = searchParams.get('plan') || 'professional';
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = async (plan: string) => {
    // In production, this would redirect to payment gateway
    window.location.href = `/checkout?plan=${plan}&period=${billingPeriod}`;
  };

  const plans = {
    professional: {
      name: 'Professional',
      monthly: 49,
      yearly: 490,
      features: [
        '3 devices',
        'Unlimited AI queries',
        'All 10 AI providers',
        'All 10 legacy system connectors',
        'Priority email support',
        'Usage analytics dashboard',
      ],
    },
    team: {
      name: 'Team',
      monthly: 199,
      yearly: 1990,
      features: [
        '10 devices',
        'Unlimited AI queries',
        'All AI providers',
        'All legacy connectors',
        'Team collaboration features',
        'Shared connection library',
        'Dedicated support channel',
        'Advanced analytics',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      monthly: null,
      yearly: null,
      features: [
        'Unlimited devices',
        'Unlimited queries',
        'All features included',
        'On-premise deployment option',
        'White-label customization',
        'SSO integration',
        'Custom SLA',
        'Dedicated account manager',
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-medium">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-medium mb-6 text-center">Choose Your Plan</h1>
          <p className="text-xl text-gray-400 mb-12 text-center">
            Start with a 14-day free trial. No credit card required.
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-900 rounded-full p-1 border-2 border-gray-700 inline-flex">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(plans).map(([key, plan]) => {
              const price = billingPeriod === 'monthly' ? plan.monthly : plan.yearly;
              const isEnterprise = key === 'enterprise';

              return (
                <div
                  key={key}
                  className={`bg-card rounded-2xl p-8 border border-border ${
                    key === 'professional' ? 'border-4 border-blue-600 relative' : ''
                  }`}
                >
                  {key === 'professional' && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-medium mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    {isEnterprise ? (
                      <div>
                        <span className="text-4xl font-medium">Custom</span>
                        <p className="text-gray-400 mt-2">Contact us for pricing</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-5xl font-medium">${price}</span>
                        <span className="text-gray-400">
                          /{billingPeriod === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(key)}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      key === 'professional'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {isEnterprise ? 'Contact Sales' : 'Subscribe Now'}
                  </button>

                  {!isEnterprise && (
                    <p className="text-center text-sm text-gray-400 mt-4">
                      14-day free trial included
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* FAQ */}
          <div className="mt-20">
            <h2 className="text-3xl font-medium text-center mb-12">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-medium mb-2">Can I change plans later?</h3>
                <p className="text-gray-400 text-sm">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect
                  immediately.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-medium mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-400 text-sm">
                  We accept PayPal globally, and Razorpay for India (UPI, cards, net banking).
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-medium mb-2">Is my data secure?</h3>
                <p className="text-gray-400 text-sm">
                  Yes! Your data stays on your infrastructure. We only receive anonymized usage
                  metadata.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-medium mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-400 text-sm">
                  Absolutely. Cancel anytime from your account dashboard. No questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SubscribeContent />
    </Suspense>
  );
}
