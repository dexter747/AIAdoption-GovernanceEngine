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
      <body className="bg-white dark:bg-black">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-6">
              <Sparkles className="w-16 h-16 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-medium text-black dark:text-white mb-2">
              Something went wrong!
            </h1>
            <p className="text-gray-500 mb-8">
              An unexpected error occurred. Please try again.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => reset()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <Link 
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-black dark:text-white rounded-lg hover:border-blue-500 transition-colors font-medium"
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
