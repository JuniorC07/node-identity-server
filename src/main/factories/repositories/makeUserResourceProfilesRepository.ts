import { db } from '@/adapters/database/knex/connection.js';
import { KnexUserResourceProfilesRepository } from '@/adapters/database/knex/repositories/UserResourceProfilesRepository.js';
import type { IUserResourceProfilesRepository } from '@/repositories/IUserResourceProfilesRepository.js';

export function makeUserResourceProfilesRepository(): IUserResourceProfilesRepository {
  return new KnexUserResourceProfilesRepository(db);
}
