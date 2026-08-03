import type { Knex } from 'knex';

import { Session } from '@/entities/Session.js';
import type {
  ISessionsRepository,
  UpdateSessionExpirationInput,
} from '@/repositories/ISessionsRepository.js';

interface SessionRow {
  id: string;
  user_id: string;
  identity_id: string;
  token_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
  last_used_at: Date;
  expires_at: Date;
  revoked_at: Date | null;
}

export class KnexSessionsRepository implements ISessionsRepository {
  constructor(private readonly db: Knex) {}

  async create(session: Session): Promise<void> {
    await this.db<SessionRow>('sessions').insert({
      id: session.id,
      user_id: session.userId,
      identity_id: session.identityId,
      token_hash: session.tokenHash,
      ip_address: session.ipAddress,
      user_agent: session.userAgent,
      created_at: session.createdAt,
      last_used_at: session.lastUsedAt,
      expires_at: session.expiresAt,
      revoked_at: session.revokedAt,
    });
  }

  async findActiveByTokenHash(tokenHash: string): Promise<Session | null> {
    const sessionRow = await this.db<SessionRow>('sessions')
      .where({ token_hash: tokenHash })
      .andWhere('expires_at', '>', new Date())
      .andWhere('revoked_at', null)
      .first();

    if (!sessionRow) {
      return null;
    }
    return this.toDomain(sessionRow);
  }

  async updateLastUsedAt(sessionId: string): Promise<void> {
    await this.db<SessionRow>('sessions')
      .update({
        last_used_at: new Date(),
      })
      .where({ id: sessionId });
  }

  async updateExpiresAt(input: UpdateSessionExpirationInput): Promise<void> {
    await this.db<SessionRow>('sessions')
      .update({
        expires_at: input.expiresAt,
      })
      .where({ id: input.sessionId });
  }

  async revoke(sessionId: string): Promise<void> {
    await this.db<SessionRow>('sessions')
      .update({
        revoked_at: new Date(),
      })
      .where({ id: sessionId });
  }

  private toDomain(sessionRow: SessionRow): Session {
    return new Session({
      id: sessionRow.id,
      userId: sessionRow.user_id,
      identityId: sessionRow.identity_id,
      tokenHash: sessionRow.token_hash,
      ipAddress: sessionRow.ip_address,
      userAgent: sessionRow.user_agent,
      createdAt: sessionRow.created_at,
      lastUsedAt: sessionRow.last_used_at,
      expiresAt: sessionRow.expires_at,
      revokedAt: sessionRow.revoked_at,
    });
  }
}
