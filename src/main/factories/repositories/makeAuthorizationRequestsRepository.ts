import { db } from '@/adapters/database/knex/connection.js';
import { KnexAuthorizationRequestsRepository } from '@/adapters/database/knex/repositories/AuthorizationRequestsRepository.js';
import type { MakeRepositoryOptions } from '@/main/factories/repositories/MakeRepositoryOptions.js';
import type { IAuthorizationRequestsRepository } from '@/repositories/IAuthorizationRequestsRepository.js';

export function makeAuthorizationRequestsRepository({
  connection = db,
}: MakeRepositoryOptions = {}): IAuthorizationRequestsRepository {
  return new KnexAuthorizationRequestsRepository(connection);
}
