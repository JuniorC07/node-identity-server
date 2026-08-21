import { idTokenConfig } from '@/config/idTokenConfig.js';
import { makeUsersRepository } from '@/main/factories/repositories/makeUsersRepository.js';
import { makeAccessTokenSignerService } from '@/main/factories/services/makeAccessTokenServices.js';
import { IdTokenIssuerUseCase } from '@/useCases/idTokens/IdTokenIssuerUseCase.js';

export function makeIdTokenIssuerUseCase(): IdTokenIssuerUseCase {
  const tokenSigner = makeAccessTokenSignerService();
  const usersRepository = makeUsersRepository();

  return new IdTokenIssuerUseCase(tokenSigner, usersRepository, idTokenConfig.lifetimeInSeconds);
}
