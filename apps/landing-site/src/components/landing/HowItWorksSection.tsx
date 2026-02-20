import { SectionHeader } from './SectionHeader';
import { Download, Database, MessageSquare } from 'lucide-react';

const steps = [
 {
 step: '1',
 icon: Download,
 title: 'Download the App',
 description: 'Install Velanova on Windows, macOS, or Linux. No complex setup required.',
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
 <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 bg-blue-950">
 <Icon className="w-5 h-5 text-blue-400" />
 </div>
 <div className="font-medium uppercase tracking-wider mb-2 text-blue-400">
 Step {item.step}
 </div>
 <h3 className="font-medium mb-2 text-white">{item.title}</h3>
 <p className="font-medium leading-relaxed text-muted-foreground">{item.description}</p>
 </div>
 );
 })}
 </div>
 </div>
 </section>
 );
}
