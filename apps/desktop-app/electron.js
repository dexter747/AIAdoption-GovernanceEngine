// Temporary Electron entry point for development
// This loads the TypeScript main process on-the-fly using tsx
console.log('[electron.js] Starting...');
try {
  require('tsx/cjs');
  console.log('[electron.js] tsx loaded, loading main/index.ts...');
  require('./src/main/index.ts');
  console.log('[electron.js] Main module loaded successfully');
} catch (error) {
  console.error('[electron.js] Error loading main:', error);
  process.exit(1);
}
