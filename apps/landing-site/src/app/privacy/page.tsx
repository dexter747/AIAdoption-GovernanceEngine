import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for Velanova. Learn how we collect, use, and protect your data when using our AI-powered database platform.',
};

export default function PrivacyPolicy() {
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
        <h1 className="text-4xl font-medium text-foreground mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 1, 2025</p>

        <div className="max-w-none space-y-8 prose-invert">
          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Velanova (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to
              protecting your privacy. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our desktop application and related
              services (the &quot;Service&quot;).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              This policy complies with the General Data Protection Regulation (GDPR), California
              Consumer Privacy Act (CCPA), and other applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">2. Information We Collect</h2>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">
              2.1 Information You Provide
            </h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Account information (name, email address)</li>
              <li>Payment information (processed securely via PayPal & Lemon Squeezy)</li>
              <li>Support communications</li>
              <li>Feedback and survey responses</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">
              2.2 Information Collected Automatically
            </h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Device information (operating system, hardware specs)</li>
              <li>Usage data (feature usage, error logs)</li>
              <li>IP address (for licensing verification only)</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">
              2.3 Data We Do NOT Collect
            </h3>
            <div className="bg-white/5 border border-zinc-700/30 rounded-lg p-4 mt-4">
              <p className="text-foreground font-medium">Zero-Knowledge Architecture</p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-2">
                <li>We do NOT access, store, or transmit your database contents</li>
                <li>We do NOT store your AI queries or responses</li>
                <li>We do NOT have access to your API keys (stored locally on your device)</li>
                <li>All data processing happens locally on your machine</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>To provide and maintain the Service</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send important updates and security notices</li>
              <li>To respond to support requests</li>
              <li>To improve our products and services</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">
              4. Legal Basis for Processing (GDPR)
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Under the GDPR, we process your data based on:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>
                <strong>Contractual necessity:</strong> To fulfill our service agreement with you
              </li>
              <li>
                <strong>Legitimate interests:</strong> To improve our services and prevent fraud
              </li>
              <li>
                <strong>Consent:</strong> For marketing communications (you can opt-out anytime)
              </li>
              <li>
                <strong>Legal obligation:</strong> To comply with applicable laws
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">5. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your location, you may have the following rights:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">GDPR Rights (EU/EEA)</h4>
                <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
                  <li>Right to access</li>
                  <li>Right to rectification</li>
                  <li>Right to erasure</li>
                  <li>Right to restrict processing</li>
                  <li>Right to data portability</li>
                  <li>Right to object</li>
                  <li>Rights related to automated decision-making</li>
                </ul>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">CCPA Rights (California)</h4>
                <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
                  <li>Right to know what data is collected</li>
                  <li>Right to delete personal information</li>
                  <li>Right to opt-out of sale of data</li>
                  <li>Right to non-discrimination</li>
                </ul>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@velanova.com" className="text-primary hover:underline">
                privacy@velanova.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>End-to-end encryption for data in transit (TLS 1.3)</li>
              <li>Encryption at rest for stored data (AES-256)</li>
              <li>Regular security audits and penetration testing</li>
              <li>SOC 2 Type II compliance</li>
              <li>Secure development practices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal data only for as long as necessary to fulfill the purposes
              outlined in this policy, unless a longer retention period is required by law. Account
              data is retained for the duration of your account plus 30 days after deletion request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">
              8. International Data Transfers
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If we transfer data outside the EU/EEA, we ensure appropriate safeguards are in place,
              such as Standard Contractual Clauses (SCCs) or adequacy decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">9. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the following third-party services:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>
                <strong>PayPal:</strong> Payment processing (
                <a
                  href="https://www.paypal.com/webapps/mpp/ua/privacy-full"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </a>
                )
              </li>
              <li>
                <strong>Lemon Squeezy:</strong> Subscription & digital product management (
                <a
                  href="https://www.lemonsqueezy.com/privacy"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </a>
                )
              </li>
              <li>
                <strong>Supabase:</strong> Authentication and database (
                <a href="https://supabase.com/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
                )
              </li>
              <li>
                <strong>Vercel:</strong> Website hosting (
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </a>
                )
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">
              10. Children&apos;s Privacy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service is not intended for individuals under 16 years of age. We do not knowingly
              collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">
              11. Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the &quot;Last
              updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about this Privacy Policy or to exercise your rights, contact our Data
              Protection Officer:
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="text-foreground">Velanova Privacy Team</p>
              <p className="text-muted-foreground">
                Email:{' '}
                <a href="mailto:privacy@velanova.com" className="text-primary hover:underline">
                  privacy@velanova.com
                </a>
              </p>
              <p className="text-muted-foreground">
                Address: 123 Tech Street, San Francisco, CA 94105, USA
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              EU residents may also lodge a complaint with their local data protection authority.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© 2025 Velanova. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/privacy" className="text-sm text-primary hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
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
