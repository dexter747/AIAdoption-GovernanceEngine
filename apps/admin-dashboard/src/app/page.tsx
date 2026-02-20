'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminHome() {
 const router = useRouter();

 useEffect(() => {
 router.replace('/dashboard');
 }, [router]);

 return (
 <div className="min-h-screen flex items-center justify-center bg-black">
 <div className="text-center">
 <div className="w-8 h-8 border-2 border-zinc-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
 <p className="text-zinc-500">Redirecting to dashboard...</p>
 </div>
 </div>
 );
}
