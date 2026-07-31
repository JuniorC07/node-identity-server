// src/main/logger/pinoLogger.ts

import pino from 'pino';

import { PinoLoggerService } from '@/adapters/logger/pino/PinoLoggerService.js';
import type { ILoggerService } from '@/services/ILoggerService.js';

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

const pinoInstance = pino({
  enabled: !isTest,
  level: process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: [
      'password',
      'passwordHash',
      'token',
      'rawToken',
      'sessionToken',
      '*.password',
      '*.passwordHash',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

export const logger: ILoggerService = new PinoLoggerService(pinoInstance);
