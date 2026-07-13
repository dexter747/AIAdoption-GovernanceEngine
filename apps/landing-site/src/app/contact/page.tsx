'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

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
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-16">
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
              <a href="mailto:info@astraeusnextgen.com" className="text-primary hover:underline">
                info@astraeusnextgen.com
              </a>
            </div>

            <div className="bg-muted/30 border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Call Us</h3>
              <p className="text-muted-foreground text-sm mb-4">Available Mon-Sat, 9am-6pm IST</p>
              <a href="tel:+918530079105" className="text-primary hover:underline">
                +91 85300 79105
              </a>
            </div>

            <div className="bg-muted/30 border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Visit Us</h3>
              <p className="text-muted-foreground text-sm mb-4">Our office in Pune, India</p>
              <span className="text-primary text-sm">Kothrud, Pune</span>
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
                    <h3 className="font-medium text-foreground mb-2">Office</h3>
                    <p className="text-muted-foreground">
                      SNO 7/1 (P) 7/2 NR, Kokan Express
                      <br />
                      Kothrud, Pune, Maharashtra
                      <br />
                      India - 411038
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

      <Footer />
    </div>
  );
}
