import { db } from '@/adapters/database/knex/connection.js';
import { KnexOAuthScopesRepository } from '@/adapters/database/knex/repositories/OAuthScopesRepository.js';
import type { IOAuthScopesRepository } from '@/repositories/IOAuthScopesRepository.js';

export function makeOAuthScopesRepository(): IOAuthScopesRepository {
  return new KnexOAuthScopesRepository(db);
}
