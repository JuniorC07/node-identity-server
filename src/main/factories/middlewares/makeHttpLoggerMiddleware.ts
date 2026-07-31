import { logger } from '@/main/logger/pinoLogger.js';
import { HttpLoggerMiddleware } from '@/middlewares/HttpLoggerMiddleware.js';
import type { RequestHandler } from 'express';

export function makeHttpLoggerMiddleware(): RequestHandler {
  return new HttpLoggerMiddleware(logger).handle();
}
