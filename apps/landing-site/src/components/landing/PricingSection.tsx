"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Check, Sparkles, Building2, Rocket, X } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const pricingTiers = [
  {
    name: "Starter",
    icon: Rocket,
    price: "$0",
    period: "/14 days",
    description: "Perfect for trying out the platform",
    features: ["1 device license", "100 queries per month", "All AI model providers", "Basic database connectors", "Email support", "7-day data retention"],
    notIncluded: ["Advanced analytics", "Custom workflows", "API access"],
    cta: "Start Free Trial",
    ctaLink: "/download",
    highlighted: false,
  },
  {
    name: "Professional",
    icon: Sparkles,
    price: "$199",
    period: "/month per user",
    description: "For teams that need unlimited power",
    features: ["Up to 10 device licenses", "Unlimited queries", "All 64+ system connectors", "All AI model providers", "Advanced analytics & dashboards", "Custom workflows & automation", "Priority support (4h SLA)", "API access & webhooks", "90-day data retention", "SSO integration", "Custom reports"],
    cta: "Start 14-Day Trial",
    ctaLink: "/subscribe?plan=pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    icon: Building2,
    price: "Custom",
    description: "For organizations with complex needs",
    features: ["Unlimited device licenses", "Unlimited everything", "All Professional features", "On-premise / air-gapped deployment", "White-label & custom branding", "Dedicated account manager", "24/7 phone support (1h SLA)", "Custom integrations & development", "Unlimited data retention", "SLA guarantees", "Training & onboarding"],
    cta: "Contact Sales",
    ctaLink: "/contact",
    highlighted: false,
  },
];

export function PricingSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".price-header > *", {
        opacity: 0, y: 30, duration: 0.7, stagger: 0.12, immediateRender: false,
        scrollTrigger: { trigger: ".price-header", start: "top 88%", once: true },
      });
      gsap.from(".price-card", {
        opacity: 0, y: 40, duration: 0.6, stagger: 0.12, ease: "power2.out", immediateRender: false,
        scrollTrigger: { trigger: ".price-grid", start: "top 92%", once: true },
      });
      gsap.from(".price-footer > *", {
        opacity: 0, y: 15, duration: 0.5, stagger: 0.1, immediateRender: false,
        scrollTrigger: { trigger: ".price-footer", start: "top 92%", once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="pricing" ref={ref} className="relative py-16 bg-black">
      <div className="absolute inset-0 dot-grid opacity-20" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="price-header text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-5 bg-white/[0.03] border-white/[0.08]">
            <Sparkles className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-500">Simple, Transparent Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-5 text-white">
            Plans That <span className="text-shimmer">Scale With You</span>
          </h2>
          <p className="text-lg text-zinc-500">
            Start free. Upgrade when you&apos;re ready. No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="price-grid grid md:grid-cols-3 gap-6 max-w-6xl mx-auto py-6 overflow-visible">
          {pricingTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={cn(
                  "price-card relative p-8 rounded-2xl border transition-all duration-500",
                  tier.highlighted
                    ? "border-white/20 bg-white/[0.05] shadow-2xl shadow-white/[0.05] ring-1 ring-white/[0.12]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] card-hover"
                )}
              >
                {tier.highlighted && (
                  <div className="absolute top-0 right-0 bg-white text-black text-xs font-medium px-4 py-1.5 rounded-bl-xl rounded-tr-2xl">
                    MOST POPULAR
                  </div>
                )}

                <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-zinc-400" />
                </div>

                <h3 className="text-xl font-medium text-white mb-1">{tier.name}</h3>
                <p className="text-sm text-zinc-500 mb-5">{tier.description}</p>

                <div className="flex items-baseline gap-1 mb-7">
                  <span className="text-4xl font-medium text-white tracking-tight">{tier.price}</span>
                  {tier.period && <span className="text-sm text-zinc-500">{tier.period}</span>}
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-zinc-500" />
                      <span className="text-zinc-400">{feature}</span>
                    </li>
                  ))}
                  {tier.notIncluded && tier.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm opacity-40">
                      <X className="w-4 h-4 flex-shrink-0 mt-0.5 text-zinc-600" />
                      <span className="line-through text-zinc-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.ctaLink}
                  className={cn(
                    "block w-full text-center py-3.5 rounded-xl font-medium text-sm transition-all duration-300",
                    tier.highlighted
                      ? "bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5"
                      : "border border-white/[0.08] text-zinc-300 hover:border-white/[0.15] hover:bg-white/[0.03]"
                  )}
                >
                  {tier.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="price-footer mt-16 text-center">
          <p className="text-sm text-zinc-500 mb-4">
            All plans include 14-day free trial &middot; No credit card required &middot; Cancel anytime
          </p>
          <div className="flex items-center justify-center gap-6 mb-8">
            {["Zero lock-in", "Cancel anytime", "99.9% Uptime SLA"].map((text) => (
              <span key={text} className="flex items-center gap-2 text-sm text-zinc-600">
                <Check className="w-3.5 h-3.5 text-zinc-500" />
                {text}
              </span>
            ))}
          </div>
          {/* Secure Payments */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-xs text-zinc-600 font-medium">Secure Payments By</span>
            <img src="/paypal.svg" alt="PayPal" className="h-6 object-contain brightness-0 invert opacity-70 hover:opacity-100 transition-opacity" />
            <span className="text-zinc-700 text-xs">&amp;</span>
            <img src="/lemonsqueezy.svg" alt="Lemon Squeezy" className="h-5 object-contain brightness-0 invert opacity-70 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </section>
  );
}