'use client';

import Link from 'next/link';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <ShieldAlert className="w-16 h-16 text-zinc-400" />
        </div>

        <h1 className="text-4xl font-bold mb-2 text-white">404</h1>
        <h2 className="text-lg font-medium mb-4 text-zinc-400">Page Not Found</h2>
        <p className="text-zinc-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors font-medium text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
