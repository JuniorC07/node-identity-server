import type { Knex } from 'knex';

import type { IAuthorizationCodesRepository } from '@/repositories/oauth/IOAuthAuthorizationCodesRepository.js';
import { AuthorizationCode } from '@/entities/oauth/AuthorizationCode.js';

interface OAuthAuthorizationCodeRow {
  id: string;
  authorization_request_id: string;
  code_hash: string;
  created_at: Date;
  expires_at: Date;
  used_at: Date | null;
  approved_at: Date | null;
  denied_at: Date | null;
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
}
