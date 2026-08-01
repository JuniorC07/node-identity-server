import { ISessionsRepository } from '@/repositories/ISessionsRepository.js';
import { KnexSessionsRepository } from '@/adapters/database/knex/repositories/SessionsRepository.js';
import { db } from '@/adapters/database/knex/connection.js';

export function makeSessionRepository(): ISessionsRepository {
  return new KnexSessionsRepository(db);
}
