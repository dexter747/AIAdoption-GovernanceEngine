import { useState, useEffect } from 'react';
import {
  Check, X, Loader2, ExternalLink, Zap, Users, Building2,
  CreditCard, Calendar, ArrowRight, Star, RefreshCw,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Pricing Plans ────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'trial',
    name: 'Free Trial',
    Icon: Star,
    price: { monthly: 0, yearly: 0 },
    description: '14 days full access, no card required',
    cta: 'Current Plan',
    highlight: false,
    features: [
      '100 AI queries / month',
      '2 database connections',
      'GPT-4o Mini & Groq models',
      'Chat history (7 days)',
      'Community support',
    ],
    missing: [
      'All AI models (GPT-5, Claude, Gemini)',
      'Unlimited connections',
      'Priority support',
      'BYOK — bring your own keys',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    Icon: Zap,
    price: { monthly: 49, yearly: 468 },
    description: 'For individuals and power users',
    cta: 'Start Professional',
    highlight: true,
    features: [
      'Unlimited AI queries',
      'Unlimited DB connections',
      'All AI models — GPT-5, Claude, Gemini, Grok',
      'BYOK — bring your own API keys',
      'Full chat history',
      'File attachments & context',
      'Priority email support',
      'Early feature access',
    ],
    missing: [
      'Team collaboration',
      'Admin dashboard',
      'SSO / SAML',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    Icon: Users,
    price: { monthly: 199, yearly: 1908 },
    description: 'Everything in Pro plus team features',
    cta: 'Start Team',
    highlight: false,
    features: [
      'Everything in Professional',
      'Up to 10 team members',
      'Shared connections & contexts',
      'Team chat history',
      'Usage analytics',
      'Admin controls & permissions',
      'Dedicated Slack support',
      'Custom AI system prompts',
    ],
    missing: [
      'Unlimited team members',
      'SSO / SAML',
      'Dedicated account manager',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    Icon: Building2,
    price: { monthly: 0, yearly: 0 },
    description: 'Custom pricing for large orgs',
    cta: 'Contact Sales',
    highlight: false,
    features: [
      'Unlimited members & connections',
      'SSO / SAML / LDAP',
      'On-premise deployment',
      '99.9% uptime SLA',
      'Dedicated account manager',
      'Custom AI fine-tuning',
      'Audit logs & compliance',
      'Custom integrations & API',
    ],
    missing: [],
  },
] as const;

type PlanId = typeof PLANS[number]['id'];

const CHECKOUT_URLS: Record<string, Record<'monthly' | 'yearly', string>> = {
  professional: {
    monthly: 'https://checkout.velanova.ai/professional-monthly',
    yearly: 'https://checkout.velanova.ai/professional-yearly',
  },
  team: {
    monthly: 'https://checkout.velanova.ai/team-monthly',
    yearly: 'https://checkout.velanova.ai/team-yearly',
  },
  enterprise: {
    monthly: 'https://velanova.ai/contact',
    yearly: 'https://velanova.ai/contact',
  },
};

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  billing,
  currentPlan,
  isLoading,
  onSelect,
}: {
  plan: (typeof PLANS)[number];
  billing: 'monthly' | 'yearly';
  currentPlan: PlanId | null;
  isLoading: string | null;
  onSelect: (id: string) => void;
}) {
  const price = plan.price[billing];
  const isCurrent = currentPlan === plan.id;
  const isEnterprise = plan.id === 'enterprise';
  const yearlySaving =
    !isEnterprise && plan.price.monthly > 0
      ? Math.round((1 - plan.price.yearly / (plan.price.monthly * 12)) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative flex flex-col rounded-2xl border p-5 transition-all duration-200',
        plan.highlight
          ? 'bg-white/[0.04] border-white/[0.18] shadow-[0_0_60px_-12px_rgba(255,255,255,0.08)]'
          : 'bg-white/[0.015] border-white/[0.06] hover:border-white/[0.10] hover:bg-white/[0.025]',
        isCurrent && 'border-white/[0.14]',
      )}
    >
      {plan.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white text-black text-[11px] font-semibold tracking-wide whitespace-nowrap shadow">
          Most Popular
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
            plan.highlight ? 'bg-white/10' : 'bg-white/[0.06]',
          )}>
            <plan.Icon className="w-4 h-4 text-zinc-300" strokeWidth={1.6} />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-white">{plan.name}</h3>
            <p className="text-[11px] text-zinc-600 leading-tight">{plan.description}</p>
          </div>
        </div>

        <div className="flex items-end gap-1">
          {isEnterprise ? (
            <span className="text-2xl font-bold text-white">Custom</span>
          ) : price === 0 ? (
            <span className="text-2xl font-bold text-white">Free</span>
          ) : (
            <>
              <span className="text-2xl font-bold text-white">${price}</span>
              <span className="text-zinc-600 mb-0.5 text-[13px]">
                /{billing === 'monthly' ? 'mo' : 'yr'}
              </span>
            </>
          )}
        </div>
        {billing === 'yearly' && yearlySaving > 0 && (
          <p className="text-[11px] text-emerald-400 mt-0.5">Save {yearlySaving}% vs monthly</p>
        )}
      </div>

      <button
        onClick={() => onSelect(plan.id)}
        disabled={isCurrent || isLoading === plan.id}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 mb-4',
          isCurrent
            ? 'bg-white/[0.04] text-zinc-600 border border-white/[0.06] cursor-default'
            : plan.highlight
            ? 'bg-white text-black hover:bg-zinc-100 shadow-[0_2px_20px_-4px_rgba(255,255,255,0.15)]'
            : 'border border-white/[0.10] text-white hover:bg-white/[0.06] hover:border-white/[0.18]',
        )}
      >
        {isLoading === plan.id ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isCurrent ? (
          <><Check className="w-3.5 h-3.5" /> Current Plan</>
        ) : (
          <>{plan.cta}<ArrowRight className="w-3.5 h-3.5" /></>
        )}
      </button>

      <div className="h-px bg-white/[0.05] mb-3.5" />

      <div className="flex-1 space-y-2">
        {plan.features.map((f) => (
          <div key={f} className="flex items-start gap-2 text-[12px]">
            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="text-zinc-400 leading-snug">{f}</span>
          </div>
        ))}
        {plan.missing.map((f) => (
          <div key={f} className="flex items-start gap-2 text-[12px]">
            <X className="w-3.5 h-3.5 text-zinc-800 flex-shrink-0 mt-0.5" />
            <span className="text-zinc-700 leading-snug">{f}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState<PlanId | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  useEffect(() => {
    loadData();
    const search = window.location.search + window.location.hash;
    if (search.includes('checkout=success') || search.includes('checkout_success')) {
      showToast('success', 'Payment successful! Your plan has been upgraded.');
    }
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5500);
  };

  const loadData = async () => {
    try {
      setPageLoading(true);
      const [subResult, pyResult] = await Promise.allSettled([
        (window.electron as any).api?.getSubscription?.(),
        (window.electron as any).api?.getPaymentHistory?.(),
      ]);
      if (subResult.status === 'fulfilled' && subResult.value) {
        setCurrentPlan((subResult.value.plan as PlanId) ?? 'trial');
      } else {
        setCurrentPlan('trial');
      }
      if (pyResult.status === 'fulfilled' && Array.isArray(pyResult.value)) {
        setPayments(pyResult.value);
      }
    } catch {
      setCurrentPlan('trial');
    } finally {
      setPageLoading(false);
    }
  };

  const handleSelect = async (planId: string) => {
    if (planId === currentPlan) return;
    setIsLoading(planId);
    try {
      let url: string | null = null;
      try {
        const r = await (window.electron as any).api?.createCheckout?.({ plan: planId, billing });
        url = r?.checkoutUrl ?? r?.url ?? null;
      } catch { /* fall through */ }
      if (!url) {
        url = CHECKOUT_URLS[planId]?.[billing] ?? 'https://velanova.ai/pricing';
      }
      await (window.electron as any).system?.openExternal?.(url);
      showToast('success', 'Checkout opened in your browser. Return here after payment completes.');
    } catch (err: any) {
      showToast('error', err?.message ?? 'Could not open checkout. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelConfirm) { setCancelConfirm(true); return; }
    setCancelConfirm(false);
    try {
      await (window.electron as any).api?.cancelSubscription?.();
      showToast('success', 'Subscription cancelled. Access continues until period end.');
      loadData();
    } catch (err: any) {
      showToast('error', err?.message ?? 'Failed to cancel. Please contact support.');
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border border-white/20 border-t-white/70 rounded-full animate-spin" />
          <p className="text-[12px] text-zinc-600">Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#0a0a0a] overflow-y-auto">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            className={cn(
              'fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-[13px] font-medium max-w-sm w-full',
              toast.type === 'success'
                ? 'bg-[#0e0e0e] border-emerald-500/30 text-emerald-300'
                : 'bg-[#0e0e0e] border-red-500/30 text-red-300',
            )}
          >
            {toast.type === 'success'
              ? <Check className="w-4 h-4 flex-shrink-0" />
              : <X className="w-4 h-4 flex-shrink-0" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold text-white mb-2">Plans &amp; Billing</h1>
          <p className="text-[14px] text-zinc-500">
            Upgrade to unlock unlimited queries, all AI models, and BYOK support
          </p>
          <div className="inline-flex items-center gap-1 mt-6 p-1 rounded-xl border border-white/[0.07] bg-white/[0.02]">
            {(['monthly', 'yearly'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={cn(
                  'px-5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200',
                  billing === b ? 'bg-white text-black shadow' : 'text-zinc-600 hover:text-zinc-300',
                )}
              >
                {b === 'monthly' ? 'Monthly' : 'Annual'}
                {b === 'yearly' && (
                  <span className="ml-1.5 text-[10px] text-emerald-400 font-semibold">-20%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billing={billing}
              currentPlan={currentPlan}
              isLoading={isLoading}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {currentPlan && currentPlan !== 'trial' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white">
                    {PLANS.find((p) => p.id === currentPlan)?.name} — Active
                  </p>
                  <p className="text-[12px] text-zinc-600">Renews automatically each billing period</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadData}
                  title="Refresh status"
                  className="p-2 rounded-lg text-zinc-700 hover:text-zinc-400 hover:bg-white/[0.05] transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className={cn(
                    'px-4 py-2 rounded-xl text-[13px] font-medium border transition-all',
                    cancelConfirm
                      ? 'border-red-500/40 text-red-400 hover:bg-red-500/10'
                      : 'border-white/[0.07] text-zinc-500 hover:border-white/[0.14] hover:text-zinc-300',
                  )}
                >
                  {cancelConfirm ? 'Confirm cancel?' : 'Cancel Subscription'}
                </button>
                {cancelConfirm && (
                  <button
                    onClick={() => setCancelConfirm(false)}
                    className="px-3 py-2 text-[13px] text-zinc-700 hover:text-zinc-400 transition-colors"
                  >
                    Never mind
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-semibold text-white">Payment History</h2>
              <p className="text-[12px] text-zinc-600 mt-0.5">Your invoices and transactions</p>
            </div>
            <Calendar className="w-4 h-4 text-zinc-700" />
          </div>
          {payments.length > 0 ? (
            <div className="divide-y divide-white/[0.03]">
              {payments.map((p, i) => (
                <div key={p.id ?? i} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                      <CreditCard className="w-3.5 h-3.5 text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-[13px] text-white">
                        ${((p.amount ?? 0) / 100).toFixed(2)}{' '}
                        <span className="text-zinc-600">{(p.currency ?? 'USD').toUpperCase()}</span>
                      </p>
                      <p className="text-[11px] text-zinc-600">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                        {' · '}
                        <span className={p.status === 'succeeded' ? 'text-emerald-500' : 'text-red-400'}>
                          {p.status ?? 'unknown'}
                        </span>
                      </p>
                    </div>
                  </div>
                  {p.invoiceUrl && (
                    <button
                      onClick={() => (window.electron as any).system?.openExternal?.(p.invoiceUrl)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.07] text-[12px] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.14] transition-all"
                    >
                      <ExternalLink className="w-3 h-3" /> Invoice
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <CreditCard className="w-8 h-8 text-zinc-800 mb-2.5" />
              <p className="text-[13px] text-zinc-600">No payments yet</p>
              <p className="text-[11px] text-zinc-700 mt-1">Invoices appear here once you upgrade</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] px-5 py-5 flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white mb-1">Bring Your Own API Keys (BYOK)</p>
            <p className="text-[13px] text-zinc-500 leading-relaxed">
              On Professional and above you can add your own OpenAI, Anthropic, Google, Groq, and more
              API keys. Keys are AES-encrypted and stored locally — we never see them. Costs go
              directly to your provider account.
            </p>
            <button
              onClick={() => { window.location.hash = '#/settings/api-keys'; }}
              className="mt-3 flex items-center gap-1.5 text-[13px] text-zinc-300 hover:text-white transition-colors"
            >
              Manage API Keys <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
