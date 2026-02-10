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
      <div className="h-16" />
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800'
          : 'bg-transparent'
      )}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <span className="text-base font-semibold text-gray-900 dark:text-white">AI Nexus</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              href="/download"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-1 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/download"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Download className="w-4 h-4" />
                      Download App
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            )}

            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 animate-fade-in">
            <div className="max-w-6xl mx-auto px-6 py-4 space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!user && (
                <Link
                  href="/login"
                  className="block px-3 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
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
