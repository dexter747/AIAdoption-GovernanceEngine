'use client';

import React from 'react';

// Single dark theme - no mode switching
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useTheme() {
  return { theme: 'dark' as const, setTheme: () => {}, systemTheme: 'dark' as const };
}
