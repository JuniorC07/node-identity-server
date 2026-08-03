import { ISessionsRepository } from '@/repositories/ISessionsRepository.js';
import { Session } from '@/entities/Session.js';
import { sessionExpirationInMilliSeconds } from '@/config/sessionExpirationInMilliSeconds.js';

export interface RenewSessionOutput {
  renewed: boolean;
  expiresAt: Date;
}

export class RenewSessionUseCase {
  constructor(private readonly sessionsRepository: ISessionsRepository) {}

  async execute(session: Session): Promise<RenewSessionOutput> {
    const now = new Date();
    if (!session.shouldRenew(now, sessionExpirationInMilliSeconds)) {
      return {
        renewed: false,
        expiresAt: session.expiresAt,
      };
    }

    const expiresAt = new Date(now.getTime() + sessionExpirationInMilliSeconds);

    await this.sessionsRepository.updateExpiresAt({
      sessionId: session.id,
      expiresAt,
    });

    return {
      renewed: true,
      expiresAt,
    };
  }
}
