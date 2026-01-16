import { useAuth } from '../context/AuthContext';
import { Sparkles, ExternalLink } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Welcome to AI Nexus</h1>
          <p className="text-gray-500 mt-2">Sign in to access your AI workspace</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">
              You'll be redirected to your browser to securely sign in with your account.
            </p>
          </div>

          <button
            onClick={login}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ExternalLink className="w-5 h-5" />
                Sign in with Browser
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="text-2xl mb-2">🔗</div>
            <p className="text-xs text-gray-500">Connect to any database</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">🤖</div>
            <p className="text-xs text-gray-500">AI-powered queries</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-xs text-gray-500">Enterprise security</p>
          </div>
        </div>
      </div>
    </div>
  );
}
