import type { AccessTokenClaims } from '@/services/accessTokens/AccessTokenClaims.js';
import type { ITokenVerifierService } from '@/services/accessTokens/ITokenVerifierService.js';

export interface VerifyAccessTokenInput {
  accessToken: string;
  audience: string | string[];
}

export type VerifyAccessTokenOutput = AccessTokenClaims;

export class VerifyAccessTokenUseCase {
  constructor(private readonly tokenVerifier: ITokenVerifierService) {}

  async execute(input: VerifyAccessTokenInput): Promise<VerifyAccessTokenOutput> {
    return this.tokenVerifier.verify({
      token: input.accessToken,
      audience: input.audience,
    });
  }
}
