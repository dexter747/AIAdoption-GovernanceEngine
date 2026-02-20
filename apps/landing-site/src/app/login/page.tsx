'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

function LoginContent() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const [isLoading, setIsLoading] = useState(false);
 const error = searchParams.get('error');
 
 // Check if this is a desktop app login request
 const isDesktop = searchParams.get('desktop') === 'true';
 const callbackUrl = searchParams.get('callbackUrl') || '/download';

 const handleGoogleSignIn = () => {
 setIsLoading(true);
 // Redirect to our JWT-based Google OAuth endpoint
 const authUrl = new URL('/api/auth/google', window.location.origin);
 authUrl.searchParams.set('desktop', isDesktop.toString());
 authUrl.searchParams.set('callbackUrl', callbackUrl);
 window.location.href = authUrl.toString();
 };

 return (
 <div className="min-h-screen flex items-center justify-center p-4 bg-black">
 <div className="rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md bg-black border-zinc-800">
 {/* Error Message */}
 {error && (
 <div className="mb-6 p-3 border rounded-lg bg-zinc-900/30 border-zinc-800">
 <p className="text-zinc-400">
 {error === 'oauth_error' && 'Authentication was cancelled or failed.'}
 {error === 'token_exchange_failed' && 'Failed to complete authentication.'}
 {error === 'callback_failed' && 'Something went wrong. Please try again.'}
 {!['oauth_error', 'token_exchange_failed', 'callback_failed'].includes(error) && 'An error occurred. Please try again.'}
 </p>
 </div>
 )}
 
 {/* Logo and Title */}
 <div className="flex flex-col items-center mb-8">
 <div className="flex items-center justify-center gap-2 mb-4">
 <Sparkles className="w-10 h-10 text-zinc-300" />
 </div>
 <h1 className="font-medium text-white">
 Velanova
 </h1>
 <p className="text-muted-foreground text-sm mt-2">
 {isDesktop ? 'Sign in to continue to the desktop app' : 'Bring AI to Your Legacy Systems'}
 </p>
 </div>

 <div className="space-y-6">
 {/* Heading */}
 <div className="text-center space-y-2">
 <h2 className="font-medium text-white">Welcome Back</h2>
 <p className="text-muted-foreground text-sm">
 Sign in to access your account
 </p>
 </div>

 {/* Google Sign In Button */}
 <button
 onClick={handleGoogleSignIn}
 disabled={isLoading}
 className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-zinc-800 hover:bg-zinc-950"
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
 <div className="w-full border-t border-zinc-800"></div>
 </div>
 <div className="relative flex justify-center text-xs uppercase">
 <span className="px-3 text-muted-foreground font-medium bg-black">
 New to Velanova?
 </span>
 </div>
 </div>

 {/* Subscribe Link */}
 <Link
 href="/subscribe"
 className="block w-full text-center px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors font-medium"
 >
 Get Started with a Free Trial
 </Link>
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

function LoadingFallback() {
 return (
 <div className="min-h-screen flex items-center justify-center p-4 bg-black">
 <div className="rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md bg-black border-zinc-800">
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
