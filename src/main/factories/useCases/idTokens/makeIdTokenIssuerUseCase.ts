import { idTokenConfig } from '@/config/idTokenConfig.js';
import { makeIdTokenSignerService } from '@/main/factories/services/makeAccessTokenServices.js';
import { IdTokenIssuerUseCase } from '@/useCases/idTokens/IdTokenIssuerUseCase.js';

export function makeIdTokenIssuerUseCase(): IdTokenIssuerUseCase {
  return new IdTokenIssuerUseCase(makeIdTokenSignerService(), idTokenConfig.lifetimeInSeconds);
}
