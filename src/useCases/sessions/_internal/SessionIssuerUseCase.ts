import { ISessionsRepository } from '@/repositories/ISessionsRepository.js';
import { ISessionTokenService } from '@/services/ISessionTokenService.js';
import { Session } from '@/entities/Session.js';
import { randomUUID } from 'node:crypto';
import { sessionExpirationInMilliSeconds } from '@/config/sessionExpirationInMilliSeconds.js';

export interface SessionIssuerInput {
  userId: string;
  identityId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface SessionIssuerOutput {
  rawToken: string;
  expiresAt: Date;
}

export class SessionIssuerUseCase {
  constructor(
    private readonly sessionsRepository: ISessionsRepository,
    private readonly tokenService: ISessionTokenService
  ) {}

  async execute(input: SessionIssuerInput): Promise<SessionIssuerOutput> {
    const { rawToken, tokenHash } = this.tokenService.generate();

    const now = new Date();

    const session = new Session({
      id: randomUUID(),
      identityId: input.identityId,
      userId: input.userId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      tokenHash,
      lastUsedAt: now,
      createdAt: now,
      expiresAt: new Date(Date.now() + sessionExpirationInMilliSeconds),
      revokedAt: null,
    });

    await this.sessionsRepository.create(session);

    return { rawToken, expiresAt: session.expiresAt };
  }
}
