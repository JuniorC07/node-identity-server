import { db } from '@/adapters/database/knex/connection.js';
import { KnexOAuthConsentGrantsRepository } from '@/adapters/database/knex/repositories/OAuthConsentGrantsRepository.js';
import type { IOAuthConsentGrantsRepository } from '@/repositories/IOAuthConsentGrantsRepository.js';

export function makeOAuthConsentGrantsRepository(): IOAuthConsentGrantsRepository {
  return new KnexOAuthConsentGrantsRepository(db);
}
