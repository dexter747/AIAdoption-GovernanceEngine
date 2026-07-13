import Link from 'next/link';
import { Download, Zap, Shield, Globe, Database, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Velanova" className="w-8 h-8 rounded-lg" />
            <h1 className="text-2xl font-medium">Velanova</h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="#features" className="text-gray-400 hover:text-white">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-400 hover:text-white">
              Pricing
            </Link>
            <Link href="/download" className="text-gray-400 hover:text-white">
              Download
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Admin Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-medium mb-6 text-white">Bring AI to Your Legacy Software</h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Connect your existing databases and enterprise systems to powerful AI models. Query your
          data in natural language, automate tasks, and gain insights instantly.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/download"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-lg font-medium"
          >
            <Download className="w-5 h-5" />
            Download for Free
          </Link>
          <Link
            href="/subscribe"
            className="px-8 py-4 bg-card/10 text-blue-400 border-2 border-blue-500 rounded-lg hover:bg-card/20 text-lg font-medium"
          >
            View Pricing
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          14-day free trial • No credit card required • Windows, macOS & Linux
        </p>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-medium text-center mb-12">Why Velanova?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Database className="w-12 h-12 text-blue-600" />}
            title="10+ Database Connectors"
            description="Connect to PostgreSQL, MySQL, Oracle, SQL Server, SAP HANA, MongoDB, Salesforce, Jira, and more."
          />
          <FeatureCard
            icon={<Zap className="w-12 h-12 text-blue-600" />}
            title="10 AI Providers"
            description="OpenAI, Anthropic, Google, Cohere, Mistral, Groq, Perplexity, and even local Ollama models."
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12 text-blue-600" />}
            title="Data Privacy First"
            description="Your data stays on your infrastructure. Only anonymized metadata is sent to our servers."
          />
          <FeatureCard
            icon={<Globe className="w-12 h-12 text-blue-600" />}
            title="Cloud + Desktop Hybrid"
            description="Desktop app for data processing, cloud backend for licensing and analytics."
          />
          <FeatureCard
            icon={<Sparkles className="w-12 h-12 text-blue-600" />}
            title="Natural Language Queries"
            description='Ask questions like "Show me top customers" and get instant answers from your data.'
          />
          <FeatureCard
            icon={<Database className="w-12 h-12 text-blue-600" />}
            title="Offline AI Support"
            description="Run AI models locally with Ollama for complete data privacy and zero API costs."
          />
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="container mx-auto px-4 py-20 bg-card rounded-3xl border border-border my-20"
      >
        <h3 className="text-3xl font-medium text-center mb-12">Simple, Transparent Pricing</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <PricingCard
            name="Trial"
            price="$0"
            period="14 days"
            features={['1 device', '100 queries/month', 'All AI providers', 'Email support']}
            cta="Start Free Trial"
            ctaLink="/download"
          />
          <PricingCard
            name="Professional"
            price="$49"
            period="per month"
            features={['3 devices', 'Unlimited queries', 'All AI providers', 'Priority support']}
            cta="Subscribe Now"
            ctaLink="/subscribe?plan=professional"
            highlighted
          />
          <PricingCard
            name="Team"
            price="$199"
            period="per month"
            features={[
              '10 devices',
              'Unlimited queries',
              'Team collaboration',
              'Dedicated support',
            ]}
            cta="Subscribe Now"
            ctaLink="/subscribe?plan=team"
          />
          <PricingCard
            name="Enterprise"
            price="Custom"
            period="contact us"
            features={[
              'Unlimited devices',
              'Unlimited queries',
              'On-premise option',
              'White-label available',
            ]}
            cta="Contact Sales"
            ctaLink="/contact"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h3 className="text-4xl font-medium mb-6">Ready to Get Started?</h3>
        <p className="text-xl text-gray-400 mb-8">
          Download Velanova now and transform how you interact with your data.
        </p>
        <Link
          href="/download"
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium"
        >
          <Download className="w-5 h-5" />
          Download Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/features">Features</Link>
                </li>
                <li>
                  <Link href="/pricing">Pricing</Link>
                </li>
                <li>
                  <Link href="/download">Download</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/docs">Documentation</Link>
                </li>
                <li>
                  <Link href="/guides">Guides</Link>
                </li>
                <li>
                  <Link href="/api">API Reference</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about">About</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <Link href="/careers">Careers</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms of Service</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Velanova. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <div className="mb-4">{icon}</div>
      <h4 className="text-xl font-medium mb-2">{title}</h4>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  features,
  cta,
  ctaLink,
  highlighted = false,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  ctaLink: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`p-6 rounded-xl border-2 ${
        highlighted ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-card/5'
      }`}
    >
      <h4 className="text-xl font-medium mb-2">{name}</h4>
      <div className="mb-4">
        <span className="text-4xl font-medium">{price}</span>
        <span className="text-gray-400">/{period}</span>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaLink}
        className={`block text-center py-3 rounded-lg font-medium ${
          highlighted
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-white hover:bg-gray-200'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
