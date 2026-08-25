import { AuthenticateAccessTokenMiddleware } from '@/middlewares/AuthenticateAccessTokenMiddleware.js';
import { makeVerifyAccessTokenUseCase } from '@/main/factories/useCases/accessTokens/makeVerifyAccessTokenUseCase.js';

export function makeAuthenticateAccessTokenMiddleware(
  audience: string
): AuthenticateAccessTokenMiddleware {
  const verifyAccessTokenUseCase = makeVerifyAccessTokenUseCase();

  return new AuthenticateAccessTokenMiddleware(verifyAccessTokenUseCase, audience);
}
