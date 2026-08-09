import { AppError } from '@/errors/AppError.js';

export class InvalidOAuthRedirectUriError extends AppError {
  constructor() {
    super({
      statusCode: 400,
      code: 'invalid_oauth_redirect_uri',
      message: 'The redirect URI is not registered for this OAuth client',
    });
  }
}
