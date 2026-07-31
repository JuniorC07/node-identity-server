import { randomUUID } from 'node:crypto';

import type { RequestHandler } from 'express';

import type { ILoggerService } from '@/services/ILoggerService.js';

export class HttpLoggerMiddleware {
  constructor(private readonly logger: ILoggerService) {}

  handle(): RequestHandler {
    return (req, res, next) => {
      const startedAt = process.hrtime.bigint();
      const requestId = req.get('x-request-id') ?? randomUUID();

      res.setHeader('x-request-id', requestId);
      res.locals.requestId = requestId;

      res.once('finish', () => {
        const elapsedMilliseconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

        const context = {
          requestId,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          durationInMilliseconds: `${elapsedMilliseconds.toFixed(2)} ms`,
          ipAddress: req.ip,
          errorCode: res.locals.errorCode,
        };

        if (res.statusCode >= 500) {
          this.logger.error('HTTP request completed', context);
          return;
        }

        if (res.statusCode >= 400) {
          this.logger.warn('HTTP request completed', context);
          return;
        }

        this.logger.info('HTTP request completed', context);
      });

      next();
    };
  }
}
