import { randomUUID } from 'node:crypto';

import { AuthorizationCode } from '@/entities/oauth/AuthorizationCode.js';
import { InvalidOAuthAuthorizationRequestError } from '@/errors/oauth/InvalidOAuthAuthorizationRequestError.js';
import type { IAuthorizationCodesRepository } from '@/repositories/oauth/IOAuthAuthorizationCodesRepository.js';
import type { IAuthorizationRequestsRepository } from '@/repositories/IAuthorizationRequestsRepository.js';
import type { ISessionTokenService } from '@/services/ISessionTokenService.js';

export interface CreateOAuthAuthorizationCodeInput {
  authorizationRequestId: string;
}

export interface CreateOAuthAuthorizationCodeOutput {
  codeHash: string;
  rawCode: string;
}

export class CreateOAuthAuthorizationCodeUseCase {
  constructor(
    private readonly authorizationRequestsRepository: IAuthorizationRequestsRepository,
    private readonly authorizationCodesRepository: IAuthorizationCodesRepository,
    private readonly authorizationRequestTokenService: ISessionTokenService,
    private readonly authorizationCodeLifetimeInSeconds: number
  ) {}

  async execute(
    input: CreateOAuthAuthorizationCodeInput
  ): Promise<CreateOAuthAuthorizationCodeOutput> {
    const now = new Date();

    const authorizationRequest = await this.authorizationRequestsRepository.findPendingById(
      input.authorizationRequestId,
      now
    );

    if (!authorizationRequest) {
      throw new InvalidOAuthAuthorizationRequestError();
    }

    const { rawToken: rawCode, tokenHash: codeHash } =
      this.authorizationRequestTokenService.generate();
    const authorizationCode = new AuthorizationCode({
      id: randomUUID(),
      codeHash,
      authorizationRequestId: input.authorizationRequestId,
      deniedAt: null,
      approvedAt: null,
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.authorizationCodeLifetimeInSeconds * 1000),
    });

    await this.authorizationCodesRepository.create(authorizationCode);

    return { rawCode, codeHash };
  }
}
