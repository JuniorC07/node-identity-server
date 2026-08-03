import { ISessionsRepository } from '@/repositories/ISessionsRepository.js';

export class RevokeSessionUseCase {
  constructor(private readonly sessionsRepository: ISessionsRepository) {}

  async execute(sessionId: string): Promise<void> {
    await this.sessionsRepository.revoke(sessionId);
  }
}
