import { OAuthError } from '@/errors/oauth/OAuthError.js';

export class InvalidOAuthRedirectUriError extends OAuthError {
  constructor() {
    super({
      statusCode: 400,
      code: 'invalid_request',
      message: 'The redirect URI is not registered for this OAuth client',
    });
  }
}
