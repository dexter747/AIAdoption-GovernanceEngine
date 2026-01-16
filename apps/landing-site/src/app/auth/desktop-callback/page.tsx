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
      setRedirected(true);
      
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

      // Try HTTP callback first (more reliable in development)
      const httpCallbackUrl = `http://localhost:42069/auth/callback?token=${token}&user=${user}`;
      const deepLinkUrl = `ainexus://auth/callback?token=${token}&user=${user}`;
      
      console.log('🔗 Trying HTTP callback:', httpCallbackUrl);
      console.log('🔗 Fallback deep link:', deepLinkUrl);
      
      // Small delay to show success message
      setTimeout(() => {
        // Method 1: Try HTTP callback (most reliable in dev)
        fetch(httpCallbackUrl, { mode: 'no-cors' })
          .then(() => {
            console.log('✅ HTTP callback succeeded');
          })
          .catch((err) => {
            console.log('⚠️ HTTP callback failed, trying deep link:', err);
            
            // Fallback to deep link methods
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = deepLinkUrl;
            document.body.appendChild(iframe);
            
            setTimeout(() => {
              window.location.href = deepLinkUrl;
            }, 100);
            
            setTimeout(() => {
              const link = document.createElement('a');
              link.href = deepLinkUrl;
              link.click();
            }, 200);
            
            setTimeout(() => {
              if (iframe.parentNode) {
                document.body.removeChild(iframe);
              }
            }, 2000);
          });
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
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          Opening desktop app...
        </div>
        
        {/* Manual redirect buttons */}
        <div className="space-y-3">
          <button 
            onClick={() => {
              const token = btoa(JSON.stringify({
                id: session?.user?.id || session?.user?.email,
                email: session?.user?.email,
                timestamp: Date.now(),
              }));
              const user = encodeURIComponent(JSON.stringify({
                id: session?.user?.id || session?.user?.email,
                email: session?.user?.email,
                name: session?.user?.name,
                image: session?.user?.image,
              }));
              const httpCallbackUrl = `http://localhost:42069/auth/callback?token=${token}&user=${user}`;
              console.log('Manual HTTP callback:', httpCallbackUrl);
              fetch(httpCallbackUrl, { mode: 'no-cors' })
                .then(() => console.log('✅ Manual HTTP callback succeeded'))
                .catch(err => console.error('❌ Manual HTTP callback failed:', err));
            }}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Open Desktop App Manually (HTTP)
          </button>
          
          <p className="text-xs text-gray-400">
            If the app doesn't open automatically, click the button above or check if the desktop app is running.
          </p>
        </div>
      </div>
    </div>
  );
}
