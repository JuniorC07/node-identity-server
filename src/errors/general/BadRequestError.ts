import { AppError } from '@/errors/AppError.js';

interface BadRequestErrorParams {
  message?: string;
  details?: Record<string, unknown>;
}

export class BadRequestError extends AppError {
  constructor({ message = 'Invalid request', details = {} }: BadRequestErrorParams = {}) {
    super({
      statusCode: 400,
      code: 'bad_request',
      message,
      details,
    });
  }
}
