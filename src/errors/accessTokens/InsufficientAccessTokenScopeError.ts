import { OAuthError } from '@/errors/oauth/OAuthError.js';

export class InsufficientAccessTokenScopeError extends OAuthError {
  constructor(requiredScopes: readonly string[]) {
    const scope = requiredScopes.join(' ');

    super({
      statusCode: 403,
      code: 'insufficient_scope',
      message: 'The access token does not have the required scopes',
      details: { requiredScopes },
      wwwAuthenticate: `Bearer error="insufficient_scope", scope="${scope}"`,
    });
  }
}
