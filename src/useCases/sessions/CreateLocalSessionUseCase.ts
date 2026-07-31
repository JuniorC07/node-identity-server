import { dummyPasswordHash } from '@/config/dummyPasswordHash.js';
import { InvalidCrendentialsError } from '@/errors/general/InvalidCrendentialsError.js';
import type { IIdentitiesRepository } from '@/repositories/IIdentitiesRepository.js';
import type { IPasswordHasher } from '@/services/IPasswordHasher.js';
import { SessionIssuerUseCase } from './_internal/SessionIssuerUseCase.js';

export interface CreateLocalSessionInput {
  identifier: string;
  password: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface CreateLocalSessionOutput {
  rawToken: string;
  expiresAt: Date;
}

export class CreateLocalSessionUseCase {
  constructor(
    private readonly identityRepository: IIdentitiesRepository,
    private readonly SessionIssuerUseCase: SessionIssuerUseCase,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(input: CreateLocalSessionInput): Promise<CreateLocalSessionOutput> {
    const identifier = input.identifier.trim().toLowerCase();
    const identity = await this.identityRepository.findByProviderSubject('local', identifier);
    const passwordHash = identity?.passwordHash ?? dummyPasswordHash;
    const passwordMatches = await this.passwordHasher.verify(input.password, passwordHash);

    if (!identity || !passwordMatches) {
      throw new InvalidCrendentialsError();
    }
    const { rawToken, expiresAt } = await this.SessionIssuerUseCase.execute({
      identityId: identity.id,
      userId: identity.userId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    return { rawToken, expiresAt };
  }
}
