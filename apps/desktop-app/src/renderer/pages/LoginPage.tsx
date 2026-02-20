import { useAuth } from '../hooks/useAuth';
import { Sparkles, Shield, Zap, Database } from 'lucide-react';

export default function LoginPage() {
 const { login, isLoading } = useAuth();

 return (
 <div className="min-h-screen flex items-center justify-center p-4 bg-black">
 <div className="w-full max-w-lg">
 {/* Logo and Header */}
 <div className="text-center mb-10">
 <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6">
 <img src="/logo.png" alt="Velanova" className="w-20 h-20 rounded-3xl" />
 </div>
 <h1 className="font-medium mb-3 text-white">
 Welcome to Velanova
 </h1>
 <p className="text-zinc-400">
 Sign in to continue
 </p>
 </div>

 {/* Login Card */}
 <div className="backdrop-blur-xl rounded-3xl p-10 shadow-2xl bg-zinc-950/80 border-zinc-800/50">
 <div className="text-center mb-8">
 <p className="leading-relaxed text-zinc-400">
 Securely authenticate using your browser.
 <br />
 <span className="mt-2 inline-block text-muted-foreground">
 Your session will be saved for future use.
 </span>
 </p>
 </div>

 <button
 onClick={login}
 disabled={isLoading}
 className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black font-medium text-lg rounded-2xl hover:bg-zinc-200 transition-all duration-200 shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
 >
 {isLoading ? (
 <>
 <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
 <span>Opening browser...</span>
 </>
 ) : (
 <>
 <Shield className="w-6 h-6" />
 <span>Sign in securely</span>
 </>
 )}
 </button>

 <div className="mt-8 text-center">
 <p className="text-muted-foreground">
 By signing in, you agree to our{' '}
 <a href="#" className="text-zinc-300 hover:text-zinc-400 underline">Terms of Service</a>
 {' '}and{' '}
 <a href="#" className="text-zinc-300 hover:text-zinc-400 underline">Privacy Policy</a>
 </p>
 </div>
 </div>

 {/* Features Preview */}
 <div className="mt-10 grid grid-cols-3 gap-6">
 <div className="text-center group">
 <div className="inline-flex items-center justify-center w-14 h-14 backdrop-blur-lg rounded-2xl mb-3 group-hover:scale-110 transition-transform duration-200 shadow-lg bg-zinc-900/60 border-zinc-800/50">
 <Database className="w-7 h-7 text-zinc-400" />
 </div>
 <p className="font-medium text-zinc-400">Connect Databases</p>
 <p className="mt-1 text-muted-foreground">MySQL, PostgreSQL, MongoDB & more</p>
 </div>
 <div className="text-center group">
 <div className="inline-flex items-center justify-center w-14 h-14 backdrop-blur-lg rounded-2xl mb-3 group-hover:scale-110 transition-transform duration-200 shadow-lg bg-zinc-900/60 border-zinc-800/50">
 <Zap className="w-7 h-7 text-zinc-400" />
 </div>
 <p className="font-medium text-zinc-400">AI-Powered</p>
 <p className="mt-1 text-muted-foreground">Natural language queries</p>
 </div>
 <div className="text-center group">
 <div className="inline-flex items-center justify-center w-14 h-14 backdrop-blur-lg rounded-2xl mb-3 group-hover:scale-110 transition-transform duration-200 shadow-lg bg-zinc-900/60 border-zinc-800/50">
 <Shield className="w-7 h-7 text-zinc-400" />
 </div>
 <p className="font-medium text-zinc-400">Secure</p>
 <p className="mt-1 text-muted-foreground">Enterprise-grade security</p>
 </div>
 </div>
 </div>
 </div>
 );
}
