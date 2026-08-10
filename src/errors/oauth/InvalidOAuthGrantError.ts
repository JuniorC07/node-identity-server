import { AppError } from '@/errors/AppError.js';

export class InvalidOAuthGrantError extends AppError {
  constructor() {
    super({
      statusCode: 400,
      code: 'invalid_oauth_grant',
      message: 'The OAuth authorization code is invalid, expired, or already used',
    });
  }
}
