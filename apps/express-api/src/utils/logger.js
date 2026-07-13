/**
 * Logger - Production-ready logging with Pino
 */

import pino from 'pino';
import { config } from '../config/index.js';

const transport =
  config.env === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined;

export const logger = pino({
  level: config.logging.level,
  transport,
  base: {
    env: config.env,
    version: config.version,
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.apiKey',
      '*.apiKey',
      '*.password',
    ],
    censor: '[REDACTED]',
  },
});

// Create child loggers for specific modules
export function createLogger(module) {
  return logger.child({ module });
}
