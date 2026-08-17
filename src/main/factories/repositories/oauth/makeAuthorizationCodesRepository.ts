import { db } from '@/adapters/database/knex/connection.js';
import { KnexAuthorizationCodesRepository } from '@/adapters/database/knex/repositories/oauth/OAuthAuthorizationCodesRepository.js';
import type { MakeRepositoryOptions } from '@/main/factories/repositories/MakeRepositoryOptions.js';
import type { IAuthorizationCodesRepository } from '@/repositories/oauth/IOAuthAuthorizationCodesRepository.js';

export function makeAuthorizationCodeRepository({
  connection = db,
}: MakeRepositoryOptions = {}): IAuthorizationCodesRepository {
  return new KnexAuthorizationCodesRepository(connection);
}
