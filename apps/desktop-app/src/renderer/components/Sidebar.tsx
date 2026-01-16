import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Database, MessageSquare, Settings, 
  CreditCard, User, LogOut, Sparkles, Sun, Moon, Monitor,
  ChevronDown
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Connections', href: '/connections', icon: Database },
  { name: 'AI Queries', href: '/queries', icon: MessageSquare },
  { name: 'Pricing', href: '/pricing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemDark);
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) return null;

  return (
    <aside className="w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 min-h-screen flex flex-col">
      {/* Logo - with drag region for macOS */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 app-region-drag">
        <div className="flex items-center gap-2 app-region-no-drag">
          <Sparkles className="w-7 h-7 text-blue-500" />
          <span className="text-xl font-semibold text-black dark:text-white">AI Nexus</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme Toggle */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
        <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Theme</p>
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
          <button
            onClick={() => handleThemeChange('light')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              theme === 'light'
                ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            Light
          </button>
          <button
            onClick={() => handleThemeChange('system')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              theme === 'system'
                ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Auto
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            Dark
          </button>
        </div>
      </div>

      {/* User & Logout */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2">
          {user?.image ? (
            <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-black dark:text-white truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
