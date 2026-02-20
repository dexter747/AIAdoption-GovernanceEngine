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
 <div className="min-h-screen bg-background flex items-center justify-center p-4">
 <div className="w-full max-w-sm">
 {/* Logo */}
 <div className="text-center mb-8">
 <div className="flex items-center justify-center gap-2 mb-4">
 <img src="/logo.png" alt="Velanova" className="w-8 h-8 rounded-lg" />
 <span className="text-2xl font-medium text-foreground">Velanova</span>
 </div>
 <h1 className="text-xl font-medium text-foreground mb-2">Admin Portal</h1>
 <p className="text-sm text-muted-foreground">Sign in with your admin credentials</p>
 </div>

 {/* Form */}
 <form onSubmit={handleSignIn} className="space-y-4">
 {/* Email */}
 <div>
 <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
 Email
 </label>
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <input
 id="email"
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="admin@gmail.com"
 required
 autoComplete="email"
 className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 />
 </div>
 </div>

 {/* Password */}
 <div>
 <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1">
 Password
 </label>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <input
 id="password"
 type={showPassword ? 'text' : 'password'}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••"
 required
 autoComplete="current-password"
 className="w-full pl-10 pr-10 py-2.5 border border-border rounded-lg text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
 >
 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 </div>

 {/* Error */}
 {error && (
 <div className="p-3 bg-red-950 border border-red-800 rounded-lg text-sm text-red-400">
 {error}
 </div>
 )}

 {/* Submit */}
 <button
 type="submit"
 disabled={isLoading}
 className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-medium rounded-lg transition-colors"
 >
 {isLoading ? 'Signing in...' : 'Sign in'}
 </button>
 </form>

 <p className="mt-6 text-center text-xs text-muted-foreground">
 Only authorized admin accounts can access this portal.
 </p>
 </div>
 </div>
 );
}
