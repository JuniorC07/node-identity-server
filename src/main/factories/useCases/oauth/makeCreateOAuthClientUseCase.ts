import { db } from '@/adapters/database/knex/connection.js';
import { KnexOAuthClientsRepository } from '@/adapters/database/knex/repositories/OAuthClientsRepository.js';
import { CreateOAuthClientUseCase } from '@/useCases/oauth/CreateOAuthClientUseCase.js';
import { makePasswordHasherService } from '@/main/factories/services/makePasswordHasherService.js';
import { makeOAuthClientCredentialsService } from '@/main/factories/services/makeOAuthClientCredentialsService.js';

export function makeCreateOAuthClientUseCase(): CreateOAuthClientUseCase {
  const usersRepository = new KnexOAuthClientsRepository(db);

  const passwordHasher = makePasswordHasherService();
  const oAuthClientCredentials = makeOAuthClientCredentialsService();

  return new CreateOAuthClientUseCase(usersRepository, oAuthClientCredentials, passwordHasher);
}
