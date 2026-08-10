import { AppError } from '@/errors/AppError.js';

export class InvalidOAuthTargetError extends AppError {
  constructor() {
    super({
      statusCode: 400,
      code: 'invalid_oauth_target',
      message: 'An authorization request may target only one resource audience',
    });
  }
}
