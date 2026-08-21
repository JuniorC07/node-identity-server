import { OAuthError } from '@/errors/oauth/OAuthError.js';

export class InvalidPkceChallengeError extends OAuthError {
  constructor() {
    super({
      statusCode: 400,
      code: 'invalid_request',
      message: 'The PKCE code challenge is invalid',
    });
  }
}
