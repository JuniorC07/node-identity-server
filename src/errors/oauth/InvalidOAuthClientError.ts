import { OAuthError } from '@/errors/oauth/OAuthError.js';

export class InvalidOAuthClientError extends OAuthError {
  constructor(authenticateClient = false) {
    super({
      statusCode: authenticateClient ? 401 : 400,
      code: 'invalid_client',
      message: 'The OAuth client is invalid or does not exist',
      wwwAuthenticate: authenticateClient ? 'Basic realm="oauth/token"' : undefined,
    });
  }
}
