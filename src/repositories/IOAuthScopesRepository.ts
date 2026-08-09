import type { OAuthScope } from '@/entities/OAuthScope.js';

export interface IOAuthScopesRepository {
  findByKeys(keys: readonly string[]): Promise<OAuthScope[]>;
}
