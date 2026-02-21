import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: './src/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    // Split vendor libraries from app code so the browser can cache them
    // separately and old machines don't re-parse everything on each rebuild.
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Heavy vendor libs → their own cached chunk
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/@radix-ui') ||
              id.includes('node_modules/class-variance-authority') ||
              id.includes('node_modules/clsx') ||
              id.includes('node_modules/tailwind-merge')) {
            return 'vendor-ui';
          }
        },
      },
    },
    // Use ESBuild for faster, leaner minification
    minify: 'esbuild',
    // Target modern Electron — no legacy polyfills needed
    target: 'chrome120',
    // Warn if any chunk exceeds 600 KB (our pages should be tiny now)
    chunkSizeWarningLimit: 600,
    // Don't inline assets into CSS — keeps CSS parse time low
    assetsInlineLimit: 0,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
      '@shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  server: {
    port: 5199,
    strictPort: true,
    // Pre-warm the most-visited routes so first navigation feels instant
    warmup: {
      clientFiles: [
        './pages/ModernChatPage.tsx',
        './pages/LibraryPage.tsx',
        './components/Sidebar.tsx',
      ],
    },
  },
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  // Optimise dep pre-bundling for faster cold starts
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      'lucide-react', 'framer-motion', 'clsx', 'tailwind-merge',
    ],
  },
});


