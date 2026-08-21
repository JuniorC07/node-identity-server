import { OAuthError } from '@/errors/oauth/OAuthError.js';

export class InvalidOAuthNonceError extends OAuthError {
  constructor() {
    super({
      statusCode: 400,
      code: 'invalid_request',
      message: 'A valid nonce is required when requesting the openid scope',
    });
  }
}
