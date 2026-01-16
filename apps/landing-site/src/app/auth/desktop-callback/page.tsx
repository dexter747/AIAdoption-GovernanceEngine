'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, CheckCircle, Loader2 } from 'lucide-react';

export default function DesktopCallbackPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user && !redirected) {
      const callback = searchParams.get('callback') || 'ainexus://auth/callback';
      
      // Create a secure token (in production, use a proper JWT)
      const token = btoa(JSON.stringify({
        id: session.user.id || session.user.email,
        email: session.user.email,
        timestamp: Date.now(),
      }));

      const user = encodeURIComponent(JSON.stringify({
        id: session.user.id || session.user.email,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      }));

      // Redirect to desktop app with auth data
      const redirectUrl = `${callback}?token=${token}&user=${user}`;
      
      setRedirected(true);
      
      // Small delay to show success message
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1500);
    }
  }, [status, session, searchParams, redirected]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-black dark:text-white mb-2">Authentication Required</h1>
          <p className="text-gray-500 mb-4">Please sign in first to continue.</p>
          <a 
            href={`/login?desktop=true&callback=${searchParams.get('callback') || 'ainexus://auth/callback'}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Authentication Successful!</h1>
        <p className="text-gray-500 mb-6">
          You've been authenticated as <strong className="text-black dark:text-white">{session?.user?.name}</strong>. 
          Redirecting you back to the AI Nexus app...
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Opening desktop app...
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Not redirecting? <button onClick={() => window.location.href = 'ainexus://auth/callback'} className="text-blue-500 hover:underline">Click here</button>
        </p>
      </div>
    </div>
  );
}
