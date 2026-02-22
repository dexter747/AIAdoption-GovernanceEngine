import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of Service for Velanova. Read our terms governing the use of our AI-powered database intelligence platform.',
};

export default function TermsOfService() {
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

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-medium text-foreground mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 1, 2025</p>

        <div className="max-w-none space-y-8 prose-invert">
          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Velanova (the &quot;Service&quot;), you agree to be bound by
              these Terms of Service (&quot;Terms&quot;). If you disagree with any part of these
              terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Velanova is a desktop application that enables users to connect their databases and
              enterprise systems to various AI models for natural language querying and data
              analysis. The Service includes:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Desktop application for Windows, macOS, and Linux</li>
              <li>Database connectors and integrations</li>
              <li>AI provider integrations (OpenAI, Anthropic, Google, etc.)</li>
              <li>License management and subscription services</li>
              <li>Support and documentation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">3. Account Registration</h2>
            <p className="text-muted-foreground leading-relaxed">
              To use certain features of the Service, you must:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Create an account with accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be at least 16 years of age (or the age of majority in your jurisdiction)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You are responsible for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">4. License Grant</h2>
            <p className="text-muted-foreground leading-relaxed">
              Subject to these Terms and payment of applicable fees, we grant you a limited,
              non-exclusive, non-transferable, revocable license to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Download and install the desktop application</li>
              <li>Use the Service for your personal or internal business purposes</li>
              <li>Access documentation and support resources</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">5. Restrictions</h2>
            <p className="text-muted-foreground leading-relaxed">You agree NOT to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Reverse engineer, decompile, or disassemble the software</li>
              <li>Modify, adapt, or create derivative works</li>
              <li>Remove or alter any proprietary notices</li>
              <li>Use the Service for illegal purposes</li>
              <li>Share your license key with unauthorized users</li>
              <li>Exceed the usage limits of your subscription plan</li>
              <li>Attempt to bypass any security or access controls</li>
              <li>Use the Service to compete with Velanova</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">
              6. Subscription and Payments
            </h2>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">6.1 Pricing</h3>
            <p className="text-muted-foreground leading-relaxed">
              Subscription fees are as listed on our pricing page. We reserve the right to change
              prices with 30 days&apos; notice.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">6.2 Billing</h3>
            <p className="text-muted-foreground leading-relaxed">
              Subscriptions are billed in advance on a monthly or annual basis. All fees are
              non-refundable except as stated in our Refund Policy.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">6.3 Free Trial</h3>
            <p className="text-muted-foreground leading-relaxed">
              We may offer free trials. If you don&apos;t cancel before the trial ends, you will be
              charged the applicable subscription fee.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">7. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service integrates with third-party AI providers (OpenAI, Anthropic, Google,
              etc.). Your use of these services is subject to their respective terms and privacy
              policies. We are not responsible for third-party services.
            </p>
            <div className="bg-white/5 border border-zinc-700/30 rounded-lg p-4 mt-4">
              <p className="text-foreground font-medium">Important:</p>
              <p className="text-muted-foreground mt-2">
                When using third-party AI providers, your queries and data may be transmitted to
                their servers according to their terms. For maximum privacy, use local AI models via
                Ollama.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">8. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service and its original content, features, and functionality are owned by
              Velanova and are protected by international copyright, trademark, and other
              intellectual property laws.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You retain ownership of any data you process through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">
              9. Disclaimer of Warranties
            </h2>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-muted-foreground leading-relaxed">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
                WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL
                BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                AI-GENERATED OUTPUTS MAY CONTAIN ERRORS OR INACCURACIES. YOU ARE RESPONSIBLE FOR
                VERIFYING ALL OUTPUTS BEFORE RELYING ON THEM.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">
              10. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, VELANOVA SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
              REVENUES.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Our total liability shall not exceed the amount paid by you in the 12 months preceding
              the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">11. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless Velanova from any claims arising from your
              use of the Service, violation of these Terms, or infringement of any third-party
              rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">12. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your access immediately, without prior notice, for any
              breach of these Terms. Upon termination:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Your license to use the Service ends immediately</li>
              <li>You must uninstall the desktop application</li>
              <li>We may delete your account data after 30 days</li>
              <li>Provisions that should survive termination will remain in effect</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">13. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by the laws of the State of California, United States,
              without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">14. Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed">
              Any disputes arising from these Terms shall be resolved through binding arbitration in
              San Francisco, California, except that either party may seek injunctive relief in
              court.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">15. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will provide notice of
              material changes via email or through the Service. Continued use after changes
              constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">16. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, contact us at:
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="text-foreground">Velanova Legal Team</p>
              <p className="text-muted-foreground">
                Email:{' '}
                <a href="mailto:legal@velanova.com" className="text-primary hover:underline">
                  legal@velanova.com
                </a>
              </p>
              <p className="text-muted-foreground">
                Address: 123 Tech Street, San Francisco, CA 94105, USA
              </p>
            </div>
          </section>
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
            <Link href="/terms" className="text-sm text-primary hover:underline">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground">
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
