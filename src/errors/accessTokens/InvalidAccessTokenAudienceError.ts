import { AppError } from '@/errors/AppError.js';

export class InvalidAccessTokenAudienceError extends AppError {
  constructor() {
    super({
      statusCode: 401,
      code: 'invalid_access_token_audience',
      message: 'Invalid access token audience',
    });
  }
}
