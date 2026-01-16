'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if this is a desktop app login request
  const isDesktop = searchParams.get('desktop') === 'true';
  const desktopCallback = searchParams.get('callback');
  
  // Set callback URL - if desktop, redirect to desktop callback page
  const callbackUrl = isDesktop 
    ? `/auth/desktop-callback?callback=${encodeURIComponent(desktopCallback || 'ainexus://auth/callback')}`
    : searchParams.get('callbackUrl') || '/download';

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            AI Nexus
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {isDesktop ? 'Sign in to continue to the desktop app' : 'Bring AI to Your Legacy Systems'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Heading */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-black dark:text-white">Welcome Back</h2>
            <p className="text-gray-500 text-sm">
              Sign in to access your account
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-black dark:text-white font-medium">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Continue with Google'
              )}
            </span>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-3 bg-white dark:bg-black text-gray-500 font-medium">
                New to AI Nexus?
              </span>
            </div>
          </div>

          {/* Subscribe Link */}
          <Link
            href="/subscribe"
            className="block w-full text-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
          >
            Get Started with a Free Trial
          </Link>
        </div>

        {/* Footer Links */}
        <div className="mt-8 space-y-4">
          <p className="text-center text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-blue-500 hover:underline font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-500 hover:underline font-medium">
              Privacy Policy
            </Link>
          </p>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
