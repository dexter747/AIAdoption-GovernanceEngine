'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function ContactPage() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFormState('success');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-xl font-medium bg-gradient-to-r from-primary to-zinc-600 bg-clip-text text-transparent">
                Velanova
              </span>
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-medium text-foreground mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a question or need help? We&apos;re here for you. Choose how you&apos;d like to
              reach us.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-muted/30 border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Email Us</h3>
              <p className="text-muted-foreground text-sm mb-4">
                For general inquiries and support
              </p>
              <a href="mailto:hello@velanova.com" className="text-primary hover:underline">
                hello@velanova.com
              </a>
            </div>

            <div className="bg-muted/30 border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Live Chat</h3>
              <p className="text-muted-foreground text-sm mb-4">Available Mon-Fri, 9am-6pm PST</p>
              <button className="text-primary hover:underline">Start a conversation</button>
            </div>

            <div className="bg-muted/30 border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Sales</h3>
              <p className="text-muted-foreground text-sm mb-4">
                For enterprise and partnership inquiries
              </p>
              <a href="mailto:sales@velanova.com" className="text-primary hover:underline">
                sales@velanova.com
              </a>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-medium text-foreground mb-6">Send us a Message</h2>

              {formState === 'success' ? (
                <div className="bg-white/5 border border-zinc-700/30 rounded-2xl p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-foreground mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground mb-6">
                    Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setFormState('idle');
                      setFormData({ name: '', email: '', subject: '', message: '' });
                    }}
                    className="text-primary hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    >
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="enterprise">Enterprise Sales</option>
                      <option value="partnership">Partnership</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formState === 'submitting'}
                    className="w-full px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formState === 'submitting' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Office Info */}
            <div>
              <h2 className="text-2xl font-medium text-foreground mb-6">Our Office</h2>

              <div className="bg-muted/30 border border-border rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Headquarters</h3>
                    <p className="text-muted-foreground">
                      123 Tech Street, Suite 500
                      <br />
                      San Francisco, CA 94105
                      <br />
                      United States
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="font-medium text-foreground mb-4">Frequently Asked</h3>
              <div className="space-y-4">
                <div className="bg-muted/30 border border-border rounded-xl p-4">
                  <h4 className="font-medium text-foreground mb-2">How long does support take?</h4>
                  <p className="text-muted-foreground text-sm">
                    We typically respond within 24 hours for general inquiries and 4 hours for
                    urgent technical issues.
                  </p>
                </div>
                <div className="bg-muted/30 border border-border rounded-xl p-4">
                  <h4 className="font-medium text-foreground mb-2">Do you offer demos?</h4>
                  <p className="text-muted-foreground text-sm">
                    Yes! Contact our sales team to schedule a personalized demo for your
                    organization.
                  </p>
                </div>
                <div className="bg-muted/30 border border-border rounded-xl p-4">
                  <h4 className="font-medium text-foreground mb-2">Can I get a custom plan?</h4>
                  <p className="text-muted-foreground text-sm">
                    Absolutely. Our Enterprise plan is fully customizable to your needs. Let&apos;s
                    talk!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© 2025 Velanova. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm text-primary hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
