import { Session } from '@/entities/Session.js';

export interface UpdateSessionExpirationInput {
  sessionId: string;
  expiresAt: Date;
}

export interface ISessionsRepository {
  create(session: Session): Promise<void>;
  findActiveById(id: string): Promise<Session | null>;
  findActiveByTokenHash(tokenHash: string): Promise<Session | null>;
  updateLastUsedAt(sessionId: string): Promise<void>;
  updateExpiresAt(input: UpdateSessionExpirationInput): Promise<void>;
  revoke(sessionId: string): Promise<void>;
}
