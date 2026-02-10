'use client';

import { useEffect, useRef } from 'react';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
    quote: 'AI Nexus transformed how our team accesses data. What used to take days now takes minutes. The ROI was immediate - we saved 40 hours per week in the first month alone.',
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

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !cardsRef.current) return;

    const ctx = gsap.context(() => {
      // Animate header
      gsap.from(headerRef.current, {
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 80%',
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
      });

      // Stagger animate testimonial cards
      const cards = cardsRef.current?.querySelectorAll('.testimonial-card');
      if (cards) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 70%',
          },
          y: 40,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 bg-white dark:bg-gray-950"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
            <Star className="w-4 h-4 fill-current" />
            Customer Stories
          </div>
          <h2 className="text-4xl  md:text-5xl font-medium text-black dark:text-white mb-4">
            Trusted by{' '}
            <span className="text-blue-500">
              2,500+ enterprises
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            See how teams are transforming their legacy systems with AI Nexus
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.author}
              className="testimonial-card group relative border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300"
            >
              <CardContent className="p-6">
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-blue-500/20 dark:text-blue-400/20 mb-4" />

                {/* Rating */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-4 h-4 text-blue-500 fill-blue-500" 
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5 italic">
                  &quot;{testimonial.quote}&quot;
                </p>

                {/* Results badge */}
                {testimonial.results && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-medium mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {testimonial.results}
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-black dark:text-white truncate">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 font-medium truncate">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-8 text-gray-400 dark:text-gray-600">
            <div className="text-center">
              <div className="text-2xl font-medium text-gray-900 dark:text-white">4.9/5</div>
              <div className="text-xs">Average Rating</div>
            </div>
            <div className="w-px h-12 bg-gray-200 dark:bg-gray-800" />
            <div className="text-center">
              <div className="text-2xl font-medium text-gray-900 dark:text-white">2,500+</div>
              <div className="text-xs">Enterprise Customers</div>
            </div>
            <div className="w-px h-12 bg-gray-200 dark:bg-gray-800" />
            <div className="text-center">
              <div className="text-2xl font-medium text-gray-900 dark:text-white">98%</div>
              <div className="text-xs">Customer Satisfaction</div>
            </div>
            <div className="w-px h-12 bg-gray-200 dark:bg-gray-800" />
            <div className="text-center">
              <div className="text-2xl font-medium text-gray-900 dark:text-white">10M+</div>
              <div className="text-xs">Queries Processed</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
