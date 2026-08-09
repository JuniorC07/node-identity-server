import { db } from '@/adapters/database/knex/connection.js';
import { KnexAuthorizationRequestsRepository } from '@/adapters/database/knex/repositories/AuthorizationRequestsRepository.js';
import type { IAuthorizationRequestsRepository } from '@/repositories/IAuthorizationRequestsRepository.js';

export function makeAuthorizationRequestsRepository(): IAuthorizationRequestsRepository {
  return new KnexAuthorizationRequestsRepository(db);
}
