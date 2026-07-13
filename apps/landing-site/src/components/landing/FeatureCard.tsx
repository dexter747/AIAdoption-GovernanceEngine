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

const iconColors = [
  'bg-zinc-900/40 text-zinc-400',
  'bg-zinc-900/40 text-zinc-400',
  'bg-zinc-900/40 text-zinc-400',
  'bg-zinc-900/40 text-zinc-400',
  'bg-zinc-900/40 text-zinc-400',
  'bg-zinc-900/40 text-zinc-400',
];

export function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <div
      className="group p-6 rounded-xl transition-colors animate-slide-up bg-zinc-950 border-zinc-800 hover:border-zinc-800"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${iconColors[index % iconColors.length].split(' ')[0]}`}
      >
        <Icon className={`w-5 h-5 ${iconColors[index % iconColors.length].split(' ')[1]}`} />
      </div>
      <h3 className="font-medium mb-2 text-white">{feature.title}</h3>
      <p className="leading-relaxed font-medium text-muted-foreground">{feature.description}</p>
    </div>
  );
}
