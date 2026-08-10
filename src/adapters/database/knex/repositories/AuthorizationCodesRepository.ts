import type { Knex } from 'knex';

import { AuthorizationCode } from '@/entities/AuthorizationCode.js';
import type {
  IAuthorizationCodesRepository,
  IssueAuthorizationCodeInput,
} from '@/repositories/IAuthorizationCodesRepository.js';

interface AuthorizationCodeRow {
  id: string;
  code_hash: string;
  oauth_client_id: string;
  user_id: string;
  session_id: string;
  redirect_uri: string;
  granted_scopes: string[];
  nonce: string | null;
  code_challenge: string;
  code_challenge_method: 'S256';
  created_at: Date | string;
  expires_at: Date | string;
  used_at: Date | string | null;
}

export class KnexAuthorizationCodesRepository implements IAuthorizationCodesRepository {
  constructor(private readonly db: Knex) {}

  async issue(input: IssueAuthorizationCodeInput): Promise<boolean> {
    return this.db.transaction(async (trx) => {
      const consumedRequestIds = await trx('oauth_authorization_requests')
        .where({ id: input.authorizationRequestId })
        .whereNull('consumed_at')
        .andWhere('expires_at', '>', input.now)
        .update({ consumed_at: input.now }, ['id']);

      if (consumedRequestIds.length !== 1) {
        return false;
      }

      const code = input.authorizationCode;
      await trx<AuthorizationCodeRow>('oauth_authorization_codes').insert({
        id: code.id,
        code_hash: code.codeHash,
        oauth_client_id: code.oauthClientId,
        user_id: code.userId,
        session_id: code.sessionId,
        redirect_uri: code.redirectUri,
        granted_scopes: [...code.grantedScopes],
        nonce: code.nonce,
        code_challenge: code.codeChallenge,
        code_challenge_method: code.codeChallengeMethod,
        created_at: code.createdAt,
        expires_at: code.expiresAt,
        used_at: code.usedAt,
      });

      if (input.consentGrants.length > 0) {
        await trx('oauth_consent_grants')
          .insert(
            input.consentGrants.map((grant) => ({
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
            granted_at: trx.raw('excluded.granted_at'),
            expires_at: trx.raw('excluded.expires_at'),
            revoked_at: trx.raw('excluded.revoked_at'),
          });
      }

      return true;
    });
  }

  async findPendingByCodeHash(codeHash: string, now: Date): Promise<AuthorizationCode | null> {
    const row = await this.db<AuthorizationCodeRow>('oauth_authorization_codes')
      .where({ code_hash: codeHash })
      .whereNull('used_at')
      .andWhere('expires_at', '>', now)
      .first();

    return row ? this.toDomain(row) : null;
  }

  async consume(id: string, now: Date): Promise<boolean> {
    const consumedIds = await this.db<AuthorizationCodeRow>('oauth_authorization_codes')
      .where({ id })
      .whereNull('used_at')
      .andWhere('expires_at', '>', now)
      .update({ used_at: now }, ['id']);

    return consumedIds.length === 1;
  }

  private toDomain(row: AuthorizationCodeRow): AuthorizationCode {
    return new AuthorizationCode({
      id: row.id,
      codeHash: row.code_hash,
      oauthClientId: row.oauth_client_id,
      userId: row.user_id,
      sessionId: row.session_id,
      redirectUri: row.redirect_uri,
      grantedScopes: row.granted_scopes,
      nonce: row.nonce,
      codeChallenge: row.code_challenge,
      codeChallengeMethod: row.code_challenge_method,
      createdAt: new Date(row.created_at),
      expiresAt: new Date(row.expires_at),
      usedAt: row.used_at ? new Date(row.used_at) : null,
    });
  }
}
