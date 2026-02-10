'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Check, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      // Animate content
      gsap.from(contentRef.current?.querySelectorAll('.cta-item') || [], {
        scrollTrigger: {
          trigger: contentRef.current,
          start: 'top 70%',
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
      });

      // Floating blobs
      if (blobsRef.current) {
        const blobs = blobsRef.current.querySelectorAll('.blob');
        blobs.forEach((blob, i) => {
          gsap.to(blob, {
            y: `${i % 2 === 0 ? '-=30' : '+=30'}`,
            x: `${i % 2 === 0 ? '+=20' : '-=20'}`,
            duration: 4 + i,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.5,
          });
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 overflow-hidden bg-blue-500"
    >

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <div ref={contentRef}>
          {/* Badge */}
          <div className="cta-item inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6 border border-white/20">
            <Sparkles className="w-4 h-4" />
            Start Your 14-Day Free Trial
          </div>

          {/* Headline */}
          <h2 className="cta-item text-4xl md:text-6xl font-medium text-white mb-6 leading-tight">
            Ready to transform your
            <br />
            legacy systems with AI?
          </h2>

          {/* Description */}
          <p className="cta-item text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join 2,500+ enterprises using AI Nexus to unlock insights, automate workflows, and save 89% on data access time.
          </p>

          {/* Benefits */}
          <div className="cta-item flex flex-wrap items-center justify-center gap-6 mb-10 text-white">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-300" />
              <span className="text-sm font-medium">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-300" />
              <span className="text-sm font-medium">24-hour setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-300" />
              <span className="text-sm font-medium">Cancel anytime</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="cta-item flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/download"
              className="group px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 font-medium text-lg inline-flex items-center justify-center gap-3 shadow-2xl shadow-black/20 hover:shadow-black/30 hover:scale-105"
            >
              <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium text-lg inline-flex items-center justify-center gap-3 border-2 border-white/20 hover:border-white/40"
            >
              Talk to Sales
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="cta-item mt-12 flex flex-wrap items-center justify-center gap-8 text-blue-100 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              SOC 2 Type II Certified
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              GDPR & HIPAA Compliant
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              99.9% Uptime SLA
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
