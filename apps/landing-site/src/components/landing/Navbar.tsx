'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Download, LogOut, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Features', href: '/#features' },
  { name: 'Pricing', href: '/#pricing' },
  { name: 'FAQ', href: '/#faq' },
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
    <nav className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto backdrop-blur-2xl rounded-2xl bg-black/70 border-zinc-800/50 shadow-black/50">
        <div className="px-6">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <img src="/logo.png" alt="Velanova" className="w-10 h-10 rounded-xl" />
              <span className="text-lg font-medium tracking-tight text-white">Velanova</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1 flex-shrink-0">
              {navLinks.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-3 py-2 font-medium transition-colors rounded-lg whitespace-nowrap text-zinc-400 hover:text-white hover:bg-zinc-900"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/demo"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 font-medium transition-colors rounded-lg whitespace-nowrap text-zinc-400 hover:text-white hover:bg-zinc-900"
              >
                <Play className="w-4 h-4" />
                View Demo
              </Link>
              <Link
                href="/download"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 font-medium transition-colors rounded-lg whitespace-nowrap text-zinc-400 hover:text-white hover:bg-zinc-900"
              >
                <Download className="w-4 h-4" />
                Download
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg transition-colors hover:bg-zinc-900"
                  >
                    {user.image ? (
                      <img
                        src={
                          user.image.includes('googleusercontent.com')
                            ? `/api/avatar/proxy?url=${encodeURIComponent(user.image)}`
                            : user.image
                        }
                        alt={user.name || 'User'}
                        className="w-7 h-7 rounded-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove(
                            'hidden'
                          );
                        }}
                      />
                    ) : null}
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full bg-white flex items-center justify-center',
                        user.image ? 'hidden' : ''
                      )}
                    >
                      <span className="text-white text-xs font-medium">
                        {(user.name?.charAt(0) || user.email.charAt(0)).toUpperCase()}
                      </span>
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-xl py-1 overflow-hidden bg-black border-zinc-800">
                      <div className="px-4 py-3 border-b border-zinc-800">
                        <p className="font-medium truncate text-white">{user.name}</p>
                        <p className="truncate text-muted-foreground">{user.email}</p>
                      </div>
                      <Link
                        href="/download"
                        className="flex items-center gap-3 px-4 py-2.5 font-medium transition-colors text-zinc-400 hover:bg-zinc-900"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Download className="w-4 h-4" />
                        Download App
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900/40"
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
                  className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-zinc-200 transition-all whitespace-nowrap"
                >
                  Sign In
                </Link>
              )}

              <button
                className="md:hidden p-2 rounded-lg transition-colors flex-shrink-0 hover:bg-zinc-900"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-zinc-400" />
                ) : (
                  <Menu className="w-5 h-5 text-zinc-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800">
            <div className="px-6 py-4 space-y-1">
              {navLinks.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-3 font-medium rounded-lg transition-colors text-zinc-400 hover:text-white hover:bg-zinc-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!user && (
                <Link
                  href="/login"
                  className="block px-4 py-3 text-base font-medium text-zinc-300 rounded-lg transition-colors hover:bg-zinc-900/40"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
