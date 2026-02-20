'use client';

import { Star, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  {
    quote: 'Velanova transformed how our team accesses data. What used to take days now takes minutes. The ROI was immediate - we saved 40 hours per week in the first month alone.',
    author: 'Sarah Chen',
    role: 'VP of Engineering',
    company: 'TechCorp Global',
    avatar: 'SC',
    rating: 5,
    results: '89% faster data access',
  },
  {
    quote: 'The security and compliance features are enterprise-grade. Our auditors were impressed with the BYOK implementation and zero-knowledge architecture. Finally, a tool that doesn\'t compromise on security.',
    author: 'Michael Rodriguez',
    role: 'CISO',
    company: 'SecureBank',
    avatar: 'MR',
    rating: 5,
    results: 'SOC 2 compliant deployment',
  },
  {
    quote: 'We connected 12 legacy systems in one day. The natural language interface means our business analysts can query data directly without waiting for IT. Game-changer for our operations.',
    author: 'Emily Watson',
    role: 'Chief Data Officer',
    company: 'RetailCo',
    avatar: 'EW',
    rating: 5,
    results: '12 systems integrated',
  },
  {
    quote: 'The BYOK feature saved us $40K/month in AI costs. We use our own OpenAI credits and have complete visibility into usage. The platform pays for itself 10x over.',
    author: 'David Kim',
    role: 'Head of Finance Systems',
    company: 'FinanceHub',
    avatar: 'DK',
    rating: 5,
    results: '$480K annual savings',
  },
  {
    quote: 'Implementation was shockingly fast. We went from POC to production in 48 hours. The desktop app approach means zero infrastructure changes. Our IT team loved the simplicity.',
    author: 'Lisa Thompson',
    role: 'Director of IT',
    company: 'HealthTech Solutions',
    avatar: 'LT',
    rating: 5,
    results: '48hr implementation',
  },
  {
    quote: 'The multi-database query capability is phenomenal. We can join data from Oracle, PostgreSQL, and MongoDB in a single query. Something that was impossible before is now trivial.',
    author: 'James Park',
    role: 'Senior Data Architect',
    company: 'DataFlow Industries',
    avatar: 'JP',
    rating: 5,
    results: '3 databases, 1 query',
  },
];

// Split: first 3 go to one row, next 3 to the other (each row has both halves duplicated for seamless loop)
const row1 = [...testimonials.slice(0, 3), ...testimonials.slice(3, 6)];
const row2 = [...testimonials.slice(3, 6), ...testimonials.slice(0, 3)];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex-shrink-0 w-[340px] mx-3 bg-black/5 border border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300">
      {/* Quote icon */}
      <Quote className="w-7 h-7 text-blue-400/30 mb-3" />

      {/* Rating */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-gray-400 text-sm leading-relaxed mb-4 italic line-clamp-4">
        &quot;{testimonial.quote}&quot;
      </p>

      {/* Results badge */}
      {testimonial.results && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
          {testimonial.results}
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white text-xs font-semibold">{testimonial.avatar}</span>
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-white text-sm truncate">{testimonial.author}</div>
          <div className="text-xs text-gray-500 truncate">{testimonial.role}</div>
          <div className="text-xs text-gray-400 truncate">{testimonial.company}</div>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: Testimonial[];
  reverse?: boolean;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="relative flex overflow-hidden">
      <div
        className={cn(
          'flex w-max',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        )}
      >
        {doubled.map((t, i) => (
          <TestimonialCard key={`${t.author}-${i}`} testimonial={t} />
        ))}
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="relative py-24 bg-black overflow-hidden">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Header */}
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
            <Star className="w-3.5 h-3.5 fill-current" />
            Customer Stories
          </div>
          <h2 className="text-4xl md:text-5xl font-medium text-white mb-4">
            Trusted by{' '}
            <span className="text-blue-500">2,500+ enterprises</span>
          </h2>
          <p className="text-lg text-gray-500">
            See how teams are transforming their legacy systems with Velanova
          </p>
        </div>
      </div>

      {/* Bidirectional marquee — bleeds edge-to-edge */}
      <div className="relative">
        {/* Left & right fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="flex flex-col gap-4 py-2">
          <MarqueeRow items={row1} reverse={false} />
          <MarqueeRow items={row2} reverse={true} />
        </div>
      </div>

      {/* Trust indicators */}
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-semibold text-white">4.9/5</div>
            <div className="text-xs text-gray-500 mt-0.5">Average Rating</div>
          </div>
          <div className="w-px h-10 bg-black/10" />
          <div className="text-center">
            <div className="text-2xl font-semibold text-white">2,500+</div>
            <div className="text-xs text-gray-500 mt-0.5">Enterprise Customers</div>
          </div>
          <div className="w-px h-10 bg-black/10" />
          <div className="text-center">
            <div className="text-2xl font-semibold text-white">98%</div>
            <div className="text-xs text-gray-500 mt-0.5">Customer Satisfaction</div>
          </div>
          <div className="w-px h-10 bg-black/10" />
          <div className="text-center">
            <div className="text-2xl font-semibold text-white">10M+</div>
            <div className="text-xs text-gray-500 mt-0.5">Queries Processed</div>
          </div>
        </div>
      </div>
    </section>
  );
}
