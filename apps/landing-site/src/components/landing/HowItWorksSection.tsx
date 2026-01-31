import { SectionHeader } from './SectionHeader';

const steps = [
  {
    step: '01',
    title: 'Download the App',
    description: 'Install AI Nexus on Windows, macOS, or Linux. No complex setup required.',
  },
  {
    step: '02',
    title: 'Connect Your Database',
    description: 'Add your database credentials. We support 10+ database types out of the box.',
  },
  {
    step: '03',
    title: 'Start Asking Questions',
    description: 'Type your questions in plain English. AI generates and executes the perfect SQL.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          badge="How It Works"
          badgeColor="purple"
          title="Get started in minutes"
          description="Three simple steps to unlock AI-powered insights from your data"
        />

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-200 to-transparent" />
              )}
              
              <div className="relative bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all">
                <div className="text-5xl font-bold bg-gradient-to-br from-blue-100 to-purple-100 bg-clip-text text-transparent mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
