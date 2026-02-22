"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight, Sparkles, Check, Zap } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".cta-inner > *", {
        opacity: 0, y: 25, duration: 0.6, stagger: 0.1, ease: "power2.out",
        immediateRender: false,
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative py-20 overflow-hidden bg-black">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[150px]" />
      <div className="absolute inset-0 dot-grid opacity-20" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <div className="cta-inner flex flex-col items-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-zinc-400 mb-8">
            <Sparkles className="w-4 h-4" />
            Start Your 14-Day Free Trial
          </div>

          <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-7 leading-tight text-white">
            Ready To Transform Your<br />
            <span className="text-shimmer">Legacy Systems With AI?</span>
          </h2>

          <p className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed text-zinc-500">
            Join 2,500+ enterprises using Velanova to unlock insights, automate workflows, and save 89% on data access time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-7 mb-12">
            {["No credit card required", "24-hour setup", "Cancel anytime"].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-400">{text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/download"
              className="group px-8 py-4 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-medium text-lg inline-flex items-center justify-center gap-3 shadow-lg shadow-white/5"
            >
              <Zap className="w-5 h-5" />
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 rounded-xl transition-all font-medium text-lg inline-flex items-center justify-center gap-3 border border-white/[0.08] text-zinc-300 hover:border-white/[0.15] hover:bg-white/[0.03]"
            >
              Talk to Sales
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-8">
            {["No credit card required", "Deploy in under 5 minutes", "99.9% Uptime SLA"].map((text) => (
              <div key={text} className="flex items-center gap-2 text-zinc-600">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}