'use client';

import { useEffect } from 'react';
import { Sparkles, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-black">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-6">
              <Sparkles className="w-16 h-16 text-zinc-400" />
            </div>

            <h1 className="font-medium mb-2 text-white">Something went wrong!</h1>
            <p className="text-muted-foreground mb-8">
              An unexpected error occurred. Please try again.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => reset()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg hover:border-zinc-700 transition-colors font-medium border-zinc-800 text-white"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
