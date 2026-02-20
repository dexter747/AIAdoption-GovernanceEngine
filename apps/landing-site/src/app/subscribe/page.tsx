'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, ArrowLeft, CheckCircle2, Zap, Users, Building2, ChevronDown } from 'lucide-react';

function SubscribeContent() {
  const searchParams = useSearchParams();
  // normalize incoming ?plan= value — 'pro' and 'professional' both map to 'professional'
  const rawPlan = searchParams.get('plan') || 'professional';
  const PLAN_ALIASES: Record<string, string> = { pro: 'professional', starter: 'trial', free: 'trial' };
  const initialPlan = PLAN_ALIASES[rawPlan] ?? (rawPlan in { trial: 1, professional: 1, team: 1, enterprise: 1 } ? rawPlan : 'professional');
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [showFAQ, setShowFAQ] = useState<string | null>(null);

  const plans = {
    trial: {
      name: 'Free Trial',
      icon: <Zap className="w-6 h-6" />,
      monthlyPrice: 0,
      annualPrice: 0,
      description: '14 days, no card required',
      features: [
        '1 data source connection',
        '100 queries per month',
        'GPT-4o Mini & Groq models',
        'Community support',
        'Basic documentation',
      ],
      cta: 'Download Free',
      popular: false,
    },
    professional: {
      name: 'Professional',
      icon: <Sparkles className="w-6 h-6" />,
      monthlyPrice: 49,
      annualPrice: 39,
      description: 'For individuals and power users',
      features: [
        'Unlimited data source connections',
        'Unlimited queries',
        'All AI providers — GPT-5, Claude, Gemini, Grok',
        'BYOK — bring your own API keys',
        'Priority email support',
        'Full chat & query history',
        'Export to CSV/JSON',
        'Custom AI prompts',
      ],
      cta: 'Start 14-Day Trial',
      popular: true,
    },
    team: {
      name: 'Team',
      icon: <Users className="w-6 h-6" />,
      monthlyPrice: 199,
      annualPrice: 159,
      description: 'For growing teams',
      features: [
        'Everything in Professional',
        'Up to 10 team members',
        'Shared connections & contexts',
        'Team analytics dashboard',
        'Admin controls & permissions',
        'SSO support',
        'Dedicated Slack support',
        'Query history (unlimited)',
      ],
      cta: 'Start 14-Day Trial',
      popular: false,
    },
    enterprise: {
      name: 'Enterprise',
      icon: <Building2 className="w-6 h-6" />,
      monthlyPrice: null,
      annualPrice: null,
      description: 'For large organizations',
      features: [
        'Unlimited data sources',
        'Unlimited queries',
        'Unlimited team members',
        'On-premise deployment option',
        'Custom integrations',
        'Dedicated support manager',
        'SLA guarantee (99.9%)',
        'Advanced security features',
        'Custom AI model training',
        'Audit logs',
        'Air-gapped deployment',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  };

  const faqs = [
    {
      id: 'trial',
      question: 'How does the free trial work?',
      answer: 'Start your 14-day free trial with no credit card required. You\'ll have full access to all Pro features. If you don\'t upgrade before the trial ends, you\'ll be moved to the Free plan.',
    },
    {
      id: 'cancel',
      question: 'Can I cancel anytime?',
      answer: 'Yes! You can cancel your subscription at any time. You\'ll retain access until the end of your current billing period.',
    },
    {
      id: 'upgrade',
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Absolutely. You can change your plan at any time. Upgrades take effect immediately (prorated). Downgrades take effect at the next billing cycle.',
    },
    {
      id: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. Enterprise customers can pay via invoice.',
    },
    {
      id: 'refund',
      question: 'What\'s your refund policy?',
      answer: 'We offer a 30-day money-back guarantee on your first payment. If you\'re not satisfied, contact us for a full refund.',
    },
  ];

  const currentPlan = plans[selectedPlan as keyof typeof plans];
  // guard: if somehow selectedPlan is still unmapped, fall back to professional
  if (!currentPlan) {
    setSelectedPlan('professional');
    return null;
  }
  const price = billingCycle === 'annual' ? currentPlan.annualPrice : currentPlan.monthlyPrice;
  const savings = billingCycle === 'annual' && currentPlan.monthlyPrice 
    ? Math.round((1 - (currentPlan.annualPrice! / currentPlan.monthlyPrice)) * 100)
    : 0;

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-medium text-foreground mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, scale as you grow. All plans include a 14-day trial.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              billingCycle === 'monthly' 
                ? 'bg-primary text-white' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              billingCycle === 'annual' 
                ? 'bg-primary text-white' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Annual
            <span className="text-xs bg-zinc-800 text-white px-2 py-0.5 rounded-full">Save 20%</span>
          </button>
        </div>

        {/* Plan Selection */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {Object.entries(plans).map(([key, plan]) => (
            <button
              key={key}
              onClick={() => setSelectedPlan(key)}
              className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                selectedPlan === key 
                  ? 'border-primary bg-primary/5 shadow-lg' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                  MOST POPULAR
                </span>
              )}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                selectedPlan === key ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
              }`}>
                {plan.icon}
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
              <div>
                {plan.monthlyPrice !== null ? (
                  <>
                    <span className="text-3xl font-medium text-foreground">
                      ${billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/mo</span>
                  </>
                ) : (
                  <span className="text-2xl font-medium text-foreground">Custom</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Plan Details */}
        <div className="bg-muted/30 border border-border rounded-2xl p-8 mb-12">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center">
                  {currentPlan.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-medium text-foreground">{currentPlan.name}</h2>
                  <p className="text-muted-foreground">{currentPlan.description}</p>
                </div>
              </div>

              {price !== null ? (
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-medium text-foreground">${price}</span>
                    <span className="text-muted-foreground">/month</span>
                    {billingCycle === 'annual' && (
                      <span className="text-muted-foreground text-sm">(billed annually)</span>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="text-zinc-300 text-sm mt-1">
                      Save {savings}% with annual billing (${currentPlan.monthlyPrice! * 12 - currentPlan.annualPrice! * 12}/year)
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-6">
                  <span className="text-4xl font-medium text-foreground">Custom Pricing</span>
                  <p className="text-muted-foreground mt-1">Tailored to your organization&apos;s needs</p>
                </div>
              )}

              <Link
                href={selectedPlan === 'enterprise' ? '/contact' : selectedPlan === 'trial' ? '/download' : '/login'}
                className="inline-flex items-center justify-center w-full lg:w-auto px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium text-lg"
              >
                {currentPlan.cta}
              </Link>

              <p className="text-sm text-muted-foreground mt-4">
                {selectedPlan === 'trial' 
                  ? 'No credit card required' 
                  : selectedPlan === 'enterprise'
                  ? "We'll get back to you within 24 hours"
                  : 'No credit card required for trial'}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-4">What&apos;s included:</h3>
              <ul className="space-y-3">
                {currentPlan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-medium text-foreground text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowFAQ(showFAQ === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium text-foreground">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showFAQ === faq.id ? 'rotate-180' : ''}`} />
                </button>
                {showFAQ === faq.id && (
                  <div className="px-6 pb-4">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">Secure payments powered by</p>
          <div className="flex items-center justify-center gap-8 opacity-60">
            <span className="text-lg font-medium text-muted-foreground">Stripe</span>
            <span className="text-lg font-medium text-muted-foreground">PayPal</span>
            <span className="text-lg font-medium text-muted-foreground">256-bit SSL</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-xl font-medium bg-gradient-to-r from-primary to-zinc-600 bg-clip-text text-transparent">Velanova</span>
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center">Loading...</div>}>
        <SubscribeContent />
      </Suspense>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© 2025 Velanova. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
            <Link href="/refund" className="text-sm text-muted-foreground hover:text-foreground">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
