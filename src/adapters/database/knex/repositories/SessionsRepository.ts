import type { Knex } from 'knex';

import { Session } from '@/entities/Session.js';
import type { ISessionsRepository } from '@/repositories/ISessionsRepository.js';

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
}
