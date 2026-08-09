import { AppError } from '@/errors/AppError.js';

export class UnsupportedOAuthResponseTypeError extends AppError {
  constructor() {
    super({
      statusCode: 400,
      code: 'unsupported_oauth_response_type',
      message: 'The OAuth response type is not supported',
    });
  }
}
