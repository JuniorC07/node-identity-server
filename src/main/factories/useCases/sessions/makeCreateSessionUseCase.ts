import { makeSHA256SessionTokenService } from '@/main/factories/services/makeSessionTokenService.js';
import { db } from '@/adapters/database/knex/connection.js';
import { KnexIdentitiesRepository } from '@/adapters/database/knex/repositories/IdentitiesRepository.js';
import { CreateLocalSessionUseCase } from '@/useCases/sessions/CreateLocalSessionUseCase.js';
import { SessionIssuerUseCase } from '@/useCases/sessions/_internal/SessionIssuerUseCase.js';
import { makePasswordHasherService } from '@/main/factories/services/makePasswordHasherService.js';
import { makeSessionRepository } from '@/main/factories/repositories/makeSessionRepository.js';

export function makeCreateLocalSessionUseCase(): CreateLocalSessionUseCase {
  const identitiesRepository = new KnexIdentitiesRepository(db);
  const sessionRepository = makeSessionRepository();
  const sha256SessionTokenService = makeSHA256SessionTokenService();
  const sessionIssuerUseCase = new SessionIssuerUseCase(
    sessionRepository,
    sha256SessionTokenService
  );

  const passwordHasher = makePasswordHasherService();

  return new CreateLocalSessionUseCase(identitiesRepository, sessionIssuerUseCase, passwordHasher);
}
