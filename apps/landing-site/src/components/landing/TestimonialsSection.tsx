import { SectionHeader } from './SectionHeader';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    quote: 'AI Nexus helped us unlock insights from our legacy Oracle database that we thought were impossible to get.',
    author: 'Sarah Chen',
    role: 'CTO, TechCorp',
    initials: 'SC',
  },
  {
    quote: 'The natural language queries are a game-changer. Our non-technical team can now access data directly.',
    author: 'Michael Torres',
    role: 'Data Lead, FinanceHub',
    initials: 'MT',
  },
  {
    quote: 'Finally, a tool that respects data privacy. Everything runs locally — exactly what we needed for compliance.',
    author: 'Emily Watson',
    role: 'CISO, SecureBank',
    initials: 'EW',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          badge="Testimonials"
          title="Loved by data teams"
        />

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.author} className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-5">
                &quot;{t.quote}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">{t.initials}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{t.author}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
