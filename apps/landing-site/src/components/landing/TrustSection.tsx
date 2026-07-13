'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Lock, Globe, Users, Zap, Key, ShieldCheck, LucideIcon } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface TrustBadge {
  icon: LucideIcon;
  title: string;
  description: string;
}

const trustBadges: TrustBadge[] = [
  {
    icon: ShieldCheck,
    title: 'Zero-Knowledge',
    description: 'Your data never touches our servers',
  },
  { icon: Key, title: 'BYOK Support', description: 'Bring your own AI API keys' },
  { icon: Lock, title: 'AES-256-GCM', description: 'Military-grade encryption at rest' },
  { icon: Zap, title: 'Air-Gap Ready', description: 'On-premise deployment available' },
  { icon: Globe, title: 'Always Available', description: 'Designed for enterprise reliability' },
  { icon: Users, title: 'Team Ready', description: 'Built for organizations of all sizes' },
];

export function TrustSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.trust-header > *', {
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.12,
        immediateRender: false,
        scrollTrigger: { trigger: '.trust-header', start: 'top 85%', once: true },
      });
      gsap.from('.trust-badge-card', {
        opacity: 0,
        y: 30,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: '.trust-grid', start: 'top 85%', once: true },
      });
      gsap.from('.security-banner', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        immediateRender: false,
        scrollTrigger: { trigger: '.security-banner', start: 'top 90%', once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative py-16 bg-zinc-950/50">
      <div className="absolute inset-0 dot-grid opacity-20" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="trust-header text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-white mb-4">
            Enterprise-Grade <span className="text-shimmer">Security By Design</span>
          </h2>
          <p className="text-lg text-zinc-500">
            Built for the world&apos;s most security-conscious organizations
          </p>
        </div>

        <div className="trust-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {trustBadges.map(badge => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.title}
                className="trust-badge-card p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500 text-center card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-zinc-400" />
                </div>
                <h3 className="text-sm font-medium mb-1 text-white">{badge.title}</h3>
                <p className="text-xs text-zinc-500 leading-tight">{badge.description}</p>
              </div>
            );
          })}
        </div>

        <div className="security-banner max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-4 px-7 py-5 rounded-2xl border bg-white/[0.02] border-white/[0.06] backdrop-blur-sm">
            <Lock className="w-6 h-6 text-zinc-400 flex-shrink-0" />
            <div className="text-left">
              <div className="font-medium text-white text-sm">
                Your data never leaves your infrastructure
              </div>
              <div className="text-sm text-zinc-500">
                Zero-knowledge architecture with AES-256-GCM encryption. Air-gapped deployment
                available.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrustSection;
