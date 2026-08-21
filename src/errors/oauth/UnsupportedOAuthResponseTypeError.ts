import { OAuthError } from '@/errors/oauth/OAuthError.js';

export class UnsupportedOAuthResponseTypeError extends OAuthError {
  constructor() {
    super({
      statusCode: 400,
      code: 'unsupported_response_type',
      message: 'The OAuth response type is not supported',
    });
  }
}
