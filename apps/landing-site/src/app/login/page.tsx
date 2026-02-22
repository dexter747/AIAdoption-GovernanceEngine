'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const error = searchParams.get('error');

  // Check if this is a desktop app login request
  const isDesktop = searchParams.get('desktop') === 'true';
  const callbackUrl = searchParams.get('callbackUrl') || '/download';

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    const authUrl = new URL('/api/auth/google', window.location.origin);
    authUrl.searchParams.set('desktop', isDesktop.toString());
    authUrl.searchParams.set('callbackUrl', callbackUrl);
    window.location.href = authUrl.toString();
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsEmailLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'Please verify your email before signing in') {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
        setFormError(data.error || 'Sign in failed');
        return;
      }

      // Successful login — redirect
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setIsEmailLoading(false);
    }
  };

  const displayError =
    formError ||
    (error === 'oauth_error' && 'Authentication was cancelled or failed.') ||
    (error === 'token_exchange_failed' && 'Failed to complete authentication.') ||
    (error === 'callback_failed' && 'Something went wrong. Please try again.') ||
    (error &&
      !['oauth_error', 'token_exchange_failed', 'callback_failed'].includes(error) &&
      'An error occurred. Please try again.') ||
    '';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md bg-black border border-zinc-800">
        {/* Error Message */}
        {displayError && (
          <div className="mb-6 p-3 border rounded-lg bg-red-500/10 border-red-500/20">
            <p className="text-red-400 text-sm">{displayError}</p>
          </div>
        )}

        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <Sparkles className="w-10 h-10 text-zinc-300 mb-4" />
          <h1 className="font-medium text-white text-xl">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mt-2">
            {isDesktop
              ? 'Sign in to continue to the desktop app'
              : 'Sign in to access your account'}
          </p>
        </div>

        <div className="space-y-5">
          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
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
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-zinc-400">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                  placeholder="Your password"
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

            <button
              type="submit"
              disabled={isEmailLoading}
              className="w-full py-3 px-4 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEmailLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-3 text-muted-foreground font-medium bg-black">or</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-950"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#ffffff"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#a1a1aa"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#a1a1aa"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#71717a"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium text-white">
              {isGoogleLoading ? 'Redirecting...' : 'Continue with Google'}
            </span>
          </button>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-zinc-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-white hover:underline font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 space-y-4">
          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-zinc-300 hover:underline font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-zinc-300 hover:underline font-medium">
              Privacy Policy
            </Link>
          </p>

          <div className="pt-4 border-t text-center border-zinc-800">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md bg-black border border-zinc-800">
        <div className="flex flex-col items-center">
          <Sparkles className="w-10 h-10 text-zinc-300 animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginContent />
    </Suspense>
  );
}
