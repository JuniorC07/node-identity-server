import type { RequestHandler } from 'express';

import { InsufficientAccessTokenScopeError } from '@/errors/accessTokens/InsufficientAccessTokenScopeError.js';
import { InvalidAccessTokenError } from '@/errors/accessTokens/InvalidAccessTokenError.js';

export class AuthorizeAccessTokenMiddleware {
  handle(requiredScopes: readonly string[]): RequestHandler {
    return (req, _res, next) => {
      if (!req.accessTokenAuth) {
        throw new InvalidAccessTokenError();
      }

      const grantedScopes = new Set(req.accessTokenAuth.scopes);
      const hasRequiredScopes = requiredScopes.every((scope) => grantedScopes.has(scope));

      if (!hasRequiredScopes) {
        throw new InsufficientAccessTokenScopeError(requiredScopes);
      }

      next();
    };
  }
}
