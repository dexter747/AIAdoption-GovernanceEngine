import { Database, Cpu, Lock, MessageSquare, Cloud, Layers, LucideIcon } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { FeatureCard } from './FeatureCard';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: Database,
    title: '10+ Database Connectors',
    description: 'PostgreSQL, MySQL, Oracle, SQL Server, MongoDB, Redis, and more out of the box.',
    color: 'blue',
  },
  {
    icon: Cpu,
    title: 'Multiple AI Providers',
    description: 'OpenAI, Anthropic Claude, Google Gemini, Mistral, or run locally with Ollama.',
    color: 'purple',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'Your data never leaves your infrastructure. Fully air-gapped deployment option.',
    color: 'green',
  },
  {
    icon: MessageSquare,
    title: 'Natural Language Queries',
    description: 'Ask questions in plain English and get instant, accurate SQL results.',
    color: 'orange',
  },
  {
    icon: Cloud,
    title: 'Hybrid Architecture',
    description: 'Desktop app for local processing, cloud for licensing. Best of both worlds.',
    color: 'cyan',
  },
  {
    icon: Layers,
    title: 'Extensible Plugins',
    description: 'Add new databases and AI providers via our growing plugin marketplace.',
    color: 'pink',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          badge="Features"
          badgeColor="blue"
          title="Everything you need to modernize"
          description="A complete platform to connect your legacy systems with modern AI capabilities"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
