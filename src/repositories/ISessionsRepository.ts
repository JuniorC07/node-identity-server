import { Session } from '@/entities/Session.js';

export interface UpdateSessionExpirationInput {
  sessionId: string;
  expiresAt: Date;
}

export interface ISessionsRepository {
  create(session: Session): Promise<void>;
  findActiveByTokenHash(tokenHash: string): Promise<Session | null>;
  updateLastUsedAt(sessionId: string): Promise<void>;
  updateExpiresAt(input: UpdateSessionExpirationInput): Promise<void>;
}
