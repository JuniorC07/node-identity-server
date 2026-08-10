import { db } from '@/adapters/database/knex/connection.js';
import { KnexOAuthClientsRepository } from '@/adapters/database/knex/repositories/oauth/OAuthClientsRepository.js';
import type { IOAuthClientsRepository } from '@/repositories/oauth/IOAuthClientsRepository.js';

export function makeOAuthClientsRepository(): IOAuthClientsRepository {
  return new KnexOAuthClientsRepository(db);
}
