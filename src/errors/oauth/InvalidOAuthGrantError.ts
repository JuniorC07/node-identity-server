import { OAuthError } from '@/errors/oauth/OAuthError.js';

export class InvalidOAuthGrantError extends OAuthError {
  constructor() {
    super({
      statusCode: 400,
      code: 'invalid_grant',
      message: 'The OAuth authorization code is invalid, expired, or already used',
    });
  }
}
