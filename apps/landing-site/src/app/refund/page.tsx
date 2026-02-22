'use client';

import Link from 'next/link';
import { Sparkles, ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function RefundPolicy() {
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
        <h1 className="text-4xl font-medium text-foreground mb-4">Refund Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 1, 2025</p>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-foreground mb-2">30-Day Money-Back Guarantee</h2>
          <p className="text-muted-foreground">
            We stand behind our product. If you&apos;re not satisfied with Velanova, we&apos;ll
            refund your purchase within 30 days of payment—no questions asked.
          </p>
        </div>

        <div className="max-w-none space-y-8 prose-invert">
          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">1. Eligible for Refund</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">First-time subscription payments</p>
                  <p className="text-muted-foreground text-sm">
                    Refundable within 30 days of initial purchase
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Plan upgrades</p>
                  <p className="text-muted-foreground text-sm">
                    Prorated difference refundable within 14 days of upgrade
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Annual subscriptions</p>
                  <p className="text-muted-foreground text-sm">
                    Full refund within 30 days, or prorated refund within 90 days
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Service outages</p>
                  <p className="text-muted-foreground text-sm">
                    Prorated credit for downtime exceeding 24 hours
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">
              2. Not Eligible for Refund
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Renewal payments</p>
                  <p className="text-muted-foreground text-sm">
                    Automatic renewals are non-refundable (you can cancel before renewal)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Requests after 30 days</p>
                  <p className="text-muted-foreground text-sm">
                    The refund window closes 30 days after purchase
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Terms of Service violations</p>
                  <p className="text-muted-foreground text-sm">
                    Accounts terminated for abuse are not eligible
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Third-party charges</p>
                  <p className="text-muted-foreground text-sm">
                    API costs from OpenAI, Anthropic, etc. are billed by those providers
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">
              3. How to Request a Refund
            </h2>
            <div className="bg-muted/50 rounded-lg p-6">
              <ol className="list-decimal pl-6 text-muted-foreground space-y-4">
                <li>
                  <strong className="text-foreground">Email us</strong> at{' '}
                  <a href="mailto:billing@velanova.com" className="text-primary hover:underline">
                    billing@velanova.com
                  </a>{' '}
                  with subject line &quot;Refund Request&quot;
                </li>
                <li>
                  <strong className="text-foreground">Include:</strong>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Your account email address</li>
                    <li>Order/transaction ID (from your receipt)</li>
                    <li>Reason for refund (optional, but helps us improve)</li>
                  </ul>
                </li>
                <li>
                  <strong className="text-foreground">Wait for confirmation</strong> – We&apos;ll
                  respond within 2 business days
                </li>
                <li>
                  <strong className="text-foreground">Receive your refund</strong> – Processed
                  within 5-10 business days to your original payment method
                </li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">
              4. Subscription Cancellation
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You can cancel your subscription at any time from your account settings or by
              contacting support. Upon cancellation:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>You&apos;ll retain access until the end of your current billing period</li>
              <li>No further charges will be made</li>
              <li>Your data will be retained for 30 days, then deleted</li>
            </ul>
            <div className="flex items-start gap-3 bg-white/5 border border-zinc-700/30 rounded-lg p-4 mt-4">
              <AlertCircle className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                <strong className="text-foreground">Tip:</strong> Cancel at least 24 hours before
                your renewal date to avoid being charged for the next billing cycle.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">5. Plan Downgrades</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you downgrade to a lower-tier plan:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>The new rate takes effect at the start of your next billing cycle</li>
              <li>No refund is provided for the remaining time on the higher tier</li>
              <li>
                Features from the higher tier will be disabled at the end of the current period
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">6. Free Trial</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our 14-day free trial requires no payment information. You will only be charged if
              you:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Explicitly upgrade to a paid plan during or after the trial</li>
              <li>
                Provide payment details and don&apos;t cancel before trial ends (if payment was
                required)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">
              7. Currency and Payment Methods
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              All prices are listed in USD. Refunds are issued in the original payment currency.
              Depending on your bank, currency conversion may result in slight differences from the
              original charge.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">We accept:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
              <li>Credit/Debit cards (Visa, Mastercard, Amex)</li>
              <li>PayPal</li>
              <li>Bank transfers (Enterprise plans only)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">
              8. Disputes and Chargebacks
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We encourage you to contact us before initiating a chargeback with your bank.
              Chargebacks take longer to resolve and may result in account suspension. We&apos;re
              happy to work with you directly to resolve any billing issues.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">
              9. Contact Billing Support
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For any billing questions or refund requests:
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="text-foreground">Velanova Billing Team</p>
              <p className="text-muted-foreground">
                Email:{' '}
                <a href="mailto:billing@velanova.com" className="text-primary hover:underline">
                  billing@velanova.com
                </a>
              </p>
              <p className="text-muted-foreground">Response time: Within 2 business days</p>
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
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/refund" className="text-sm text-primary hover:underline">
              Refund Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
