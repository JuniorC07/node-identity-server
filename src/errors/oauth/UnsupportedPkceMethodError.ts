import { AppError } from '@/errors/AppError.js';

export class UnsupportedPkceMethodError extends AppError {
  constructor() {
    super({
      statusCode: 400,
      code: 'unsupported_pkce_method',
      message: 'Only the S256 PKCE challenge method is supported',
    });
  }
}
