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
 className="group p-6 rounded-xl transition-colors animate-slide-up bg-gray-900 border-gray-800 hover:border-gray-700"
 style={{ animationDelay: `${index * 80}ms` }}
 >
 <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-blue-950">
 <Icon className="w-5 h-5 text-blue-400" />
 </div>
 <h3 className="font-medium mb-2 text-white">{feature.title}</h3>
 <p className="leading-relaxed font-medium text-muted-foreground">{feature.description}</p>
 </div>
 );
}
