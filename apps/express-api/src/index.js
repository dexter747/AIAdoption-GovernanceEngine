/**
 * Velanova Express API - Entry Point
 * Production-ready backend server with WebSocket support
 */

// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { logger } from './utils/logger.js';
import { config } from './config/index.js';
import { initializeWebSocket, getWebSocketStats } from './websocket/index.js';

const app = createApp();

// Graceful shutdown handler
const gracefulShutdown = signal => {
  logger.info({ signal }, 'Received shutdown signal');

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Start server
const server = app.listen(config.port, () => {
  // Initialize WebSocket server
  const wss = initializeWebSocket(server);

  logger.info(
    {
      port: config.port,
      env: config.env,
      supabase: config.supabase.url ? 'connected' : 'not configured',
      websocket: 'enabled',
    },
    '🚀 Velanova API Server started'
  );

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           Velanova API Server v${config.version}                   ║
╠═══════════════════════════════════════════════════════════╣
║  Port:        ${config.port}                                        ║
║  Environment: ${config.env.padEnd(41)}║
║  Supabase:    ${(config.supabase.url ? 'Connected' : 'Not configured').padEnd(41)}║
║  WebSocket:   ws://localhost:${config.port}/ws/mcp                  ║
╠═══════════════════════════════════════════════════════════╣
║  Endpoints:                                               ║
║    Health:    http://localhost:${config.port}/health                ║
║    API:       http://localhost:${config.port}/api                   ║
║    WebSocket: ws://localhost:${config.port}/ws/mcp                  ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection');
});

process.on('uncaughtException', error => {
  logger.fatal({ error }, 'Uncaught Exception');
  process.exit(1);
});

export default server;
