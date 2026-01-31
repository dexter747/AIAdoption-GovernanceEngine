'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Sparkles, Menu, X, Download, User, LogOut } from 'lucide-react';
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for user session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
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
      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-24" />
      
      {/* Island Navbar */}
      <nav
        className={cn(
          'fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500',
          scrolled ? 'top-3' : 'top-6'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2.5 rounded-full transition-all duration-500',
            'bg-white/90 backdrop-blur-xl shadow-lg shadow-black/5 border border-gray-200/50',
            scrolled && 'shadow-xl shadow-black/10'
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 pl-1 pr-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent hidden sm:inline">
              AI Nexus
            </span>
          </Link>

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-gray-200" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100/80 transition-all"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-gray-200" />

          {/* Download Button */}
          <Link
            href="/download"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-50 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </Link>

          {/* Auth Section */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                {user.image ? (
                  <img src={user.image} alt={user.name || 'User'} className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/download"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Download className="w-4 h-4" />
                    Download App
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
              className="px-4 py-1.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-1.5 rounded-full hover:bg-gray-100 transition-colors ml-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 py-3 animate-fade-in">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-5 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <hr className="my-2 border-gray-100" />
            <Link
              href="/download"
              className="flex items-center gap-2 px-5 py-2.5 text-blue-600 hover:bg-blue-50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Download className="w-4 h-4" />
              Download App
            </Link>
            {!user && (
              <Link
                href="/login"
                className="block mx-4 mt-2 px-4 py-2.5 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
