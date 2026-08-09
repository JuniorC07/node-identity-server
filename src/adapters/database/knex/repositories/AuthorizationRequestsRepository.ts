import type { Knex } from 'knex';

import { IAuthorizationRequestsRepository } from '@/repositories/IAuthorizationRequestsRepository.js';
import { AuthorizationRequest } from '@/entities/AuthorizationRequest.js';

export class KnexAuthorizationRequestsRepository implements IAuthorizationRequestsRepository {
  constructor(private readonly db: Knex) {}

  async create(request: AuthorizationRequest): Promise<void> {
    await this.db('oauth_authorization_requests').insert({
      id: request.id,
      request_token_hash: request.requestTokenHash,
      oauth_client_id: request.oauthClientId,
      user_id: request.userId,
      session_id: request.sessionId,
      redirect_uri: request.redirectUri,
      requested_scopes: request.requestedScopes,
      state: request.state,
      nonce: request.nonce,
      code_challenge: request.codeChallenge,
      code_challenge_method: request.codeChallengeMethod,
      created_at: request.createdAt,
      expires_at: request.expiresAt,
      consumed_at: request.consumedAt,
    });
  }
}
