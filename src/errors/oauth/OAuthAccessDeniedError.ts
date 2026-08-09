import { AppError } from '@/errors/AppError.js';

export class OAuthAccessDeniedError extends AppError {
  constructor() {
    super({
      statusCode: 403,
      code: 'oauth_access_denied',
      message: 'The user is not authorized for one or more requested OAuth scopes',
    });
  }
}
