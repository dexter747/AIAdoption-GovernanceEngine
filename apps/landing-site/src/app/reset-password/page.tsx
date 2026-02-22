'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md bg-black border border-zinc-800 text-center">
          <h1 className="text-xl font-medium text-white mb-3">Invalid Reset Link</h1>
          <p className="text-zinc-500 text-sm mb-6">
            This password reset link is invalid or missing. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="block w-full py-3 px-4 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-colors"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md bg-black border border-zinc-800 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-medium text-white mb-3">Password Reset!</h1>
          <p className="text-zinc-500 text-sm mb-8">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 px-4 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-colors"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md bg-black border border-zinc-800">
        <div className="flex flex-col items-center mb-8">
          <Sparkles className="w-10 h-10 text-zinc-300 mb-4" />
          <h1 className="font-medium text-white text-xl">Set new password</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Choose a strong password for your account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 border rounded-lg bg-red-500/10 border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                placeholder="Min 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                placeholder="Repeat password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <Sparkles className="w-10 h-10 text-zinc-300 animate-pulse" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
