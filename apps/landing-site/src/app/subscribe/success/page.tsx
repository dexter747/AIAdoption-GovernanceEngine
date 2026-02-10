'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Download, ArrowRight, Loader2, Copy, Check } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (sessionId) {
      // Simulate fetching subscription details
      setTimeout(() => {
        setSubscription({
          plan: 'Professional',
          billingCycle: 'monthly',
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        });
        // Generate mock license key for demo
        setLicenseKey(`AINX-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
        setLoading(false);
      }, 1500);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const copyLicenseKey = () => {
    if (licenseKey) {
      navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-20">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-4xl font-medium text-white mb-2">
            Welcome to AI Nexus!
          </h1>
          <p className="text-xl text-gray-400">
            Your subscription has been activated successfully.
          </p>
        </div>

        {/* Subscription Details */}
        {subscription && (
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-medium text-white mb-4">Subscription Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Plan</span>
                <span className="text-white font-medium">{subscription.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Billing Cycle</span>
                <span className="text-white font-medium capitalize">{subscription.billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Next Billing Date</span>
                <span className="text-white font-medium">{subscription.nextBilling}</span>
              </div>
            </div>
          </div>
        )}

        {/* License Key */}
        {licenseKey && (
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-medium text-white mb-2">Your License Key</h2>
            <p className="text-sm text-gray-400 mb-4">
              Use this key to activate the desktop application.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-3 bg-gray-900 rounded-lg font-mono text-lg text-blue-400 break-all">
                {licenseKey}
              </code>
              <button
                onClick={copyLicenseKey}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Copy license key"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-300" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              A copy of this license has also been sent to your email.
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-medium text-white mb-4">Next Steps</h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full text-white text-sm font-medium">
                1
              </span>
              <div>
                <p className="text-white font-medium">Download the Desktop App</p>
                <p className="text-sm text-gray-400">Get the app for Windows, macOS, or Linux.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full text-white text-sm font-medium">
                2
              </span>
              <div>
                <p className="text-white font-medium">Activate Your License</p>
                <p className="text-sm text-gray-400">Enter your license key in the app settings.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full text-white text-sm font-medium">
                3
              </span>
              <div>
                <p className="text-white font-medium">Connect Your Databases</p>
                <p className="text-sm text-gray-400">Add your database connections and start querying with AI.</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/download"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Desktop App
          </Link>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Support */}
        <p className="text-center text-gray-500 text-sm mt-12">
          Need help? <a href="mailto:support@ainexus.com" className="text-blue-400 hover:underline">Contact our support team</a>
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
