import { AppError } from '@/errors/AppError.js';

export class InvalidOAuthAuthorizationDecisionError extends AppError {
  constructor() {
    super({
      statusCode: 400,
      code: 'invalid_oauth_authorization_decision',
      message: 'The OAuth authorization decision is invalid',
    });
  }
}
