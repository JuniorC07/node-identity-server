import { OAuthError } from '@/errors/oauth/OAuthError.js';

export class InvalidOAuthAuthorizationRequestError extends OAuthError {
  constructor() {
    super({
      statusCode: 400,
      code: 'invalid_request',
      message: 'The OAuth authorization request is invalid, expired, or already processed',
    });
  }
}
