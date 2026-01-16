'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  Download, Zap, Shield, Database, Sparkles, ArrowRight, 
  CheckCircle2, Menu, X, ChevronRight, Globe, MessageSquare, Star
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-black/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-blue-500" />
              <span className="text-xl font-semibold text-black dark:text-white">AI Nexus</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors">Features</Link>
              <Link href="#pricing" className="text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
              <Link href="/download" className="text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors">Download</Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <Link href="/login" className="text-sm font-medium text-black dark:text-white hover:text-blue-500 transition-colors">
                Sign In
              </Link>
              <Link href="/subscribe" className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Get Started
              </Link>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6 text-black dark:text-white" /> : <Menu className="w-6 h-6 text-black dark:text-white" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex flex-col gap-4">
                <Link href="#features" className="text-sm text-gray-500">Features</Link>
                <Link href="#pricing" className="text-sm text-gray-500">Pricing</Link>
                <Link href="/download" className="text-sm text-gray-500">Download</Link>
                <hr className="border-gray-200 dark:border-gray-800" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Theme</span>
                  <ThemeToggle />
                </div>
                <Link href="/login" className="text-sm font-medium text-black dark:text-white">Sign In</Link>
                <Link href="/subscribe" className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg text-center">Get Started</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 text-sm text-blue-500 mb-6">
            <Zap className="w-4 h-4" />
            <span>Now with GPT-4 &amp; Claude 3</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-black dark:text-white mb-6 leading-tight">
            Bring AI to Your<br />Legacy Systems
          </h1>

          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
            Connect your existing databases and enterprise systems to powerful AI models. 
            Query your data in natural language.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/subscribe" className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium inline-flex items-center justify-center gap-2">
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/download" className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-700 text-black dark:text-white rounded-lg hover:border-blue-500 transition-colors font-medium inline-flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download App
            </Link>
          </div>

          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Free 14-day trial</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-blue-500" /> No credit card</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-black dark:text-white mb-4">Why AI Nexus?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Everything you need to modernize your legacy systems with AI</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Database className="w-6 h-6" />}
              title="10+ Database Connectors"
              description="PostgreSQL, MySQL, Oracle, SQL Server, MongoDB, and more."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Multiple AI Providers"
              description="OpenAI, Anthropic, Google, Mistral, or run local with Ollama."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Privacy First"
              description="Your data never leaves your infrastructure. Fully air-gapped option."
            />
            <FeatureCard
              icon={<MessageSquare className="w-6 h-6" />}
              title="Natural Language Queries"
              description="Ask questions in plain English and get instant SQL results."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Hybrid Architecture"
              description="Desktop app for processing, cloud for licensing. Best of both."
            />
            <FeatureCard
              icon={<ChevronRight className="w-6 h-6" />}
              title="Extensible Plugins"
              description="Add new databases and AI providers via our plugin marketplace."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-black dark:text-white mb-4">Simple Pricing</h2>
            <p className="text-gray-500">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <PricingCard
              name="Starter"
              price="$0"
              period="14-day trial"
              features={['1 device', '100 queries/month', 'All AI providers', 'Email support']}
              cta="Start Trial"
              ctaLink="/download"
            />
            <PricingCard
              name="Professional"
              price="$49"
              period="per month"
              features={['3 devices', 'Unlimited queries', 'All AI providers', 'Priority support']}
              cta="Subscribe"
              ctaLink="/subscribe?plan=pro"
              highlighted
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              period="contact us"
              features={['Unlimited devices', 'On-premise option', 'White-label', 'Dedicated support']}
              cta="Contact Sales"
              ctaLink="/contact"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-black dark:text-white mb-4">What Our Users Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="AI Nexus helped us unlock insights from our legacy Oracle database that we thought were impossible to get."
              author="Sarah Chen"
              role="CTO, TechCorp"
            />
            <TestimonialCard
              quote="The natural language queries are a game-changer. Our non-technical team can now access data directly."
              author="Michael Torres"
              role="Data Lead, FinanceHub"
            />
            <TestimonialCard
              quote="Finally, a tool that respects data privacy. Everything runs locally - exactly what we needed."
              author="Emily Watson"
              role="CISO, SecureBank"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold text-black dark:text-white mb-4">Ready to get started?</h2>
          <p className="text-gray-500 mb-8">Download AI Nexus and start your free trial today.</p>
          <Link href="/download" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
            <Download className="w-4 h-4" />
            Download Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-blue-500" />
                <span className="font-semibold text-black dark:text-white">AI Nexus</span>
              </div>
              <p className="text-sm text-gray-500">Bringing AI to your legacy systems.</p>
            </div>
            <div>
              <h4 className="font-medium text-black dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/#features" className="hover:text-blue-500">Features</Link></li>
                <li><Link href="/#pricing" className="hover:text-blue-500">Pricing</Link></li>
                <li><Link href="/download" className="hover:text-blue-500">Download</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-black dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/about" className="hover:text-blue-500">About</Link></li>
                <li><Link href="/contact" className="hover:text-blue-500">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-black dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/privacy" className="hover:text-blue-500">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-blue-500">Terms of Service</Link></li>
                <li><Link href="/refund" className="hover:text-blue-500">Refund Policy</Link></li>
                <li><Link href="/cookies" className="hover:text-blue-500">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500">
            <p>&copy; 2026 AI Nexus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-black dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

function PricingCard({ name, price, period, features, cta, ctaLink, highlighted = false }: {
  name: string; price: string; period: string; features: string[]; cta: string; ctaLink: string; highlighted?: boolean;
}) {
  return (
    <div className={`p-6 rounded-lg border ${highlighted ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-800'}`}>
      {highlighted && <div className="text-xs font-medium text-blue-500 mb-2">MOST POPULAR</div>}
      <h3 className="text-lg font-medium text-black dark:text-white">{name}</h3>
      <div className="mt-2 mb-4">
        <span className="text-3xl font-semibold text-black dark:text-white">{price}</span>
        <span className="text-gray-500 text-sm"> /{period}</span>
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            {f}
          </li>
        ))}
      </ul>
      <Link href={ctaLink} className={`block text-center py-2 rounded-lg font-medium text-sm ${highlighted ? 'bg-blue-500 text-white hover:bg-blue-600' : 'border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:border-blue-500'}`}>
        {cta}
      </Link>
    </div>
  );
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-blue-500 fill-blue-500" />)}
      </div>
      <p className="text-sm text-gray-500 mb-4">&quot;{quote}&quot;</p>
      <div>
        <div className="font-medium text-black dark:text-white text-sm">{author}</div>
        <div className="text-xs text-gray-500">{role}</div>
      </div>
    </div>
  );
}
