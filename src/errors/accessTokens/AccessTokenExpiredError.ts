import { AppError } from '@/errors/AppError.js';

export class AccessTokenExpiredError extends AppError {
  constructor() {
    super({
      statusCode: 401,
      code: 'access_token_expired',
      message: 'Access token expired',
    });
  }
}
