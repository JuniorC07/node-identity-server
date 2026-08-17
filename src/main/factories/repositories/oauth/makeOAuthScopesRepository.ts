import { db } from '@/adapters/database/knex/connection.js';
import { KnexOAuthScopesRepository } from '@/adapters/database/knex/repositories/oauth/OAuthScopesRepository.js';
import type { MakeRepositoryOptions } from '@/main/factories/repositories/MakeRepositoryOptions.js';
import type { IOAuthScopesRepository } from '@/repositories/oauth/IOAuthScopesRepository.js';

export function makeOAuthScopesRepository({
  connection = db,
}: MakeRepositoryOptions = {}): IOAuthScopesRepository {
  return new KnexOAuthScopesRepository(connection);
}
