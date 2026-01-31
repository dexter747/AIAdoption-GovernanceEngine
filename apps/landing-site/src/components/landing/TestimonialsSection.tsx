import { Star } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "AI Nexus helped us unlock insights from our legacy Oracle database that we thought were impossible to get.",
    author: "Sarah Chen",
    role: "CTO, TechCorp",
    avatar: "SC",
  },
  {
    quote: "The natural language queries are a game-changer. Our non-technical team can now access data directly.",
    author: "Michael Torres",
    role: "Data Lead, FinanceHub",
    avatar: "MT",
  },
  {
    quote: "Finally, a tool that respects data privacy. Everything runs locally—exactly what we needed for compliance.",
    author: "Emily Watson",
    role: "CISO, SecureBank",
    avatar: "EW",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          badge="Testimonials"
          badgeColor="orange"
          title="Loved by data teams"
        />

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.author} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
      {/* Stars */}
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-gray-700 text-lg leading-relaxed mb-6">
        &quot;{testimonial.quote}&quot;
      </p>

      {/* Author */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
          {testimonial.avatar}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{testimonial.author}</div>
          <div className="text-sm text-gray-500">{testimonial.role}</div>
        </div>
      </div>
    </div>
  );
}
