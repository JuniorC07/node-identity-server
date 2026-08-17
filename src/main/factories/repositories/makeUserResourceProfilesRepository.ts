import { IUserResourceProfilesRepository } from '@/repositories/IUserResourceProfilesRepository.js';
import { KnexUserResourceProfilesRepository } from '@/adapters/database/knex/repositories/UserResourceProfilesRepository.js';
import { db } from '@/adapters/database/knex/connection.js';
import type { MakeRepositoryOptions } from '@/main/factories/repositories/MakeRepositoryOptions.js';

export function makeUserResourceProfilesRepository({
  connection = db,
}: MakeRepositoryOptions = {}): IUserResourceProfilesRepository {
  return new KnexUserResourceProfilesRepository(connection);
}
