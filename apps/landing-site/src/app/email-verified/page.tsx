'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

function EmailVerifiedContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const reason = searchParams.get('reason');

  const isSuccess = status === 'success';

  const errorMessages: Record<string, string> = {
    missing_token: 'No verification token was provided.',
    invalid_token: 'The verification link is invalid or has expired.',
    user_not_found: "We couldn't find your account.",
    server_error: 'Something went wrong on our end.',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md bg-black border border-zinc-800 text-center">
        {isSuccess ? (
          <>
            {/* Success */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-medium text-white mb-3">Email Verified!</h1>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8">
              Your email has been verified successfully. Your account is now fully active.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Sign In Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        ) : (
          <>
            {/* Error */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-medium text-white mb-3">Verification Failed</h1>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              {errorMessages[reason || ''] || 'The verification link is invalid or has expired.'}
            </p>
            <div className="space-y-3">
              <Link
                href="/signup"
                className="block w-full py-3 px-4 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Try Again
              </Link>
              <Link
                href="/login"
                className="block w-full py-3 px-4 border border-zinc-700 text-white font-medium rounded-xl hover:bg-zinc-950 hover:border-zinc-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </>
        )}

        {/* Back */}
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-white"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EmailVerifiedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <Sparkles className="w-10 h-10 text-zinc-300 animate-pulse" />
        </div>
      }
    >
      <EmailVerifiedContent />
    </Suspense>
  );
}
