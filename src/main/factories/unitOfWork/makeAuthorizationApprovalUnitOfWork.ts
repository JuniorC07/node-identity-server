import { db } from '@/adapters/database/knex/connection.js';
import { KnexUnitOfWork } from '@/adapters/database/knex/UnitOfWork/UnitOfWork.js';
import { IAuthorizationApprovalUnitOfWork } from '@/repositories/oauth/IAuthorizationApprovalRepositories.js';
import { makeAuthorizationRequestsRepository } from '@/main/factories/repositories/makeAuthorizationRequestsRepository.js';
import { makeAuthorizationCodeRepository } from '@/main/factories/repositories/oauth/makeAuthorizationCodesRepository.js';
import { makeOAuthConsentGrantsRepository } from '@/main/factories/repositories/oauth/makeOAuthConsentGrantsRepository.js';

export function makeAuthorizationApprovalUnitOfWork(): IAuthorizationApprovalUnitOfWork {
  return new KnexUnitOfWork(db, (trx) => ({
    authorizationRequests: makeAuthorizationRequestsRepository({ connection: trx }),

    authorizationCodes: makeAuthorizationCodeRepository({ connection: trx }),

    consentGrants: makeOAuthConsentGrantsRepository({ connection: trx }),
  }));
}
