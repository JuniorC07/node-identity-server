import { db } from '@/adapters/database/knex/connection.js';
import { KnexOAuthClientsRepository } from '@/adapters/database/knex/repositories/oauth/OAuthClientsRepository.js';
import type { MakeRepositoryOptions } from '@/main/factories/repositories/MakeRepositoryOptions.js';
import type { IOAuthClientsRepository } from '@/repositories/oauth/IOAuthClientsRepository.js';

export function makeOAuthClientsRepository({
  connection = db,
}: MakeRepositoryOptions = {}): IOAuthClientsRepository {
  return new KnexOAuthClientsRepository(connection);
}
