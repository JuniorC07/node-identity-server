import { ISessionsRepository } from '@/repositories/ISessionsRepository.js';
import { Session } from '@/entities/Session.js';

export class UpdateSessionLastUsedAtUseCase {
  constructor(private readonly sessionsRepository: ISessionsRepository) {}

  async execute(session: Session): Promise<void> {
    await this.sessionsRepository.updateLastUsedAt(session.id);
  }
}
