'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
 const router = useRouter();
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState('');

 const handleSignIn = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsLoading(true);
 setError('');

 try {
 const res = await fetch('/api/auth/login', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email: email.trim(), password }),
 });

 const data = await res.json();

 if (!res.ok) {
 setError(data.error || 'Login failed. Please try again.');
 return;
 }

 // Authenticated — navigate to dashboard
 router.push('/dashboard');
 router.refresh();
 } catch {
 setError('Network error. Please try again.');
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
 {/* Background grid */}
 <div className="absolute inset-0 dot-grid opacity-30" />
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.015] rounded-full blur-[120px] pointer-events-none" />

 <div className="relative w-full max-w-sm">
 {/* Logo */}
 <div className="text-center mb-8">
 <div className="flex items-center justify-center gap-2.5 mb-5">
 <img src="/logo.png" alt="Velanova" className="w-10 h-10 rounded-xl" />
 <span className="text-xl font-medium tracking-tight text-white">Velanova</span>
 </div>
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] mb-4">
 <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
 <span className="text-xs font-medium text-zinc-500">Admin Portal</span>
 </div>
 <h1 className="text-2xl font-medium text-white mb-2">Welcome back</h1>
 <p className="text-sm text-zinc-500">Sign in with your admin credentials</p>
 </div>

 {/* Form */}
 <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
 <form onSubmit={handleSignIn} className="space-y-4">
 {/* Email */}
 <div>
 <label htmlFor="email" className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
 Email
 </label>
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
 <input
 id="email"
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="admin@velanova.com"
 required
 autoComplete="email"
 className="w-full pl-10 pr-4 py-2.5 border border-white/[0.08] rounded-xl text-sm text-white placeholder-zinc-600 bg-white/[0.03] focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
 />
 </div>
 </div>

 {/* Password */}
 <div>
 <label htmlFor="password" className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
 Password
 </label>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
 <input
 id="password"
 type={showPassword ? 'text' : 'password'}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••"
 required
 autoComplete="current-password"
 className="w-full pl-10 pr-10 py-2.5 border border-white/[0.08] rounded-xl text-sm text-white placeholder-zinc-600 bg-white/[0.03] focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
 >
 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 </div>

 {/* Error */}
 {error && (
 <div className="p-3 bg-zinc-950 border border-white/[0.06] rounded-xl text-sm text-zinc-400">
 {error}
 </div>
 )}

 {/* Submit */}
 <button
 type="submit"
 disabled={isLoading}
 className="w-full py-2.5 bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-medium rounded-xl transition-colors text-sm mt-2"
 >
 {isLoading ? 'Signing in...' : 'Sign in'}
 </button>
 </form>
 </div>

 <p className="mt-5 text-center text-xs text-zinc-600">
 Only authorized admin accounts can access this portal.
 </p>
 </div>
 </div>
 );
}
