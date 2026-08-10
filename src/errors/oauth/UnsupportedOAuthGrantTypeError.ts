import { AppError } from '@/errors/AppError.js';

export class UnsupportedOAuthGrantTypeError extends AppError {
  constructor() {
    super({
      statusCode: 400,
      code: 'unsupported_oauth_grant_type',
      message: 'Only the authorization_code grant type is supported',
    });
  }
}
