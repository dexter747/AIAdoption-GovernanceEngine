'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Download, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

interface UserSession {
  id: string;
  email: string;
  name?: string;
  image?: string;
  plan?: string;
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, setTheme, systemTheme } = useTheme();

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.user) setUser(data.user);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };
    checkSession();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      setUser(null);
      setUserMenuOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <>
      <div className="h-24" />
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className={cn(
          'rounded-full transition-all duration-500 ease-out',
          scrolled
            ? 'bg-white/70 dark:bg-black/70 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20 border border-gray-200/50 dark:border-gray-800/50'
            : 'bg-white/50 dark:bg-black/50 backdrop-blur-md border border-gray-200/30 dark:border-gray-800/30'
        )}>
          <div className="px-6 h-14 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <span className="text-sm font-semibold text-black dark:text-white">AI Nexus</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              href="/download"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {user.image ? (
                    <img
                      src={user.image.includes('googleusercontent.com') ? `/api/avatar/proxy?url=${encodeURIComponent(user.image)}` : user.image}
                      alt={user.name || 'User'}
                      className="w-7 h-7 rounded-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
                    />
                  ) : null}
                  <div className={cn(
                    "w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center",
                    user.image ? "hidden" : ""
                  )}>
                    <span className="text-white text-xs font-medium">
                      {(user.name?.charAt(0) || user.email.charAt(0)).toUpperCase()}
                    </span>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50 py-1 animate-fade-in overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-800/50">
                      <p className="text-sm font-medium text-black dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/download"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Download className="w-4 h-4" />
                      Download App
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-1.5 text-xs font-semibold bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all hover:shadow-lg hover:shadow-blue-500/25"
              >
                Sign In
              </Link>
            )}

            <button
              className="md:hidden p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-3 bg-white/70 dark:bg-black/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-lg animate-fade-in">
            <div className="space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!user && (
                <Link
                  href="/login"
                  className="block px-3 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
