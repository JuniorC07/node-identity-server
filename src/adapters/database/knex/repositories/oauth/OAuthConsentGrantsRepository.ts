import type { Knex } from 'knex';

import type {
  FindActiveConsentScopeIdsInput,
  IOAuthConsentGrantsRepository,
} from '@/repositories/oauth/IOAuthConsentGrantsRepository.js';

interface OAuthConsentGrantRow {
  id: string;
  user_id: string;
  oauth_client_id: string;
  scope_id: string;
  granted_at: Date;
  expires_at: Date | null;
  revoked_at: Date | null;
}

export class KnexOAuthConsentGrantsRepository implements IOAuthConsentGrantsRepository {
  constructor(private readonly db: Knex) {}

  async findActiveScopeIds(input: FindActiveConsentScopeIdsInput): Promise<string[]> {
    if (input.scopeIds.length === 0) {
      return [];
    }

    const rows = await this.db<OAuthConsentGrantRow>('oauth_consent_grants')
      .select('scope_id')
      .where({
        user_id: input.userId,
        oauth_client_id: input.oauthClientId,
      })
      .whereIn('scope_id', [...input.scopeIds])
      .whereNull('revoked_at')
      .andWhere((query) => {
        query.whereNull('expires_at').orWhere('expires_at', '>', input.now);
      });

    return [...new Set(rows.map((row) => row.scope_id))];
  }
}
