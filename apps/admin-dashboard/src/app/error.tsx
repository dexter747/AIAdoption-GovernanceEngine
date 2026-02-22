'use client';

import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="w-16 h-16 text-red-400" />
        </div>

        <h1 className="text-2xl font-bold mb-2 text-white">Something went wrong</h1>
        <p className="text-zinc-500 mb-2">An unexpected error occurred. Please try again.</p>
        {error.digest && (
          <p className="text-xs text-zinc-600 mb-6 font-mono">Error ID: {error.digest}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors font-medium text-white"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
