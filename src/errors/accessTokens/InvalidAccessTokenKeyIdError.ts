import { AppError } from '@/errors/AppError.js';

export class InvalidAccessTokenKeyIdError extends AppError {
  constructor() {
    super({
      statusCode: 401,
      code: 'invalid_access_token_key_id',
      message: 'Invalid access token key id',
    });
  }
}
