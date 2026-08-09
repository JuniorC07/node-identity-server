import { AppError } from '@/errors/AppError.js';

export class InvalidOAuthNonceError extends AppError {
  constructor() {
    super({
      statusCode: 400,
      code: 'invalid_oauth_nonce',
      message: 'A valid nonce is required when requesting the openid scope',
    });
  }
}
