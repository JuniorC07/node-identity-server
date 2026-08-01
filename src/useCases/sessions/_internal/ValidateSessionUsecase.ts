import { ISessionTokenService } from '@/services/ISessionTokenService.js';
import { ISessionsRepository } from '@/repositories/ISessionsRepository.js';
import { Session } from '@/entities/Session.js';
import { UnauthorizedError } from '@/errors/general/UnauthorizedError.js';

export interface ValidateSessionInput {
  rawToken: string;
}

export class ValidateSessionUsecase {
  constructor(
    private readonly sessionsRepository: ISessionsRepository,
    private readonly sessionToken: ISessionTokenService
  ) {}

  async execute({ rawToken }: ValidateSessionInput): Promise<Session> {
    const tokenHash = this.sessionToken.hash(rawToken);

    const session = await this.sessionsRepository.findActiveByTokenHash(tokenHash);

    if (!session) {
      throw new UnauthorizedError();
    }

    return session;
  }
}
