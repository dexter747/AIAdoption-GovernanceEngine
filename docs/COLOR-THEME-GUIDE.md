# Color Theme Guide

## Color System

### 🎨 Color Palette

**Light Mode:**
- Background: **White** (#ffffff)
- Text: **Black** (#000000)
- Accent: **Blue** (#3b82f6)
- Secondary Text: **Gray** (#6b7280)

**Dark Mode:**
- Background: **Black** (#000000)
- Text: **White** (#ffffff)
- Accent: **Blue** (#3b82f6)
- Secondary Text: **Light Gray** (#9ca3af)

---

## Usage Examples

### Titles and Headings
```tsx
// Main titles - Black in light mode, White in dark mode
<h1 className="text-foreground text-4xl font-medium">
  Main Title
</h1>

// With blue accent
<h1 className="text-primary-500 text-4xl font-medium">
  Accented Title
</h1>
```

### Body Text
```tsx
// Primary text - Black/White based on theme
<p className="text-foreground">
  This is the main body text that changes based on theme.
</p>

// Secondary text - Gray for labels, descriptions
<p className="text-gray-500 dark:text-gray-400">
  This is secondary text like labels or descriptions.
</p>

// Or use semantic classes
<p className="text-muted-foreground">
  Labels, descriptions, meta information
</p>
```

### Buttons
```tsx
// Primary button - Blue background
<button className="bg-primary-500 text-white hover:bg-primary-600 px-4 py-2 rounded-lg">
  Primary Action
</button>

// Secondary button - Gray background
<button className="bg-gray-200 dark:bg-gray-700 text-foreground hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-lg">
  Secondary Action
</button>

// Outline button
<button className="border-2 border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950 px-4 py-2 rounded-lg">
  Outline Button
</button>
```

### Cards and Containers
```tsx
// White card in light mode, dark card in dark mode
<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
  <h2 className="text-foreground text-xl font-medium">Card Title</h2>
  <p className="text-muted-foreground">Card description</p>
</div>

// Subtle background card
<div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
  <h3 className="text-foreground">Content</h3>
</div>
```

### Inputs
```tsx
// Input field
<input
  type="text"
  className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-foreground px-4 py-2 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
  placeholder="Enter text..."
/>
```

### Links
```tsx
// Blue link
<a href="#" className="text-primary-500 hover:text-primary-600 underline">
  Click here
</a>

// Subtle link
<a href="#" className="text-foreground hover:text-primary-500">
  Navigation link
</a>
```

---

## Available Tailwind Classes

### Background Colors
```css
/* White/Black backgrounds */
bg-background          /* White (light) / Black (dark) */
bg-white dark:bg-black /* Explicit control */

/* Blue accents */
bg-primary-50 to bg-primary-950
bg-primary-500         /* Main blue */

/* Gray backgrounds */
bg-gray-50 to bg-gray-950
bg-gray-100            /* Very light gray */
bg-gray-900            /* Very dark gray */
```

### Text Colors
```css
/* Primary text */
text-foreground        /* Black (light) / White (dark) */
text-black dark:text-white

/* Blue accent text */
text-primary-500       /* Main blue */
text-primary-600       /* Darker blue */

/* Secondary text (labels, descriptions) */
text-gray-500          /* Gray in light mode */
text-gray-400          /* Lighter gray for dark mode */
text-muted-foreground  /* Auto-adjusting gray */
```

### Border Colors
```css
border-gray-200 dark:border-gray-800  /* Borders */
border-primary-500                     /* Blue borders */
```

---

## Theme Provider Setup

### 1. Wrap your app in ThemeProvider

**Landing Site & Admin Dashboard** (`layout.tsx`):
```tsx
import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 2. Add Theme Toggle Component

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>Your App</h1>
      <ThemeToggle />
    </header>
  );
}
```

---

## Quick Reference

### Light Mode
| Element | Color | Tailwind Class |
|---------|-------|----------------|
| Background | White | `bg-white` or `bg-background` |
| Text | Black | `text-black` or `text-foreground` |
| Accent | Blue | `text-primary-500` or `bg-primary-500` |
| Secondary | Gray | `text-gray-500` |

### Dark Mode
| Element | Color | Tailwind Class |
|---------|-------|----------------|
| Background | Black | `bg-black` or `bg-background` |
| Text | White | `text-white` or `text-foreground` |
| Accent | Blue | `text-primary-500` or `bg-primary-500` |
| Secondary | Light Gray | `text-gray-400` |

---

## Desktop App (Electron)

The desktop app uses the same color system. Add theme detection:

```tsx
// src/renderer/App.tsx
import { useEffect, useState } from 'react';

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Detect system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className={theme}>
      <div className="bg-background text-foreground min-h-screen">
        {/* Your app content */}
      </div>
    </div>
  );
}
```

---

## Testing

Test your theme in both modes:

```tsx
// Example component showing all states
export function ThemeTest() {
  return (
    <div className="p-8 space-y-4">
      {/* Backgrounds */}
      <div className="bg-background p-4 rounded">Background</div>
      <div className="bg-white dark:bg-black p-4 rounded border">White/Black</div>
      
      {/* Text */}
      <h1 className="text-foreground text-3xl font-medium">Main Title</h1>
      <p className="text-foreground">Primary text content</p>
      <p className="text-muted-foreground">Secondary text (labels)</p>
      
      {/* Accents */}
      <button className="bg-primary-500 text-white px-4 py-2 rounded">
        Primary Button
      </button>
      <a href="#" className="text-primary-500">Blue Link</a>
      
      {/* Cards */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <h3 className="text-foreground font-medium">Card Title</h3>
        <p className="text-muted-foreground">Card description</p>
      </div>
    </div>
  );
}
```

---

## Summary

✅ **Light Mode**: White background, black text, blue accents, gray for secondary text
✅ **Dark Mode**: Black background, white text, blue accents, light gray for secondary text
✅ **System Support**: Auto-detects user's system preference
✅ **Consistent**: Same colors across landing site, admin dashboard, and desktop app
✅ **Flexible**: Easy to toggle between themes manually or use system preference

All configured and ready to use! 🎨
