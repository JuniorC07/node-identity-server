import { db } from '@/adapters/database/knex/connection.js';
import { KnexOAuthConsentGrantsRepository } from '@/adapters/database/knex/repositories/oauth/OAuthConsentGrantsRepository.js';
import type { MakeRepositoryOptions } from '@/main/factories/repositories/MakeRepositoryOptions.js';
import type { IOAuthConsentGrantsRepository } from '@/repositories/oauth/IOAuthConsentGrantsRepository.js';

export function makeOAuthConsentGrantsRepository({
  connection = db,
}: MakeRepositoryOptions = {}): IOAuthConsentGrantsRepository {
  return new KnexOAuthConsentGrantsRepository(connection);
}
