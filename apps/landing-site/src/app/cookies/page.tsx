'use client';

import Link from 'next/link';
import { Sparkles, ArrowLeft, Cookie, Shield, Settings, BarChart3 } from 'lucide-react';

export default function CookiePolicy() {
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
        <h1 className="text-4xl font-medium text-foreground mb-4">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 1, 2025</p>

        <div className="max-w-none space-y-8 prose-invert">
          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">1. What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are stored on your device (computer, tablet, or
              mobile) when you visit our website. They help us recognize your device and remember
              certain information about your visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">
              2. Types of Cookies We Use
            </h2>

            <div className="grid gap-4 mt-6">
              <div className="border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Essential Cookies</h3>
                    <span className="text-xs bg-white/5 text-zinc-300 px-2 py-0.5 rounded">
                      Required
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  These cookies are necessary for the website to function and cannot be switched
                  off. They are usually set in response to actions you take, such as logging in,
                  filling in forms, or setting privacy preferences.
                </p>
                <div className="mt-4 bg-muted/50 rounded p-3">
                  <p className="text-sm font-medium text-foreground mb-2">Examples:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Session ID cookies</li>
                    <li>• Authentication tokens</li>
                    <li>• CSRF protection tokens</li>
                    <li>• Cookie consent preferences</li>
                  </ul>
                </div>
              </div>

              <div className="border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Functional Cookies</h3>
                    <span className="text-xs bg-white/5 text-zinc-400 px-2 py-0.5 rounded">
                      Optional
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  These cookies enable enhanced functionality and personalization, such as
                  remembering your preferences and settings.
                </p>
                <div className="mt-4 bg-muted/50 rounded p-3">
                  <p className="text-sm font-medium text-foreground mb-2">Examples:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Language preferences</li>
                    <li>• Theme preferences (light/dark mode)</li>
                    <li>• Recently viewed items</li>
                  </ul>
                </div>
              </div>

              <div className="border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Analytics Cookies</h3>
                    <span className="text-xs bg-white/5 text-zinc-300 px-2 py-0.5 rounded">
                      Optional
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  These cookies help us understand how visitors interact with our website by
                  collecting and reporting information anonymously.
                </p>
                <div className="mt-4 bg-muted/50 rounded p-3">
                  <p className="text-sm font-medium text-foreground mb-2">Examples:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Page view statistics</li>
                    <li>• Traffic sources</li>
                    <li>• User journey tracking</li>
                    <li>• Performance metrics</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">3. Cookie List</h2>
            <div className="overflow-x-auto">
              <table className="w-full border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Cookie Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 text-sm text-foreground font-mono">auth-token</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">Essential</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">1 hour</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      User authentication (JWT access token)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-foreground font-mono">refresh-token</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">Essential</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">7 days</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Token refresh for seamless authentication
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-foreground font-mono">cookie-consent</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">Essential</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">1 year</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Stores cookie preferences
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-foreground font-mono">theme</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">Functional</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">1 year</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      Light/dark mode preference
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-foreground font-mono">_ga, _gid</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">Analytics</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">2 years / 24h</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">Google Analytics</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">4. Third-Party Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Some cookies are placed by third-party services that appear on our pages. We use:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>
                <strong>Google Analytics:</strong> For understanding website usage (
                <a
                  href="https://policies.google.com/privacy"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </a>
                )
              </li>
              <li>
                <strong>PayPal:</strong> For processing payments (
                <a
                  href="https://www.paypal.com/webapps/mpp/ua/privacy-full"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </a>
                )
              </li>
              <li>
                <strong>Lemon Squeezy:</strong> For subscription management (
                <a
                  href="https://www.lemonsqueezy.com/privacy"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </a>
                )
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">5. Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have several options for managing cookies:
            </p>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Cookie Banner</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you first visit our site, you&apos;ll see a cookie banner where you can accept or
              reject non-essential cookies.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Browser Settings</h3>
            <p className="text-muted-foreground leading-relaxed">
              Most browsers allow you to control cookies through their settings. Here are links to
              manage cookies in popular browsers:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  className="text-primary hover:underline"
                >
                  Google Chrome
                </a>
              </li>
              <li>
                <a
                  href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                  className="text-primary hover:underline"
                >
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a
                  href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                  className="text-primary hover:underline"
                >
                  Safari
                </a>
              </li>
              <li>
                <a
                  href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  className="text-primary hover:underline"
                >
                  Microsoft Edge
                </a>
              </li>
            </ul>

            <div className="bg-white/5 border border-zinc-700/30 rounded-lg p-4 mt-6">
              <p className="text-foreground font-medium">Note:</p>
              <p className="text-muted-foreground mt-2">
                Disabling essential cookies may affect the functionality of the website. Some
                features may not work correctly without them.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">6. Do Not Track</h2>
            <p className="text-muted-foreground leading-relaxed">
              Some browsers have a &quot;Do Not Track&quot; feature that signals to websites that
              you don&apos;t want your online activity tracked. We currently respond to DNT signals
              by disabling analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">7. Desktop Application</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Velanova desktop application does not use cookies. However, it may store local
              preferences and authentication tokens in secure local storage on your device.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">8. Updates to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time. We will notify you of any changes
              by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-foreground mb-4">9. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about our use of cookies, please contact us:
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="text-foreground">Velanova Privacy Team</p>
              <p className="text-muted-foreground">
                Email:{' '}
                <a href="mailto:privacy@velanova.com" className="text-primary hover:underline">
                  privacy@velanova.com
                </a>
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
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-sm text-primary hover:underline">
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
