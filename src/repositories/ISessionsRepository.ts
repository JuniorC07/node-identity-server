import { Session } from '@/entities/Session.js';

export interface ISessionsRepository {
  create(session: Session): Promise<void>;
  findActiveByTokenHash(tokenHash: string): Promise<Session | null>;
}
