import { db } from '@/adapters/database/knex/connection.js';
import { KnexUnitOfWork } from '@/adapters/database/knex/UnitOfWork/UnitOfWork.js';
import { makeAuthorizationRequestsRepository } from '@/main/factories/repositories/makeAuthorizationRequestsRepository.js';
import { makeAuthorizationCodeRepository } from '@/main/factories/repositories/oauth/makeAuthorizationCodesRepository.js';
import type { IUnitOfWork } from '@/services/database/IUnitOfWork.js';
import type { CreateOAuthAuthorizationCodeRepositories } from '@/useCases/oauth/_internal/CreateOAuthAuthorizationCodeUseCase.js';

export function makeAuthorizationCodeIssuanceUnitOfWork(): IUnitOfWork<CreateOAuthAuthorizationCodeRepositories> {
  return new KnexUnitOfWork(db, (trx) => ({
    authorizationRequests: makeAuthorizationRequestsRepository({ connection: trx }),
    authorizationCodes: makeAuthorizationCodeRepository({ connection: trx }),
  }));
}

