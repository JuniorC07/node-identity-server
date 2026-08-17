import { ISessionsRepository } from '@/repositories/ISessionsRepository.js';
import { KnexSessionsRepository } from '@/adapters/database/knex/repositories/SessionsRepository.js';
import { db } from '@/adapters/database/knex/connection.js';
import type { MakeRepositoryOptions } from '@/main/factories/repositories/MakeRepositoryOptions.js';

export function makeSessionRepository({
  connection = db,
}: MakeRepositoryOptions = {}): ISessionsRepository {
  return new KnexSessionsRepository(connection);
}
