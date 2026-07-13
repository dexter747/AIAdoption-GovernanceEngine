'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, RefreshCw, ArrowLeft } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setResent(true);
    } catch {
      // silent
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md bg-black border border-zinc-800 text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
          <Mail className="w-10 h-10 text-indigo-400" />
        </div>

        <h1 className="text-2xl font-medium text-white mb-3">Check your email</h1>
        <p className="text-zinc-500 text-sm leading-relaxed mb-2">
          We&apos;ve sent a verification link to
        </p>
        {email && <p className="text-white font-medium mb-6">{email}</p>}
        <p className="text-zinc-500 text-sm leading-relaxed mb-8">
          Click the link in the email to verify your account. The link expires in 24 hours.
        </p>

        {/* Tips */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 mb-6 text-left">
          <p className="text-sm font-medium text-zinc-300 mb-2">Didn&apos;t get the email?</p>
          <ul className="text-sm text-zinc-500 space-y-1">
            <li>• Check your spam or junk folder</li>
            <li>• Make sure you entered the correct email</li>
            <li>• The email might take a few minutes to arrive</li>
          </ul>
        </div>

        {/* Resend button */}
        <button
          onClick={handleResend}
          disabled={resending || resent || !email}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-zinc-700 rounded-xl text-white hover:bg-zinc-950 hover:border-zinc-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
          {resent
            ? 'Verification link re-sent!'
            : resending
              ? 'Sending...'
              : 'Resend verification email'}
        </button>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-800 space-y-3">
          <Link
            href="/login"
            className="block text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Already verified? <span className="font-medium text-zinc-300">Sign in</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <Sparkles className="w-10 h-10 text-zinc-300 animate-pulse" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
