'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Lock, Check, ArrowLeft, Loader2 } from 'lucide-react';

function CheckoutContent() {
 const searchParams = useSearchParams();
 const router = useRouter();
 
 const sessionId = searchParams.get('session_id');
 const plan = searchParams.get('plan') || 'professional';
 const cycle = searchParams.get('cycle') || 'monthly';
 const amount = parseInt(searchParams.get('amount') || '4900') / 100;

 const [loading, setLoading] = useState(false);
 const [formData, setFormData] = useState({
 email: '',
 name: '',
 cardNumber: '',
 expiry: '',
 cvc: '',
 });

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);

 // Simulate payment processing
 await new Promise(resolve => setTimeout(resolve, 2000));

 // In development, simulate successful payment
 router.push(`/subscribe/success?session_id=${sessionId}`);
 };

 const planNames: Record<string, string> = {
 trial: 'Free Trial',
 professional: 'Professional',
 team: 'Team',
 enterprise: 'Enterprise',
 };

 return (
 <div className="min-h-screen bg-gray-900">
 {/* Header */}
 <header className="border-b bg-gray-800 border-gray-700">
 <div className="max-w-4xl mx-auto px-4 py-4">
 <Link href="/pricing" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white">
 <ArrowLeft className="w-4 h-4" />
 Back to pricing
 </Link>
 </div>
 </header>

 <main className="max-w-4xl mx-auto px-4 py-12">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
 {/* Order Summary */}
 <div className="order-2 lg:order-1">
 <div className="rounded-xl p-6 shadow-sm bg-gray-800">
 <h2 className="font-medium mb-6 text-white">
 Order Summary
 </h2>

 <div className="space-y-4">
 <div className="flex justify-between">
 <span className="text-muted-foreground">Plan</span>
 <span className="font-medium text-white">
 {planNames[plan]}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Billing</span>
 <span className="font-medium capitalize text-white">
 {cycle}
 </span>
 </div>
 <hr className="border-gray-700" />
 <div className="flex justify-between text-lg">
 <span className="font-medium text-white">Total</span>
 <span className="font-medium text-white">
 ${amount.toFixed(2)}/{cycle === 'yearly' ? 'yr' : 'mo'}
 </span>
 </div>
 </div>

 {/* Features */}
 <div className="mt-8 pt-6 border-t border-gray-700">
 <h3 className="font-medium mb-4 text-white">
 What's included:
 </h3>
 <ul className="space-y-3">
 {[
 'Unlimited AI queries',
 'All 15+ AI providers',
 'Unlimited database connections',
 'Priority support',
 'Cost tracking & analytics',
 ].map((feature, i) => (
 <li key={i} className="flex items-center gap-2 text-muted-foreground">
 <Check className="w-4 h-4 text-green-500" />
 {feature}
 </li>
 ))}
 </ul>
 </div>

 {/* Security Notice */}
 <div className="mt-6 p-4 rounded-lg bg-gray-700/50">
 <div className="flex items-center gap-2 text-muted-foreground">
 <Lock className="w-4 h-4" />
 <span>Secure checkout powered by Dodo Payments</span>
 </div>
 </div>
 </div>
 </div>

 {/* Payment Form */}
 <div className="order-1 lg:order-2">
 <div className="rounded-xl p-6 shadow-sm bg-gray-800">
 <h2 className="font-medium mb-6 text-white">
 Payment Details
 </h2>

 {/* Dev Mode Notice */}
 <div className="mb-6 p-4 rounded-lg bg-amber-900/20 border-amber-800">
 <p className="text-amber-400">
 <strong>Development Mode:</strong> This is a mock checkout. No real payment will be processed.
 </p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block font-medium mb-1 text-gray-300">
 Email
 </label>
 <input
 type="email"
 required
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-600 bg-gray-700 text-white"
 placeholder="you@example.com"
 />
 </div>

 <div>
 <label className="block font-medium mb-1 text-gray-300">
 Cardholder Name
 </label>
 <input
 type="text"
 required
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-600 bg-gray-700 text-white"
 placeholder="John Doe"
 />
 </div>

 <div>
 <label className="block font-medium mb-1 text-gray-300">
 Card Number
 </label>
 <div className="relative">
 <input
 type="text"
 required
 value={formData.cardNumber}
 onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
 className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-12 border-gray-600 bg-gray-700 text-white"
 placeholder="4242 4242 4242 4242"
 />
 <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block font-medium mb-1 text-gray-300">
 Expiry
 </label>
 <input
 type="text"
 required
 value={formData.expiry}
 onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
 className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-600 bg-gray-700 text-white"
 placeholder="MM/YY"
 />
 </div>
 <div>
 <label className="block font-medium mb-1 text-gray-300">
 CVC
 </label>
 <input
 type="text"
 required
 value={formData.cvc}
 onChange={(e) => setFormData({ ...formData, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
 className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-600 bg-gray-700 text-white"
 placeholder="123"
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {loading ? (
 <>
 <Loader2 className="w-5 h-5 animate-spin" />
 Processing...
 </>
 ) : (
 <>
 <Lock className="w-4 h-4" />
 Pay ${amount.toFixed(2)}
 </>
 )}
 </button>

 <p className="text-muted-foreground">
 By confirming your subscription, you agree to our{' '}
 <Link href="/terms" className="text-blue-500 hover:underline">Terms of Service</Link>
 {' '}and{' '}
 <Link href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>.
 </p>
 </form>
 </div>
 </div>
 </div>
 </main>
 </div>
 );
}

export default function CheckoutPage() {
 return (
 <Suspense fallback={
 <div className="min-h-screen flex items-center justify-center bg-gray-900">
 <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
 </div>
 }>
 <CheckoutContent />
 </Suspense>
 );
}
