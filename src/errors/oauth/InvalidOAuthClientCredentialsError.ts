import { AppError } from '@/errors/AppError.js';

export class InvalidOAuthClientCredentialsError extends AppError {
  constructor() {
    super({
      statusCode: 401,
      code: 'invalid_oauth_client_credentials',
      message: 'The OAuth client credentials are invalid',
    });
  }
}
