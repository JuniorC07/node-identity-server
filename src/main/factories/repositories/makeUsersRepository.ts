import { db } from '@/adapters/database/knex/connection.js';
import { KnexUsersRepository } from '@/adapters/database/knex/repositories/UsersRepository.js';
import type { MakeRepositoryOptions } from '@/main/factories/repositories/MakeRepositoryOptions.js';
import type { IUsersRepository } from '@/repositories/IUsersRepository.js';

export function makeUsersRepository({
  connection = db,
}: MakeRepositoryOptions = {}): IUsersRepository {
  return new KnexUsersRepository(connection);
}
