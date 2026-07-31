import { SHA256SessionTokenService } from '@/adapters/crypto/sha256/SHA256SessionTokenService.js';
import { db } from '@/adapters/database/knex/connection.js';
import { KnexIdentitiesRepository } from '@/adapters/database/knex/repositories/IdentitiesRepository.js';
import { KnexSessionsRepository } from '@/adapters/database/knex/repositories/SessionsRepository.js';
import { CreateLocalSessionUseCase } from '@/useCases/sessions/CreateLocalSessionUseCase.js';
import { SessionIssuerUseCase } from '@/useCases/sessions/_internal/SessionIssuerUseCase.js';
import { makePasswordHasherService } from '../../services/makePasswordHasherService.js';

export function makeCreateLocalSessionUseCase(): CreateLocalSessionUseCase {
  const identitiesRepository = new KnexIdentitiesRepository(db);
  const sessionRepository = new KnexSessionsRepository(db);
  const sha256SessionTokenService = new SHA256SessionTokenService();
  const sessionIssuerUseCase = new SessionIssuerUseCase(
    sessionRepository,
    sha256SessionTokenService
  );

  const passwordHasher = makePasswordHasherService();

  return new CreateLocalSessionUseCase(identitiesRepository, sessionIssuerUseCase, passwordHasher);
}
