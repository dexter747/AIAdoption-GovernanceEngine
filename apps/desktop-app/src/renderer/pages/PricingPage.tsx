import { Check, ExternalLink, Sparkles, Building2, Rocket } from 'lucide-react';
import { cn } from '../lib/utils';

const plans = [
  {
    name: 'Starter',
    icon: Rocket,
    price: '$0',
    period: '/ 14-day trial',
    description: 'Perfect for trying out the platform',
    features: [
      '1 device license',
      '100 queries per month',
      'All AI model providers',
      'Basic database connectors',
      'Email support',
      '7-day data retention',
    ],
    cta: 'Download Free',
    ctaAction: 'download',
    highlighted: false,
  },
  {
    name: 'Professional',
    icon: Sparkles,
    price: '$199',
    period: '/ month per user',
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
    ],
    cta: 'Start 14-Day Trial',
    ctaAction: 'subscribe',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: 'Custom',
    period: '',
    description: 'For organisations with complex needs',
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
      'SLA guarantees & training',
    ],
    cta: 'Contact Sales',
    ctaAction: 'contact',
    highlighted: false,
  },
];

function SecurePaymentsBadge() {
  return (
    <div className="flex items-center justify-center gap-2.5 flex-wrap">
      <span className="text-[11px] text-white/25 font-medium">Secure Payments By</span>
      <img src="/paypal.svg" alt="PayPal" className="h-5 object-contain opacity-50 hover:opacity-80 transition-opacity" />
      <span className="text-white/20 text-[11px]">&amp;</span>
      <img src="/lemonsqueezy.svg" alt="Lemon Squeezy" className="h-4 object-contain opacity-50 hover:opacity-80 transition-opacity" />
    </div>
  );
}

export default function PricingPage() {
  const open = (url: string) => window.electron?.system.openExternal(url);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 app-region-no-drag select-none">Pricing</h1>
        <div className="w-px h-4 bg-white/[0.08] mx-3" />
        <span className="text-[11px] text-white/30 app-region-no-drag">Start free · No credit card required · Cancel anytime</span>
      </div>

      <div className="flex-1 overflow-auto bg-[#0b0b0b] p-6">
        {/* Plans grid */}
        <div className="grid grid-cols-3 gap-4 max-w-5xl">
          {plans.map(plan => {
            const Icon = plan.icon;
            return (
              <div key={plan.name}
                className={cn('relative flex flex-col rounded-xl border p-5 transition-all',
                  plan.highlighted
                    ? 'border-white/25 bg-white/[0.06] shadow-lg shadow-white/[0.04] ring-1 ring-white/15'
                    : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]'
                )}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 text-[10px] font-medium px-3 py-1 bg-white text-black rounded-bl-lg rounded-tr-xl tracking-wide">
                    MOST POPULAR
                  </div>
                )}

                <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center mb-4">
                  <Icon className="w-4.5 h-4.5 text-white/40" size={18} />
                </div>

                <h3 className="text-[14px] font-medium text-white mb-0.5">{plan.name}</h3>
                <p className="text-[11px] text-white/35 mb-4">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-[28px] font-medium text-white tracking-tight">{plan.price}</span>
                  {plan.period && <span className="text-[11px] text-white/35">{plan.period}</span>}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-[11.5px]">
                      <Check className="w-3.5 h-3.5 text-white/30 flex-shrink-0 mt-0.5" />
                      <span className="text-white/55">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    if (plan.ctaAction === 'download') open('https://velanova.ai/download');
                    else if (plan.ctaAction === 'subscribe') open('https://velanova.ai/subscribe?plan=pro');
                    else open('https://velanova.ai/contact');
                  }}
                  className={cn('w-full py-2 rounded-[6px] text-[12px] font-medium transition-all flex items-center justify-center gap-1.5',
                    plan.highlighted
                      ? 'bg-white text-black hover:bg-zinc-200'
                      : 'border border-white/[0.09] text-white/60 hover:border-white/20 hover:bg-white/[0.04]'
                  )}
                >
                  {plan.cta}
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Secure Payments */}
        <div className="mt-8 py-5 border-t border-white/[0.05]">
          <SecurePaymentsBadge />
        </div>

        <div className="mt-3 pb-2 text-center">
          <p className="text-[11px] text-white/25">
            Need a custom plan?{' '}
            <button onClick={() => open('https://velanova.ai/contact')}
              className="text-white/40 hover:text-white/60 underline underline-offset-2 transition-colors">
              Contact sales
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
