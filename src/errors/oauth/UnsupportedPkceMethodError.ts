import { OAuthError } from '@/errors/oauth/OAuthError.js';

export class UnsupportedPkceMethodError extends OAuthError {
  constructor() {
    super({
      statusCode: 400,
      code: 'invalid_request',
      message: 'Only the S256 PKCE challenge method is supported',
    });
  }
}
