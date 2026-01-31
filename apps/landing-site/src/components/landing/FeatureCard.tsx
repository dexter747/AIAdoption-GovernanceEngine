import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  feature: {
    icon: LucideIcon;
    title: string;
    description: string;
    color: string;
  };
  index: number;
}

// Color mappings for Tailwind - must be static for JIT compilation
const colorClasses: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'from-blue-500/10 to-blue-600/10', text: 'text-blue-500' },
  purple: { bg: 'from-purple-500/10 to-purple-600/10', text: 'text-purple-500' },
  green: { bg: 'from-green-500/10 to-green-600/10', text: 'text-green-500' },
  orange: { bg: 'from-orange-500/10 to-orange-600/10', text: 'text-orange-500' },
  cyan: { bg: 'from-cyan-500/10 to-cyan-600/10', text: 'text-cyan-500' },
  pink: { bg: 'from-pink-500/10 to-pink-600/10', text: 'text-pink-500' },
};

export function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = feature.icon;
  const colors = colorClasses[feature.color] || colorClasses.blue;

  return (
    <div
      className="group relative p-8 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
      >
        <Icon className={`w-7 h-7 ${colors.text}`} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
    </div>
  );
}
