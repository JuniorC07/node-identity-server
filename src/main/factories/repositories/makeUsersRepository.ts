import { db } from '@/adapters/database/knex/connection.js';
import { KnexUsersRepository } from '@/adapters/database/knex/repositories/UsersRepository.js';
import type { IUsersRepository } from '@/repositories/IUsersRepository.js';

export function makeUsersRepository(): IUsersRepository {
  return new KnexUsersRepository(db);
}
