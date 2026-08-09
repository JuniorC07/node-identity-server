import { db } from '@/adapters/database/knex/connection.js';
import { KnexOAuthClientsRepository } from '@/adapters/database/knex/repositories/OAuthClientsRepository.js';
import type { IOAuthClientsRepository } from '@/repositories/IOAuthClientsRepository.js';

export function makeOAuthClientsRepository(): IOAuthClientsRepository {
  return new KnexOAuthClientsRepository(db);
}
