import { AppError } from '@/errors/AppError.js';

export class InvalidOAuthAuthorizationRequestError extends AppError {
  constructor() {
    super({
      statusCode: 400,
      code: 'invalid_oauth_authorization_request',
      message: 'The OAuth authorization request is invalid, expired, or already processed',
    });
  }
}
