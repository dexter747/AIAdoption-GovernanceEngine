'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      setSent(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md bg-black border border-zinc-800 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-medium text-white mb-3">Check your email</h1>
          <p className="text-zinc-500 text-sm leading-relaxed mb-2">
            If an account exists for <span className="text-white font-medium">{email}</span>,
            we&apos;ve sent a password reset link.
          </p>
          <p className="text-zinc-600 text-sm mb-8">The link will expire in 1 hour.</p>
          <Link
            href="/login"
            className="block w-full py-3 px-4 border border-zinc-700 text-white font-medium rounded-xl hover:bg-zinc-950 hover:border-zinc-600 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md bg-black border border-zinc-800">
        <div className="flex flex-col items-center mb-8">
          <Sparkles className="w-10 h-10 text-zinc-300 mb-4" />
          <h1 className="font-medium text-white text-xl">Forgot password?</h1>
          <p className="text-muted-foreground text-sm mt-2 text-center">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 border rounded-lg bg-red-500/10 border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800 text-center space-y-3">
          <Link
            href="/login"
            className="block text-sm text-zinc-400 hover:text-white transition-colors font-medium"
          >
            Back to Sign In
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
