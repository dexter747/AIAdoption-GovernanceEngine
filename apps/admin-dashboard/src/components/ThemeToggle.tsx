'use client';

import { useTheme } from './ThemeProvider';
import { Moon, Sun, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded ${
          theme === 'light'
            ? 'bg-white dark:bg-gray-900 text-primary-500'
            : 'text-gray-500 dark:text-gray-400'
        }`}
        title="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-900 text-primary-500'
            : 'text-gray-500 dark:text-gray-400'
        }`}
        title="System theme"
      >
        <Monitor className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded ${
          theme === 'dark'
            ? 'bg-white dark:bg-gray-900 text-primary-500'
            : 'text-gray-500 dark:text-gray-400'
        }`}
        title="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
