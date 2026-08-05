import { AppError } from '@/errors/AppError.js';

export class InvalidAccessTokenError extends AppError {
  constructor() {
    super({
      statusCode: 401,
      code: 'invalid_access_token',
      message: 'Invalid access token',
    });
  }
}
