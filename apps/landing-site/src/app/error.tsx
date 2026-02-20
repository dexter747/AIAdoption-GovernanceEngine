'use client';

import { useEffect } from 'react';
import { Sparkles, RefreshCw, ArrowLeft } from 'lucide-react';

export default function Error({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 useEffect(() => {
 // Log the error to console for debugging
 console.error('Page error:', error);
 }, [error]);

 return (
 <div className="min-h-screen flex items-center justify-center p-4 bg-black">
 <div className="text-center max-w-md">
 <div className="flex justify-center mb-6">
 <Sparkles className="w-16 h-16 text-orange-500" />
 </div>
 
 <h1 className="font-medium mb-2 text-white">
 Oops! Something went wrong
 </h1>
 <p className="text-muted-foreground mb-2">
 We encountered an error loading this page.
 </p>
 {error.message && (
 <p className="text-sm text-muted-foreground mb-6 font-mono p-2 rounded bg-gray-900">
 {error.message}
 </p>
 )}
 
 <div className="flex flex-col sm:flex-row gap-3 justify-center">
 <button
 onClick={() => reset()}
 className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
 >
 <RefreshCw className="w-4 h-4" />
 Try Again
 </button>
 <button
 onClick={() => window.history.back()}
 className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg hover:border-blue-500 transition-colors font-medium border-gray-700 text-white"
 >
 <ArrowLeft className="w-4 h-4" />
 Go Back
 </button>
 </div>
 </div>
 </div>
 );
}
