import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For individuals getting started',
    features: [
      '1 database connection',
      '50 AI queries/month',
      'Basic SQL generation',
      'Community support',
    ],
    current: false,
    cta: 'Current Plan',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For professionals and small teams',
    features: [
      '5 database connections',
      '500 AI queries/month',
      'Advanced SQL generation',
      'Query history & favorites',
      'Priority support',
      'Export to CSV/Excel',
    ],
    current: true,
    cta: 'Current Plan',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For large teams and organizations',
    features: [
      'Unlimited connections',
      'Unlimited AI queries',
      'Custom AI training',
      'Team collaboration',
      'SSO & SAML',
      'Dedicated support',
      'SLA guarantee',
      'On-premise deployment',
    ],
    current: false,
    cta: 'Upgrade',
  },
];

export default function PricingPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-medium text-black dark:text-white">Pricing Plans</h1>
        <p className="text-gray-500 mt-2">Choose the plan that's right for you</p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white dark:bg-black border rounded-2xl p-6 ${
              plan.popular 
                ? 'border-blue-500 ring-2 ring-blue-500' 
                : 'border-gray-200 dark:border-gray-800'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-black dark:text-white">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-medium text-black dark:text-white">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                plan.current
                  ? 'bg-gray-100 dark:bg-gray-900 text-gray-500 cursor-default'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              disabled={plan.current}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500">
          Need a custom plan? <button className="text-blue-500 hover:underline">Contact sales</button>
        </p>
      </div>
    </div>
  );
}
