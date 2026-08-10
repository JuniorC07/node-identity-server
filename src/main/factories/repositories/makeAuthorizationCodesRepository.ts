import { db } from '@/adapters/database/knex/connection.js';
import { KnexAuthorizationCodesRepository } from '@/adapters/database/knex/repositories/AuthorizationCodesRepository.js';
import type { IAuthorizationCodesRepository } from '@/repositories/IAuthorizationCodesRepository.js';

export function makeAuthorizationCodesRepository(): IAuthorizationCodesRepository {
  return new KnexAuthorizationCodesRepository(db);
}
