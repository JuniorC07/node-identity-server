import { AppError } from '@/errors/AppError.js';

export class InvalidOAuthScopeError extends AppError {
  constructor() {
    super({
      statusCode: 400,
      code: 'invalid_oauth_scope',
      message: 'One or more requested OAuth scopes are invalid',
    });
  }
}
