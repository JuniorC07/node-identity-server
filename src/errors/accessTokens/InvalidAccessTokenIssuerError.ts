import { AppError } from '@/errors/AppError.js';

export class InvalidAccessTokenIssuerError extends AppError {
  constructor() {
    super({
      statusCode: 401,
      code: 'invalid_access_token_issuer',
      message: 'Invalid access token issuer',
    });
  }
}
