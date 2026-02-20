'use client';

import Link from 'next/link';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
 return (
 <div className="min-h-screen flex items-center justify-center p-4 bg-black">
 <div className="text-center max-w-md">
 <div className="flex justify-center mb-6">
 <Sparkles className="w-16 h-16 text-blue-500" />
 </div>
 
 <h1 className="font-medium mb-2 text-white">404</h1>
 <h2 className="font-medium mb-4 text-gray-300">
 Page Not Found
 </h2>
 <p className="text-muted-foreground mb-8">
 The page you're looking for doesn't exist or has been moved.
 </p>
 
 <div className="flex flex-col sm:flex-row gap-3 justify-center">
 <Link 
 href="/"
 className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
 >
 <Home className="w-4 h-4" />
 Go Home
 </Link>
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
