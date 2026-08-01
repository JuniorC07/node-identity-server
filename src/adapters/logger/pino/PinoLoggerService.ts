import type { Logger } from 'pino';

import type { ILoggerService, LogContext } from '@/services/ILoggerService.js';

export class PinoLoggerService implements ILoggerService {
  constructor(private readonly logger: Logger) {}

  debug(message: string, context: LogContext = {}): void {
    this.logger.debug(context, message);
  }

  info(message: string, context: LogContext = {}): void {
    this.logger.info(context, message);
  }

  warn(message: string, context: LogContext = {}): void {
    this.logger.warn(context, message);
  }

  error(message: string, context: LogContext = {}): void {
    const { error, ...metadata } = context;

    this.logger.error(
      {
        ...metadata,
        ...(error !== undefined ? { err: error } : {}),
      },
      message
    );
  }

  child(context: LogContext): ILoggerService {
    return new PinoLoggerService(this.logger.child(context));
  }
}
