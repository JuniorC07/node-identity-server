import { OAuthError } from '@/errors/oauth/OAuthError.js';

export class OAuthAccessDeniedError extends OAuthError {
  constructor() {
    super({
      statusCode: 403,
      code: 'access_denied',
      message: 'The user is not authorized for one or more requested OAuth scopes',
    });
  }
}
