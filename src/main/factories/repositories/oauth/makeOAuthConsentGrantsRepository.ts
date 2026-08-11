import { db } from '@/adapters/database/knex/connection.js';
import { KnexOAuthConsentGrantsRepository } from '@/adapters/database/knex/repositories/oauth/OAuthConsentGrantsRepository.js';
import type { IOAuthConsentGrantsRepository } from '@/repositories/oauth/IOAuthConsentGrantsRepository.js';

export function makeOAuthConsentGrantsRepository(): IOAuthConsentGrantsRepository {
  return new KnexOAuthConsentGrantsRepository(db);
}
