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

export function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <div
      className="group p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">{feature.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{feature.description}</p>
    </div>
  );
}
