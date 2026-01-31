import { useAuth } from '../hooks/useAuth';
import { Sparkles, Shield, Zap, Database } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo and Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-2xl shadow-blue-500/50">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Welcome to AI Nexus
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Sign in to continue
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-10 shadow-2xl">
          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Securely authenticate using your browser.
              <br />
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-2 inline-block">
                Your session will be saved for future use.
              </span>
            </p>
          </div>

          <button
            onClick={login}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-lg rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
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
            <p className="text-xs text-gray-400 dark:text-gray-500">
              By signing in, you agree to our{' '}
              <a href="#" className="text-blue-500 hover:text-blue-600 underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-blue-500 hover:text-blue-600 underline">Privacy Policy</a>
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-10 grid grid-cols-3 gap-6">
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl mb-3 group-hover:scale-110 transition-transform duration-200 shadow-lg">
              <Database className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Connect Databases</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">MySQL, PostgreSQL, MongoDB & more</p>
          </div>
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl mb-3 group-hover:scale-110 transition-transform duration-200 shadow-lg">
              <Zap className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">AI-Powered</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Natural language queries</p>
          </div>
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl mb-3 group-hover:scale-110 transition-transform duration-200 shadow-lg">
              <Shield className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Secure</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enterprise-grade security</p>
          </div>
        </div>
      </div>
    </div>
  );
}
