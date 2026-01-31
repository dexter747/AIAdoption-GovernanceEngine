// Service Worker - Minimal implementation
// This file exists to prevent 404 errors from previously cached service worker registrations

self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim all clients immediately
  event.waitUntil(
    self.clients.claim().then(() => {
      // Unregister this service worker after claiming clients
      // This effectively removes the service worker
      return self.registration.unregister();
    })
  );
});

// No fetch handler - let all requests pass through normally
