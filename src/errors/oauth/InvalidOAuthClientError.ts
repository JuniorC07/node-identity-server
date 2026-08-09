import { AppError } from '@/errors/AppError.js';

export class InvalidOAuthClientError extends AppError {
  constructor() {
    super({
      statusCode: 400,
      code: 'invalid_oauth_client',
      message: 'The OAuth client is invalid or does not exist',
    });
  }
}
