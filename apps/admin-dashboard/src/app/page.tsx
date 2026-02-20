'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminHome() {
 const router = useRouter();

 useEffect(() => {
 router.replace('/dashboard');
 }, [router]);

 return (
 <div className="min-h-screen flex items-center justify-center bg-background">
 <div className="text-center">
 <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
 <p className="text-muted-foreground">Redirecting to dashboard...</p>
 </div>
 </div>
 );
}
