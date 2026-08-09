import type { Knex } from 'knex';

import type { OAuthConsentGrant } from '@/entities/OAuthConsentGrant.js';
import type {
  FindActiveConsentScopeIdsInput,
  IOAuthConsentGrantsRepository,
} from '@/repositories/IOAuthConsentGrantsRepository.js';

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

  async save(grant: OAuthConsentGrant): Promise<void> {
    await this.saveAll([grant]);
  }

  async saveAll(grants: OAuthConsentGrant[]): Promise<void> {
    if (grants.length === 0) {
      return;
    }

    await this.db<OAuthConsentGrantRow>('oauth_consent_grants')
      .insert(
        grants.map((grant) => ({
          id: grant.id,
          user_id: grant.userId,
          oauth_client_id: grant.oauthClientId,
          scope_id: grant.scopeId,
          granted_at: grant.grantedAt,
          expires_at: grant.expiresAt,
          revoked_at: grant.revokedAt,
        }))
      )
      .onConflict(['user_id', 'oauth_client_id', 'scope_id'])
      .merge({
        granted_at: this.db.raw('excluded.granted_at'),
        expires_at: this.db.raw('excluded.expires_at'),
        revoked_at: this.db.raw('excluded.revoked_at'),
      });
  }
}
