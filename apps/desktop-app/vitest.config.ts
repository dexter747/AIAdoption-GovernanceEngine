/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
      '@shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/renderer/__tests__/setup.ts'],
    include: ['src/renderer/__tests__/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    // Mock heavy deps that don't work in jsdom
    deps: {
      optimizer: {
        web: {
          include: ['vitest-canvas-mock'],
        },
      },
    },
    coverage: {
      provider: 'v8',
      include: [
        'src/renderer/lib/**/*.ts',
        'src/renderer/components/ui/**/*.tsx',
        'src/renderer/pages/**/*.tsx',
      ],
      exclude: ['src/renderer/__tests__/**'],
    },
  },
});
