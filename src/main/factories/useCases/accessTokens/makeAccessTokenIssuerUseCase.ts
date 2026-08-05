import { accessTokenConfig } from '@/config/accessTokenConfig.js';
import { makeAccessTokenSignerService } from '@/main/factories/services/makeAccessTokenServices.js';
import { AccessTokenIssuerUseCase } from '@/useCases/accessTokens/AccessTokenIssuerUseCase.js';

export function makeAccessTokenIssuerUseCase(): AccessTokenIssuerUseCase {
  const tokenSigner = makeAccessTokenSignerService();
  return new AccessTokenIssuerUseCase(tokenSigner, accessTokenConfig.lifetimeInSeconds);
}
