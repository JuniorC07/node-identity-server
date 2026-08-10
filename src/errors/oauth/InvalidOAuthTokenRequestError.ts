import { AppError } from '@/errors/AppError.js';

export class InvalidOAuthTokenRequestError extends AppError {
  constructor() {
    super({
      statusCode: 400,
      code: 'invalid_oauth_token_request',
      message: 'The OAuth token request is invalid',
    });
  }
}
