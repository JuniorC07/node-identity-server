import { OAuthError } from '@/errors/oauth/OAuthError.js';

export class InvalidOAuthScopeError extends OAuthError {
  constructor() {
    super({
      statusCode: 400,
      code: 'invalid_scope',
      message: 'One or more requested OAuth scopes are invalid',
    });
  }
}
