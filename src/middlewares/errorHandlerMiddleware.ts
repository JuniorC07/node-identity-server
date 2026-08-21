import type { ErrorRequestHandler } from 'express';

import { AppError } from '@/errors/AppError.js';
import { OAuthError } from '@/errors/oauth/OAuthError.js';
import type { ILoggerService } from '@/services/ILoggerService.js';

export class ErrorHandlerMiddleware {
  constructor(private readonly logger: ILoggerService) {}

  handle: ErrorRequestHandler = (error, req, res, _next) => {
    const requestContext = {
      requestId: res.locals.requestId,
      method: req.method,
      path: req.path,
    };

    if (error instanceof OAuthError) {
      res.locals.errorCode = error.code;
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Pragma', 'no-cache');

      if (error.wwwAuthenticate) {
        res.setHeader('WWW-Authenticate', error.wwwAuthenticate);
      }

      res.status(error.statusCode).json({
        error: error.code,
        error_description: error.message,
      });

      return;
    }

    if (error instanceof AppError) {
      res.locals.errorCode = error.code;

      res.status(error.statusCode).json({
        message: error.message,
        name: error.code,
        details: error.details,
      });

      return;
    }

    res.locals.errorCode = 'generic_error';

    this.logger.error('Unhandled request error', {
      ...requestContext,
      errorCode: res.locals.errorCode,
      error,
    });

    res.status(500).json({
      message: 'An error occurred',
      name: 'generic_error',
      details: {},
    });
  };
}
