import { IUserResourceProfilesRepository } from '@/repositories/IUserResourceProfilesRepository.js';
import { KnexUserResourceProfilesRepository } from '@/adapters/database/knex/repositories/UserResourceProfilesRepository.js';
import { db } from '@/adapters/database/knex/connection.js';

export function makeUserResourceProfilesRepository(): IUserResourceProfilesRepository {
  return new KnexUserResourceProfilesRepository(db);
}
