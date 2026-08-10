import { CreateOAuthClientUseCase } from '@/useCases/oauth/CreateOAuthClientUseCase.js';
import { makePasswordHasherService } from '@/main/factories/services/makePasswordHasherService.js';
import { makeOAuthClientCredentialsService } from '@/main/factories/services/makeOAuthClientCredentialsService.js';
import { makeOAuthClientsRepository } from '@/main/factories/repositories/oauth/makeOAuthClientsRepository.js';
import { makeOAuthScopesRepository } from '@/main/factories/repositories/oauth/makeOAuthScopesRepository.js';

export function makeCreateOAuthClientUseCase(): CreateOAuthClientUseCase {
  const clientsRepository = makeOAuthClientsRepository();
  const scopesRepository = makeOAuthScopesRepository();

  const passwordHasher = makePasswordHasherService();
  const oAuthClientCredentials = makeOAuthClientCredentialsService();

  return new CreateOAuthClientUseCase(
    clientsRepository,
    oAuthClientCredentials,
    passwordHasher,
    scopesRepository
  );
}
