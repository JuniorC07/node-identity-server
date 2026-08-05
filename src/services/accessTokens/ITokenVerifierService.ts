import type { AccessTokenClaims } from '@/services/accessTokens/AccessTokenClaims.js';

export interface VerifyTokenInput {
  token: string;
  audience: string | string[];
}

export interface ITokenVerifierService {
  verify(input: VerifyTokenInput): Promise<AccessTokenClaims>;
}
