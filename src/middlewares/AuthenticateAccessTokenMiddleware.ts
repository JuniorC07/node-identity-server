import { InvalidAccessTokenError } from '@/errors/accessTokens/InvalidAccessTokenError.js';
import { VerifyAccessTokenUseCase } from '@/useCases/accessTokens/VerifyAccessTokenUseCase.js';
import type { RequestHandler } from 'express';

export class AuthenticateAccessTokenMiddleware {
  constructor(
    private readonly verifyAccessTokenUseCase: VerifyAccessTokenUseCase,
    private readonly audience: string
  ) {}

  handle(): RequestHandler {
    return async (req, _res, next) => {
      const authorization = req.header('authorization');
      const [scheme, accessToken] = authorization?.split(' ') ?? [];

      if (scheme?.toLowerCase() !== 'bearer' || !accessToken) {
        throw new InvalidAccessTokenError();
      }

      const token = await this.verifyAccessTokenUseCase.execute({
        accessToken,
        audience: this.audience,
      });

      req.accessTokenAuth = {
        userId: token.subject,
        clientId: token.clientId,
        sessionId: token.sessionId,
        scopes: token.scopes,
        audience: token.audience,
      };

      next();
    };
  }
}
