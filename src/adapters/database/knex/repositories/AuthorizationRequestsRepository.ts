import type { Knex } from 'knex';

import { IAuthorizationRequestsRepository } from '@/repositories/IAuthorizationRequestsRepository.js';
import { AuthorizationRequest } from '@/entities/AuthorizationRequest.js';

interface AuthorizationRequestRow {
  id: string;
  request_token_hash: string;
  oauth_client_id: string;
  user_id: string;
  session_id: string;
  redirect_uri: string;
  requested_scopes: string[];
  state: string;
  nonce: string | null;
  code_challenge: string;
  code_challenge_method: 'S256';
  created_at: Date | string;
  expires_at: Date | string;
  consumed_at: Date | string | null;
}

export class KnexAuthorizationRequestsRepository implements IAuthorizationRequestsRepository {
  constructor(private readonly db: Knex) {}

  async create(request: AuthorizationRequest): Promise<void> {
    await this.db<AuthorizationRequestRow>('oauth_authorization_requests').insert({
      id: request.id,
      request_token_hash: request.requestTokenHash,
      oauth_client_id: request.oauthClientId,
      user_id: request.userId,
      session_id: request.sessionId,
      redirect_uri: request.redirectUri,
      requested_scopes: [...request.requestedScopes],
      state: request.state,
      nonce: request.nonce,
      code_challenge: request.codeChallenge,
      code_challenge_method: request.codeChallengeMethod,
      created_at: request.createdAt,
      expires_at: request.expiresAt,
      consumed_at: request.consumedAt,
    });
  }

  async findById(id: string): Promise<AuthorizationRequest | null> {
    const row = await this.db<AuthorizationRequestRow>('oauth_authorization_requests')
      .where({ id })
      .first();

    return row ? this.toDomain(row) : null;
  }

  async findPendingById(id: string, now: Date): Promise<AuthorizationRequest | null> {
    const row = await this.db<AuthorizationRequestRow>('oauth_authorization_requests')
      .where({ id })
      .whereNull('consumed_at')
      .andWhere('expires_at', '>', now)
      .first();

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findPendingByTokenHash(tokenHash: string, now: Date): Promise<AuthorizationRequest | null> {
    const row = await this.db<AuthorizationRequestRow>('oauth_authorization_requests')
      .where({ request_token_hash: tokenHash })
      .whereNull('consumed_at')
      .andWhere('expires_at', '>', now)
      .first();

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async consume(id: string, now: Date): Promise<boolean> {
    const consumedIds = await this.db<AuthorizationRequestRow>('oauth_authorization_requests')
      .where({ id })
      .whereNull('consumed_at')
      .andWhere('expires_at', '>', now)
      .update({ consumed_at: now }, ['id']);

    return consumedIds.length === 1;
  }

  private toDomain(row: AuthorizationRequestRow): AuthorizationRequest {
    return new AuthorizationRequest({
      id: row.id,
      requestTokenHash: row.request_token_hash,
      oauthClientId: row.oauth_client_id,
      userId: row.user_id,
      sessionId: row.session_id,
      redirectUri: row.redirect_uri,
      requestedScopes: row.requested_scopes,
      state: row.state,
      nonce: row.nonce,
      codeChallenge: row.code_challenge,
      codeChallengeMethod: row.code_challenge_method,
      createdAt: new Date(row.created_at),
      expiresAt: new Date(row.expires_at),
      consumedAt: row.consumed_at ? new Date(row.consumed_at) : null,
    });
  }
}
