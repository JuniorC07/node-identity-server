import { db } from '@/adapters/database/knex/connection.js';
import { KnexOAuthScopesRepository } from '@/adapters/database/knex/repositories/oauth/OAuthScopesRepository.js';
import type { IOAuthScopesRepository } from '@/repositories/oauth/IOAuthScopesRepository.js';

export function makeOAuthScopesRepository(): IOAuthScopesRepository {
  return new KnexOAuthScopesRepository(db);
}
