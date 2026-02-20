'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface UserData {
 id: string;
 email: string;
 name?: string;
 image?: string;
 plan?: string;
}

function DesktopCallbackContent() {
 const searchParams = useSearchParams();
 const [redirected, setRedirected] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [user, setUser] = useState<UserData | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 
 // Get tokens from URL params (set by Google callback)
 const tokenFromUrl = searchParams.get('token');
 const refreshFromUrl = searchParams.get('refresh');

 const sendAuthToDesktop = async (jwtToken: string, refreshToken: string, userData: UserData) => {
 const userParam = encodeURIComponent(JSON.stringify(userData));
 const httpCallbackUrl = `http://localhost:42069/auth/callback?token=${jwtToken}&refresh=${refreshToken}&user=${userParam}`;
 const deepLinkUrl = `velanova://auth/callback?token=${jwtToken}&refresh=${refreshToken}&user=${userParam}`;
 
 console.log('🔗 Sending JWT to desktop app');
 
 try {
 // Try HTTP callback first (most reliable in development)
 await fetch(httpCallbackUrl, { mode: 'no-cors' });
 console.log('✅ HTTP callback succeeded');
 } catch (err) {
 console.log('⚠️ HTTP callback failed, trying deep link:', err);
 
 // Fallback to deep link
 const iframe = document.createElement('iframe');
 iframe.style.display = 'none';
 iframe.src = deepLinkUrl;
 document.body.appendChild(iframe);
 
 setTimeout(() => {
 window.location.href = deepLinkUrl;
 }, 100);
 
 setTimeout(() => {
 if (iframe.parentNode) {
 document.body.removeChild(iframe);
 }
 }, 2000);
 }
 };

 useEffect(() => {
 // If we have tokens from URL, use them directly
 if (tokenFromUrl && !redirected) {
 setRedirected(true);
 setIsLoading(false);
 
 // Decode user from token
 try {
 const parts = tokenFromUrl.split('.');
 if (parts.length === 3) {
 const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
 const userData = {
 id: payload.sub,
 email: payload.email,
 name: payload.name,
 image: payload.image,
 plan: payload.plan || 'trial',
 };
 setUser(userData);
 
 setTimeout(() => {
 sendAuthToDesktop(tokenFromUrl, refreshFromUrl || '', userData);
 }, 1000);
 }
 } catch (err) {
 console.error('Failed to decode token:', err);
 setError('Invalid token received');
 }
 return;
 }

 // Otherwise, fetch from session cookie
 if (!redirected && !tokenFromUrl) {
 fetch('/api/auth/token')
 .then(async (res) => {
 if (!res.ok) {
 throw new Error('Not authenticated');
 }
 return res.json();
 })
 .then((data) => {
 setUser(data.user);
 setIsLoading(false);
 setRedirected(true);
 
 setTimeout(() => {
 sendAuthToDesktop(data.token, data.refreshToken, data.user);
 }, 1000);
 })
 .catch((err) => {
 console.error('Failed to get token:', err);
 setError('Please sign in first');
 setIsLoading(false);
 });
 }
 }, [tokenFromUrl, refreshFromUrl, redirected]);

 const handleManualRedirect = async () => {
 if (tokenFromUrl && user) {
 await sendAuthToDesktop(tokenFromUrl, refreshFromUrl || '', user);
 return;
 }
 
 try {
 const res = await fetch('/api/auth/token');
 if (!res.ok) {
 throw new Error('Not authenticated');
 }
 const data = await res.json();
 await sendAuthToDesktop(data.token, data.refreshToken, data.user);
 } catch (err: any) {
 console.error('Manual redirect failed:', err);
 setError(err.message);
 }
 };

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-black">
 <div className="text-center">
 <Loader2 className="w-8 h-8 text-zinc-300 animate-spin mx-auto mb-4" />
 <p className="text-muted-foreground">Completing authentication...</p>
 </div>
 </div>
 );
 }

 if (error && !user) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-black">
 <div className="text-center max-w-md px-4">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-zinc-900/40">
 <AlertCircle className="w-8 h-8 text-zinc-400" />
 </div>
 <h1 className="font-medium mb-2 text-white">Authentication Required</h1>
 <p className="text-muted-foreground mb-6">{error}</p>
 <a 
 href="/login?desktop=true"
 className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors font-medium"
 >
 Sign In
 </a>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen flex items-center justify-center bg-black">
 <div className="text-center max-w-md px-4">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-zinc-900/40">
 <CheckCircle className="w-8 h-8 text-zinc-400" />
 </div>
 <h1 className="font-medium mb-2 text-white">Authentication Successful!</h1>
 <p className="text-muted-foreground mb-6">
 You've been authenticated as <strong className="text-white">{user?.name || user?.email}</strong>. 
 Redirecting you back to the Velanova app...
 </p>
 <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
 <Loader2 className="w-4 h-4 animate-spin" />
 Opening desktop app...
 </div>
 
 <div className="space-y-3">
 <button 
 onClick={handleManualRedirect}
 className="w-full px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors font-medium"
 >
 Open Desktop App Manually
 </button>
 
 <p className="text-xs text-muted-foreground">
 If the app doesn't open automatically, click the button above.
 </p>
 </div>
 </div>
 </div>
 );
}

function LoadingFallback() {
 return (
 <div className="min-h-screen flex items-center justify-center bg-black">
 <div className="text-center">
 <Loader2 className="w-8 h-8 text-zinc-300 animate-spin mx-auto mb-4" />
 <p className="text-muted-foreground">Loading...</p>
 </div>
 </div>
 );
}

export default function DesktopCallbackPage() {
 return (
 <Suspense fallback={<LoadingFallback />}>
 <DesktopCallbackContent />
 </Suspense>
 );
}
