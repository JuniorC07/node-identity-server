import { BcryptPasswordHasher } from '@/adapters/crypto/bcrypt/BcryptPasswordHasher.js';
import { SHA256SessionTokenService } from '@/adapters/crypto/sha256/SHA256SessionTokenService.js';
import { db } from '@/adapters/database/knex/connection.js';
import { KnexIdentitiesRepository } from '@/adapters/database/knex/repositories/IdentitiesRepository.js';
import { KnexSessionsRepository } from '@/adapters/database/knex/repositories/SessionsRepository.js';
import { CreateLocalSessionUseCase } from '@/useCases/sessions/CreateLocalSessionUseCase.js';
import { SessionIssuerUseCase } from '@/useCases/sessions/_internal/SessionIssuerUseCase.js';

export function makeCreateLocalSessionUseCase(): CreateLocalSessionUseCase {
  const identitiesRepository = new KnexIdentitiesRepository(db);
  const sessionRepository = new KnexSessionsRepository(db);
  const sha256SessionTokenService = new SHA256SessionTokenService();
  const sessionIssuerUseCase = new SessionIssuerUseCase(
    sessionRepository,
    sha256SessionTokenService
  );

  const rounds = process.env.NODE_ENV === 'development' ? 1 : 14;
  const passwordPepper = process.env.PASSWORD_PEPPER ?? '';
  const passwordHasher = new BcryptPasswordHasher(passwordPepper, rounds);

  return new CreateLocalSessionUseCase(identitiesRepository, sessionIssuerUseCase, passwordHasher);
}
