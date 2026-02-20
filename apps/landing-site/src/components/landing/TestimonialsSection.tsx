"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  results?: string;
}

const testimonials: Testimonial[] = [
  { quote: "Velanova transformed how our team accesses data. What used to take days now takes minutes. The ROI was immediate - we saved 40 hours per week in the first month alone.", author: "Sarah Chen", role: "VP of Engineering", company: "TechCorp Global", avatar: "SC", rating: 5, results: "89% faster data access" },
  { quote: "The security features are enterprise-grade. Our team was impressed with the BYOK implementation and zero-knowledge architecture — our data never leaves our infrastructure.", author: "Michael Rodriguez", role: "CISO", company: "SecureBank", avatar: "MR", rating: 5, results: "Zero-knowledge deployment" },
  { quote: "We connected 12 legacy systems in one day. The natural language interface means our business analysts can query data directly without waiting for IT.", author: "Emily Watson", role: "Chief Data Officer", company: "RetailCo", avatar: "EW", rating: 5, results: "12 systems integrated" },
  { quote: "The BYOK feature saved us $40K/month in AI costs. We use our own OpenAI credits and have complete visibility into usage.", author: "David Kim", role: "Head of Finance Systems", company: "FinanceHub", avatar: "DK", rating: 5, results: "$480K annual savings" },
  { quote: "Implementation was shockingly fast. We went from POC to production in 48 hours. The desktop app approach means zero infrastructure changes.", author: "Lisa Thompson", role: "Director of IT", company: "HealthTech Solutions", avatar: "LT", rating: 5, results: "48hr implementation" },
  { quote: "The multi-database query capability is phenomenal. We can join data from Oracle, PostgreSQL, and MongoDB in a single query.", author: "James Park", role: "Senior Data Architect", company: "DataFlow Industries", avatar: "JP", rating: 5, results: "3 databases, 1 query" },
];

const row1 = [...testimonials.slice(0, 3), ...testimonials.slice(3, 6)];
const row2 = [...testimonials.slice(3, 6), ...testimonials.slice(0, 3)];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex-shrink-0 w-[360px] mx-3 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-all duration-500 backdrop-blur-sm">
      <Quote className="w-6 h-6 text-zinc-700 mb-4" />

      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 text-zinc-400 fill-zinc-400" />
        ))}
      </div>

      <p className="text-sm text-zinc-400 leading-relaxed mb-5 italic line-clamp-4">
        &quot;{testimonial.quote}&quot;
      </p>

      {testimonial.results && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-zinc-400 mb-5">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
          {testimonial.results}
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center flex-shrink-0 border border-white/[0.08]">
          <span className="text-white text-xs font-medium">{testimonial.avatar}</span>
        </div>
        <div className="min-w-0">
          <div className="font-medium text-white text-sm">{testimonial.author}</div>
          <div className="text-xs text-zinc-600">{testimonial.role} &middot; {testimonial.company}</div>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ items, reverse = false }: { items: Testimonial[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="relative flex overflow-hidden">
      <div className={cn("flex w-max", reverse ? "animate-marquee-reverse" : "animate-marquee")}>
        {doubled.map((t, i) => (
          <TestimonialCard key={t.author + "-" + i} testimonial={t} />
        ))}
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".test-header > *", {
        opacity: 0, y: 30, duration: 0.7, stagger: 0.12, immediateRender: false,
        scrollTrigger: { trigger: ".test-header", start: "top 85%", once: true },
      });
      gsap.from(".test-marquee", {
        opacity: 0, duration: 1, immediateRender: false,
        scrollTrigger: { trigger: ".test-marquee", start: "top 90%", once: true },
      });
      gsap.from(".test-stat", {
        opacity: 0, y: 20, duration: 0.5, stagger: 0.1, immediateRender: false,
        scrollTrigger: { trigger: ".test-stats", start: "top 90%", once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative py-16 bg-black overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-20" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="test-header text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm font-medium text-zinc-400 mb-5">
            <Star className="w-3.5 h-3.5 fill-current" />
            Customer Stories
          </div>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-4">
            Trusted by <span className="text-shimmer">2,500+ enterprises</span>
          </h2>
          <p className="text-lg text-zinc-500">
            See how teams are transforming their legacy systems with Velanova
          </p>
        </div>
      </div>

      <div className="test-marquee relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-black to-transparent z-10" />

        <div className="flex flex-col gap-5 py-2">
          <MarqueeRow items={row1} reverse={false} />
          <MarqueeRow items={row2} reverse={true} />
        </div>
      </div>

      <div className="test-stats relative max-w-7xl mx-auto px-6 mt-16">
        <div className="flex flex-wrap items-center justify-center gap-10">
          {[
            { value: "4.9/5", label: "Average Rating" },
            { value: "2,500+", label: "Enterprise Customers" },
            { value: "98%", label: "Customer Satisfaction" },
            { value: "10M+", label: "Queries Processed" },
          ].map((stat, i, arr) => (
            <div key={stat.label} className="test-stat flex items-center gap-10">
              <div className="text-center">
                <div className="text-2xl font-medium text-white">{stat.value}</div>
                <div className="text-xs text-zinc-600 mt-0.5">{stat.label}</div>
              </div>
              {i < arr.length - 1 && <div className="hidden sm:block w-px h-10 bg-white/[0.06]" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}