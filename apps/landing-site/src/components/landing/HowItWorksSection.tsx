import { SectionHeader } from './SectionHeader';
import { Download, Database, MessageSquare } from 'lucide-react';

const steps = [
  {
    step: '1',
    icon: Download,
    title: 'Download the App',
    description: 'Install AI Nexus on Windows, macOS, or Linux. No complex setup required.',
  },
  {
    step: '2',
    icon: Database,
    title: 'Connect Your Database',
    description: 'Add your database credentials. We support 10+ database types out of the box.',
  },
  {
    step: '3',
    icon: MessageSquare,
    title: 'Start Asking Questions',
    description: 'Type your questions in plain English. AI generates and executes the perfect SQL.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          badge="How It Works"
          title="Get started in minutes"
          description="Three simple steps to unlock AI-powered insights from your data"
        />

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 mb-5">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
