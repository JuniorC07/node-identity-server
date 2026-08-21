import type { Knex } from 'knex';

import type {
  ConsumeAuthorizationCodeInput,
  IAuthorizationCodesRepository,
} from '@/repositories/oauth/IOAuthAuthorizationCodesRepository.js';
import { AuthorizationCode } from '@/entities/oauth/AuthorizationCode.js';

interface OAuthAuthorizationCodeRow {
  id: string;
  authorization_request_id: string;
  code_hash: string;
  created_at: Date | string;
  expires_at: Date | string;
  used_at: Date | string | null;
  approved_at: Date | string | null;
  denied_at: Date | string | null;
}

export class KnexAuthorizationCodesRepository implements IAuthorizationCodesRepository {
  constructor(private readonly db: Knex) {}

  async create(authorizationCode: AuthorizationCode): Promise<void> {
    await this.db<OAuthAuthorizationCodeRow>('oauth_authorization_codes').insert({
      id: authorizationCode.id,
      authorization_request_id: authorizationCode.authorizationRequestId,
      code_hash: authorizationCode.codeHash,
      created_at: authorizationCode.createdAt,
      expires_at: authorizationCode.expiresAt,
      approved_at: authorizationCode.approvedAt,
      denied_at: authorizationCode.deniedAt,
    });
  }

  async findPendingByCodeHash(codeHash: string, now: Date): Promise<AuthorizationCode | null> {
    const row = await this.db<OAuthAuthorizationCodeRow>('oauth_authorization_codes')
      .where({ code_hash: codeHash })
      .whereNull('approved_at')
      .whereNull('denied_at')
      .andWhere('expires_at', '>', now)
      .first();

    return row ? this.toDomain(row) : null;
  }

  async consume(input: ConsumeAuthorizationCodeInput): Promise<boolean> {
    const changes = {
      used_at: input.consumedAt,
      approved_at: input.status === 'approved' ? input.consumedAt : null,
      denied_at: input.status === 'denied' ? input.consumedAt : null,
    };

    const consumedIds = await this.db<OAuthAuthorizationCodeRow>('oauth_authorization_codes')
      .where({ id: input.id })
      .whereNull('approved_at')
      .whereNull('denied_at')
      .andWhere('expires_at', '>', input.consumedAt)
      .update(changes, ['id']);

    return consumedIds.length === 1;
  }

  private toDomain(row: OAuthAuthorizationCodeRow): AuthorizationCode {
    return new AuthorizationCode({
      id: row.id,
      authorizationRequestId: row.authorization_request_id,
      codeHash: row.code_hash,
      createdAt: new Date(row.created_at),
      expiresAt: new Date(row.expires_at),
      approvedAt: row.approved_at ? new Date(row.approved_at) : null,
      deniedAt: row.denied_at ? new Date(row.denied_at) : null,
    });
  }
}
