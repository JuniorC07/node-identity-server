import { logger } from '@/main/logger/pinoLogger.js';
import { ErrorHandlerMiddleware } from '@/middlewares/errorHandlerMiddleware.js';
import type { ErrorRequestHandler } from 'express';

export function makeErrorHandlerMiddleware(): ErrorRequestHandler {
  const middleware = new ErrorHandlerMiddleware(logger);
  return middleware.handle;
}
