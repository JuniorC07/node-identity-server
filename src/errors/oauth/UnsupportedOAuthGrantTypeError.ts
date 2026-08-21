import { OAuthError } from '@/errors/oauth/OAuthError.js';

export class UnsupportedOAuthGrantTypeError extends OAuthError {
  constructor() {
    super({
      statusCode: 400,
      code: 'unsupported_grant_type',
      message: 'The requested OAuth grant type is not supported',
    });
  }
}

