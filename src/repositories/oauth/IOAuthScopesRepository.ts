import type { OAuthScope } from '@/entities/oauth/OAuthScope.js';

export interface IOAuthScopesRepository {
  findByKeys(keys: readonly string[]): Promise<OAuthScope[]>;
}
